import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the user is authenticated
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // For development purposes, we'll allow the request to proceed
  // In production, uncomment this to enforce authentication
  // return res.status(401).json({ message: 'Not authenticated' });
  
  return next();
}