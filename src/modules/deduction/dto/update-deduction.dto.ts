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

export class UpdateDeductionDto {
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsEnum(DeductionType)
  type?: DeductionType;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number | null;

  @IsOptional()
  @IsDateString()
  month?: string;
}
