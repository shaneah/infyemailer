import { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware for admin users
 * Verifies that the user is authenticated and has admin access
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ message: 'Not authenticated' });
}

/**
 * Authentication middleware for client users
 * Verifies that the client user is authenticated
 */
export function isClientAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Check if client is authenticated via session
  if (req.session && req.session.clientUser) {
    return next();
  }
  
  return res.status(401).json({ message: 'Not authenticated as client' });
}

/**
 * Authorization middleware for checking specific client permissions
 * Usage: authorize('campaigns', 'contacts')
 * @param permissions - List of permission keys to check for
 */
export function authorize(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.clientUser) {
      return res.status(401).json({ message: 'Not authenticated as client' });
    }
    
    const clientUser = req.session.clientUser;
    
    // If no permissions are provided, just check for authenticated client
    if (permissions.length === 0) {
      return next();
    }
    
    // Check if client has all required permissions
    if (clientUser.permissions) {
      const hasAllPermissions = permissions.every(permission => 
        clientUser.permissions[permission] === true
      );
      
      if (hasAllPermissions) {
        return next();
      }
    }
    
    return res.status(403).json({ 
      message: 'Unauthorized access',
      requiredPermissions: permissions
    });
  };
}

/**
 * Create a client-specific context for authenticated requests
 * @param req - Express request
 * @returns Client context object with session data
 */
export function getClientContext(req: Request) {
  if (!req.session || !req.session.clientUser) {
    return null;
  }
  
  return {
    clientUser: req.session.clientUser,
    clientId: req.session.clientUser.clientId || req.session.clientUser.id,
    permissions: req.session.clientUser.permissions || {},
    authenticated: true
  };
}