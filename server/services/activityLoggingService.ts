import { db } from "../db";
import { 
  clientActivities, 
  dataUploads,
  type ClientActivity,
  type DataUpload
} from "@shared/schema";
import { eq, and, sql, desc, like, lte, gte } from "drizzle-orm";
import { format, subDays } from "date-fns";

// Define filter types
export interface ActivityFilter {
  clientId?: number;
  clientUserId?: number;
  actionType?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface UploadFilter {
  clientId?: number;
  clientUserId?: number;
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Log client activity
 */
export async function logActivity(data: Omit<ClientActivity, 'id' | 'createdAt'>) {
  try {
    const [activity] = await db.insert(clientActivities)
      .values(data)
      .returning();
    
    return activity;
  } catch (error) {
    console.error("Error logging client activity:", error);
    throw error;
  }
}

/**
 * Log data upload
 */
export async function logUpload(data: Omit<DataUpload, 'id' | 'uploadedAt'>) {
  try {
    const [upload] = await db.insert(dataUploads)
      .values(data)
      .returning();
    
    return upload;
  } catch (error) {
    console.error("Error logging data upload:", error);
    throw error;
  }
}

/**
 * Update upload processing status
 */
export async function updateUpload(
  id: number, 
  data: Partial<Omit<DataUpload, 'id' | 'uploadedAt'>>
) {
  try {
    const [upload] = await db.update(dataUploads)
      .set({
        ...data,
        processedAt: data.status === 'completed' || data.status === 'failed' 
          ? new Date() 
          : undefined
      })
      .where(eq(dataUploads.id, id))
      .returning();
    
    return upload;
  } catch (error) {
    console.error("Error updating data upload:", error);
    throw error;
  }
}

/**
 * Get activity by ID
 */
export async function getActivity(id: number) {
  try {
    const [activity] = await db.select()
      .from(clientActivities)
      .where(eq(clientActivities.id, id));
    
    return activity;
  } catch (error) {
    console.error("Error fetching activity:", error);
    throw error;
  }
}

/**
 * Get upload by ID
 */
export async function getUpload(id: number) {
  try {
    const [upload] = await db.select()
      .from(dataUploads)
      .where(eq(dataUploads.id, id));
    
    return upload;
  } catch (error) {
    console.error("Error fetching upload:", error);
    throw error;
  }
}

/**
 * Get activities with filters and pagination
 */
export async function getActivities(filters: ActivityFilter = {}) {
  try {
    const { 
      clientId, 
      clientUserId, 
      actionType, 
      action, 
      startDate, 
      endDate,
      limit = 10,
      offset = 0
    } = filters;
    
    let query = db.select().from(clientActivities);
    
    // Add filters
    if (clientId) {
      query = query.where(eq(clientActivities.clientId, clientId));
    }
    
    if (clientUserId) {
      query = query.where(eq(clientActivities.clientUserId, clientUserId));
    }
    
    if (actionType) {
      query = query.where(eq(clientActivities.actionType, actionType));
    }
    
    if (action) {
      query = query.where(eq(clientActivities.action, action));
    }
    
    if (startDate) {
      query = query.where(gte(clientActivities.createdAt, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(clientActivities.createdAt, endDate));
    }
    
    // Count total
    const countQuery = db.select({ count: sql<number>`count(*)` })
      .from(clientActivities)
      .where(query['wheres'] ? query['wheres'] : sql`1=1`);
    
    const [countResult] = await countQuery;
    const total = countResult?.count || 0;
    
    // Get data with pagination
    const activities = await query
      .orderBy(desc(clientActivities.createdAt))
      .limit(limit)
      .offset(offset);
    
    return {
      activities,
      pagination: {
        total,
        limit,
        offset
      }
    };
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}

/**
 * Get uploads with filters and pagination
 */
export async function getUploads(filters: UploadFilter = {}) {
  try {
    const { 
      clientId, 
      clientUserId, 
      type, 
      status, 
      startDate, 
      endDate,
      limit = 10,
      offset = 0
    } = filters;
    
    let query = db.select().from(dataUploads);
    
    // Add filters
    if (clientId) {
      query = query.where(eq(dataUploads.clientId, clientId));
    }
    
    if (clientUserId) {
      query = query.where(eq(dataUploads.clientUserId, clientUserId));
    }
    
    if (type) {
      query = query.where(eq(dataUploads.type, type));
    }
    
    if (status) {
      query = query.where(eq(dataUploads.status, status));
    }
    
    if (startDate) {
      query = query.where(gte(dataUploads.uploadedAt, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(dataUploads.uploadedAt, endDate));
    }
    
    // Count total
    const countQuery = db.select({ count: sql<number>`count(*)` })
      .from(dataUploads)
      .where(query['wheres'] ? query['wheres'] : sql`1=1`);
    
    const [countResult] = await countQuery;
    const total = countResult?.count || 0;
    
    // Get data with pagination
    const uploads = await query
      .orderBy(desc(dataUploads.uploadedAt))
      .limit(limit)
      .offset(offset);
    
    return {
      uploads,
      pagination: {
        total,
        limit,
        offset
      }
    };
  } catch (error) {
    console.error("Error fetching uploads:", error);
    throw error;
  }
}

/**
 * Get activity statistics for the admin dashboard
 */
export async function getActivityStatistics() {
  try {
    // Get the total number of activities
    const [totalActivities] = await db.select({ count: sql<number>`count(*)` })
      .from(clientActivities);
    
    // Get unique clients count
    const [uniqueClientsCount] = await db.select({ count: sql<number>`count(distinct ${clientActivities.clientId})` })
      .from(clientActivities);
    
    // Get activity counts by type
    const activityTypeCount = await db.select({
        type: clientActivities.actionType,
        count: sql<number>`count(*)`
      })
      .from(clientActivities)
      .groupBy(clientActivities.actionType)
      .orderBy(sql`count(*) desc`);
    
    // Get activity counts by action
    const activityActionCount = await db.select({
        action: clientActivities.action,
        count: sql<number>`count(*)`
      })
      .from(clientActivities)
      .groupBy(clientActivities.action)
      .orderBy(sql`count(*) desc`);
    
    // Get activity trend over the last 14 days
    const trendDates = Array.from({ length: 14 }).map((_, i) => {
      return format(subDays(new Date(), i), 'yyyy-MM-dd');
    }).reverse();
    
    const trend = await Promise.all(trendDates.map(async (date) => {
      const [result] = await db.select({ count: sql<number>`count(*)` })
        .from(clientActivities)
        .where(sql`DATE(${clientActivities.createdAt}) = ${date}`);
      
      return {
        date,
        count: result?.count || 0
      };
    }));
    
    // Get the total number of uploads
    const [totalUploads] = await db.select({ count: sql<number>`count(*)` })
      .from(dataUploads);
    
    // Get upload counts by type
    const uploadTypeCount = await db.select({
        type: dataUploads.type,
        count: sql<number>`count(*)`
      })
      .from(dataUploads)
      .groupBy(dataUploads.type)
      .orderBy(sql`count(*) desc`);
    
    // Get upload counts by status
    const uploadStatusCount = await db.select({
        status: dataUploads.status,
        count: sql<number>`count(*)`
      })
      .from(dataUploads)
      .groupBy(dataUploads.status)
      .orderBy(sql`count(*) desc`);
    
    return {
      activities: {
        total: totalActivities?.count || 0,
        uniqueClients: uniqueClientsCount?.count || 0,
        byType: activityTypeCount,
        byAction: activityActionCount,
        trend
      },
      uploads: {
        total: totalUploads?.count || 0,
        byType: uploadTypeCount,
        byStatus: uploadStatusCount
      }
    };
  } catch (error) {
    console.error("Error fetching activity statistics:", error);
    throw error;
  }
}