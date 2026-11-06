import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import type { Response } from 'express';

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiErrorFilter.name);
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    let status = 500;
    let message: string | string[] = 'Internal server error';
    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      message = typeof body === 'string' ? body : (body as { message: string | string[] }).message;
    } else if (error instanceof UniqueConstraintError) {
      status = 400;
      message = 'A record with this value already exists';
    } else if (error instanceof ForeignKeyConstraintError) {
      status = 400;
      message = 'Referenced record does not exist or is still in use';
    } else if (error instanceof ValidationError) {
      status = 400;
      message = error.errors.map((e) => e.message);
    }
    if (status === 500) this.logger.error(error instanceof Error ? error.name : 'Unexpected error');
    response.status(status).json({ success: false, message });
  }
}
