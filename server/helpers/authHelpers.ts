import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 */
export const validateAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

/**
 * Middleware to check if user is an admin 
 */
export const validateAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = req.user as any;
  
  if (!user || !user.role || user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized. Admin access required.' });
  }
  
  next();
};