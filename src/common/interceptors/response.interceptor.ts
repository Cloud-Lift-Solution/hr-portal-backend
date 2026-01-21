import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18nContext } from 'nestjs-i18n';
import { SuccessResponse } from '../interfaces/error-response.interface';

export const RESPONSE_MESSAGE_KEY = 'response_message';

/**
 * Decorator to set custom response message for an endpoint
 * Usage: @ResponseMessage('auth.loginSuccess')
 */
export const ResponseMessage = (message: string) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(RESPONSE_MESSAGE_KEY, message, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(RESPONSE_MESSAGE_KEY, message, target);
    return target;
  };
};

/**
 * Global Response Interceptor
 * Wraps all successful responses in a standard format
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;

    // Get custom message from decorator or use default
    const messageKey = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        // Get translated message
        const i18n = I18nContext.current();
        let message = 'Success';

        if (messageKey && i18n) {
          const translated = i18n.t(messageKey);
          if (translated && translated !== messageKey) {
            message = translated as string;
          }
        } else if (messageKey) {
          message = messageKey;
        }

        // Build the standard response
        const successResponse: SuccessResponse<T> = {
          success: true,
          statusCode,
          message,
          data,
          timestamp: new Date().toISOString(),
        };

        return successResponse;
      }),
    );
  }
}
