import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: unknown) => {
        const statusCode: number = response.statusCode ?? 200;

        // If controller already returned in desired shape, keep it
        if (
          data !== null &&
          typeof data === 'object' &&
          'data' in (data as Record<string, unknown>) &&
          'message' in (data as Record<string, unknown>) &&
          'status' in (data as Record<string, unknown>) &&
          'statusCode' in (data as Record<string, unknown>)
        ) {
          return data;
        }

        let message = 'Successfully';
        const status = 'success';
        if (
          data !== null &&
          typeof data === 'object' &&
          typeof (data as Record<string, unknown>).message === 'string'
        ) {
          message = (data as Record<string, unknown>).message as string;
        }

        return {
          data,
          message,
          status: status,
          statusCode,
        } as {
          data: unknown;
          message: string;
          status: string;
          statusCode: number;
        };
      }),
    );
  }
}
