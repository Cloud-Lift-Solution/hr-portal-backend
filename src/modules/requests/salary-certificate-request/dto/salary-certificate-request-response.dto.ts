import { SalaryCertificateStatus } from '@prisma/client';

export class SalaryCertificateEmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: { id: string; name: string } | null;
}

export class SalaryCertificateRequestResponseDto {
  id: string;
  employee: SalaryCertificateEmployeeInfoDto;
  reason: string;
  description: string | null;
  status: SalaryCertificateStatus;
  createdAt: Date;
  updatedAt: Date;
}
