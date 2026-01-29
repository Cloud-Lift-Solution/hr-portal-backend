import { IsEnum } from 'class-validator';
import { VacationExtensionStatus } from '@prisma/client';

export class UpdateVacationExtensionStatusDto {
  @IsEnum(VacationExtensionStatus)
  status: VacationExtensionStatus;
}
