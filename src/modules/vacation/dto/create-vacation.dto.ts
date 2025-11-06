import { IsUUID, IsEnum, IsDateString } from 'class-validator';
import { VacationReason, VacationType } from '@prisma/client';

export class CreateVacationDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  departureDay: string;

  @IsDateString()
  returnDay: string;

  @IsEnum(VacationReason)
  reason: VacationReason;

  @IsEnum(VacationType)
  type: VacationType;
}


