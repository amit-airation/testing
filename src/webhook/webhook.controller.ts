import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JobWebhookDto } from './dto/job-webhook.dto.js';
import { WebhookSecretGuard } from './webhook-secret.guard.js';
import { WebhookService } from './webhook.service.js';

@Controller('webhooks')
@UseGuards(WebhookSecretGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('jobs')
  handleJobWebhook(@Body() dto: JobWebhookDto, @Req() request: Request) {
    return this.webhookService.handleJobEvent(dto, request.body);
  }
}
