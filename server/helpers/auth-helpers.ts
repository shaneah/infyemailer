import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if a user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user) {
    return next();
  }
  
  return res.status(401).json({ message: 'Not authenticated' });
}

/**
 * Middleware to check if a client user is authenticated
 */
export function isClientAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.clientUser) {
    return next();
  }
  
  return res.status(401).json({ message: 'Client not authenticated' });
}

/**
 * Middleware to check if the logged in user is an admin
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ message: 'Unauthorized. Admin access required.' });
}

/**
 * Middleware to validate if a client user has specific permissions
 */
export function hasPermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.clientUser) {
      return res.status(401).json({ message: 'Client not authenticated' });
    }
    
    const clientUser = req.session.clientUser;
    
    // Check if user has needed permission
    if (clientUser.permissions && clientUser.permissions[permission]) {
      return next();
    }
    
    return res.status(403).json({ 
      message: `Unauthorized. Missing required permission: ${permission}` 
    });
  };
}

/**
 * Create validation decorator for client permissions
 */
export function requireClientPermission(permission: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(req: Request, res: Response, next: NextFunction) {
      if (!req.session || !req.session.clientUser) {
        return res.status(401).json({ message: 'Client not authenticated' });
      }
      
      const clientUser = req.session.clientUser;
      
      // Check if user has needed permission
      if (clientUser.permissions && clientUser.permissions[permission]) {
        return originalMethod.apply(this, [req, res, next]);
      }
      
      return res.status(403).json({ 
        message: `Unauthorized. Missing required permission: ${permission}` 
      });
    };
    
    return descriptor;
  };
}

/**
 * Helper to get current authenticated user
 */
export function getCurrentUser(req: Request) {
  return req.session && req.session.user ? req.session.user : null;
}

/**
 * Helper to get current authenticated client user
 */
export function getCurrentClientUser(req: Request) {
  return req.session && req.session.clientUser ? req.session.clientUser : null;
}

/**
 * Extend Request interface to include custom session properties
 */
declare module 'express-session' {
  interface SessionData {
    user?: any;
    clientUser?: any;
  }
}