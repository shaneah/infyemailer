import { Request } from 'express';
import { db } from '../db';
import { eq, gte, lte, desc } from 'drizzle-orm';
import { clientActivities, dataUploads, type InsertClientActivity, type InsertDataUpload } from '@shared/schema';

/**
 * Service for tracking client activities and data uploads
 */
class ActivityLoggingService {
  /**
   * Log a client activity
   * @param req Express request object (for IP and user agent)
   * @param data Activity data
   * @returns The logged activity record
   */
  async logActivity(req: Request, data: Omit<InsertClientActivity, 'ipAddress' | 'userAgent'>): Promise<any> {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress || '';
      const userAgent = req.get('User-Agent') || '';
      
      const [activity] = await db.insert(clientActivities).values({
        ...data,
        ipAddress,
        userAgent,
      }).returning();
      
      return activity;
    } catch (error) {
      console.error('Error logging client activity:', error);
      // Don't throw - we don't want logging failures to crash the application
      return null;
    }
  }
  
  /**
   * Track a file upload by a client
   * @param req Express request object
   * @param data Upload details
   * @returns The tracked upload record
   */
  async trackUpload(req: Request, data: Omit<InsertDataUpload, 'ipAddress' | 'userAgent'>): Promise<any> {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress || '';
      const userAgent = req.get('User-Agent') || '';
      
      const [upload] = await db.insert(dataUploads).values({
        ...data,
        ipAddress,
        userAgent,
      }).returning();
      
      return upload;
    } catch (error) {
      console.error('Error tracking file upload:', error);
      // Don't throw - we don't want logging failures to crash the application
      return null;
    }
  }
  
  /**
   * Update an upload record's status
   * @param uploadId ID of the upload to update
   * @param status New status
   * @param processedData Optional processing data
   */
  async updateUploadStatus(
    uploadId: number,
    status: string,
    processedData?: {
      processedRecords?: number;
      totalRecords?: number;
      errorCount?: number;
      errors?: any;
      metadata?: any;
    }
  ): Promise<any> {
    try {
      const [updatedUpload] = await db.update(dataUploads)
        .set({
          status,
          processedAt: new Date(),
          ...(processedData || {}),
        })
        .where(eq(dataUploads.id, uploadId))
        .returning();
        
      return updatedUpload;
    } catch (error) {
      console.error('Error updating upload status:', error);
      return null;
    }
  }
  
  /**
   * Get client activities with optional filtering
   * @param clientId The client ID to filter by
   * @param options Filter options
   */
  async getClientActivities(clientId: number, options: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    actionType?: string;
    action?: string;
  } = {}): Promise<any[]> {
    try {
      let query = db.select().from(clientActivities)
        .where(eq(clientActivities.clientId, clientId))
        .orderBy(desc(clientActivities.createdAt));
      
      if (options.startDate) {
        query = query.where(gte(clientActivities.createdAt, options.startDate));
      }
      
      if (options.endDate) {
        query = query.where(lte(clientActivities.createdAt, options.endDate));
      }
      
      if (options.actionType) {
        query = query.where(eq(clientActivities.actionType, options.actionType));
      }
      
      if (options.action) {
        query = query.where(eq(clientActivities.action, options.action));
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.offset(options.offset);
      }
      
      return await query;
    } catch (error) {
      console.error('Error getting client activities:', error);
      return [];
    }
  }
  
  /**
   * Get client data uploads with optional filtering
   * @param clientId The client ID to filter by
   * @param options Filter options
   */
  async getClientUploads(clientId: number, options: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    type?: string;
    status?: string;
  } = {}): Promise<any[]> {
    try {
      let query = db.select().from(dataUploads)
        .where(eq(dataUploads.clientId, clientId))
        .orderBy(desc(dataUploads.uploadedAt));
      
      if (options.startDate) {
        query = query.where(gte(dataUploads.uploadedAt, options.startDate));
      }
      
      if (options.endDate) {
        query = query.where(lte(dataUploads.uploadedAt, options.endDate));
      }
      
      if (options.type) {
        query = query.where(eq(dataUploads.type, options.type));
      }
      
      if (options.status) {
        query = query.where(eq(dataUploads.status, options.status));
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.offset(options.offset);
      }
      
      return await query;
    } catch (error) {
      console.error('Error getting client uploads:', error);
      return [];
    }
  }
}

// Export as a singleton
export const activityLoggingService = new ActivityLoggingService();