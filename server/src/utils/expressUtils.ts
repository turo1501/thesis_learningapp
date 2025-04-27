import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async controller function to properly handle errors and ensure Promise<void> return type
 * This is a utility to make TypeScript happy with Express route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 