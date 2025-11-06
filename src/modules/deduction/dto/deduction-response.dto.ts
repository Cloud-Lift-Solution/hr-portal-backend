import { DeductionType } from '@prisma/client';

export class DeductionEmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: { id: string; name: string } | null;
}

export class DeductionResponseDto {
  id: string;
  type: DeductionType;
  amount: number | null;
  days: number | null;
  month: Date;
  employee: DeductionEmployeeInfoDto;
  createdAt: Date;
  updatedAt: Date;
}


