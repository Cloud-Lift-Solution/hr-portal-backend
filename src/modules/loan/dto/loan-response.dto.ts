import { LoanType, LoanStatus } from '@prisma/client';

export class LoanEmployeeInfoDto {
  id: string;
  name: string;
  companyEmail: string | null;
  department: {
    id: string;
    name: string;
  } | null;
}

export class LoanResponseDto {
  id: string;
  employeeId: string;
  employee?: LoanEmployeeInfoDto;
  loanAmount: number;
  purpose: string;
  type: LoanType;
  numberOfInstallments: number;
  numberOfPaymentsMade: number;
  remainingInstallments: number; // Calculated
  installmentAmount: number; // Calculated
  month: number | null;
  year: number | null;
  paymentStartDate: Date;
  note: string | null;
  status: LoanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentResponseDto {
  id: string;
  numberOfPaymentsMade: number;
  remainingInstallments: number;
  installmentAmount: number;
  status: LoanStatus;
  message: string;
}

export class LoanListResponseDto {
  data: LoanResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
