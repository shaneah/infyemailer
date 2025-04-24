import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types for collaboration
interface CollaborationUser {
  id: string;
  username: string;
  avatar?: string;
  color: string;
  isCurrentUser?: boolean;
}

interface CursorPosition {
  userId: string;
  sectionId?: string;
  elementId?: string;
  position?: { x: number; y: number };
  selection?: { start: number; end: number };
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

// Define props interface for parameters
interface UseCollaborationProps {
  templateId: string | number;
  userId: string;
  username: string;
  avatar?: string;
}

/**
 * Custom hook for real-time collaboration on email templates
 */
export function useCollaboration({ 
  templateId, 
  userId, 
  username, 
  avatar 
}: UseCollaborationProps) {
  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [cursorPositions, setCursorPositions] = useState<Record<string, CursorPosition>>({});
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  
  // Initialize onTemplateChange callback reference
  const [onTemplateChange, setOnTemplateChange] = useState<
    ((user: CollaborationUser, change: TemplateChange) => void) | null
  >(null);
  
  // Send a message to the server
  const sendMessage = useCallback((data: any) => {
    try {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        const message = JSON.stringify(data);
        console.log(`Sending message type: ${data.type}`);
        socketRef.current.send(message);
      } else {
        console.warn('Cannot send message - WebSocket is not connected', {
          readyState: socketRef.current ? socketRef.current.readyState : 'no socket',
          messageType: data.type
        });
      }
    } catch (error) {
      console.error('Error sending WebSocket message:', error, data);
    }
  }, []);
  
  // Handle incoming messages
  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'room_state':
        // Update users and cursor positions with current room state
        setUsers(message.data.users || []);
        
        // Format cursor positions as a record for easier lookup
        const positionMap: Record<string, CursorPosition> = {};
        (message.data.cursorPositions || []).forEach((pos: CursorPosition) => {
          positionMap[pos.userId] = pos;
        });
        setCursorPositions(positionMap);
        break;
        
      case 'user_list':
        // Update the list of users
        setUsers(message.data || []);
        break;
        
      case 'cursor_update':
        // Update a specific user's cursor position
        const cursorData = message.data;
        if (cursorData && cursorData.user) {
          setCursorPositions(prev => ({
            ...prev,
            [cursorData.user.id]: {
              userId: cursorData.user.id,
              sectionId: cursorData.sectionId,
              elementId: cursorData.elementId,
              position: cursorData.position,
              selection: cursorData.selection,
              timestamp: cursorData.timestamp || Date.now()
            }
          }));
        }
        break;
        
      case 'template_change':
        // Notify about changes to the template
        if (message.data && message.data.user && message.data.changeData) {
          const { user, changeData } = message.data;
          
          // Apply the change to local template state if callback is provided
          if (onTemplateChange) {
            onTemplateChange(user, changeData);
          }
        }
        break;
        
      default:
        console.log('Unhandled message type:', message.type);
    }
  }, [onTemplateChange]);
  
  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (!userId || !templateId) {
      console.log('Missing required params for WebSocket connection:', { userId, templateId });
      return;
    }
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping connection attempt');
      return; // Already connected
    }
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    try {
      // Get the WebSocket URL with protocol based on current location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/collaboration?userId=${userId}&templateId=${templateId}`;
      
      console.log('Attempting WebSocket connection to:', wsUrl);
      
      // Create WebSocket connection
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Connection opened
      socket.addEventListener('open', () => {
        console.log('Successfully connected to collaboration server');
        setIsConnected(true);
        setIsReconnecting(false);
        
        // Join the collaboration room
        const joinMessage = {
          type: 'join',
          username,
          avatar
        };
        console.log('Sending join message:', joinMessage);
        sendMessage(joinMessage);
        
        // Set up ping interval to keep connection alive
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        
        pingIntervalRef.current = window.setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            sendMessage({ type: 'ping' });
          }
        }, 30000) as unknown as number; // 30 seconds
      });
      
      // Listen for messages
      socket.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received WebSocket message:', message.type);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, event.data);
        }
      });
      
      // Connection closed
      socket.addEventListener('close', (event) => {
        console.log(`WebSocket closed: ${event.code} ${event.reason}`);
        setIsConnected(false);
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Attempt to reconnect
        if (!isReconnecting) {
          setIsReconnecting(true);
          console.log('Scheduling reconnection attempt in 2 seconds...');
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 2000) as unknown as number; // 2 seconds delay before reconnecting
        }
      });
      
      // Connection error
      socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to collaboration server. Retrying...',
          variant: 'destructive',
        });
      });
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
      
      // Attempt to reconnect
      if (!isReconnecting) {
        setIsReconnecting(true);
        console.log('Error occurred, scheduling reconnection attempt in 3 seconds...');
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000) as unknown as number; // 3 seconds delay before reconnecting
      }
    }
  }, [templateId, userId, username, avatar, isReconnecting, toast, sendMessage, handleMessage]);
  
  // Update cursor position
  const updateCursorPosition = useCallback((data: {
    sectionId?: string;
    elementId?: string;
    position?: { x: number; y: number };
    selection?: { start: number; end: number };
  }) => {
    sendMessage({
      type: 'cursor_update',
      data
    });
  }, [sendMessage]);
  
  // Send template change
  const sendTemplateChange = useCallback((changeData: {
    type: 'add' | 'update' | 'delete' | 'move';
    targetType: 'section' | 'element' | 'template';
    targetId?: string;
    parentId?: string;
    data: any;
  }) => {
    sendMessage({
      type: 'template_change',
      data: changeData
    });
  }, [sendMessage]);
  
  // Initialize connection on component mount
  useEffect(() => {
    console.log('Initializing WebSocket connection with params:', { 
      templateId, 
      userId,
      username 
    });
    connect();
    
    // Clean up on unmount
    return () => {
      console.log('Cleaning up WebSocket connection resources');
      
      if (socketRef.current) {
        try {
          // Try to send a leave message if the connection is open
          if (socketRef.current.readyState === WebSocket.OPEN) {
            console.log('Sending leave message before disconnecting');
            socketRef.current.send(JSON.stringify({ 
              type: 'leave',
              userId
            }));
          }
          
          socketRef.current.close();
        } catch (error) {
          console.error('Error while closing WebSocket:', error);
        } finally {
          socketRef.current = null;
        }
      }
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect, userId]);
  
  // Return hook value
  return {
    isConnected,
    isReconnecting,
    users,
    cursorPositions,
    updateCursorPosition,
    sendTemplateChange,
    setOnTemplateChange,
  };
}