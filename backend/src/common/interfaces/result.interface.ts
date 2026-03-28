export interface ResultError {
  readonly code: string;
  readonly message: string;
}

/**
 * @ai-context Encapsulates operation outcomes without throwing exceptions for expected failures.
 * Controllers map `success: false` to appropriate HTTP status codes.
 */
export interface Result<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ResultError;
}

export const Result = {
  ok<T = void>(data?: T): Result<T> {
    return { success: true, data };
  },

  fail<T = never>(code: string, message: string): Result<T> {
    return {
      success: false,
      error: {
        code,
        message,
      },
    };
  },
};
