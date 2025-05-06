import { Router, Request, Response } from 'express';
import { 
  getActivities, 
  getUploads, 
  getActivity, 
  getUpload, 
  getActivityStatistics, 
  ActivityFilter,
  UploadFilter
} from '../services/activityLoggingService';
import { validateAdmin } from '../helpers/authHelpers';
import { parse } from 'date-fns';

const router = Router();

// Middleware to ensure only admins can access these routes
router.use(validateAdmin);

// Get activity statistics
router.get('/activity-stats', async (req: Request, res: Response) => {
  try {
    const stats = await getActivityStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    res.status(500).json({ error: 'Failed to fetch activity statistics' });
  }
});

// Get activities with pagination and filtering
router.get('/activities', async (req: Request, res: Response) => {
  try {
    const filters: ActivityFilter = {
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };
    
    // Apply client filter
    if (req.query.clientId) {
      filters.clientId = parseInt(req.query.clientId as string);
    }
    
    // Apply user filter
    if (req.query.clientUserId) {
      filters.clientUserId = parseInt(req.query.clientUserId as string);
    }
    
    // Apply action type filter
    if (req.query.actionType) {
      filters.actionType = req.query.actionType as string;
    }
    
    // Apply action filter
    if (req.query.action) {
      filters.action = req.query.action as string;
    }
    
    // Apply date range filters
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    
    const result = await getActivities(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get a specific activity by ID
router.get('/activities/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const activity = await getActivity(id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Get uploads with pagination and filtering
router.get('/uploads', async (req: Request, res: Response) => {
  try {
    const filters: UploadFilter = {
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };
    
    // Apply client filter
    if (req.query.clientId) {
      filters.clientId = parseInt(req.query.clientId as string);
    }
    
    // Apply user filter
    if (req.query.clientUserId) {
      filters.clientUserId = parseInt(req.query.clientUserId as string);
    }
    
    // Apply type filter
    if (req.query.type) {
      filters.type = req.query.type as string;
    }
    
    // Apply status filter
    if (req.query.status) {
      filters.status = req.query.status as string;
    }
    
    // Apply date range filters
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    
    const result = await getUploads(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

// Get a specific upload by ID
router.get('/uploads/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const upload = await getUpload(id);
    
    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }
    
    res.json(upload);
  } catch (error) {
    console.error('Error fetching upload:', error);
    res.status(500).json({ error: 'Failed to fetch upload' });
  }
});

export default router;