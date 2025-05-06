import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate if user is authenticated
 */
export function validateAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

/**
 * Middleware to validate if user is an admin
 */
export function validateAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Check if user has admin role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  
  next();
}

/**
 * Middleware to validate if user is a client user
 */
export function validateClientUser(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Check if user has client user role
  if (!req.user || req.user.role !== 'client') {
    return res.status(403).json({ message: 'Forbidden: Client access required' });
  }
  
  next();
}

/**
 * Middleware to check if user has specific permission
 */
export function validatePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Only admins bypass permission checks
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has the required permission
    if (!req.user || 
        !req.user.permissions || 
        !Array.isArray(req.user.permissions) || 
        !req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        message: `Forbidden: Missing required permission: ${permission}` 
      });
    }
    
    next();
  };
}