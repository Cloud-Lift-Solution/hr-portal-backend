import { IsEnum } from 'class-validator';
import { SalaryAdvanceStatus } from '@prisma/client';

export class UpdateSalaryAdvanceStatusDto {
  @IsEnum(SalaryAdvanceStatus)
  status: SalaryAdvanceStatus;
}
