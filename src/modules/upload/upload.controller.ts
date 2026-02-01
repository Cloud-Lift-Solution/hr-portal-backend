import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { S3Service } from './services/s3.service';
import { GenerateUploadUrlDto, UploadUrlResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('File Upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  /**
   * Generate a pre-signed URL for uploading a file to S3
   * Returns the upload URL and the final file URL that will be accessible after upload
   */
  @Post('generate-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate pre-signed upload URL',
    description:
      'Generates a pre-signed URL for uploading files directly to S3. Returns both the upload URL and the final public URL.',
  })
  async generateUploadUrl(
    @Body() dto: GenerateUploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    const { uploadUrl, fileKey, fileUrl } =
      await this.s3Service.generatePresignedUploadUrl(
        dto.fileName,
        dto.contentType,
        3600, // 1 hour expiration
      );

    return {
      uploadUrl,
      fileKey,
      fileUrl,
      expiresIn: 3600,
    };
  }

  /**
   * Delete a file from S3
   * Useful for cleanup when upload fails or file needs to be removed
   */
  @Delete(':fileKey(*)')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete file from S3',
    description: 'Deletes a file from S3 using its file key',
  })
  async deleteFile(@Param('fileKey') fileKey: string): Promise<void> {
    await this.s3Service.deleteFile(fileKey);
  }
}
