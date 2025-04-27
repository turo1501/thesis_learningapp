import { RequestHandler } from 'express';
import { clerkClient } from '../index';

// We don't need to redefine these interfaces since they're already in express.d.ts
// Just use the global Express.Request type

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    // Check if Clerk auth middleware has already authenticated the user
    // Use type assertion to access auth property
    const userId = (req as any).auth?.userId;
    
    console.log('Auth Middleware - Auth Object:', (req as any).auth);
    console.log('Auth Middleware - UserId:', userId);
    
    if (!userId) {
      console.log('Auth Middleware - No userId found in request');
      res.status(401).json({ message: 'Unauthorized: Not authenticated' });
      return;
    }
    
    try {
      // Get user data
      const user = await clerkClient.users.getUser(userId);
      
      // If user not found
      if (!user) {
        console.log('Auth Middleware - User not found for userId:', userId);
        res.status(403).json({ message: 'Forbidden: User not found' });
        return;
      }
      
      // Add user to request using type assertion
      (req as any).user = {
        id: user.id,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
        email: user.emailAddresses[0]?.emailAddress,
        imageUrl: user.imageUrl,
        role: (user.publicMetadata.userType as 'student' | 'teacher' | 'admin') || 'student',
      };
      
      console.log("Auth Middleware - User role:", (req as any).user?.role);
      
      next();
    } catch (error) {
      console.error('Auth Middleware - Error getting user data:', error);
      res.status(401).json({ message: 'Unauthorized: Invalid user data' });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
}; 