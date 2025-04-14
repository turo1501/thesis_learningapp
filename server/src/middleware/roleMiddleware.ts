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
    console.log('Role Middleware - Checking role:', roles);
    console.log('Role Middleware - User object:', authReq.user);
    
    if (!authReq.user) {
      console.log('Role Middleware - No user found in request');
      res.status(401).json({ message: 'Unauthorized: No user found' });
      return;
    }

    const userRole = authReq.user.role;
    console.log('Role Middleware - User role:', userRole);
    
    if (!userRole || !roles.includes(userRole)) {
      console.log('Role Middleware - User role not authorized. Required:', roles, 'Got:', userRole);
      res.status(403).json({ 
        message: `Forbidden: Requires ${roles.join(' or ')} role` 
      });
      return;
    }

    console.log('Role Middleware - Role check passed');
    next();
  };
};