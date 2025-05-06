import { Router } from 'express';
import { z } from 'zod';
import { activityLoggingService } from '../services/activityLoggingService';
import { db } from '../db';
import { eq, desc, and } from 'drizzle-orm';
import { clientActivities, dataUploads, clients, clientUsers } from '@shared/schema';
import { validateAdmin } from '../helpers/authHelpers';

const router = Router();

// Middleware to verify admin authentication
router.use(validateAdmin);

/**
 * Get all client activities across the entire system
 * Can be filtered by date range, client, action type, etc.
 */
router.get('/activities', async (req, res) => {
  try {
    // Parse query parameters with validation
    const querySchema = z.object({
      limit: z.coerce.number().optional().default(100),
      offset: z.coerce.number().optional().default(0),
      clientId: z.coerce.number().optional(),
      startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      action: z.string().optional(),
      actionType: z.string().optional(),
    });

    const query = querySchema.safeParse(req.query);
    
    if (!query.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: query.error.format() 
      });
    }

    // Build the query
    let dbQuery = db.select({
      activity: clientActivities,
      clientName: clients.name,
      clientCompany: clients.company,
      userName: clientUsers.username
    })
    .from(clientActivities)
    .leftJoin(clients, eq(clientActivities.clientId, clients.id))
    .leftJoin(clientUsers, eq(clientActivities.clientUserId, clientUsers.id))
    .orderBy(desc(clientActivities.createdAt))
    .limit(query.data.limit)
    .offset(query.data.offset);

    // Add filters
    if (query.data.clientId) {
      dbQuery = dbQuery.where(eq(clientActivities.clientId, query.data.clientId));
    }

    if (query.data.startDate) {
      dbQuery = dbQuery.where(
        and(
          query.data.clientId ? eq(clientActivities.clientId, query.data.clientId) : undefined,
          clientActivities.createdAt >= query.data.startDate
        )
      );
    }

    if (query.data.endDate) {
      dbQuery = dbQuery.where(
        and(
          query.data.clientId ? eq(clientActivities.clientId, query.data.clientId) : undefined,
          query.data.startDate ? clientActivities.createdAt >= query.data.startDate : undefined,
          clientActivities.createdAt <= query.data.endDate
        )
      );
    }

    if (query.data.action) {
      dbQuery = dbQuery.where(eq(clientActivities.action, query.data.action));
    }

    if (query.data.actionType) {
      dbQuery = dbQuery.where(eq(clientActivities.actionType, query.data.actionType));
    }

    // Execute the query
    const activities = await dbQuery;

    // Count total matching activities for pagination
    const [{ count }] = await db.select({
      count: db.fn.count(clientActivities.id)
    })
    .from(clientActivities)
    .where(
      and(
        query.data.clientId ? eq(clientActivities.clientId, query.data.clientId) : undefined,
        query.data.startDate ? clientActivities.createdAt >= query.data.startDate : undefined,
        query.data.endDate ? clientActivities.createdAt <= query.data.endDate : undefined,
        query.data.action ? eq(clientActivities.action, query.data.action) : undefined,
        query.data.actionType ? eq(clientActivities.actionType, query.data.actionType) : undefined
      )
    );

    // Format the response
    const formattedActivities = activities.map(item => ({
      id: item.activity.id,
      clientId: item.activity.clientId,
      clientName: item.clientName,
      clientCompany: item.clientCompany,
      clientUserId: item.activity.clientUserId,
      userName: item.userName,
      action: item.activity.action,
      actionType: item.activity.actionType,
      entityId: item.activity.entityId,
      description: item.activity.description,
      ipAddress: item.activity.ipAddress,
      userAgent: item.activity.userAgent,
      createdAt: item.activity.createdAt,
      metadata: item.activity.metadata
    }));

    return res.json({
      activities: formattedActivities,
      pagination: {
        total: Number(count),
        limit: query.data.limit,
        offset: query.data.offset
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * Get all data uploads across the entire system
 * Can be filtered by date range, client, file type, etc.
 */
router.get('/uploads', async (req, res) => {
  try {
    // Parse query parameters with validation
    const querySchema = z.object({
      limit: z.coerce.number().optional().default(100),
      offset: z.coerce.number().optional().default(0),
      clientId: z.coerce.number().optional(),
      startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      type: z.string().optional(),
      status: z.string().optional(),
    });

    const query = querySchema.safeParse(req.query);
    
    if (!query.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: query.error.format() 
      });
    }

    // Build the query
    let dbQuery = db.select({
      upload: dataUploads,
      clientName: clients.name,
      clientCompany: clients.company,
      userName: clientUsers.username
    })
    .from(dataUploads)
    .leftJoin(clients, eq(dataUploads.clientId, clients.id))
    .leftJoin(clientUsers, eq(dataUploads.clientUserId, clientUsers.id))
    .orderBy(desc(dataUploads.uploadedAt))
    .limit(query.data.limit)
    .offset(query.data.offset);

    // Add filters
    if (query.data.clientId) {
      dbQuery = dbQuery.where(eq(dataUploads.clientId, query.data.clientId));
    }

    if (query.data.startDate) {
      dbQuery = dbQuery.where(
        and(
          query.data.clientId ? eq(dataUploads.clientId, query.data.clientId) : undefined,
          dataUploads.uploadedAt >= query.data.startDate
        )
      );
    }

    if (query.data.endDate) {
      dbQuery = dbQuery.where(
        and(
          query.data.clientId ? eq(dataUploads.clientId, query.data.clientId) : undefined,
          query.data.startDate ? dataUploads.uploadedAt >= query.data.startDate : undefined,
          dataUploads.uploadedAt <= query.data.endDate
        )
      );
    }

    if (query.data.type) {
      dbQuery = dbQuery.where(eq(dataUploads.type, query.data.type));
    }

    if (query.data.status) {
      dbQuery = dbQuery.where(eq(dataUploads.status, query.data.status));
    }

    // Execute the query
    const uploads = await dbQuery;

    // Count total matching uploads for pagination
    const [{ count }] = await db.select({
      count: db.fn.count(dataUploads.id)
    })
    .from(dataUploads)
    .where(
      and(
        query.data.clientId ? eq(dataUploads.clientId, query.data.clientId) : undefined,
        query.data.startDate ? dataUploads.uploadedAt >= query.data.startDate : undefined,
        query.data.endDate ? dataUploads.uploadedAt <= query.data.endDate : undefined,
        query.data.type ? eq(dataUploads.type, query.data.type) : undefined,
        query.data.status ? eq(dataUploads.status, query.data.status) : undefined
      )
    );

    // Format the response
    const formattedUploads = uploads.map(item => ({
      id: item.upload.id,
      clientId: item.upload.clientId,
      clientName: item.clientName,
      clientCompany: item.clientCompany,
      clientUserId: item.upload.clientUserId,
      userName: item.userName,
      type: item.upload.type,
      filename: item.upload.filename,
      originalFilename: item.upload.originalFilename,
      fileSize: item.upload.fileSize,
      mimeType: item.upload.mimeType,
      status: item.upload.status,
      processedRecords: item.upload.processedRecords,
      totalRecords: item.upload.totalRecords,
      errorCount: item.upload.errorCount,
      errors: item.upload.errors,
      uploadedAt: item.upload.uploadedAt,
      processedAt: item.upload.processedAt,
      ipAddress: item.upload.ipAddress,
      userAgent: item.upload.userAgent,
      metadata: item.upload.metadata
    }));

    return res.json({
      uploads: formattedUploads,
      pagination: {
        total: Number(count),
        limit: query.data.limit,
        offset: query.data.offset
      }
    });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

/**
 * Get activities for a specific client
 */
router.get('/client/:clientId/activities', async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    // Parse query parameters with validation
    const querySchema = z.object({
      limit: z.coerce.number().optional().default(100),
      offset: z.coerce.number().optional().default(0),
      startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      action: z.string().optional(),
      actionType: z.string().optional(),
    });

    const query = querySchema.safeParse(req.query);
    
    if (!query.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: query.error.format() 
      });
    }

    const activities = await activityLoggingService.getClientActivities(clientId, {
      limit: query.data.limit,
      offset: query.data.offset,
      startDate: query.data.startDate,
      endDate: query.data.endDate,
      action: query.data.action,
      actionType: query.data.actionType
    });

    // Count total matching activities for pagination
    const [{ count }] = await db.select({
      count: db.fn.count(clientActivities.id)
    })
    .from(clientActivities)
    .where(
      and(
        eq(clientActivities.clientId, clientId),
        query.data.startDate ? clientActivities.createdAt >= query.data.startDate : undefined,
        query.data.endDate ? clientActivities.createdAt <= query.data.endDate : undefined,
        query.data.action ? eq(clientActivities.action, query.data.action) : undefined,
        query.data.actionType ? eq(clientActivities.actionType, query.data.actionType) : undefined
      )
    );

    return res.json({
      activities,
      pagination: {
        total: Number(count),
        limit: query.data.limit,
        offset: query.data.offset
      }
    });
  } catch (error) {
    console.error('Error fetching client activities:', error);
    return res.status(500).json({ error: 'Failed to fetch client activities' });
  }
});

/**
 * Get uploads for a specific client
 */
router.get('/client/:clientId/uploads', async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    // Parse query parameters with validation
    const querySchema = z.object({
      limit: z.coerce.number().optional().default(100),
      offset: z.coerce.number().optional().default(0),
      startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      type: z.string().optional(),
      status: z.string().optional(),
    });

    const query = querySchema.safeParse(req.query);
    
    if (!query.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: query.error.format() 
      });
    }

    const uploads = await activityLoggingService.getClientUploads(clientId, {
      limit: query.data.limit,
      offset: query.data.offset,
      startDate: query.data.startDate,
      endDate: query.data.endDate,
      type: query.data.type,
      status: query.data.status
    });

    // Count total matching uploads for pagination
    const [{ count }] = await db.select({
      count: db.fn.count(dataUploads.id)
    })
    .from(dataUploads)
    .where(
      and(
        eq(dataUploads.clientId, clientId),
        query.data.startDate ? dataUploads.uploadedAt >= query.data.startDate : undefined,
        query.data.endDate ? dataUploads.uploadedAt <= query.data.endDate : undefined,
        query.data.type ? eq(dataUploads.type, query.data.type) : undefined,
        query.data.status ? eq(dataUploads.status, query.data.status) : undefined
      )
    );

    return res.json({
      uploads,
      pagination: {
        total: Number(count),
        limit: query.data.limit,
        offset: query.data.offset
      }
    });
  } catch (error) {
    console.error('Error fetching client uploads:', error);
    return res.status(500).json({ error: 'Failed to fetch client uploads' });
  }
});

/**
 * Get activity statistics
 */
router.get('/activity-stats', async (req, res) => {
  try {
    // Get total activity counts
    const [totalActivities] = await db.select({
      count: db.fn.count(clientActivities.id)
    }).from(clientActivities);

    // Get total client counts with activities
    const [clientsWithActivities] = await db.select({
      count: db.fn.countDistinct(clientActivities.clientId)
    }).from(clientActivities);

    // Get activities by type
    const activitiesByType = await db.select({
      actionType: clientActivities.actionType,
      count: db.fn.count(clientActivities.id)
    })
    .from(clientActivities)
    .groupBy(clientActivities.actionType)
    .orderBy(desc(db.fn.count(clientActivities.id)));

    // Get activities by action
    const activitiesByAction = await db.select({
      action: clientActivities.action,
      count: db.fn.count(clientActivities.id)
    })
    .from(clientActivities)
    .groupBy(clientActivities.action)
    .orderBy(desc(db.fn.count(clientActivities.id)));

    // Get upload statistics
    const [totalUploads] = await db.select({
      count: db.fn.count(dataUploads.id)
    }).from(dataUploads);

    const uploadsByType = await db.select({
      type: dataUploads.type,
      count: db.fn.count(dataUploads.id)
    })
    .from(dataUploads)
    .groupBy(dataUploads.type)
    .orderBy(desc(db.fn.count(dataUploads.id)));

    const uploadsByStatus = await db.select({
      status: dataUploads.status,
      count: db.fn.count(dataUploads.id)
    })
    .from(dataUploads)
    .groupBy(dataUploads.status)
    .orderBy(desc(db.fn.count(dataUploads.id)));

    // Get recent activity trend (daily for last 14 days)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const activityTrend = await db.select({
      day: db.sql`DATE(${clientActivities.createdAt})`,
      count: db.fn.count(clientActivities.id)
    })
    .from(clientActivities)
    .where(clientActivities.createdAt >= twoWeeksAgo)
    .groupBy(db.sql`DATE(${clientActivities.createdAt})`)
    .orderBy(db.sql`DATE(${clientActivities.createdAt})`);

    // Format the response
    const stats = {
      activities: {
        total: Number(totalActivities.count),
        uniqueClients: Number(clientsWithActivities.count),
        byType: activitiesByType.map(item => ({
          type: item.actionType,
          count: Number(item.count)
        })),
        byAction: activitiesByAction.map(item => ({
          action: item.action,
          count: Number(item.count)
        })),
        trend: activityTrend.map(item => ({
          date: item.day,
          count: Number(item.count)
        }))
      },
      uploads: {
        total: Number(totalUploads.count),
        byType: uploadsByType.map(item => ({
          type: item.type,
          count: Number(item.count)
        })),
        byStatus: uploadsByStatus.map(item => ({
          status: item.status,
          count: Number(item.count)
        }))
      }
    };

    return res.json(stats);
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    return res.status(500).json({ error: 'Failed to fetch activity statistics' });
  }
});

export default router;