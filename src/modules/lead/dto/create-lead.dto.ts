import { IsString, IsEmail, IsOptional, IsUrl, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Lead name',
    minLength: 2,
    maxLength: 200,
    example: 'Enterprise Software Solution',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  leadName: string;

  @ApiProperty({
    description: 'Client name',
    minLength: 2,
    maxLength: 200,
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  clientName: string;

  @ApiProperty({
    description: 'Client phone number',
    example: '+1234567890',
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'clientPhone must be a valid phone number in E.164 format',
  })
  clientPhone: string;

  @ApiProperty({
    description: 'Client email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'clientEmail must be a valid email address' })
  clientEmail: string;

  @ApiProperty({
    description: 'Reference or lead source',
    minLength: 2,
    maxLength: 500,
    example: 'Referred by existing client',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  reference: string;

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

