import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message, or an array of validation messages',
    example: 'Round 1 not found',
  })
  message!: string | string[];

  @ApiProperty({ example: 'Not Found' })
  error!: string;
}

export class RoundCountDto {
  @ApiProperty({ example: 12 })
  participants!: number;
}

export class RoundDetailsCountDto {
  @ApiProperty({ example: 12 })
  participants!: number;

  @ApiProperty({ example: 34 })
  webhookEvents!: number;
}

export class RoundRecordDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Campus Hackathon' })
  name!: string;

  @ApiProperty({ enum: ['draft', 'active', 'closed'], example: 'active' })
  status!: 'draft' | 'active' | 'closed';

  @ApiProperty({ example: 900 })
  timeLimitSeconds!: number;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    format: 'date-time',
    example: '2026-09-17T10:00:00.000Z',
  })
  startedAt!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    format: 'date-time',
    example: null,
  })
  stoppedAt!: string | null;

  @ApiProperty({ format: 'date-time', example: '2026-09-17T09:50:00.000Z' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', example: '2026-09-17T10:00:00.000Z' })
  updatedAt!: string;
}

export class RoundTimingDto extends RoundRecordDto {
  @ApiPropertyOptional({
    nullable: true,
    description: 'Milliseconds since startedAt. Null if the round has never started.',
    example: 45000,
  })
  elapsedMs!: number | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Milliseconds left on the clock. Null if the round has never started.',
    example: 855000,
  })
  remainingMs!: number | null;

  @ApiProperty({
    description: 'True when elapsed time has reached the round time limit.',
    example: false,
  })
  expired!: boolean;
}

export class RoundListItemDto extends RoundTimingDto {
  @ApiProperty({ type: RoundCountDto })
  _count!: RoundCountDto;
}

export class ScoreItemDto {
  @ApiProperty({ example: 8 })
  id!: number;

  @ApiPropertyOptional({ nullable: true, example: 32100 })
  elapsedMs!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 'job_abc123' })
  jobId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Backend Engineer' })
  jobName!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    enum: ['create', 'publish'],
    example: 'publish',
  })
  status!: 'create' | 'publish' | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    format: 'date-time',
    example: '2026-09-17T10:04:12.000Z',
  })
  publishedAt!: string | null;

  @ApiProperty({ format: 'date-time', example: '2026-09-17T10:04:12.000Z' })
  createdAt!: string;
}

export class ParticipantSummaryDto {
  @ApiProperty({ example: 3 })
  id!: number;

  @ApiProperty({ example: 'Ada Lovelace' })
  name!: string;

  @ApiProperty({ example: 'Analytical Engines' })
  companyName!: string;

  @ApiProperty({ example: '9876543210' })
  mobileNumber!: string;

  @ApiProperty({ example: 'co_42' })
  companyId!: string;

  @ApiProperty({ format: 'date-time', example: '2026-09-17T09:55:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: 2, description: 'Webhook events with status `create`.' })
  createCount!: number;

  @ApiProperty({ example: 1, description: 'Webhook events with status `publish`.' })
  publishCount!: number;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Slowest job elapsed time; used as the leaderboard tie-breaker.',
    example: 32100,
  })
  lastElapsedMs!: number | null;

  @ApiProperty({ example: 2 })
  jobCount!: number;

  @ApiProperty({ type: [ScoreItemDto] })
  scores!: ScoreItemDto[];
}

export class RankedParticipantDto extends ParticipantSummaryDto {
  @ApiProperty({ example: 1 })
  rank!: number;
}

export class RoundSummaryDto {
  @ApiProperty({ example: 12 })
  participantCount!: number;

  @ApiProperty({ example: 34 })
  eventCount!: number;

  @ApiProperty({ example: 22 })
  createCount!: number;

  @ApiProperty({ example: 12 })
  publishCount!: number;
}

export class WebhookEventDto {
  @ApiProperty({ example: 91 })
  id!: number;

  @ApiProperty({ example: 1 })
  roundId!: number;

  @ApiProperty({ example: 'co_42' })
  companyId!: string;

  @ApiProperty({ example: 'job_abc123' })
  jobKey!: string;

  @ApiProperty({ enum: ['create', 'publish'], example: 'publish' })
  status!: 'create' | 'publish';

  @ApiProperty({ example: 32100 })
  elapsedMs!: number;

  @ApiProperty({ format: 'date-time', example: '2026-09-17T10:04:12.000Z' })
  createdAt!: string;
}

export class RoundDetailsDto extends RoundTimingDto {
  @ApiProperty({ type: [ParticipantSummaryDto] })
  participants!: ParticipantSummaryDto[];

  @ApiProperty({ type: [RankedParticipantDto] })
  leaderboard!: RankedParticipantDto[];

  @ApiProperty({ type: [WebhookEventDto] })
  events!: WebhookEventDto[];

  @ApiProperty({
    type: [WebhookEventDto],
    description: 'Raw Prisma relation; same records as `events`.',
  })
  webhookEvents!: WebhookEventDto[];

  @ApiProperty({ type: RoundSummaryDto })
  summary!: RoundSummaryDto;

  @ApiProperty({ type: RoundDetailsCountDto })
  _count!: RoundDetailsCountDto;
}

export class LeaderboardResponseDto {
  @ApiProperty({ example: 1 })
  roundId!: number;

  @ApiProperty({ example: 'Campus Hackathon' })
  name!: string;

  @ApiProperty({ enum: ['draft', 'active', 'closed'], example: 'active' })
  status!: 'draft' | 'active' | 'closed';

  @ApiPropertyOptional({ nullable: true, example: 45000 })
  elapsedMs!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 855000 })
  remainingMs!: number | null;

  @ApiProperty({ example: false })
  expired!: boolean;

  @ApiProperty({ type: RoundSummaryDto })
  summary!: RoundSummaryDto;

  @ApiProperty({ type: [RankedParticipantDto] })
  leaderboard!: RankedParticipantDto[];
}

export class ParticipantDetailsDto extends ParticipantSummaryDto {
  @ApiProperty({ type: RoundTimingDto })
  round!: RoundTimingDto;
}

export class ParticipantDto {
  @ApiProperty({ example: 3 })
  id!: number;

  @ApiProperty({ example: 'Ada Lovelace' })
  name!: string;

  @ApiProperty({ example: 'Analytical Engines' })
  companyName!: string;

  @ApiProperty({ example: '9876543210' })
  mobileNumber!: string;

  @ApiProperty({ example: 'co_42' })
  companyId!: string;

  @ApiProperty({ example: 1 })
  roundId!: number;

  @ApiProperty({ format: 'date-time', example: '2026-09-17T09:55:00.000Z' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', example: '2026-09-17T09:55:00.000Z' })
  updatedAt!: string;
}

export class JobDto {
  @ApiProperty({ example: 5 })
  id!: number;

  @ApiProperty({ example: 'job_abc123' })
  jobId!: string;

  @ApiProperty({ example: 'Backend Engineer' })
  jobName!: string;

  @ApiProperty({ example: 'co_42' })
  companyId!: string;

  @ApiProperty({ enum: ['create', 'publish'], example: 'publish' })
  status!: 'create' | 'publish';

  @ApiPropertyOptional({
    nullable: true,
    description: 'Raw webhook JSON payload.',
    example: {
      id: 'job_abc123',
      jobName: 'Backend Engineer',
      companyId: 'co_42',
      status: 'publish',
      createdAt: '2026-09-17T10:03:01.000Z',
    },
  })
  payload!: Record<string, unknown> | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    format: 'date-time',
    example: '2026-09-17T10:04:12.000Z',
  })
  publishedAt!: string | null;

  @ApiProperty({
    format: 'date-time',
    example: '2026-09-17T10:03:01.000Z',
    description: 'Source job created timestamp from the webhook payload.',
  })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', example: '2026-09-17T10:04:12.000Z' })
  updatedAt!: string;
}

export class ScoreDto {
  @ApiProperty({ example: 8 })
  id!: number;

  @ApiPropertyOptional({ nullable: true, example: 32100 })
  elapsedMs!: number | null;

  @ApiProperty({ example: 3 })
  participantId!: number;

  @ApiPropertyOptional({ nullable: true, example: 5 })
  jobId!: number | null;

  @ApiProperty({ format: 'date-time', example: '2026-09-17T10:03:01.000Z' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', example: '2026-09-17T10:04:12.000Z' })
  updatedAt!: string;
}

export class ParticipantWithRoundDto extends ParticipantDto {
  @ApiProperty({ type: RoundRecordDto })
  round!: RoundRecordDto;
}

export class JobWebhookResponseDto {
  @ApiProperty({ type: JobDto })
  job!: JobDto;

  @ApiProperty({ type: ParticipantWithRoundDto })
  participant!: ParticipantWithRoundDto;

  @ApiProperty({ type: ScoreDto })
  score!: ScoreDto;

  @ApiProperty({ type: WebhookEventDto })
  webhookEvent!: WebhookEventDto;

  @ApiProperty({
    description: 'Create events recorded for this participant in the active round.',
    example: 2,
  })
  createCount!: number;

  @ApiProperty({
    description: 'Publish events recorded for this participant in the active round.',
    example: 1,
  })
  publishCount!: number;

  @ApiProperty({ example: 32100 })
  elapsedMs!: number;

  @ApiProperty({ example: 867900 })
  remainingMs!: number;

  @ApiProperty({ example: 900 })
  timeLimitSeconds!: number;
}
