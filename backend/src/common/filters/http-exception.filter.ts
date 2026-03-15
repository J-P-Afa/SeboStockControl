import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResultError } from '../interfaces/result.interface';

/**
 * Filter to catch all HttpExceptions and normalize the response body.
 * Ensures the response follows the { code, message } contract for the frontend.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let error: ResultError;

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'code' in exceptionResponse &&
      'message' in exceptionResponse
    ) {
      // Structure already matches ResultError
      error = exceptionResponse as ResultError;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      // Handle NestJS default structure or other objects
      const body = exceptionResponse as any;
      error = {
        code: body.code || exception.name || 'INTERNAL_ERROR',
        message: body.message || exception.message,
      };
    } else {
      // Fallback for string responses
      error = {
        code: exception.name || 'INTERNAL_ERROR',
        message: String(exceptionResponse) || exception.message,
      };
    }

    response.status(status).json(error);
  }
}
