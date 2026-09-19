import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Queue } from 'bullmq';
import {
  ApiErrorDto,
  JobWebhookAcceptedDto,
} from '../docs/response.dto.js';
import { JobWebhookDto } from './dto/job-webhook.dto.js';
import {
  JOB_WEBHOOKS_QUEUE,
  JobWebhookQueuePayload,
} from './job-webhooks.constants.js';
import { WebhookSecretGuard } from './webhook-secret.guard.js';

@ApiTags('Webhooks')
@ApiBearerAuth('webhook-secret')
@ApiUnauthorizedResponse({ type: ApiErrorDto })
@Controller('webhooks')
@UseGuards(WebhookSecretGuard)
export class WebhookController {
  constructor(
    @InjectQueue(JOB_WEBHOOKS_QUEUE)
    private readonly jobWebhooksQueue: Queue<JobWebhookQueuePayload>,
  ) {}

  @Post('jobs')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Enqueue a job create/publish event',
    description:
      'Validates auth and body, then enqueues the event on Redis/BullMQ. Processing (participant match, job upsert, counts) happens asynchronously. Unknown company or expired round fail in the worker, not as HTTP 404/403.',
  })
  @ApiAcceptedResponse({ type: JobWebhookAcceptedDto })
  async handleJobWebhook(
    @Body() dto: JobWebhookDto,
    @Req() request: Request,
  ): Promise<JobWebhookAcceptedDto> {
    const receivedAt = new Date();
    const job = await this.jobWebhooksQueue.add(
      'process',
      {
        dto: {
          id: dto.id,
          jobName: dto.jobName,
          companyId: dto.companyId,
          status: dto.status,
          createdAt: dto.createdAt.toISOString(),
        },
        rawPayload: request.body,
        receivedAt: receivedAt.toISOString(),
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );

    return {
      accepted: true,
      jobId: String(job.id),
      queue: JOB_WEBHOOKS_QUEUE,
      receivedAt: receivedAt.toISOString(),
    };
  }
}
