import { Router } from 'express';
import { 
  getConnectedUsers, 
  getConnectedUserCount, 
  getResourceEditors, 
  getResourcesEditedByUser,
  sendGeneralNotification,
  NotificationType
} from '../services/collaborationService';

const router = Router();

/**
 * Get currently connected users
 */
router.get('/users', (req, res) => {
  try {
    const users = getConnectedUsers();
    const count = getConnectedUserCount();
    
    res.json({
      count,
      users
    });
  } catch (error) {
    console.error('Error getting connected users:', error);
    res.status(500).json({ error: 'Failed to get connected users' });
  }
});

/**
 * Get resources being edited and by whom
 */
router.get('/resources', (req, res) => {
  try {
    const resources = getResourceEditors();
    res.json(resources);
  } catch (error) {
    console.error('Error getting resource editors:', error);
    res.status(500).json({ error: 'Failed to get resource editors' });
  }
});

/**
 * Get resources being edited by a specific user
 */
router.get('/users/:userId/resources', (req, res) => {
  try {
    const userId = req.params.userId;
    const resources = getResourcesEditedByUser(userId);
    res.json(resources);
  } catch (error) {
    console.error(`Error getting resources for user ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Failed to get user resources' });
  }
});

/**
 * Send a notification to all users or specific users
 */
router.post('/notify', (req, res) => {
  try {
    const { title, message, targetUserIds } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    sendGeneralNotification(title, message, targetUserIds);
    
    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

/**
 * Simulate a user joining notification for testing
 */
router.post('/simulate/join', (req, res) => {
  try {
    const { userId, userName, userRole, userAvatar } = req.body;
    
    if (!userId || !userName) {
      return res.status(400).json({ error: 'User ID and name are required' });
    }
    
    // This is just a simulation - in a real app, users connect via WebSocket
    sendGeneralNotification(
      'User Joined',
      `${userName} joined the collaboration`,
      null
    );
    
    res.json({ success: true, message: 'Join notification simulated' });
  } catch (error) {
    console.error('Error simulating join notification:', error);
    res.status(500).json({ error: 'Failed to simulate notification' });
  }
});

/**
 * Simulate resource editing notification for testing
 */
router.post('/simulate/edit', (req, res) => {
  try {
    const { userId, userName, resourceId, resourceType } = req.body;
    
    if (!userId || !userName || !resourceId) {
      return res.status(400).json({ 
        error: 'User ID, name, and resource ID are required' 
      });
    }
    
    // This is just a simulation - in a real app, actions come via WebSocket
    sendGeneralNotification(
      'Resource Edit Started',
      `${userName} started editing ${resourceType || 'resource'} ${resourceId}`,
      null
    );
    
    res.json({ success: true, message: 'Edit notification simulated' });
  } catch (error) {
    console.error('Error simulating edit notification:', error);
    res.status(500).json({ error: 'Failed to simulate notification' });
  }
});

export default router;