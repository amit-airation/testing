import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ROUND_STATUSES, type RoundStatusValue } from './create-round.dto.js';

export class UpdateRoundDto {
  @ApiPropertyOptional({ example: 'Campus Hackathon Finals' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ minimum: 1, example: 1200 })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitSeconds?: number;

  @ApiPropertyOptional({ minimum: 1, example: 1200, description: 'Alias of timeLimitSeconds.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  time_limit_seconds?: number;

  @ApiPropertyOptional({
    minimum: 1,
    example: 20,
    description: 'Converted to seconds as minutes * 60.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;

  @ApiPropertyOptional({ minimum: 1, example: 20, description: 'Alias of timeLimitMinutes.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  time_limit_minutes?: number;

  @ApiPropertyOptional({
    enum: ROUND_STATUSES,
    example: 'active',
    description:
      '`active` starts the round (and closes any other active round). `closed` stops the round.',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsIn(ROUND_STATUSES)
  status?: RoundStatusValue;
}
