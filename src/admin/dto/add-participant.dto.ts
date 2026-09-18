import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddParticipantDto {
  @ApiPropertyOptional({ example: 'Ada Lovelace' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Ada Lovelace', description: 'Alias of name.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userName?: string;

  @ApiPropertyOptional({ example: 'Ada Lovelace', description: 'Alias of name.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  user_name?: string;

  @ApiPropertyOptional({ example: 'Analytical Engines' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyName?: string;

  @ApiPropertyOptional({ example: 'Analytical Engines', description: 'Alias of companyName.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  company_name?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mobileNumber?: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Alias of mobileNumber.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mobile_number?: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Alias of mobileNumber.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mobile?: string;

  @ApiPropertyOptional({ example: 'co_42' })
  @Transform(({ value }) =>
    value === undefined || value === null ? value : String(value),
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyId?: string;

  @ApiPropertyOptional({ example: 'co_42', description: 'Alias of companyId.' })
  @Transform(({ value }) =>
    value === undefined || value === null ? value : String(value),
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  company_id?: string;
}

export function resolveParticipantInput(dto: AddParticipantDto) {
  const name = firstValue(dto.name, dto.userName, dto.user_name);
  const companyName = firstValue(dto.companyName, dto.company_name);
  const mobileNumber = firstValue(
    dto.mobileNumber,
    dto.mobile_number,
    dto.mobile,
  );
  const companyId = firstValue(dto.companyId, dto.company_id);

  if (!name || !companyName || !mobileNumber || !companyId) {
    const missing = [
      !name && 'name',
      !companyName && 'companyName',
      !mobileNumber && 'mobileNumber',
      !companyId && 'companyId',
    ].filter(Boolean);

    throw new BadRequestException(
      `Missing required participant fields: ${missing.join(', ')}`,
    );
  }

  return {
    name,
    companyName,
    mobileNumber,
    companyId,
  };
}

function firstValue(
  ...values: Array<string | undefined>
): string | undefined {
  return values.find((value) => value !== undefined && value !== '');
}
