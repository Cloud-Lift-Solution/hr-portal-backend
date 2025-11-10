import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAllowanceDto {
  @ApiPropertyOptional({
    description: 'Allowance name',
    example: 'Transportation Allowance',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'Allowance amount',
    example: 50.0,
    minimum: 0.01,
    maximum: 999999999.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(999999999.99)
  fees?: number;

  @ValidateIf((o) => !o.name && !o.fees)
  validate() {
    throw new Error('At least one field (name or fees) must be provided');
  }
}
