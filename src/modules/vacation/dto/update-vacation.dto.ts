import { IsUUID, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { VacationReason, VacationType } from '@prisma/client';

export class UpdateVacationDto {
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsDateString()
  departureDay?: string;

  @IsOptional()
  @IsDateString()
  returnDay?: string;

  @IsOptional()
  @IsEnum(VacationReason)
  reason?: VacationReason;

  @IsOptional()
  @IsEnum(VacationType)
  type?: VacationType;
}


