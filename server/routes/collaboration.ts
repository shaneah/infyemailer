import { Router } from 'express';
import * as collaborationService from '../services/collaborationService';

const router = Router();

// Get active users
router.get('/users', (req, res) => {
  const activeUsers = collaborationService.getActiveUsers();
  res.json({ activeUsers });
});

// Get users editing a resource
router.get('/resource/:resourceId/editors', (req, res) => {
  const { resourceId } = req.params;
  const editors = collaborationService.getUsersEditingResource(resourceId);
  res.json({ resourceId, editors });
});

// Start editing a resource
router.post('/resource/:resourceId/start-edit', (req, res) => {
  const { resourceId } = req.params;
  const { userId, resourceType } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  collaborationService.startResourceEdit(resourceId, resourceType || 'unknown', userId);
  res.status(200).json({ success: true });
});

// End editing a resource
router.post('/resource/:resourceId/end-edit', (req, res) => {
  const { resourceId } = req.params;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  collaborationService.endResourceEdit(resourceId, userId);
  res.status(200).json({ success: true });
});

// Record resource update
router.post('/resource/:resourceId/update', (req, res) => {
  const { resourceId } = req.params;
  const { userId, resourceType, changes } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  collaborationService.notifyResourceUpdated(
    resourceId, 
    resourceType || 'unknown', 
    userId, 
    changes || {}
  );
  
  res.status(200).json({ success: true });
});

// Add a comment to a resource
router.post('/resource/:resourceId/comment', (req, res) => {
  const { resourceId } = req.params;
  const { userId, resourceType, comment } = req.body;
  
  if (!userId || !comment) {
    return res.status(400).json({ error: 'User ID and comment are required' });
  }
  
  collaborationService.notifyCommentAdded(
    resourceId, 
    resourceType || 'unknown', 
    userId, 
    comment
  );
  
  res.status(200).json({ success: true });
});

// Mention a user in a resource
router.post('/resource/:resourceId/mention', (req, res) => {
  const { resourceId } = req.params;
  const { userId, resourceType, mentionedUserId, context } = req.body;
  
  if (!userId || !mentionedUserId) {
    return res.status(400).json({ error: 'User IDs are required' });
  }
  
  collaborationService.notifyUserMentioned(
    resourceId, 
    resourceType || 'unknown', 
    userId, 
    mentionedUserId, 
    context || ''
  );
  
  res.status(200).json({ success: true });
});

// Assign a task
router.post('/task/:taskId/assign', (req, res) => {
  const { taskId } = req.params;
  const { assignerId, assigneeId, taskDetails } = req.body;
  
  if (!assignerId || !assigneeId) {
    return res.status(400).json({ error: 'Assigner ID and assignee ID are required' });
  }
  
  collaborationService.notifyTaskAssigned(
    taskId, 
    assignerId, 
    assigneeId, 
    taskDetails || {}
  );
  
  res.status(200).json({ success: true });
});

export default router;