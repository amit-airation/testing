import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { JOB_WEBHOOKS_QUEUE } from './job-webhooks.constants.js';
import { JobWebhooksProcessor } from './job-webhooks.processor.js';
import { WebhookController } from './webhook.controller.js';
import { WebhookSecretGuard } from './webhook-secret.guard.js';
import { WebhookService } from './webhook.service.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: JOB_WEBHOOKS_QUEUE,
    }),
  ],
  controllers: [WebhookController],
  providers: [WebhookService, WebhookSecretGuard, JobWebhooksProcessor],
})
export class WebhookModule {}
