import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddParticipantDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  user_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  company_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mobile_number?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mobile?: string;

  @Transform(({ value }) =>
    value === undefined || value === null ? value : String(value),
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyId?: string;

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
