import { Processor, WorkerHost } from '@nestjs/bullmq';
import {
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Job, UnrecoverableError } from 'bullmq';
import { JOB_WEBHOOKS_QUEUE, JobWebhookQueuePayload } from './job-webhooks.constants.js';
import { WebhookService } from './webhook.service.js';

@Processor(JOB_WEBHOOKS_QUEUE)
export class JobWebhooksProcessor extends WorkerHost {
  private readonly logger = new Logger(JobWebhooksProcessor.name);

  constructor(private readonly webhookService: WebhookService) {
    super();
  }

  async process(job: Job<JobWebhookQueuePayload>) {
    const { dto, rawPayload, receivedAt } = job.data;

    try {
      const result = await this.webhookService.handleJobEvent(
        {
          ...dto,
          createdAt: new Date(dto.createdAt),
        },
        rawPayload,
        {
          receivedAt: new Date(receivedAt),
          queueJobId: job.id ?? undefined,
        },
      );

      this.logger.log(
        `Processed webhook job ${job.id} for company ${dto.companyId} (${dto.status})`,
      );

      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        const message =
          typeof error.message === 'string'
            ? error.message
            : 'Webhook rejected';
        throw new UnrecoverableError(message);
      }

      throw error;
    }
  }
}
