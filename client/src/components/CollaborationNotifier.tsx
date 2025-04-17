import React, { useEffect, useState, useRef } from 'react';
import { 
  Bell, 
  UserPlus, 
  UserMinus, 
  Edit2, 
  FileText, 
  MessageSquare, 
  AtSign, 
  Clipboard, 
  AlertCircle 
} from 'lucide-react';
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Define notification types 
enum NotificationType {
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  RESOURCE_EDIT_STARTED = 'resource_edit_started',
  RESOURCE_EDIT_ENDED = 'resource_edit_ended',
  RESOURCE_UPDATED = 'resource_updated',
  COMMENT_ADDED = 'comment_added',
  MENTION = 'mention',
  TASK_ASSIGNED = 'task_assigned'
}

interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  user?: UserInfo;
  resourceId?: string;
  resourceType?: string;
  context?: string;
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
  userRole,
  userAvatar
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // Connect to WebSocket server when component mounts
  useEffect(() => {
    const connectWebSocket = () => {
      // Determine protocol (ws or wss) based on current URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      
      // Create URL with query parameters for identification
      const wsUrl = `${protocol}//${host}/collaboration?userId=${encodeURIComponent(userId)}&userName=${encodeURIComponent(userName)}${userRole ? `&userRole=${encodeURIComponent(userRole)}` : ''}${userAvatar ? `&userAvatar=${encodeURIComponent(userAvatar)}` : ''}`;
      
      console.log('Connecting to collaboration WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      // Connection opened
      ws.addEventListener('open', (event) => {
        console.log('Connected to collaboration server');
        toast({
          title: "Collaboration Connected",
          description: "You are now connected to the real-time collaboration service.",
          duration: 3000
        });
      });
      
      // Listen for messages
      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      
      // Connection closed
      ws.addEventListener('close', (event) => {
        console.log('Disconnected from collaboration server:', event.code, event.reason);
        // Attempt to reconnect after delay
        setTimeout(() => {
          if (document.visibilityState !== 'hidden') {
            connectWebSocket();
          }
        }, 3000);
      });
      
      // Connection error
      ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
      });
    };
    
    // Initial connection
    connectWebSocket();
    
    // Reconnect when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
        connectWebSocket();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up the connection when component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userId, userName, userRole, userAvatar, toast]);
  
  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    console.log('Received collaboration message:', data);
    
    if (data.type === 'initial_state') {
      // This is just the initial state, no notification needed
      return;
    }
    
    // Generate a unique ID for the notification
    const notificationId = `${data.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let title = '';
    let message = '';
    let shouldNotify = true;
    
    switch (data.type) {
      case NotificationType.USER_JOINED:
        title = 'User Joined';
        message = `${data.user?.name} joined the collaboration`;
        break;
        
      case NotificationType.USER_LEFT:
        title = 'User Left';
        message = `${data.user?.name} left the collaboration`;
        break;
        
      case NotificationType.RESOURCE_EDIT_STARTED:
        title = 'Editing Started';
        message = `${data.user?.name} started editing ${data.resourceType || 'resource'} ${data.resourceId}`;
        break;
        
      case NotificationType.RESOURCE_EDIT_ENDED:
        title = 'Editing Ended';
        message = `${data.user?.name} finished editing ${data.resourceId}`;
        shouldNotify = false; // Don't need a toast for this
        break;
        
      case NotificationType.RESOURCE_UPDATED:
        title = 'Resource Updated';
        message = `${data.user?.name} updated ${data.resourceType || 'resource'} ${data.resourceId}`;
        break;
        
      case NotificationType.COMMENT_ADDED:
        title = 'New Comment';
        message = `${data.user?.name} commented on ${data.resourceType || 'resource'} ${data.resourceId}: ${data.comment}`;
        break;
        
      case NotificationType.MENTION:
        title = 'You were mentioned';
        message = `${data.mentioningUser?.name} mentioned you in ${data.resourceType || 'resource'} ${data.resourceId}`;
        break;
        
      case NotificationType.TASK_ASSIGNED:
        title = 'Task Assigned';
        message = `${data.assigner?.name} assigned you task: ${data.taskDetails?.title || data.taskId}`;
        break;
        
      default:
        title = 'Collaboration Update';
        message = 'Something happened in the collaboration';
        shouldNotify = false;
    }
    
    // Create the notification
    const notification: Notification = {
      id: notificationId,
      type: data.type,
      title,
      message,
      timestamp: data.timestamp || Date.now(),
      read: false,
      user: data.user || data.mentioningUser || data.assigner,
      resourceId: data.resourceId,
      resourceType: data.resourceType,
      context: data.context
    };
    
    // Update notifications state
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep only the latest 50 notifications
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification if needed
    if (shouldNotify) {
      toast({
        title,
        description: message,
        duration: 5000
      });
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark this notification as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Handle navigation or action based on notification type
    switch (notification.type) {
      case NotificationType.RESOURCE_UPDATED:
      case NotificationType.RESOURCE_EDIT_STARTED:
        // Navigate to the resource
        if (notification.resourceId) {
          console.log(`Navigate to ${notification.resourceType} ${notification.resourceId}`);
          // Implement navigation logic here, e.g.:
          // navigate(`/${notification.resourceType}/${notification.resourceId}`);
        }
        break;
        
      case NotificationType.MENTION:
      case NotificationType.COMMENT_ADDED:
        // Navigate to the comment or mention context
        if (notification.resourceId) {
          console.log(`Navigate to comment in ${notification.resourceType} ${notification.resourceId}`);
          // Implement navigation logic here
        }
        break;
        
      case NotificationType.TASK_ASSIGNED:
        // Navigate to the task
        console.log(`Navigate to task ${notification.resourceId}`);
        // Implement navigation logic here
        break;
    }
  };
  
  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.USER_JOINED:
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case NotificationType.USER_LEFT:
        return <UserMinus className="w-4 h-4 text-amber-500" />;
      case NotificationType.RESOURCE_EDIT_STARTED:
      case NotificationType.RESOURCE_EDIT_ENDED:
        return <Edit2 className="w-4 h-4 text-blue-500" />;
      case NotificationType.RESOURCE_UPDATED:
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case NotificationType.COMMENT_ADDED:
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case NotificationType.MENTION:
        return <AtSign className="w-4 h-4 text-pink-500" />;
      case NotificationType.TASK_ASSIGNED:
        return <Clipboard className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative p-2"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-8"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground p-4">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">You'll see collaboration updates here</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b hover:bg-muted/30 cursor-pointer transition-colors ${!notification.read ? 'bg-muted/20' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {notification.user?.avatar ? (
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                          <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
                      {!notification.read && (
                        <Badge variant="default" className="mt-1 px-1.5 py-0 text-[10px]">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default CollaborationNotifier;