import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from './aws.service';
import { GetSignedUrlDto, UploadFileDto } from './dto';
import { FileUploadValidator } from './validators/file-upload.validator';
import { FILE_VALIDATORS } from './validators/file-type.constants';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileUploadValidator(FILE_VALIDATORS.GENERAL_FILE)],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<{ key: string; url: string }> {
    return await this.awsService.uploadFile(file, uploadFileDto.folder);
  }

  @Post('signed-url')
  @HttpCode(HttpStatus.OK)
  async getSignedUrl(
    @Body() getSignedUrlDto: GetSignedUrlDto,
  ): Promise<{ signedUrl: string }> {
    const signedUrl = await this.awsService.getSignedUrl(
      getSignedUrlDto.key,
      getSignedUrlDto.expiresIn,
    );

    return { signedUrl };
  }
}
