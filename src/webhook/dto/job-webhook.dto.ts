import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsIn, IsNotEmpty, IsString } from 'class-validator';

export const JOB_WEBHOOK_STATUSES = ['create', 'publish'] as const;
export type JobWebhookStatus = (typeof JOB_WEBHOOK_STATUSES)[number];

export class JobWebhookDto {
  @ApiProperty({
    example: 'Backend Engineer',
    description: 'Accepted as `jobName` or `job_name`.',
  })
  @Transform(({ obj }) => obj.jobName ?? obj.job_name)
  @IsString()
  @IsNotEmpty()
  jobName!: string;

  @ApiProperty({
    example: 'job_abc123',
    description: 'External job id. Accepted as `id`, `jobId`, or `job_id`.',
  })
  @Transform(({ obj }) => {
    const value = obj.id ?? obj.jobId ?? obj.job_id;
    return value === undefined || value === null ? value : String(value);
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    example: 'co_42',
    description: 'Accepted as `companyId` or `company_id`.',
  })
  @Transform(({ obj }) => {
    const value = obj.companyId ?? obj.company_id;
    return value === undefined || value === null ? value : String(value);
  })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({
    enum: JOB_WEBHOOK_STATUSES,
    example: 'publish',
    description: '`create` or `publish`. Each event increments that count for the participant.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsIn(JOB_WEBHOOK_STATUSES)
  status!: JobWebhookStatus;

  @ApiProperty({
    format: 'date-time',
    example: '2026-09-17T10:03:01.000Z',
    description:
      'Job created timestamp from the source system. Accepted as `createdAt` or `created_at`.',
  })
  @Transform(({ obj }) => parseWebhookDate(obj.createdAt ?? obj.created_at))
  @IsDate()
  createdAt!: Date;
}

function parseWebhookDate(value: unknown): Date | unknown {
  if (value === undefined || value === null || value === '') {
    return value;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? value : date;
}
