import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const ROUND_STATUSES = ['draft', 'active', 'closed'] as const;
export type RoundStatusValue = (typeof ROUND_STATUSES)[number];

export class CreateRoundDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  time_limit_seconds?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  time_limit_minutes?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsIn(ROUND_STATUSES)
  status?: RoundStatusValue;
}

export function resolveTimeLimitSeconds(dto: {
  timeLimitSeconds?: number;
  time_limit_seconds?: number;
  timeLimitMinutes?: number;
  time_limit_minutes?: number;
}): number {
  const seconds = dto.timeLimitSeconds ?? dto.time_limit_seconds;
  if (seconds != null) {
    return seconds;
  }

  const minutes = dto.timeLimitMinutes ?? dto.time_limit_minutes;
  if (minutes != null) {
    return minutes * 60;
  }

  throw new BadRequestException(
    'timeLimitSeconds (or timeLimitMinutes) is required',
  );
}
