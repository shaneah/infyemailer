import { WebSocket } from 'ws';

/**
 * Enum for different notification types
 */
export enum NotificationType {
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  RESOURCE_EDIT_STARTED = 'resource_edit_started',
  RESOURCE_EDIT_ENDED = 'resource_edit_ended',
  RESOURCE_UPDATED = 'resource_updated',
  COMMENT_ADDED = 'comment_added',
  MENTION = 'mention',
  TASK_ASSIGNED = 'task_assigned',
  GENERAL_NOTIFICATION = 'general_notification'
}

/**
 * User information
 */
export interface UserInfo {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
}

/**
 * Notification object structure
 */
export interface Notification {
  type: NotificationType;
  title?: string;
  message?: string;
  user?: UserInfo;
  resourceId?: string;
  resourceType?: string;
  context?: string;
  timestamp: number;
}

// Store all connected WebSocket clients
const clientConnections = new Map<string, WebSocket>();

// Store user info for each client
const clientUsers = new Map<string, UserInfo>();

// Store resource locks - who is currently editing what resource
const resourceLocks = new Map<string, Set<string>>();

// Reverse mapping: user to resources they're editing
const userResourceLocks = new Map<string, Set<string>>();

/**
 * Register a WebSocket client connection
 */
export function registerClient(ws: WebSocket, userId: string, userInfo: UserInfo): void {
  // Store the connection
  clientConnections.set(userId, ws);
  
  // Store user info
  clientUsers.set(userId, userInfo);
  
  console.log(`Client registered: ${userId} (${userInfo.name})`);
  
  // Set up cleanup on disconnect
  ws.on('close', () => {
    // Remove from connections map
    clientConnections.delete(userId);
    
    // Release all resource locks for this user
    releaseAllResourceLocks(userId);
    
    // Notify other users that this user has left
    notifyUserLeft(userId);
    
    console.log(`Client disconnected: ${userId} (${userInfo.name})`);
  });
  
  // Set up message handling
  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      handleClientMessage(userId, data);
    } catch (error) {
      console.error(`Error processing message from ${userId}:`, error);
    }
  });
  
  // Send initial state to this client
  sendInitialState(userId);
  
  // Notify other users that this user has joined
  notifyUserJoined(userId);
}

/**
 * Send initial state to a client
 */
function sendInitialState(userId: string): void {
  const ws = clientConnections.get(userId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  
  // Get all resource locks
  const resources: { [resourceId: string]: UserInfo[] } = {};
  
  // Convert to array before iterating to avoid TypeScript downlevelIteration issues
  for (const [resourceId, userIds] of Array.from(resourceLocks.entries())) {
    resources[resourceId] = Array.from(userIds)
      .map(id => clientUsers.get(id))
      .filter(Boolean) as UserInfo[];
  }
  
  // Get all connected users
  const users = Array.from(clientUsers.values());
  
  // Send the initial state
  ws.send(JSON.stringify({
    type: 'initial_state',
    resources,
    users,
    timestamp: Date.now()
  }));
}

/**
 * Handle incoming client messages
 */
function handleClientMessage(userId: string, data: any): void {
  switch (data.action) {
    case 'start_editing':
      acquireResourceLock(userId, data.resourceId, data.resourceType);
      break;
      
    case 'stop_editing':
      releaseResourceLock(userId, data.resourceId);
      break;
      
    case 'resource_updated':
      notifyResourceUpdated(userId, data.resourceId, data.resourceType);
      break;
      
    case 'add_comment':
      notifyCommentAdded(userId, data.resourceId, data.resourceType, data.comment);
      break;
      
    case 'mention_user':
      notifyUserMentioned(userId, data.mentionedUserId, data.resourceId, data.resourceType);
      break;
      
    case 'assign_task':
      notifyTaskAssigned(userId, data.assigneeId, data.taskId, data.taskDetails);
      break;
      
    default:
      console.log(`Unhandled client message action: ${data.action}`);
  }
}

/**
 * Acquire a resource lock for editing
 */
export function acquireResourceLock(userId: string, resourceId: string, resourceType?: string): boolean {
  // Get or create the set of users editing this resource
  if (!resourceLocks.has(resourceId)) {
    resourceLocks.set(resourceId, new Set());
  }
  
  const usersEditingResource = resourceLocks.get(resourceId)!;
  usersEditingResource.add(userId);
  
  // Update the reverse mapping
  if (!userResourceLocks.has(userId)) {
    userResourceLocks.set(userId, new Set());
  }
  
  const resourcesEditedByUser = userResourceLocks.get(userId)!;
  resourcesEditedByUser.add(resourceId);
  
  // Notify other users
  notifyResourceEditStarted(userId, resourceId, resourceType);
  
  return true;
}

/**
 * Release a resource lock
 */
export function releaseResourceLock(userId: string, resourceId: string): boolean {
  // Remove user from the resource's editors
  const usersEditingResource = resourceLocks.get(resourceId);
  if (usersEditingResource) {
    usersEditingResource.delete(userId);
    
    // Clean up empty sets
    if (usersEditingResource.size === 0) {
      resourceLocks.delete(resourceId);
    }
  }
  
  // Remove resource from user's editing list
  const resourcesEditedByUser = userResourceLocks.get(userId);
  if (resourcesEditedByUser) {
    resourcesEditedByUser.delete(resourceId);
    
    // Clean up empty sets
    if (resourcesEditedByUser.size === 0) {
      userResourceLocks.delete(userId);
    }
  }
  
  // Notify other users
  notifyResourceEditEnded(userId, resourceId);
  
  return true;
}

/**
 * Release all resource locks for a user
 */
function releaseAllResourceLocks(userId: string): void {
  const resourcesEditedByUser = userResourceLocks.get(userId);
  if (!resourcesEditedByUser) return;
  
  // Make a copy to avoid iteration issues during deletion
  const resources = Array.from(resourcesEditedByUser);
  
  // Release each resource lock
  for (const resourceId of resources) {
    releaseResourceLock(userId, resourceId);
  }
  
  // Clean up
  userResourceLocks.delete(userId);
}

/**
 * Send notification to all clients except the sender
 */
function broadcastNotification(notification: Notification, excludeUserId?: string): void {
  const message = JSON.stringify(notification);
  
  for (const [userId, ws] of Array.from(clientConnections.entries())) {
    if (excludeUserId === userId) continue;
    
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

/**
 * Send notification to specific users
 */
function sendNotificationToUsers(notification: Notification, userIds: string[]): void {
  const message = JSON.stringify(notification);
  
  for (const userId of userIds) {
    const ws = clientConnections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

/**
 * Notify all users that a user has joined
 */
export function notifyUserJoined(userId: string): void {
  const user = clientUsers.get(userId);
  if (!user) return;
  
  broadcastNotification({
    type: NotificationType.USER_JOINED,
    user,
    timestamp: Date.now()
  }, userId); // Exclude the user who joined
}

/**
 * Notify all users that a user has left
 */
export function notifyUserLeft(userId: string): void {
  const user = clientUsers.get(userId);
  if (!user) return;
  
  broadcastNotification({
    type: NotificationType.USER_LEFT,
    user,
    timestamp: Date.now()
  });
}

/**
 * Notify that a user started editing a resource
 */
export function notifyResourceEditStarted(userId: string, resourceId: string, resourceType?: string): void {
  const user = clientUsers.get(userId);
  if (!user) return;
  
  broadcastNotification({
    type: NotificationType.RESOURCE_EDIT_STARTED,
    user,
    resourceId,
    resourceType,
    timestamp: Date.now()
  }, userId);
}

/**
 * Notify that a user stopped editing a resource
 */
export function notifyResourceEditEnded(userId: string, resourceId: string): void {
  const user = clientUsers.get(userId);
  if (!user) return;
  
  broadcastNotification({
    type: NotificationType.RESOURCE_EDIT_ENDED,
    user,
    resourceId,
    timestamp: Date.now()
  }, userId);
}

/**
 * Notify that a resource was updated
 */
export function notifyResourceUpdated(userId: string, resourceId: string, resourceType?: string): void {
  const user = clientUsers.get(userId);
  if (!user) return;
  
  broadcastNotification({
    type: NotificationType.RESOURCE_UPDATED,
    user,
    resourceId,
    resourceType,
    timestamp: Date.now()
  });
}

/**
 * Notify that a comment was added
 */
export function notifyCommentAdded(userId: string, resourceId: string, resourceType: string, comment: string): void {
  const user = clientUsers.get(userId);
  if (!user) return;
  
  broadcastNotification({
    type: NotificationType.COMMENT_ADDED,
    user,
    resourceId,
    resourceType,
    context: comment,
    timestamp: Date.now()
  });
}

/**
 * Notify a user that they were mentioned
 */
export function notifyUserMentioned(
  mentioningUserId: string, 
  mentionedUserId: string, 
  resourceId: string, 
  resourceType: string
): void {
  const mentioningUser = clientUsers.get(mentioningUserId);
  if (!mentioningUser) return;
  
  sendNotificationToUsers({
    type: NotificationType.MENTION,
    user: mentioningUser,
    resourceId,
    resourceType,
    timestamp: Date.now()
  }, [mentionedUserId]);
}

/**
 * Notify a user that a task was assigned to them
 */
export function notifyTaskAssigned(
  assignerId: string, 
  assigneeId: string, 
  taskId: string, 
  taskDetails?: any
): void {
  const assigner = clientUsers.get(assignerId);
  if (!assigner) return;
  
  sendNotificationToUsers({
    type: NotificationType.TASK_ASSIGNED,
    user: assigner,
    resourceId: taskId,
    resourceType: 'task',
    context: JSON.stringify(taskDetails),
    timestamp: Date.now()
  }, [assigneeId]);
}

/**
 * Send a general notification to all users or specific users
 */
export function sendGeneralNotification(
  title: string, 
  message: string, 
  targetUserIds?: string[]
): void {
  const notification: Notification = {
    type: NotificationType.GENERAL_NOTIFICATION,
    title,
    message,
    timestamp: Date.now()
  };
  
  if (targetUserIds && targetUserIds.length > 0) {
    sendNotificationToUsers(notification, targetUserIds);
  } else {
    broadcastNotification(notification);
  }
}

/**
 * Get information about who is editing what
 */
export function getResourceEditors(): { [resourceId: string]: UserInfo[] } {
  const result: { [resourceId: string]: UserInfo[] } = {};
  
  for (const [resourceId, userIds] of Array.from(resourceLocks.entries())) {
    result[resourceId] = Array.from(userIds)
      .map(id => clientUsers.get(id as string))
      .filter(Boolean) as UserInfo[];
  }
  
  return result;
}

/**
 * Get all connected users
 */
export function getConnectedUsers(): UserInfo[] {
  return Array.from(clientUsers.values());
}

/**
 * Get all resources being edited by a user
 */
export function getResourcesEditedByUser(userId: string): string[] {
  const resources = userResourceLocks.get(userId);
  return resources ? Array.from(resources) : [];
}

/**
 * Count of connected users
 */
export function getConnectedUserCount(): number {
  return clientConnections.size;
}