import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdditionalNameDto } from './additional-name.dto';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Primary organization name',
    example: 'Syntax Maker Inc',
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
    description: 'Additional organization names with optional attachments',
    type: [AdditionalNameDto],
    example: [
      {
        name: 'شركة صانع الصيغة',
        attachmentUrl: 'https://s3.amazonaws.com/bucket/registration.pdf',
      },
      {
        name: 'Syntax Trade Co',
        attachmentUrl: null,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalNameDto)
  additionalNames?: AdditionalNameDto[];
}

