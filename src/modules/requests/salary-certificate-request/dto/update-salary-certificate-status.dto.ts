import { IsEnum } from 'class-validator';
import { SalaryCertificateStatus } from '@prisma/client';

export class UpdateSalaryCertificateStatusDto {
  @IsEnum(SalaryCertificateStatus)
  status: SalaryCertificateStatus;
}
