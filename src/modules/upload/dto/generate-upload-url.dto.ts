import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FileType {
  IMAGE = 'image',
  PDF = 'pdf',
  DOCUMENT = 'document',
  VIDEO = 'video',
  ANY = 'any',
}

export class GenerateUploadUrlDto {
  @ApiProperty({
    description: 'Original filename with extension',
    example: 'profile-photo.jpg',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  @IsString()
  contentType: string;

  @ApiProperty({
    description: 'Type of file being uploaded',
    enum: FileType,
    example: FileType.IMAGE,
    required: false,
  })
  @IsEnum(FileType)
  @IsOptional()
  fileType?: FileType;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(100 * 1024 * 1024) // 100MB max
  @IsOptional()
  fileSize?: number;
}
