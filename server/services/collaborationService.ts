import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';

// Define types for collaboration data
interface CollaborationUser {
  id: string; // Unique ID for the user
  username: string;
  avatar?: string;
  color: string; // Assigned color for cursor/selection highlighting
  templateId: string | number;
  roomId: string;
  lastActivity: number;
}

interface CursorPosition {
  userId: string;
  sectionId?: string;
  elementId?: string;
  position?: { x: number, y: number };
  selection?: { start: number, end: number };
  timestamp: number;
}

interface TemplateChange {
  userId: string;
  type: 'add' | 'update' | 'delete' | 'move';
  targetType: 'section' | 'element' | 'template';
  targetId?: string;
  parentId?: string;
  data: any;
  timestamp: number;
}

interface CollaborationRoom {
  id: string;
  templateId: string | number;
  users: Map<string, CollaborationUser>;
  cursorPositions: Map<string, CursorPosition>;
  changes: TemplateChange[];
  lastActivity: number;
}

// Store active collaboration rooms
const collaborationRooms = new Map<string, CollaborationRoom>();

// Store connected WebSocket clients by user ID
const clientConnections = new Map<string, WebSocket>();

// List of colors to assign to users
const userColors = [
  '#4F46E5', // Indigo
  '#16A34A', // Green
  '#EA580C', // Orange
  '#9333EA', // Purple
  '#E11D48', // Rose
  '#0891B2', // Cyan
  '#CA8A04', // Yellow
  '#2563EB', // Blue
];

// Initialize WebSocket server for template collaboration
export function initCollaborationService(httpServer: Server): void {
  try {
    console.log('Initializing collaboration WebSocket service on path: /collaboration');
    
    // Create WebSocket server with a different path than metrics
    const wss = new WebSocketServer({ 
      server: httpServer, 
      path: '/collaboration',
      // Add more specific configuration
      clientTracking: true, // Track connected clients
      perMessageDeflate: false // Disable per-message deflate for simplicity
    });
    
    // Log server creation status
    console.log('Collaboration WebSocket server created successfully');
    
    // Add error handler for the WebSocket server
    wss.on('error', (error) => {
      console.error('Collaboration WebSocket server error:', error);
    });
    
    // WebSocket connection handler
    wss.on('connection', (ws, req) => {
      try {
        const connectedUserId = req.url?.includes('userId=') 
          ? new URLSearchParams(req.url.slice(req.url.indexOf('?'))).get('userId') 
          : uuidv4();
        
        const templateId = req.url?.includes('templateId=')
          ? new URLSearchParams(req.url.slice(req.url.indexOf('?'))).get('templateId')
          : null;
        
        if (!templateId) {
          ws.close(1008, 'Template ID is required');
          return;
        }
        
        console.log(`Collaboration: User ${connectedUserId} connected to template ${templateId}`);
        
        // Store the connection
        clientConnections.set(connectedUserId as string, ws);
        
        // Get or create a room for this template
        const roomId = `template_${templateId}`;
        let room = collaborationRooms.get(roomId);
        
        if (!room) {
          room = {
            id: roomId,
            templateId,
            users: new Map(),
            cursorPositions: new Map(),
            changes: [],
            lastActivity: Date.now()
          };
          collaborationRooms.set(roomId, room);
        }
        
        // Handle incoming messages
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message.toString());
            handleCollaborationMessage(data, connectedUserId as string, roomId);
          } catch (error) {
            console.error('Error processing collaboration message:', error);
          }
        });
        
        // Handle disconnection
        ws.on('close', () => {
          console.log(`Collaboration: User ${connectedUserId} disconnected from template ${templateId}`);
          removeUserFromRoom(connectedUserId as string, roomId);
          clientConnections.delete(connectedUserId as string);
        });
        
        // Send initial room state to the client
        sendRoomState(connectedUserId as string, roomId);
      } catch (error) {
        console.error('Error handling WebSocket connection:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1011, 'Server error occurred');
        }
      }
    });
    
    // Clean up inactive rooms every 5 minutes
    setInterval(cleanupInactiveRooms, 5 * 60 * 1000);
    
    // Log successful initialization
    console.log('Collaboration WebSocket service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize collaboration WebSocket service:', error);
  }
}

// Handle various message types from clients
function handleCollaborationMessage(message: any, userId: string, roomId: string): void {
  const room = collaborationRooms.get(roomId);
  if (!room) return;
  
  room.lastActivity = Date.now();
  
  switch (message.type) {
    case 'join':
      addUserToRoom(userId, roomId, message.username, message.avatar);
      break;
      
    case 'cursor_update':
      updateCursorPosition(userId, roomId, message.data);
      break;
      
    case 'template_change':
      processTemplateChange(userId, roomId, message.data);
      break;
      
    case 'get_state':
      sendRoomState(userId, roomId);
      break;
      
    case 'ping':
      // Just update the user's last activity
      const user = room.users.get(userId);
      if (user) {
        user.lastActivity = Date.now();
      }
      break;
  }
}

// Add a user to a collaboration room
function addUserToRoom(userId: string, roomId: string, username: string, avatar?: string): void {
  const room = collaborationRooms.get(roomId);
  if (!room) return;
  
  // If user already exists, just update their last activity
  if (room.users.has(userId)) {
    const existingUser = room.users.get(userId)!;
    existingUser.lastActivity = Date.now();
    existingUser.username = username || existingUser.username;
    existingUser.avatar = avatar || existingUser.avatar;
    
    // Broadcast updated user list
    broadcastUserList(roomId);
    return;
  }
  
  // Assign a color to the user
  const assignedColor = userColors[room.users.size % userColors.length];
  
  // Create new user
  const user: CollaborationUser = {
    id: userId,
    username: username || `User ${room.users.size + 1}`,
    avatar,
    color: assignedColor,
    templateId: room.templateId,
    roomId,
    lastActivity: Date.now()
  };
  
  room.users.set(userId, user);
  
  // Broadcast to all users in the room that a new user has joined
  broadcastUserList(roomId);
  
  console.log(`Collaboration: User ${userId} (${username}) joined room ${roomId}`);
}

// Remove a user from a collaboration room
function removeUserFromRoom(userId: string, roomId: string): void {
  const room = collaborationRooms.get(roomId);
  if (!room) return;
  
  room.users.delete(userId);
  room.cursorPositions.delete(userId);
  
  // Broadcast updated user list
  broadcastUserList(roomId);
  
  // If room is empty, schedule it for cleanup
  if (room.users.size === 0) {
    console.log(`Collaboration: Room ${roomId} is empty, marking for cleanup`);
    room.lastActivity = Date.now() - 4 * 60 * 1000; // Set activity to 4 minutes ago
  }
}

// Update a user's cursor position
function updateCursorPosition(userId: string, roomId: string, cursorData: any): void {
  const room = collaborationRooms.get(roomId);
  if (!room) return;
  
  const user = room.users.get(userId);
  if (!user) return;
  
  user.lastActivity = Date.now();
  
  const cursorPosition: CursorPosition = {
    userId,
    sectionId: cursorData.sectionId,
    elementId: cursorData.elementId,
    position: cursorData.position,
    selection: cursorData.selection,
    timestamp: Date.now()
  };
  
  room.cursorPositions.set(userId, cursorPosition);
  
  // Broadcast the cursor update to all users except the sender
  broadcastToRoom(roomId, {
    type: 'cursor_update',
    data: {
      user: {
        id: userId,
        username: user.username,
        color: user.color
      },
      ...cursorPosition
    }
  }, [userId]);
}

// Process a template change
function processTemplateChange(userId: string, roomId: string, changeData: any): void {
  const room = collaborationRooms.get(roomId);
  if (!room) return;
  
  const user = room.users.get(userId);
  if (!user) return;
  
  user.lastActivity = Date.now();
  
  const change: TemplateChange = {
    userId,
    type: changeData.type,
    targetType: changeData.targetType,
    targetId: changeData.targetId,
    parentId: changeData.parentId,
    data: changeData.data,
    timestamp: Date.now()
  };
  
  // Add to change history
  room.changes.push(change);
  
  // Limit history to last 100 changes
  if (room.changes.length > 100) {
    room.changes = room.changes.slice(-100);
  }
  
  // Broadcast the change to all users except the sender
  broadcastToRoom(roomId, {
    type: 'template_change',
    data: {
      user: {
        userId: userId,
        username: user.username
      },
      changeData: change
    }
  }, [userId]);
}

// Send the current state of the room to a specific user
function sendRoomState(userId: string, roomId: string): void {
  const room = collaborationRooms.get(roomId);
  if (!room) return;
  
  const user = room.users.get(userId);
  const clientConnection = clientConnections.get(userId);
  
  if (!clientConnection || clientConnection.readyState !== WebSocket.OPEN) return;
  
  // If user doesn't exist in the room, add them
  if (!user) {
    // We'll add them with a generic name, which can be updated later
    addUserToRoom(userId, roomId, `User ${room.users.size + 1}`);
  }
  
  // Create a list of users for the client
  const userList = Array.from(room.users.values()).map(u => ({
    id: u.id,
    username: u.username,
    avatar: u.avatar,
    color: u.color,
    isCurrentUser: u.id === userId
  }));
  
  // Send room state
  clientConnection.send(JSON.stringify({
    type: 'room_state',
    data: {
      roomId,
      templateId: room.templateId,
      users: userList,
      cursorPositions: Array.from(room.cursorPositions.values()),
      lastChanges: room.changes.slice(-20) // Send only the last 20 changes
    }
  }));
}

// Broadcast a message to all users in a room
function broadcastToRoom(roomId: string, message: any, excludeUserIds: string[] = []): void {
  const room = collaborationRooms.get(roomId);
  if (!room) return;
  
  const messageString = JSON.stringify(message);
  
  room.users.forEach((user) => {
    if (!excludeUserIds.includes(user.id)) {
      const clientConnection = clientConnections.get(user.id);
      if (clientConnection && clientConnection.readyState === WebSocket.OPEN) {
        clientConnection.send(messageString);
      }
    }
  });
}

// Broadcast the current user list to all users in a room
function broadcastUserList(roomId: string): void {
  const room = collaborationRooms.get(roomId);
  if (!room) return;
  
  const userList = Array.from(room.users.values()).map(user => ({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    color: user.color
  }));
  
  broadcastToRoom(roomId, {
    type: 'user_list',
    data: userList
  });
}

// Clean up inactive rooms and users
function cleanupInactiveRooms(): void {
  const now = Date.now();
  const inactivityThreshold = 10 * 60 * 1000; // 10 minutes
  
  collaborationRooms.forEach((room, roomId) => {
    // Check if room is inactive
    if (now - room.lastActivity > inactivityThreshold) {
      console.log(`Collaboration: Cleaning up inactive room ${roomId}`);
      collaborationRooms.delete(roomId);
      return;
    }
    
    // Check for inactive users
    room.users.forEach((user, userId) => {
      if (now - user.lastActivity > inactivityThreshold) {
        console.log(`Collaboration: Removing inactive user ${userId} from room ${roomId}`);
        removeUserFromRoom(userId, roomId);
      }
    });
  });
}

// Export functions for other services to use
export {
  addUserToRoom,
  removeUserFromRoom,
  broadcastToRoom,
  broadcastUserList
};