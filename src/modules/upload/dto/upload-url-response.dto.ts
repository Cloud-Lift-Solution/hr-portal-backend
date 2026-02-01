import { ApiProperty } from '@nestjs/swagger';

export class UploadUrlResponseDto {
  @ApiProperty({
    description: 'Pre-signed URL for uploading the file',
    example: 'https://bucket.s3.region.amazonaws.com/...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: 'S3 key/path where the file will be stored',
    example: 'uploads/2026/01/uuid-filename.jpg',
  })
  fileKey: string;

  @ApiProperty({
    description: 'Public URL to access the file after upload',
    example: 'https://bucket.s3.region.amazonaws.com/uploads/2026/01/uuid-filename.jpg',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'Expiration time of the upload URL in seconds',
    example: 3600,
  })
  expiresIn: number;
}
