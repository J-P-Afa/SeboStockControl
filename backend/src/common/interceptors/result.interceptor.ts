import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Result, ResultError } from '../interfaces/result.interface';

/**
 * Interceptor to automatically wrap all successful responses in the Result Pattern structure.
 * If the response is an unsuccessful Result, it throws the corresponding NestJS HttpException.
 */
@Injectable()
export class ResultInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If it's a Result object
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          ('data' in data || 'error' in data)
        ) {
          const result = data as Result<unknown>;

          if (result.success) {
            return result;
          }

          // If not successful, throw appropriate exception
          this.throwException(result.error!);
        }

        // Otherwise, wrap it in the Result.ok pattern
        return Result.ok(data);
      }),
    );
  }

  private throwException(error: ResultError | string): never {
    let code = 'BAD_REQUEST';
    let message = 'Erro de requisição';

    if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      code = error.code || 'BAD_REQUEST';
      message = error.message || 'Erro de requisição';
    }

    const errorObj = { code, message };

    // Map common error codes to NestJS exceptions
    if (code.includes('NOT_FOUND')) {
      throw new NotFoundException(errorObj);
    }

    if (code.includes('ALREADY_EXISTS') || code.includes('CONFLICT')) {
      throw new ConflictException(errorObj);
    }

    if (code.includes('UNAUTHORIZED') || code.includes('INVALID_CREDENTIALS')) {
      throw new UnauthorizedException(errorObj);
    }

    if (code.includes('FORBIDDEN') || code.includes('PERMISSION_DENIED')) {
      throw new ForbiddenException(errorObj);
    }

    if (code.includes('INTERNAL_ERROR')) {
      throw new InternalServerErrorException(errorObj);
    }

    // Default to BadRequest for other business logic errors
    throw new BadRequestException(errorObj);
  }
}
