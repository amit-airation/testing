import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ROUND_STATUSES, type RoundStatusValue } from './create-round.dto.js';

export class UpdateRoundDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

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
