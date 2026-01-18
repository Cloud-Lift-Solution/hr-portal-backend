import {
  IsString,
  IsUUID,
  IsUrl,
  IsOptional,
  IsDateString,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServerDto {
  @ApiProperty({
    description: 'Project ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'server.projectIdInvalid' })
  projectId: string;

  @ApiProperty({
    description: 'Server contract reference number',
    minLength: 2,
    maxLength: 50,
    example: 'SRV-2025-001',
  })
  @IsString()
  @MinLength(2, { message: 'server.contractNoTooShort' })
  @MaxLength(50, { message: 'server.contractNoTooLong' })
  contractNo: string;

  @ApiProperty({
    description: 'Server/hosting price',
    minimum: 0.01,
    maximum: 999999999.99,
    example: 5000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'server.priceInvalid' })
  @Min(0.01, { message: 'server.pricePositive' })
  @Max(999999999.99, { message: 'server.priceTooLarge' })
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Package/plan number or identifier',
    minLength: 1,
    maxLength: 50,
    example: 'PKG-001',
  })
  @IsString()
  @MinLength(1, { message: 'server.packageNumRequired' })
  @MaxLength(50, { message: 'server.packageNumTooLong' })
  packageNum: string;

  @ApiProperty({
    description: 'Service start date',
    example: '2025-01-01',
  })
  @IsDateString({}, { message: 'server.startDateInvalid' })
  startDate: string;

  @ApiProperty({
    description: 'Service end date',
    example: '2025-12-31',
  })
  @IsDateString({}, { message: 'server.endDateInvalid' })
  endDate: string;

  @ApiPropertyOptional({
    description: 'Attachment URL for contract document',
    maxLength: 2048,
    example: 'https://s3.amazonaws.com/bucket/server-contract.pdf',
  })
  @IsOptional()
  @IsUrl({}, { message: 'server.attachmentUrlInvalid' })
  @MaxLength(2048, { message: 'server.attachmentUrlTooLong' })
  attachmentUrl?: string;
}

