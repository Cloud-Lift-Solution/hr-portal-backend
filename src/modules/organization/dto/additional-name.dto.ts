import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsUrl,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdditionalNameDto {
  @ApiPropertyOptional({
    description: 'Additional name ID (for updates)',
    example: 'uuid-here',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Additional organization name (e.g., Arabic name, Trade name)',
    example: 'شركة صانع الصيغة',
    minLength: 2,
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    description: 'S3 URL for supporting document (e.g., registration certificate)',
    example: 'https://s3.amazonaws.com/bucket/document.pdf',
    maxLength: 2048,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({}, { message: 'Invalid URL format for attachment' })
  attachmentUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}

