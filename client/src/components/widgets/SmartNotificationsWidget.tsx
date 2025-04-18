import React, { useState } from 'react';
import { Widget } from '@/hooks/useWidgets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  CheckCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  type: 'alert' | 'insight' | 'recommendation' | 'action';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'campaigns' | 'contacts' | 'performance' | 'system';
  metadata?: {
    link?: string;
    linkText?: string;
    metric?: {
      name: string;
      value: number;
      change: number;
      trend: 'up' | 'down';
    }
  }
}

interface SmartNotificationsWidgetProps {
  widget: Widget;
  data: {
    notifications: Notification[];
  };
  onRemove: (id: string) => void;
}

const SmartNotificationsWidget: React.FC<SmartNotificationsWidgetProps> = ({ 
  widget, 
  data, 
  onRemove 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(data.notifications);
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>({
    alert: true,
    insight: true,
    recommendation: true,
    action: true
  });
  const [selectedPriorities, setSelectedPriorities] = useState<Record<string, boolean>>({
    high: true,
    medium: true,
    low: true
  });
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  // Filter notifications
  const filteredNotifications = notifications.filter(notification => 
    selectedTypes[notification.type] && selectedPriorities[notification.priority]
  );
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Get icon for notification type
  const getIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'insight':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4 text-green-500" />;
      case 'action':
        return <ArrowRight className="h-4 w-4 text-rose-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };
  
  // Get background color for notification card
  const getBackgroundColor = (notification: Notification) => {
    if (notification.read) return "bg-white";
    
    switch (notification.type) {
      case 'alert':
        return "bg-amber-50";
      case 'insight':
        return "bg-blue-50";
      case 'recommendation':
        return "bg-green-50";
      case 'action':
        return "bg-rose-50";
      default:
        return "bg-white";
    }
  };
  
  // Get border color for notification card
  const getBorderColor = (notification: Notification) => {
    if (notification.read) return "border-gray-200";
    
    switch (notification.type) {
      case 'alert':
        return "border-amber-200";
      case 'insight':
        return "border-blue-200";
      case 'recommendation':
        return "border-green-200";
      case 'action':
        return "border-rose-200";
      default:
        return "border-gray-200";
    }
  };
  
  // Get badge for notification priority
  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50">
            High Priority
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Get title for notification type
  const getTypeTitle = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return 'Alert';
      case 'insight':
        return 'Insight';
      case 'recommendation':
        return 'Recommendation';
      case 'action':
        return 'Action Required';
      default:
        return 'Notification';
    }
  };

  // Get category badge
  const getCategoryBadge = (category: Notification['category']) => {
    switch (category) {
      case 'campaigns':
        return (
          <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
            Campaigns
          </Badge>
        );
      case 'contacts':
        return (
          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
            Contacts
          </Badge>
        );
      case 'performance':
        return (
          <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">
            Performance
          </Badge>
        );
      case 'system':
        return (
          <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50">
            System
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn(
      "col-span-3 md:col-span-1 shadow-sm hover:shadow-md transition-shadow",
      widget.size === 'medium' && "md:col-span-1", 
      widget.size === 'large' && "md:col-span-2"
    )}>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div className="flex items-start gap-2">
          <div className="relative">
            <Bell className="h-5 w-5 text-purple-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">{widget.title}</CardTitle>
            <CardDescription>Smart alerts and recommendations</CardDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          onClick={() => onRemove(widget.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
              {/* Type filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Filter className="h-3.5 w-3.5" />
                    Type
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuCheckboxItem 
                    checked={selectedTypes.alert} 
                    onCheckedChange={(checked) => setSelectedTypes({...selectedTypes, alert: checked})}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                    Alerts
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={selectedTypes.insight} 
                    onCheckedChange={(checked) => setSelectedTypes({...selectedTypes, insight: checked})}
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                    Insights
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={selectedTypes.recommendation} 
                    onCheckedChange={(checked) => setSelectedTypes({...selectedTypes, recommendation: checked})}
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                    Recommendations
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={selectedTypes.action} 
                    onCheckedChange={(checked) => setSelectedTypes({...selectedTypes, action: checked})}
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-rose-500 mr-1.5" />
                    Actions
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Priority filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Filter className="h-3.5 w-3.5" />
                    Priority
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuCheckboxItem 
                    checked={selectedPriorities.high} 
                    onCheckedChange={(checked) => setSelectedPriorities({...selectedPriorities, high: checked})}
                  >
                    <span className="h-2 w-2 rounded-full bg-rose-500 mr-2" />
                    High
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={selectedPriorities.medium} 
                    onCheckedChange={(checked) => setSelectedPriorities({...selectedPriorities, medium: checked})}
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500 mr-2" />
                    Medium
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={selectedPriorities.low} 
                    onCheckedChange={(checked) => setSelectedPriorities({...selectedPriorities, low: checked})}
                  >
                    <span className="h-2 w-2 rounded-full bg-slate-400 mr-2" />
                    Low
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Mark all as read */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
              disabled={unreadCount === 0}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              Mark all as read
            </Button>
          </div>
          
          {/* Notifications list */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No notifications match your filters</p>
              <Button 
                variant="link" 
                className="text-xs mt-1 h-auto p-0"
                onClick={() => {
                  setSelectedTypes({alert: true, insight: true, recommendation: true, action: true});
                  setSelectedPriorities({high: true, medium: true, low: true});
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "border rounded-md p-3 transition-colors relative", 
                    getBorderColor(notification),
                    getBackgroundColor(notification)
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  {/* Notification header */}
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {getIcon(notification)}
                      <span className={cn(
                        "text-sm font-medium",
                        notification.type === 'alert' && "text-amber-700",
                        notification.type === 'insight' && "text-blue-700",
                        notification.type === 'recommendation' && "text-green-700",
                        notification.type === 'action' && "text-rose-700"
                      )}>
                        {getTypeTitle(notification.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-gray-500">{notification.timestamp}</span>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            {notification.read ? 'Read' : 'Unread'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Notification body */}
                  <div className="mb-2">
                    <h4 className="text-sm font-medium mb-1">{notification.title}</h4>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                  </div>
                  
                  {/* Notification footer with metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {getPriorityBadge(notification.priority)}
                      {getCategoryBadge(notification.category)}
                    </div>
                    
                    {/* Show metric if available */}
                    {notification.metadata?.metric && (
                      <div className={cn(
                        "flex items-center text-xs font-medium gap-1",
                        notification.metadata.metric.trend === 'up' ? "text-green-600" : "text-rose-600"
                      )}>
                        {notification.metadata.metric.trend === 'up' ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        <span>{notification.metadata.metric.name}: {notification.metadata.metric.value}%</span>
                        <span>{notification.metadata.metric.change > 0 ? '+' : ''}{notification.metadata.metric.change}%</span>
                      </div>
                    )}
                    
                    {/* Action link if available */}
                    {notification.metadata?.link && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-7 p-0 text-xs text-purple-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to link in real implementation
                          markAsRead(notification.id);
                        }}
                      >
                        {notification.metadata.linkText || 'View details'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartNotificationsWidget;