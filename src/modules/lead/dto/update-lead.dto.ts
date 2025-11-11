import { IsString, IsEmail, IsOptional, IsUrl, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLeadDto {
  @ApiPropertyOptional({
    description: 'Lead name',
    minLength: 2,
    maxLength: 200,
    example: 'Enterprise Software Solution',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  leadName?: string;

  @ApiPropertyOptional({
    description: 'Client name',
    minLength: 2,
    maxLength: 200,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  clientName?: string;

  @ApiPropertyOptional({
    description: 'Client phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'clientPhone must be a valid phone number in E.164 format',
  })
  clientPhone?: string;

  @ApiPropertyOptional({
    description: 'Client email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'clientEmail must be a valid email address' })
  clientEmail?: string;

  @ApiPropertyOptional({
    description: 'Reference or lead source',
    minLength: 2,
    maxLength: 500,
    example: 'Referred by existing client',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  reference?: string;

  @ApiPropertyOptional({
    description: 'Attachment URL (optional)',
    maxLength: 2048,
    example: 'https://example.com/document.pdf',
  })
  @IsOptional()
  @IsUrl({}, { message: 'attachmentUrl must be a valid URL' })
  @MaxLength(2048)
  attachmentUrl?: string;
}

