import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  Min,
  IsNumber,
  IsString,
  MaxLength,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class EmployeeLoanRequestDto {
  @ApiProperty({ description: 'Loan amount', example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  loanAmount: number;

  @ApiProperty({ description: 'Loan purpose/reason', example: 'Medical expenses' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  purpose: string;

  @ApiProperty({ description: 'Number of monthly installments', example: 5 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  numberOfInstallments: number;

  @ApiPropertyOptional({
    description: 'Payment start date (first installment due date). Defaults to current date if not provided.',
    example: '2026-02-01',
  })
  @IsDateString()
  @IsOptional()
  paymentStartDate?: string;
}
