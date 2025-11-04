import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { envConfig } from '../../config/env.config';

@Injectable()
export class AwsService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: envConfig.aws.region,
      credentials: {
        accessKeyId: envConfig.aws.accessKeyId,
        secretAccessKey: envConfig.aws.secretAccessKey,
      },
    });
    this.bucketName = envConfig.aws.s3BucketName;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{ key: string; url: string }> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = folder ? `${folder}/${fileName}` : fileName;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const signedUrl = await this.getSignedUrl(key, 3600);

      return { key, url: signedUrl };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      console.error('Get signed URL error:', error);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }

  /**
   * Batch generate signed URLs for better performance
   * @param keys - Array of S3 keys
   * @param expiresIn - Expiration time in seconds (default: 3600)
   * @returns Map of key -> signed URL
   */
  async batchGetSignedUrls(
    keys: string[],
    expiresIn: number = 3600,
  ): Promise<Record<string, string>> {
    if (!keys || keys.length === 0) {
      return {};
    }

    try {
      const urlMap: Record<string, string> = {};

      // Generate all signed URLs in parallel
      await Promise.all(
        keys.map(async (key) => {
          try {
            urlMap[key] = await this.getSignedUrl(key, expiresIn);
          } catch (error) {
            console.error(
              `Failed to generate signed URL for key: ${key}`,
              error,
            );
            urlMap[key] = key; // Fallback to original key
          }
        }),
      );

      return urlMap;
    } catch (error) {
      console.error('Failed to batch generate signed URLs', error);
      // Return original keys as fallback
      const fallbackMap: Record<string, string> = {};
      for (const key of keys) {
        fallbackMap[key] = key;
      }
      return fallbackMap;
    }
  }
}
