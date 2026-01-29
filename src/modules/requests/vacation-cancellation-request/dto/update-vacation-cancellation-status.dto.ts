import { IsEnum } from 'class-validator';
import { VacationCancellationStatus } from '@prisma/client';

export class UpdateVacationCancellationStatusDto {
  @IsEnum(VacationCancellationStatus)
  status: VacationCancellationStatus;
}
