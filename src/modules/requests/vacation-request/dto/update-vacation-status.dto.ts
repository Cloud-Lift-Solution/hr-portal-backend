import { IsEnum } from 'class-validator';
import { VacationStatus } from '@prisma/client';

export class UpdateVacationStatusDto {
  @IsEnum(VacationStatus)
  status: VacationStatus;
}
