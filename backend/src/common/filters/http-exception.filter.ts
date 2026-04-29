import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResultError } from '../interfaces/result.interface';

/**
 * Filter to catch all HttpExceptions and normalize the response body.
 * Ensures the response follows the { code, message } contract for the frontend.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, error } = this.normalizeException(exception);

    response.status(status).json({
      success: false,
      error,
    });
  }

  private normalizeException(exception: unknown): {
    status: number;
    error: ResultError;
  } {
    if (this.isPrismaForeignKeyConstraintError(exception)) {
      return {
        status: HttpStatus.CONFLICT,
        error: {
          code: 'FOREIGN_KEY_CONSTRAINT',
          message:
            'Não é possível excluir este registro porque ele já está sendo usado.',
        },
      };
    }

    if (!(exception instanceof HttpException)) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      };
    }

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
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      // Handle NestJS default structure or other objects
      const body = exceptionResponse as Record<string, unknown>;
      error = {
        code: (body.code as string) || exception.name || 'INTERNAL_ERROR',
        message: (body.message as string) || exception.message,
      };
    } else {
      // Fallback for string responses
      error = {
        code: exception.name || 'INTERNAL_ERROR',
        message: String(exceptionResponse) || exception.message,
      };
    }

    return {
      status,
      error,
    };
  }

  private isPrismaForeignKeyConstraintError(exception: unknown): boolean {
    if (exception === null || typeof exception !== 'object') return false;

    const error = exception as { code?: unknown };
    return error.code === 'P2003' || error.code === 'P2014';
  }
}
