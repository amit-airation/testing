import { BadRequestException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'Campus Hackathon' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    minimum: 1,
    example: 900,
    description:
      'Round duration in seconds. Required unless time_limit_seconds is sent.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitSeconds?: number;

  @ApiPropertyOptional({
    minimum: 1,
    example: 900,
    description: 'Alias of timeLimitSeconds.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  time_limit_seconds?: number;

  @ApiPropertyOptional({
    enum: ROUND_STATUSES,
    example: 'draft',
    description:
      'Defaults to `draft`. Sending `active` starts the round immediately and closes any other active round.',
  })
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
}): number {
  const seconds = dto.timeLimitSeconds ?? dto.time_limit_seconds;
  if (seconds != null) {
    return seconds;
  }

  throw new BadRequestException('timeLimitSeconds is required');
}
