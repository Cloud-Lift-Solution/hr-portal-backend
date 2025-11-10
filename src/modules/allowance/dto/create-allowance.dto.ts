import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAllowanceDto {
  @ApiProperty({
    description: 'Allowance name (e.g., Transportation, Housing, Food)',
    example: 'Transportation Allowance',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Default allowance amount',
    example: 50.0,
    minimum: 0.01,
    maximum: 999999999.99,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Max(999999999.99)
  fees: number;
}
