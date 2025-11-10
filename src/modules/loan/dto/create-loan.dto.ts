import {
  IsUUID,
  IsEnum,
  IsNotEmpty,
  IsInt,
  Min,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { LoanType } from '@prisma/client';

export class CreateLoanDto {
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  loanAmount: number;

  @IsEnum(LoanType)
  @IsNotEmpty()
  type: LoanType;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  numberOfInstallments: number;

  @IsDateString()
  @IsNotEmpty()
  paymentStartDate: string;

  // Required only if type is ADD_TO_PAYROLL
  @ValidateIf((o) => o.type === LoanType.ADD_TO_PAYROLL)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  // Required only if type is ADD_TO_PAYROLL
  @ValidateIf((o) => o.type === LoanType.ADD_TO_PAYROLL)
  @IsInt()
  @Min(new Date().getFullYear())
  year?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  note?: string;
}

function Max(arg0: number): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    // Implementation handled by class-validator
  };
}
