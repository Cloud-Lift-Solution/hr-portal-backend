import { FileValidator, BadRequestException } from '@nestjs/common';

export interface FileUploadValidatorOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

export class FileUploadValidator extends FileValidator {
  constructor(private readonly options: FileUploadValidatorOptions) {
    super({});
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file) {
      return false;
    }

    // Validate file size
    if (this.options.maxSize && file.size > this.options.maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.options.maxSize / 1024 / 1024}MB`,
      );
    }

    // Validate MIME type
    if (
      this.options.allowedMimeTypes &&
      !this.options.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.options.allowedMimeTypes.join(', ')}`,
      );
    }

    // Validate file extension
    if (this.options.allowedExtensions) {
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      if (
        !fileExtension ||
        !this.options.allowedExtensions.includes(fileExtension)
      ) {
        throw new BadRequestException(
          `File extension .${fileExtension} is not allowed. Allowed extensions: ${this.options.allowedExtensions.join(', ')}`,
        );
      }
    }

    return true;
  }

  buildErrorMessage(): string {
    return 'File validation failed';
  }
}
