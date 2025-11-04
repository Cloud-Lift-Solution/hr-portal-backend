import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AwsService } from '../../modules/aws/aws.service';

/**
 * Usage:
 * @UseInterceptors(S3SignedUrlInterceptor)
 */
@Injectable()
export class S3SignedUrlInterceptor implements NestInterceptor {
  private readonly s3Fields = [
    'cvFileKey',
    'portfolioFileKey',
    'iconKey',
    'additionalFileKeys',
  ];

  constructor(private readonly awsService: AwsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      switchMap(async (response) => {
        if (!response) return response;

        if (response.data !== undefined) {
          console.log('response data:', response.data);

          const transformedData = Array.isArray(response.data)
            ? await this.transformArray(response.data)
            : await this.transformObject(response.data);

          return {
            ...response,
            data: transformedData,
          };
        }

        // Handle direct response (no wrapper)
        if (Array.isArray(response)) {
          return await this.transformArray(response);
        }

        return await this.transformObject(response);
      }),
    );
  }

  private async transformArray(items: any[]): Promise<any[]> {
    if (items.length === 0) return items;

    const keySet = new Set<string>();

    for (const item of items) {
      for (const field of this.s3Fields) {
        const value = item?.[field];
        if (!value) continue;

        if (Array.isArray(value)) {
          for (const key of value) {
            if (key) keySet.add(key);
          }
        } else {
          keySet.add(value);
        }
      }
    }

    if (keySet.size === 0) return items;

    const signedUrls = await this.awsService.batchGetSignedUrls([...keySet]);

    return items.map((item) => this.mapSignedUrls(item, signedUrls));
  }

  private async transformObject(obj: any): Promise<any> {
    if (!obj || typeof obj !== 'object') return obj;

    const keySet = new Set<string>();

    for (const field of this.s3Fields) {
      const value = obj[field];
      if (!value) continue;

      if (Array.isArray(value)) {
        for (const key of value) {
          if (key) keySet.add(key);
        }
      } else {
        keySet.add(value);
      }
    }

    if (keySet.size === 0) return obj;

    const signedUrls = await this.awsService.batchGetSignedUrls([...keySet]);

    return this.mapSignedUrls(obj, signedUrls);
  }

  private mapSignedUrls(obj: any, signedUrlMap: Record<string, string>): any {
    const result = { ...obj };

    for (const field of this.s3Fields) {
      const value = result[field];

      if (!value) continue;

      if (Array.isArray(value)) {
        result[field] = value.map((key) => signedUrlMap[key] || key);
      } else {
        result[field] = signedUrlMap[value] || value;
      }
    }

    return result;
  }
}
