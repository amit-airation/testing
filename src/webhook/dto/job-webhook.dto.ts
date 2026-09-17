import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export const JOB_WEBHOOK_STATUSES = ['create', 'publish'] as const;
export type JobWebhookStatus = (typeof JOB_WEBHOOK_STATUSES)[number];

export class JobWebhookDto {
  @Transform(({ obj }) => obj.jobName ?? obj.job_name)
  @IsString()
  @IsNotEmpty()
  jobName!: string;

  @Transform(({ obj }) => {
    const value = obj.id ?? obj.jobId ?? obj.job_id;
    return value === undefined || value === null ? value : String(value);
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @Transform(({ obj }) => {
    const value = obj.companyId ?? obj.company_id;
    return value === undefined || value === null ? value : String(value);
  })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsIn(JOB_WEBHOOK_STATUSES)
  status!: JobWebhookStatus;
}
