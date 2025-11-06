import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  IsInt,
  IsDateString,
} from 'class-validator';
import { DeductionType } from '@prisma/client';

export class CreateDeductionDto {
  @IsUUID()
  employeeId: string;

  @IsEnum(DeductionType)
  type: DeductionType;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number;

  @IsDateString()
  month: string;
}


