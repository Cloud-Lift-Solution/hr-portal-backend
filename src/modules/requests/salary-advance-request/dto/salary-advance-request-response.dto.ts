import { SalaryAdvanceStatus } from '@prisma/client';

export class SalaryAdvanceEmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: { id: string; name: string } | null;
}

export class SalaryAdvanceRequestResponseDto {
  id: string;
  employee: SalaryAdvanceEmployeeInfoDto;
  month: number;
  year: number;
  description: string | null;
  status: SalaryAdvanceStatus;
  createdAt: Date;
  updatedAt: Date;
}
