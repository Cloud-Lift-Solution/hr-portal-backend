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
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServerDto {
  @ApiPropertyOptional({
    description: 'Project ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'server.projectIdInvalid' })
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Server contract reference number',
    minLength: 2,
    maxLength: 50,
    example: 'SRV-2025-001',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'server.contractNoTooShort' })
  @MaxLength(50, { message: 'server.contractNoTooLong' })
  contractNo?: string;

  @ApiPropertyOptional({
    description: 'Server/hosting price',
    minimum: 0.01,
    maximum: 999999999.99,
    example: 5000.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'server.priceInvalid' })
  @Min(0.01, { message: 'server.pricePositive' })
  @Max(999999999.99, { message: 'server.priceTooLarge' })
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    description: 'Package/plan number or identifier',
    minLength: 1,
    maxLength: 50,
    example: 'PKG-001',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'server.packageNumRequired' })
  @MaxLength(50, { message: 'server.packageNumTooLong' })
  packageNum?: string;

  @ApiPropertyOptional({
    description: 'Service start date',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'server.startDateInvalid' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Service end date',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'server.endDateInvalid' })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Attachment URL for contract document (null to remove)',
    maxLength: 2048,
    example: 'https://s3.amazonaws.com/bucket/server-contract.pdf',
  })
  @IsOptional()
  @IsUrl({}, { message: 'server.attachmentUrlInvalid' })
  @MaxLength(2048, { message: 'server.attachmentUrlTooLong' })
  attachmentUrl?: string | null;
}

