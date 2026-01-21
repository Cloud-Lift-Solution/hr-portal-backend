import { ApiProperty } from '@nestjs/swagger';

export class LoanHistoryItemDto {
  @ApiProperty({ description: 'Loan ID' })
  id: string;

  @ApiProperty({ description: 'Loan purpose', example: 'Personal Loan' })
  purpose: string;

  @ApiProperty({ description: 'Loan status', example: 'COMPLETED' })
  status: string;

  @ApiProperty({ description: 'Start date', example: '2025-01-03' })
  startedDate: Date;

  @ApiProperty({ description: 'Total amount paid', example: 300 })
  totalPaid: number;

  @ApiProperty({ description: 'Number of installment months', example: 12 })
  installmentMonths: number;
}

export class LoanHistoryResponseDto {
  @ApiProperty({ description: 'List of completed loans', type: [LoanHistoryItemDto] })
  data: LoanHistoryItemDto[];

  @ApiProperty({ description: 'Pagination info' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
