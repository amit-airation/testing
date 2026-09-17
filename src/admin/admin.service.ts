import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { withRoundTiming } from '../round/round-timing.js';
import {
  AddParticipantDto,
  resolveParticipantInput,
} from './dto/add-participant.dto.js';
import {
  CreateRoundDto,
  resolveTimeLimitSeconds,
} from './dto/create-round.dto.js';
import { UpdateRoundDto } from './dto/update-round.dto.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createRound(dto: CreateRoundDto) {
    const timeLimitSeconds = resolveTimeLimitSeconds(dto);
    const now = new Date();
    const shouldStart = dto.status === 'active';

    const round = await this.prisma.$transaction(async (tx) => {
      if (shouldStart) {
        await this.closeActiveRounds(tx, now);
      }

      return tx.round.create({
        data: {
          name: dto.name,
          timeLimitSeconds,
          status: shouldStart ? 'active' : (dto.status ?? 'draft'),
          startedAt: shouldStart ? now : null,
        },
      });
    });

    return withRoundTiming(round, now);
  }

  async listRounds() {
    const now = new Date();
    const rounds = await this.prisma.round.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { participants: true } },
      },
    });

    return rounds.map((round) => withRoundTiming(round, now));
  }

  async getRound(roundId: number) {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
      include: {
        participants: { orderBy: { createdAt: 'desc' } },
        webhookEvents: { orderBy: { createdAt: 'desc' }, take: 50 },
        _count: { select: { participants: true } },
      },
    });

    if (!round) {
      throw new NotFoundException(`Round ${roundId} not found`);
    }

    return withRoundTiming(round);
  }

  async updateRound(roundId: number, dto: UpdateRoundDto) {
    await this.ensureRoundExists(roundId);
    const timeLimitSeconds = optionalTimeLimit(dto);

    if (dto.status === 'active') {
      if (timeLimitSeconds != null || dto.name) {
        await this.prisma.round.update({
          where: { id: roundId },
          data: {
            ...(dto.name ? { name: dto.name } : {}),
            ...(timeLimitSeconds != null ? { timeLimitSeconds } : {}),
          },
        });
      }
      return this.startRound(roundId);
    }

    if (dto.status === 'closed') {
      if (timeLimitSeconds != null || dto.name) {
        await this.prisma.round.update({
          where: { id: roundId },
          data: {
            ...(dto.name ? { name: dto.name } : {}),
            ...(timeLimitSeconds != null ? { timeLimitSeconds } : {}),
          },
        });
      }
      return this.stopRound(roundId);
    }

    const round = await this.prisma.round.update({
      where: { id: roundId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(timeLimitSeconds != null ? { timeLimitSeconds } : {}),
      },
    });

    return withRoundTiming(round);
  }

  async startRound(roundId: number) {
    const round = await this.ensureRoundExists(roundId);
    if (round.status === 'active') {
      throw new ConflictException(`Round ${roundId} is already started`);
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      await this.closeActiveRounds(tx, now, roundId);

      return tx.round.update({
        where: { id: roundId },
        data: {
          status: 'active',
          startedAt: now,
          stoppedAt: null,
        },
      });
    });

    return withRoundTiming(updated, now);
  }

  async stopRound(roundId: number) {
    const round = await this.ensureRoundExists(roundId);
    if (round.status !== 'active') {
      throw new ConflictException(`Round ${roundId} is not running`);
    }

    const now = new Date();
    const updated = await this.prisma.round.update({
      where: { id: roundId },
      data: {
        status: 'closed',
        stoppedAt: now,
      },
    });

    return withRoundTiming(updated, now);
  }

  async addParticipant(roundId: number, dto: AddParticipantDto) {
    const round = await this.ensureRoundExists(roundId);

    if (round.status === 'closed') {
      throw new ConflictException('Cannot add participants to a closed round');
    }

    const input = resolveParticipantInput(dto);

    try {
      return await this.prisma.participant.create({
        data: {
          name: input.name,
          companyName: input.companyName,
          mobileNumber: input.mobileNumber,
          companyId: input.companyId,
          roundId,
        },
      });
    } catch (error) {
      this.rethrowUniqueConflict(error);
      throw error;
    }
  }

  async listParticipants(roundId: number) {
    await this.ensureRoundExists(roundId);

    return this.prisma.participant.findMany({
      where: { roundId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listWebhookEvents(roundId: number) {
    await this.ensureRoundExists(roundId);

    return this.prisma.webhookEvent.findMany({
      where: { roundId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async closeActiveRounds(
    tx: Prisma.TransactionClient,
    now: Date,
    exceptRoundId?: number,
  ) {
    await tx.round.updateMany({
      where: {
        status: 'active',
        ...(exceptRoundId != null ? { id: { not: exceptRoundId } } : {}),
      },
      data: {
        status: 'closed',
        stoppedAt: now,
      },
    });
  }

  private async ensureRoundExists(roundId: number) {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      throw new NotFoundException(`Round ${roundId} not found`);
    }

    return round;
  }

  private rethrowUniqueConflict(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = error.meta?.target;
      const fields = Array.isArray(target)
        ? target.join(', ')
        : 'mobile number or company id';
      throw new ConflictException(
        `Participant already exists in this round (${fields})`,
      );
    }
  }
}

function optionalTimeLimit(dto: UpdateRoundDto): number | undefined {
  if (
    dto.timeLimitSeconds == null &&
    dto.time_limit_seconds == null &&
    dto.timeLimitMinutes == null &&
    dto.time_limit_minutes == null
  ) {
    return undefined;
  }

  return resolveTimeLimitSeconds(dto);
}
