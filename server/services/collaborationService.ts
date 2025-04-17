import { WebSocket } from 'ws';

// Store connected WebSocket clients with userId mapping for targeted notifications
const collaborationClients = new Map<string, Set<WebSocket>>();

// Track which users are currently editing which resources
const activeEdits = new Map<string, Set<string>>();

// Store user info for display in notifications
interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

const connectedUsers = new Map<string, UserInfo>();

// Types of collaboration notifications
export enum NotificationType {
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  RESOURCE_EDIT_STARTED = 'resource_edit_started',
  RESOURCE_EDIT_ENDED = 'resource_edit_ended',
  RESOURCE_UPDATED = 'resource_updated',
  COMMENT_ADDED = 'comment_added',
  MENTION = 'mention',
  TASK_ASSIGNED = 'task_assigned'
}

// Register a client connection with user information
export function registerClient(ws: WebSocket, userId: string, userInfo: UserInfo): void {
  if (!collaborationClients.has(userId)) {
    collaborationClients.set(userId, new Set());
  }
  
  collaborationClients.get(userId)?.add(ws);
  connectedUsers.set(userId, userInfo);
  
  // Notify others that this user has joined
  broadcastUserPresence(userId, true);
  
  // Handle disconnection
  ws.on('close', () => {
    unregisterClient(ws, userId);
  });
  
  // Handle messages from this client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      handleClientMessage(userId, data);
    } catch (error) {
      console.error('Error processing collaboration message:', error);
    }
  });
  
  // Send the current state of active users and edits
  sendInitialState(ws);
}

// Remove a client connection
export function unregisterClient(ws: WebSocket, userId: string): void {
  const userClients = collaborationClients.get(userId);
  
  if (userClients) {
    userClients.delete(ws);
    
    // If this was the last connection for this user, clean up
    if (userClients.size === 0) {
      collaborationClients.delete(userId);
      connectedUsers.delete(userId);
      
      // Remove user from all active edits
      for (const [resourceId, editors] of activeEdits.entries()) {
        if (editors.has(userId)) {
          editors.delete(userId);
          
          // If no one is editing this resource anymore, clean up
          if (editors.size === 0) {
            activeEdits.delete(resourceId);
          } else {
            // Notify others that this user has stopped editing
            notifyResourceEditEnded(resourceId, userId);
          }
        }
      }
      
      // Notify others that this user has left
      broadcastUserPresence(userId, false);
    }
  }
}

// Handle incoming messages from clients
function handleClientMessage(userId: string, data: any): void {
  switch (data.type) {
    case 'start_edit':
      startResourceEdit(data.resourceId, data.resourceType, userId);
      break;
    case 'end_edit':
      endResourceEdit(data.resourceId, userId);
      break;
    case 'resource_update':
      notifyResourceUpdated(data.resourceId, data.resourceType, userId, data.changes);
      break;
    case 'add_comment':
      notifyCommentAdded(data.resourceId, data.resourceType, userId, data.comment);
      break;
    case 'assign_task':
      notifyTaskAssigned(data.taskId, userId, data.assigneeId, data.taskDetails);
      break;
    case 'mention':
      notifyUserMentioned(data.resourceId, data.resourceType, userId, data.mentionedUserId, data.context);
      break;
    default:
      console.log(`Unknown message type: ${data.type}`);
  }
}

// Send initial state to a newly connected client
function sendInitialState(ws: WebSocket): void {
  // Send list of connected users
  const users = Array.from(connectedUsers.values());
  
  // Send list of resources being edited
  const edits = Array.from(activeEdits.entries()).map(([resourceId, editors]) => ({
    resourceId,
    editors: Array.from(editors).map(userId => connectedUsers.get(userId))
  }));
  
  const initialState = {
    type: 'initial_state',
    users,
    edits,
    timestamp: Date.now()
  };
  
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(initialState));
  }
}

// Notify when a user starts editing a resource
export function startResourceEdit(resourceId: string, resourceType: string, userId: string): void {
  if (!activeEdits.has(resourceId)) {
    activeEdits.set(resourceId, new Set());
  }
  
  activeEdits.get(resourceId)?.add(userId);
  
  // Notify all users about this edit
  const user = connectedUsers.get(userId);
  const notification = {
    type: NotificationType.RESOURCE_EDIT_STARTED,
    resourceId,
    resourceType,
    user,
    timestamp: Date.now()
  };
  
  broadcastToAll(notification);
}

// Notify when a user stops editing a resource
export function endResourceEdit(resourceId: string, userId: string): void {
  const editors = activeEdits.get(resourceId);
  
  if (editors && editors.has(userId)) {
    editors.delete(userId);
    
    // If no one is editing this resource anymore, clean up
    if (editors.size === 0) {
      activeEdits.delete(resourceId);
    }
    
    notifyResourceEditEnded(resourceId, userId);
  }
}

// Notify when a resource has been updated
export function notifyResourceUpdated(
  resourceId: string, 
  resourceType: string, 
  userId: string, 
  changes: any
): void {
  const user = connectedUsers.get(userId);
  
  const notification = {
    type: NotificationType.RESOURCE_UPDATED,
    resourceId,
    resourceType,
    user,
    changes,
    timestamp: Date.now()
  };
  
  broadcastToAll(notification);
}

// Notify when a comment is added
export function notifyCommentAdded(
  resourceId: string, 
  resourceType: string, 
  userId: string, 
  comment: string
): void {
  const user = connectedUsers.get(userId);
  
  const notification = {
    type: NotificationType.COMMENT_ADDED,
    resourceId,
    resourceType,
    user,
    comment,
    timestamp: Date.now()
  };
  
  broadcastToAll(notification);
}

// Notify when a user is mentioned
export function notifyUserMentioned(
  resourceId: string, 
  resourceType: string, 
  mentioningUserId: string, 
  mentionedUserId: string, 
  context: string
): void {
  const mentioningUser = connectedUsers.get(mentioningUserId);
  
  const notification = {
    type: NotificationType.MENTION,
    resourceId,
    resourceType,
    mentioningUser,
    context,
    timestamp: Date.now()
  };
  
  // Send specifically to the mentioned user
  sendToUser(mentionedUserId, notification);
}

// Notify when a task is assigned
export function notifyTaskAssigned(
  taskId: string, 
  assignerId: string, 
  assigneeId: string, 
  taskDetails: any
): void {
  const assigner = connectedUsers.get(assignerId);
  
  const notification = {
    type: NotificationType.TASK_ASSIGNED,
    taskId,
    assigner,
    taskDetails,
    timestamp: Date.now()
  };
  
  // Send specifically to the assignee
  sendToUser(assigneeId, notification);
}

// Helper to notify when a user stops editing
function notifyResourceEditEnded(resourceId: string, userId: string): void {
  const user = connectedUsers.get(userId);
  
  const notification = {
    type: NotificationType.RESOURCE_EDIT_ENDED,
    resourceId,
    user,
    timestamp: Date.now()
  };
  
  broadcastToAll(notification);
}

// Notify about user presence (joining/leaving)
function broadcastUserPresence(userId: string, isJoining: boolean): void {
  const user = connectedUsers.get(userId);
  
  if (!user) return;
  
  const notification = {
    type: isJoining ? NotificationType.USER_JOINED : NotificationType.USER_LEFT,
    user,
    timestamp: Date.now()
  };
  
  broadcastToAll(notification);
}

// Send a message to a specific user across all their connections
function sendToUser(userId: string, data: any): void {
  const userClients = collaborationClients.get(userId);
  
  if (userClients) {
    const message = JSON.stringify(data);
    
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

// Broadcast a message to all connected clients
function broadcastToAll(data: any): void {
  const message = JSON.stringify(data);
  
  for (const clients of collaborationClients.values()) {
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
}

// Get currently active users
export function getActiveUsers(): UserInfo[] {
  return Array.from(connectedUsers.values());
}

// Get users currently editing a specific resource
export function getUsersEditingResource(resourceId: string): UserInfo[] {
  const editors = activeEdits.get(resourceId);
  
  if (!editors) return [];
  
  return Array.from(editors)
    .map(userId => connectedUsers.get(userId))
    .filter((user): user is UserInfo => user !== undefined);
}