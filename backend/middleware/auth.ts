import { Request, Response, NextFunction } from 'express';
import { clerkClient, getAuth } from '@clerk/express';

export interface AuthRequest extends Request {
  auth?: {
    userId: string | null;
    sessionId: string | null;
  };
  userId?: string;
  userRole?: 'OPERATOR' | 'EMPLOYEE';
}

/**
 * Middleware to verify Clerk JWT and attach user info to request
 */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get auth from Clerk middleware (must be added in server.ts)
    const auth = getAuth(req);
    
    if (!auth.userId) {
      return res.status(401).json({ error: 'Unauthorized - No user ID' });
    }

    // Get user from Clerk
    const user = await clerkClient.users.getUser(auth.userId);
    
    // Attach user info to request
    req.userId = user.id;
    req.userRole = (user.publicMetadata?.role as 'OPERATOR' | 'EMPLOYEE') || 'EMPLOYEE';
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Unauthorized - Authentication failed' });
  }
}

/**
 * Middleware to require operator role
 */
export function requireOperator(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'OPERATOR') {
    return res.status(403).json({ error: 'Forbidden - Operator access required' });
  }
  next();
}
