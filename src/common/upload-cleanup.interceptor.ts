import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError } from 'rxjs';
import { unlink } from 'node:fs/promises';
import type { Request } from 'express';

@Injectable()
export class UploadCleanupInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    return next.handle().pipe(
      catchError(async (error: unknown) => {
        if (request.file?.path) await unlink(request.file.path).catch(() => undefined);
        throw error;
      }),
    );
  }
}
