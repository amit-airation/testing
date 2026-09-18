import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  elapsedSinceStartMs,
  isRoundExpired,
  roundLimitMs,
} from '../round/round-timing.js';
import { JobWebhookDto } from './dto/job-webhook.dto.js';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async handleJobEvent(dto: JobWebhookDto, rawPayload: unknown) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const participant = await tx.participant.findFirst({
        where: {
          companyId: dto.companyId,
          round: { status: 'active' },
        },
        include: { round: true },
      });

      if (!participant) {
        throw new NotFoundException(
          `Participant not found for company id ${dto.companyId} in the active round`,
        );
      }

      const round = participant.round;
      if (!round.startedAt) {
        throw new ForbiddenException(
          `Round ${round.id} has not been started`,
        );
      }

      if (isRoundExpired(round, now)) {
        if (round.status === 'active') {
          await tx.round.update({
            where: { id: round.id },
            data: { status: 'closed', stoppedAt: now },
          });
        }

        throw new ForbiddenException(
          `Round ${round.id} time limit of ${round.timeLimitSeconds}s has expired`,
        );
      }

      const elapsedMs = elapsedSinceStartMs(round.startedAt, now);
      if (elapsedMs == null) {
        throw new ForbiddenException(`Round ${round.id} has not been started`);
      }

      const webhookEvent = await tx.webhookEvent.create({
        data: {
          roundId: round.id,
          companyId: dto.companyId,
          jobKey: dto.id,
          status: dto.status,
          elapsedMs,
        },
      });

      const job = await tx.job.upsert({
        where: { jobId: dto.id },
        create: {
          jobId: dto.id,
          jobName: dto.jobName,
          companyId: dto.companyId,
          status: dto.status,
          payload: rawPayload as object,
          createdAt: dto.createdAt,
          publishedAt: dto.status === 'publish' ? now : null,
        },
        update: {
          jobName: dto.jobName,
          companyId: dto.companyId,
          status: dto.status,
          payload: rawPayload as object,
          publishedAt: dto.status === 'publish' ? now : undefined,
        },
      });

      const existingScore = await tx.score.findUnique({
        where: {
          participantId_jobId: {
            participantId: participant.id,
            jobId: job.id,
          },
        },
      });

      const score = existingScore
        ? await tx.score.update({
            where: { id: existingScore.id },
            data: { elapsedMs },
          })
        : await tx.score.create({
            data: {
              elapsedMs,
              participantId: participant.id,
              jobId: job.id,
            },
          });

      const [createCount, publishCount] = await Promise.all([
        tx.webhookEvent.count({
          where: {
            roundId: round.id,
            companyId: dto.companyId,
            status: 'create',
          },
        }),
        tx.webhookEvent.count({
          where: {
            roundId: round.id,
            companyId: dto.companyId,
            status: 'publish',
          },
        }),
      ]);

      return {
        job,
        participant,
        score,
        webhookEvent,
        createCount,
        publishCount,
        elapsedMs,
        remainingMs: Math.max(0, roundLimitMs(round.timeLimitSeconds) - elapsedMs),
        timeLimitSeconds: round.timeLimitSeconds,
      };
    });
  }
}
