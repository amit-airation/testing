import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller.js';
import { WebhookSecretGuard } from './webhook-secret.guard.js';
import { WebhookService } from './webhook.service.js';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService, WebhookSecretGuard],
})
export class WebhookModule {}
