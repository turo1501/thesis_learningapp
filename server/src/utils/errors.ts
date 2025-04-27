/**
 * Custom API Error class for handling application errors with status codes
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Factory function to create ApiErrors with common status codes
 */
export const createError = {
  badRequest: (message: string = 'Bad Request') => new ApiError(400, message),
  unauthorized: (message: string = 'Unauthorized') => new ApiError(401, message),
  forbidden: (message: string = 'Forbidden') => new ApiError(403, message),
  notFound: (message: string = 'Not Found') => new ApiError(404, message),
  methodNotAllowed: (message: string = 'Method Not Allowed') => new ApiError(405, message),
  conflict: (message: string = 'Conflict') => new ApiError(409, message),
  tooManyRequests: (message: string = 'Too Many Requests') => new ApiError(429, message),
  serverError: (message: string = 'Internal Server Error') => new ApiError(500, message),
};

/**
 * Global error handler middleware for Express
 */
export const errorHandler = (err: any, _req: any, res: any, _next: any) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      success: false,
      error: 'Database operation failed',
      details: err.message,
    });
  }

  // Handle other errors
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
}; 
 
 