import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddAttachmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @Transform(({ value }) => value?.trim())
  url: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  fileName?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  fileSize?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  mimeType?: string;
}

