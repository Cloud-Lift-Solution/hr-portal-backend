import { IsOptional, IsString, IsUUID, IsEnum, Matches } from 'class-validator';
import { VacationReason, VacationType } from '@prisma/client';

export class VacationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  // on_vacation | active | history | ended | upcoming
  @IsOptional()
  @Matches(/^(on_vacation|active|history|ended|upcoming)$/i)
  status?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsEnum(VacationReason)
  reason?: VacationReason;

  @IsOptional()
  @IsEnum(VacationType)
  type?: VacationType;

  @IsOptional()
  @Matches(/^\d{4}$/)
  year?: string;

  // YYYY-MM or date
  @IsOptional()
  @IsString()
  month?: string;
}


