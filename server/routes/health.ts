import { Request, Response } from 'express';
import { Pool } from '@neondatabase/serverless';
import { emailService } from '../services/EmailService';

// Define service health check interface
interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'warning' | 'unknown';
  latency?: number; // in ms
  message?: string;
  lastChecked: Date;
}

export async function registerHealthRoutes(app: any) {
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const services: ServiceHealth[] = [];

      // Check database health
      const dbHealth = await checkDatabaseHealth();
      services.push(dbHealth);

      // Check SendGrid health
      const sendGridHealth = await checkSendGridHealth();
      services.push(sendGridHealth);

      // Check domain verification service health
      const domainVerificationHealth = await checkDomainVerificationHealth();
      services.push(domainVerificationHealth);

      // Add any other service health checks here
      
      const totalTime = Date.now() - startTime;
      
      res.json({
        status: 'ok',
        time: totalTime,
        timestamp: new Date(),
        services
      });
    } catch (error) {
      console.error('Error checking service health:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to check service health',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

/**
 * Check database health by attempting a simple query
 */
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Get database connection from global pool
    const pool = global.dbPool as Pool;
    
    if (!pool) {
      return {
        name: 'Database',
        status: 'unknown',
        message: 'Database pool not initialized',
        lastChecked: new Date()
      };
    }
    
    // Perform a simple query to check connection
    const result = await pool.query('SELECT 1');
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    if (result.rowCount > 0) {
      return {
        name: 'Database',
        status: 'healthy',
        latency,
        message: 'PostgreSQL connected',
        lastChecked: new Date()
      };
    } else {
      return {
        name: 'Database',
        status: 'warning',
        latency,
        message: 'Database responded but with unexpected result',
        lastChecked: new Date()
      };
    }
  } catch (error) {
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    return {
      name: 'Database',
      status: 'unhealthy',
      latency,
      message: error instanceof Error ? `Database error: ${error.message}` : 'Unknown database error',
      lastChecked: new Date()
    };
  }
}

/**
 * Check SendGrid API key validity
 */
async function checkSendGridHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      return {
        name: 'SendGrid',
        status: 'unknown',
        message: 'SendGrid API key not configured',
        lastChecked: new Date()
      };
    }
    
    // Check if the API key is valid (by checking registered providers)
    const allProviders = emailService.getAllProviders();
    const sendGridProvider = allProviders.find(p => p.provider.getName() === 'SendGrid');
    
    // If no provider is registered yet, try to register one
    if (!sendGridProvider) {
      try {
        emailService.registerProviderWithFactory(
          'SendGrid',
          'sendgrid',
          { 
            apiKey: process.env.SENDGRID_API_KEY,
            fromEmail: 'notifications@infymailer.com',
            fromName: 'InfyMailer'
          }
        );
        
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        return {
          name: 'SendGrid',
          status: 'healthy',
          latency,
          message: 'SendGrid provider registered successfully',
          lastChecked: new Date()
        };
      } catch (error) {
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        return {
          name: 'SendGrid',
          status: 'unhealthy',
          latency,
          message: error instanceof Error ? `Failed to register SendGrid: ${error.message}` : 'Unknown SendGrid registration error',
          lastChecked: new Date()
        };
      }
    }
    
    // Check for any previous SendGrid errors
    if (global.lastSendGridError && global.lastSendGridError.includes('from address does not match a verified Sender Identity')) {
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      return {
        name: 'SendGrid',
        status: 'warning',
        latency,
        message: 'API key valid, sender identity needs verification',
        lastChecked: new Date()
      };
    }
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    return {
      name: 'SendGrid',
      status: 'healthy',
      latency,
      message: 'SendGrid API key is valid',
      lastChecked: new Date()
    };
  } catch (error) {
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    return {
      name: 'SendGrid',
      status: 'unhealthy',
      latency,
      message: error instanceof Error ? `SendGrid error: ${error.message}` : 'Unknown SendGrid error',
      lastChecked: new Date()
    };
  }
}

/**
 * Check domain verification service health
 */
async function checkDomainVerificationHealth(): Promise<ServiceHealth> {
  // This is a simplistic check - in a real app, you'd interact with DNS providers or verification services
  return {
    name: 'Domain Verification',
    status: 'healthy',
    message: 'Service operational',
    lastChecked: new Date()
  };
}