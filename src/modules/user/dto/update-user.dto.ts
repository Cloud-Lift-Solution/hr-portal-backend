import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AgeRange } from '@prisma/client';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(100)
  password?: string;

  @IsEnum(AgeRange)
  age: AgeRange;
}
