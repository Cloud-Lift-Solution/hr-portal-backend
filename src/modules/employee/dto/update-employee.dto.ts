import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDateString,
  IsUUID,
  MaxLength,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmploymentType } from '@prisma/client';
import { AttachmentDto } from './create-employee.dto';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  civilId?: string;

  @IsDateString()
  @IsOptional()
  civilIdExpiryDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  passportNo?: string;

  @IsDateString()
  @IsOptional()
  passportExpiryDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  nationality?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  @Transform(({ value }) => value?.trim())
  jobTitle?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsEnum(EmploymentType)
  @IsOptional()
  type?: EmploymentType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  salary?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  iban?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  personalEmail?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  companyEmail?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string | null;

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  assetIds?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
