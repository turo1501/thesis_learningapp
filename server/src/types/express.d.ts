import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name?: string;
        email?: string;
        imageUrl?: string;
        role?: 'student' | 'teacher' | 'admin';
      };
      auth?: {
        userId?: string;
        sessionId?: string;
      };
    }
  }
}

// This file must be a module
export {};
