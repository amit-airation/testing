import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import {
  ApiErrorDto,
  JobWebhookResponseDto,
} from '../docs/response.dto.js';
import { JobWebhookDto } from './dto/job-webhook.dto.js';
import { WebhookSecretGuard } from './webhook-secret.guard.js';
import { WebhookService } from './webhook.service.js';

@ApiTags('Webhooks')
@ApiBearerAuth('webhook-secret')
@ApiUnauthorizedResponse({ type: ApiErrorDto })
@Controller('webhooks')
@UseGuards(WebhookSecretGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('jobs')
  @ApiOperation({
    summary: 'Ingest a job create/publish event',
    description:
      'Matches `companyId` to a participant in the active round, records the event, upserts the job, and increments that participant create or publish count.',
  })
  @ApiCreatedResponse({ type: JobWebhookResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  handleJobWebhook(@Body() dto: JobWebhookDto, @Req() request: Request) {
    return this.webhookService.handleJobEvent(dto, request.body);
  }
}
