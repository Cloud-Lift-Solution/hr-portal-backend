import {
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdditionalNameDto } from './additional-name.dto';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({
    description: 'Primary organization name',
    example: 'Syntax Maker Inc',
    minLength: 2,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description:
      'Additional organization names (replaces all existing additional names)',
    type: [AdditionalNameDto],
    example: [
      {
        name: 'شركة صانع الصيغة',
        attachmentUrl: 'https://s3.amazonaws.com/bucket/registration.pdf',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalNameDto)
  additionalNames?: AdditionalNameDto[];
}

