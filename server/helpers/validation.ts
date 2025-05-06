import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Middleware to validate request body against a Zod schema
 * @param schema The Zod schema to validate against
 */
export const validateRequestBody = <T extends z.ZodType>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessages = result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        
        return res.status(400).json({
          error: 'Validation failed',
          details: errorMessages
        });
      }

      // Replace the request body with the validated data
      req.body = result.data;
      return next();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error during validation'
      });
    }
  };
};

/**
 * Middleware to validate request query parameters against a Zod schema
 * @param schema The Zod schema to validate against
 */
export const validateRequestQuery = <T extends z.ZodType>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errorMessages = result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        
        return res.status(400).json({
          error: 'Query validation failed',
          details: errorMessages
        });
      }

      // Replace the request query with the validated data
      req.query = result.data as any;
      return next();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error during query validation'
      });
    }
  };
};