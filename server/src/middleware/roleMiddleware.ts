import { RequestHandler, Request } from 'express';

// Extend the Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    email?: string;
    imageUrl?: string;
    role?: 'student' | 'teacher' | 'admin';
  };
}

export const requireRole = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({ message: 'Unauthorized: No user found' });
      return;
    }

    const userRole = authReq.user.role;
    
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ 
        message: `Forbidden: Requires ${roles.join(' or ')} role` 
      });
      return;
    }

    next();
  };
};