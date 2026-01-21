import { ApiProperty } from '@nestjs/swagger';
import { LoanStatus } from '@prisma/client';

export class UpcomingPaymentDto {
  @ApiProperty({ description: 'Installment ID' })
  id: string;

  @ApiProperty({ description: 'Payment amount', example: 50 })
  amount: number;

  @ApiProperty({ description: 'Due date', example: '2026-03-02' })
  dueDate: string;

  @ApiProperty({ description: 'Due month', example: 3 })
  dueMonth: number;

  @ApiProperty({ description: 'Due year', example: 2026 })
  dueYear: number;
}

export class ActiveLoanDto {
  @ApiProperty({ description: 'Loan ID' })
  id: string;

  @ApiProperty({ description: 'Loan purpose', example: 'Personal Loan' })
  purpose: string;

  @ApiProperty({ description: 'Loan status', example: 'ACTIVE' })
  status: LoanStatus;

  @ApiProperty({ description: 'Start date', example: '2025-01-03' })
  startedDate: Date;

  @ApiProperty({ description: 'Total loan amount', example: 300 })
  totalAmount: number;

  @ApiProperty({ description: 'Remaining balance to be paid', example: 200 })
  remainingBalance: number;

  @ApiProperty({ description: 'Monthly payment amount', example: 50 })
  monthlyPayment: number;

  @ApiProperty({ description: 'Upcoming payments for this loan', type: [UpcomingPaymentDto] })
  upcomingPayments: UpcomingPaymentDto[];
}

export class ActiveLoansResponseDto {
  @ApiProperty({ description: 'List of active loans', type: [ActiveLoanDto] })
  activeLoans: ActiveLoanDto[];
}
