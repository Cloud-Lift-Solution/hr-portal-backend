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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectType, PaymentMethod } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project type',
    enum: ProjectType,
    example: ProjectType.COMPANY_PROJECTS,
  })
  @IsEnum(ProjectType, { message: 'project.typeInvalid' })
  type: ProjectType;

  @ApiProperty({
    description: 'Project name',
    minLength: 2,
    maxLength: 200,
    example: 'HR Management System',
  })
  @IsString()
  @MinLength(2, { message: 'project.nameTooShort' })
  @MaxLength(200, { message: 'project.nameTooLong' })
  name: string;

  @ApiPropertyOptional({
    description: 'Department ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'project.departmentInvalid' })
  departmentId?: string;

  @ApiProperty({
    description: 'Client full name',
    minLength: 2,
    maxLength: 200,
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2, { message: 'project.clientNameTooShort' })
  @MaxLength(200, { message: 'project.clientNameTooLong' })
  clientName: string;

  @ApiProperty({
    description: 'Client phone number',
    example: '+96599887766',
  })
  @IsString()
  @MinLength(8, { message: 'project.clientPhoneInvalid' })
  @MaxLength(20, { message: 'project.clientPhoneInvalid' })
  @Matches(/^[\d\s\+\-\(\)]+$/, { message: 'project.clientPhoneInvalid' })
  clientPhone: string;

  @ApiProperty({
    description: 'Client email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'project.clientEmailInvalid' })
  @MaxLength(255, { message: 'project.clientEmailInvalid' })
  clientEmail: string;

  @ApiPropertyOptional({
    description: 'Client Civil ID (12 digits)',
    example: '285123456789',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{12}$/, { message: 'project.civilIdInvalid' })
  clientCivilId?: string;

  @ApiProperty({
    description: 'Contract signing date',
    example: '2025-11-15T10:30:00Z',
  })
  @IsDateString({}, { message: 'project.contractDateInvalid' })
  contractDate: string;

  @ApiProperty({
    description: 'Contract reference number',
    minLength: 2,
    maxLength: 50,
    example: 'CNT-2025-001',
  })
  @IsString()
  @MinLength(2, { message: 'project.contractNoTooShort' })
  @MaxLength(50, { message: 'project.contractNoTooLong' })
  contractNo: string;

  @ApiProperty({
    description: 'Total project price in KWD',
    example: 15000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'project.priceInvalid' })
  @Min(0.01, { message: 'project.pricePositive' })
  @Max(999999999.99, { message: 'project.priceTooLarge' })
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Payment split method',
    enum: PaymentMethod,
    example: PaymentMethod.TWO_PAYMENT,
  })
  @IsEnum(PaymentMethod, { message: 'project.paymentMethodInvalid' })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Number of working days',
    minimum: 1,
    maximum: 3650,
    example: 90,
  })
  @IsInt({ message: 'project.worksDayInvalid' })
  @Min(1, { message: 'project.worksDayPositive' })
  @Max(3650, { message: 'project.worksDayTooLarge' })
  @Type(() => Number)
  worksDay: number;

  @ApiProperty({
    description: 'Maintenance period (1-5)',
    minimum: 1,
    maximum: 5,
    example: 1,
  })
  @IsInt({ message: 'project.maintainceInvalid' })
  @Min(1, { message: 'project.maintainceRange' })
  @Max(5, { message: 'project.maintainceRange' })
  @Type(() => Number)
  maintaince: number;

  // Payment percentages - conditional validation
  @ApiPropertyOptional({
    description: 'First payment percentage (required for TWO/THREE/FOUR payment methods)',
    example: 50.0,
  })
  @ValidateIf((o) => o.paymentMethod !== PaymentMethod.FULL_PAYMENT)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'project.paymentPercentInvalid' })
  @Min(0.01, { message: 'project.paymentPercentRange' })
  @Max(100.0, { message: 'project.paymentPercentRange' })
  @Type(() => Number)
  paymentOnePercent?: number;

  @ApiPropertyOptional({
    description: 'Second payment percentage (required for TWO/THREE/FOUR payment methods)',
    example: 50.0,
  })
  @ValidateIf((o) => o.paymentMethod !== PaymentMethod.FULL_PAYMENT)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'project.paymentPercentInvalid' })
  @Min(0.01, { message: 'project.paymentPercentRange' })
  @Max(100.0, { message: 'project.paymentPercentRange' })
  @Type(() => Number)
  paymentTwoPercent?: number;

  @ApiPropertyOptional({
    description: 'Third payment percentage (required for THREE/FOUR payment methods)',
    example: 50.0,
  })
  @ValidateIf((o) =>
    o.paymentMethod === PaymentMethod.THREE_PAYMENT || o.paymentMethod === PaymentMethod.FOUR_PAYMENT,
  )
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'project.paymentPercentInvalid' })
  @Min(0.01, { message: 'project.paymentPercentRange' })
  @Max(100.0, { message: 'project.paymentPercentRange' })
  @Type(() => Number)
  paymentThreePercent?: number;

  @ApiPropertyOptional({
    description: 'Fourth payment percentage (required for FOUR payment method)',
    example: 50.0,
  })
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.FOUR_PAYMENT)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'project.paymentPercentInvalid' })
  @Min(0.01, { message: 'project.paymentPercentRange' })
  @Max(100.0, { message: 'project.paymentPercentRange' })
  @Type(() => Number)
  paymentFourPercent?: number;

  @ApiPropertyOptional({
    description: 'Attachment URL for contract document',
    maxLength: 2048,
    example: 'https://s3.amazonaws.com/bucket/contract-123.pdf',
  })
  @IsOptional()
  @IsUrl({}, { message: 'project.attachmentUrlInvalid' })
  @MaxLength(2048, { message: 'project.attachmentUrlTooLong' })
  attachmentUrl?: string;
}

