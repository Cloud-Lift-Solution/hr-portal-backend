import { IsEnum } from 'class-validator';
import { SickLeaveStatus } from '@prisma/client';

export class UpdateSickLeaveStatusDto {
  @IsEnum(SickLeaveStatus)
  status: SickLeaveStatus;
}
