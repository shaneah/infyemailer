import React, { useEffect, useState, useRef } from 'react';
import { Bell, X, User, FileEdit, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import './collaboration.css';

interface UserInfo {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
}

interface Notification {
  id: string;
  type: string;
  title?: string;
  message: string;
  user?: UserInfo;
  resourceId?: string;
  resourceType?: string;
  timestamp: number;
  read: boolean;
}

interface CollaborationNotifierProps {
  userId: string;
  userName: string;
  userRole?: string;
  userAvatar?: string;
}

export const CollaborationNotifier: React.FC<CollaborationNotifierProps> = ({
  userId,
  userName,
  userRole = 'user',
  userAvatar = ''
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<number>(0);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate a unique ID for notifications
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  // Connect to WebSocket server
  const connectWebSocket = () => {
    try {
      // Clean up any existing connection
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      // Initialize WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws?type=collaboration&userId=${userId}&userName=${encodeURIComponent(userName)}&userRole=${encodeURIComponent(userRole || '')}&userAvatar=${encodeURIComponent(userAvatar || '')}`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Register the user with the WebSocket server
        const registerMessage = JSON.stringify({
          type: 'register',
          userId,
          userInfo: {
            id: userId,
            name: userName,
            role: userRole,
            avatar: userAvatar
          }
        });
        
        socket.send(registerMessage);
        
        // Restart any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          // Handle initial state message
          if (data.type === 'initialState') {
            // Could process any initial state data here
            return;
          }
          
          // Handle notification messages
          if (data.type && data.message) {
            const newNotification: Notification = {
              id: generateId(),
              type: data.type,
              title: data.title || getDefaultTitle(data.type),
              message: data.message,
              user: data.user,
              resourceId: data.resourceId,
              resourceType: data.resourceType,
              timestamp: data.timestamp || Date.now(),
              read: false
            };
            
            setNotifications(prev => [newNotification, ...prev].slice(0, 20));
            setUnreadCount(count => count + 1);
            
            // Auto-open the notification panel if it's been less than 5 minutes since last activity
            const timeSinceLastActivity = Date.now() - lastActivityTime;
            if (timeSinceLastActivity < 5 * 60 * 1000) {
              setIsOpen(true);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Try to reconnect after a delay
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connectWebSocket();
            reconnectTimeoutRef.current = null;
          }, 5000);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      return socket;
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      return null;
    }
  };
  
  // Get default notification title based on type
  const getDefaultTitle = (type: string): string => {
    switch (type) {
      case 'user_joined':
        return 'User Joined';
      case 'user_left':
        return 'User Left';
      case 'resource_edit_started':
        return 'Edit Started';
      case 'resource_edit_ended':
        return 'Edit Ended';
      case 'resource_updated':
        return 'Resource Updated';
      case 'comment_added':
        return 'New Comment';
      case 'mention':
        return 'You Were Mentioned';
      case 'task_assigned':
        return 'Task Assigned';
      default:
        return 'Notification';
    }
  };
  
  // Get icon for notification based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_joined':
      case 'user_left':
        return <User className="h-4 w-4" />;
      case 'resource_edit_started':
      case 'resource_edit_ended':
      case 'resource_updated':
        return <FileEdit className="h-4 w-4" />;
      case 'comment_added':
      case 'mention':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  // Format timestamp to readable format
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.round(diffMs / 60000);
    
    if (diffMin < 1) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} min ago`;
    } else if (diffMin < 1440) {
      const hours = Math.floor(diffMin / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMin / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
    setUnreadCount(0);
  };
  
  // Toggle notification panel
  const toggleNotificationPanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // When opening, update last activity time
      setLastActivityTime(Date.now());
    }
    if (isOpen && unreadCount > 0) {
      // When closing, mark all as read
      markAllAsRead();
    }
  };
  
  // Mark individual notification as read
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Update unread count
    setUnreadCount(prevCount => {
      const notification = notifications.find(n => n.id === id);
      return notification && !notification.read ? prevCount - 1 : prevCount;
    });
  };
  
  // Remove individual notification
  const removeNotification = (id: string) => {
    setNotifications(prevNotifications => {
      const notificationToRemove = prevNotifications.find(n => n.id === id);
      
      // If removing an unread notification, decrement the unread count
      if (notificationToRemove && !notificationToRemove.read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return prevNotifications.filter(notification => notification.id !== id);
    });
  };
  
  // Initialize WebSocket when component mounts
  useEffect(() => {
    const socket = connectWebSocket();
    
    // Set up activity tracking
    const handleActivity = () => {
      setLastActivityTime(Date.now());
    };
    
    // Track user activity
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    
    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [userId, userName, userRole]); // Reconnect if these props change
  
  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative p-2 text-white hover:bg-white/10"
              onClick={toggleNotificationPanel}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] bg-red-500 border-none"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 z-50 max-h-[80vh] overflow-hidden flex flex-col shadow-lg">
          <div className="p-3 border-b flex justify-between items-center">
            <div className="flex items-center">
              <h4 className="text-sm font-semibold">Notifications</h4>
              <Badge 
                variant={isConnected ? "success" : "destructive"} 
                className="ml-2 px-1.5 py-0.5 text-[10px]"
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-1.5 h-6 text-xs"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Button>
          </div>
          
          <div className="overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 border-b hover:bg-accent/50 relative transition-colors ${notification.read ? '' : 'bg-accent/20'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {notification.user?.avatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                        <AvatarFallback>
                          {notification.user.name?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                      
                      {notification.resourceType && notification.resourceId && (
                        <Badge variant="outline" className="mt-1 px-1.5 py-0.5 text-[10px]">
                          {notification.resourceType}: {notification.resourceId}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};