import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsUUID,
  IsUrl,
  IsDateString,
  IsNumber,
  IsInt,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectType, PaymentMethod } from '@prisma/client';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Project type',
    enum: ProjectType,
    example: ProjectType.COMPANY_PROJECTS,
  })
  @IsOptional()
  @IsEnum(ProjectType, { message: 'project.typeInvalid' })
  type?: ProjectType;

  @ApiPropertyOptional({
    description: 'Project name',
    minLength: 2,
    maxLength: 200,
    example: 'HR Management System',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'project.nameTooShort' })
  @MaxLength(200, { message: 'project.nameTooLong' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Department ID (optional, null to remove)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'project.departmentInvalid' })
  departmentId?: string | null;

  @ApiPropertyOptional({
    description: 'Client full name',
    minLength: 2,
    maxLength: 200,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'project.clientNameTooShort' })
  @MaxLength(200, { message: 'project.clientNameTooLong' })
  clientName?: string;

  @ApiPropertyOptional({
    description: 'Client phone number',
    example: '+96599887766',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'project.clientPhoneInvalid' })
  @MaxLength(20, { message: 'project.clientPhoneInvalid' })
  @Matches(/^[\d\s\+\-\(\)]+$/, { message: 'project.clientPhoneInvalid' })
  clientPhone?: string;

  @ApiPropertyOptional({
    description: 'Client email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'project.clientEmailInvalid' })
  @MaxLength(255, { message: 'project.clientEmailInvalid' })
  clientEmail?: string;

  @ApiPropertyOptional({
    description: 'Client Civil ID (12 digits, null to remove)',
    example: '285123456789',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{12}$/, { message: 'project.civilIdInvalid' })
  clientCivilId?: string | null;

  @ApiPropertyOptional({
    description: 'Contract signing date',
    example: '2025-11-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'project.contractDateInvalid' })
  contractDate?: string;

  @ApiPropertyOptional({
    description: 'Contract reference number',
    minLength: 2,
    maxLength: 50,
    example: 'CNT-2025-001',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'project.contractNoTooShort' })
  @MaxLength(50, { message: 'project.contractNoTooLong' })
  contractNo?: string;

  @ApiPropertyOptional({
    description: 'Total project price in KWD',
    example: 15000.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'project.priceInvalid' })
  @Min(0.01, { message: 'project.pricePositive' })
  @Max(999999999.99, { message: 'project.priceTooLarge' })
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    description: 'Payment split method',
    enum: PaymentMethod,
    example: PaymentMethod.TWO_PAYMENT,
  })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'project.paymentMethodInvalid' })
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Number of working days',
    minimum: 1,
    maximum: 3650,
    example: 90,
  })
  @IsOptional()
  @IsInt({ message: 'project.worksDayInvalid' })
  @Min(1, { message: 'project.worksDayPositive' })
  @Max(3650, { message: 'project.worksDayTooLarge' })
  @Type(() => Number)
  worksDay?: number;

  @ApiPropertyOptional({
    description: 'Maintenance period (1-5)',
    minimum: 1,
    maximum: 5,
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'project.maintainceInvalid' })
  @Min(1, { message: 'project.maintainceRange' })
  @Max(5, { message: 'project.maintainceRange' })
  @Type(() => Number)
  maintaince?: number;

  // Payment percentages - optional for update
  @ApiPropertyOptional({
    description: 'First payment percentage',
    example: 50.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'project.paymentPercentInvalid' })
  @Min(0.01, { message: 'project.paymentPercentRange' })
  @Max(100.0, { message: 'project.paymentPercentRange' })
  @Type(() => Number)
  paymentOnePercent?: number | null;

  @ApiPropertyOptional({
    description: 'Second payment percentage',
    example: 50.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'project.paymentPercentInvalid' })
  @Min(0.01, { message: 'project.paymentPercentRange' })
  @Max(100.0, { message: 'project.paymentPercentRange' })
  @Type(() => Number)
  paymentTwoPercent?: number | null;

  @ApiPropertyOptional({
    description: 'Third payment percentage',
    example: 50.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'project.paymentPercentInvalid' })
  @Min(0.01, { message: 'project.paymentPercentRange' })
  @Max(100.0, { message: 'project.paymentPercentRange' })
  @Type(() => Number)
  paymentThreePercent?: number | null;

  @ApiPropertyOptional({
    description: 'Fourth payment percentage',
    example: 50.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'project.paymentPercentInvalid' })
  @Min(0.01, { message: 'project.paymentPercentRange' })
  @Max(100.0, { message: 'project.paymentPercentRange' })
  @Type(() => Number)
  paymentFourPercent?: number | null;

  @ApiPropertyOptional({
    description: 'Attachment URL for contract document (null to remove)',
    maxLength: 2048,
    example: 'https://s3.amazonaws.com/bucket/contract-123.pdf',
  })
  @IsOptional()
  @IsUrl({}, { message: 'project.attachmentUrlInvalid' })
  @MaxLength(2048, { message: 'project.attachmentUrlTooLong' })
  attachmentUrl?: string | null;
}

