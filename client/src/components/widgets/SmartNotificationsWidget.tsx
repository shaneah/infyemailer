import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Widget } from '@/hooks/useWidgets';
import { Badge } from "@/components/ui/badge";
import { 
  X, Bell, AlertCircle, TrendingUp, BarChart2, Clock, Zap, 
  Eye, Users, Inbox, Mail, ArrowUpRight, CheckCircle2, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

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

const SmartNotificationsWidget: React.FC<SmartNotificationsWidgetProps> = ({ widget, data, onRemove }) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts' | 'insights'>('all');
  
  // Get the icon for a notification type
  const getIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'insight':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'recommendation':
        return <BarChart2 className="h-4 w-4 text-purple-500" />;
      case 'action':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-indigo-500" />;
    }
  };

  // Get the icon for a notification category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'campaigns':
        return <Mail className="h-3.5 w-3.5" />;
      case 'contacts':
        return <Users className="h-3.5 w-3.5" />;
      case 'performance':
        return <Eye className="h-3.5 w-3.5" />;
      case 'system':
        return <Inbox className="h-3.5 w-3.5" />;
      default:
        return <Bell className="h-3.5 w-3.5" />;
    }
  };

  // Filter notifications based on the selected filter
  const filteredNotifications = data.notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'alerts') return notification.type === 'alert';
    if (filter === 'insights') return notification.type === 'insight';
    return true;
  });

  // Get the background color for a notification card
  const getBackgroundColor = (notification: Notification) => {
    if (notification.read) return 'bg-white';
    
    switch (notification.type) {
      case 'alert':
        return 'bg-red-50';
      case 'insight':
        return 'bg-blue-50';
      case 'recommendation':
        return 'bg-purple-50';
      case 'action':
        return 'bg-amber-50';
      default:
        return 'bg-indigo-50';
    }
  };

  // Get the border color for a notification card
  const getBorderColor = (notification: Notification) => {
    if (notification.read) return 'border-gray-200';
    
    switch (notification.type) {
      case 'alert':
        return 'border-red-200';
      case 'insight':
        return 'border-blue-200';
      case 'recommendation':
        return 'border-purple-200';
      case 'action':
        return 'border-amber-200';
      default:
        return 'border-indigo-200';
    }
  };

  return (
    <Card className="overflow-hidden shadow-md border border-indigo-100 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Zap className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-indigo-900">{widget.title}</CardTitle>
              <CardDescription className="text-indigo-700">
                Personalized alerts & insights
              </CardDescription>
            </div>
          </div>
          <button onClick={() => onRemove(widget.id)} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Bell className="h-4 w-4 text-indigo-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-800">Notifications</h3>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setFilter('all')}
              className={`px-2 py-1 text-xs rounded ${filter === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-2 py-1 text-xs rounded ${filter === 'unread' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              Unread
            </button>
            <button 
              onClick={() => setFilter('alerts')}
              className={`px-2 py-1 text-xs rounded ${filter === 'alerts' ? 'bg-red-100 text-red-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              Alerts
            </button>
            <button 
              onClick={() => setFilter('insights')}
              className={`px-2 py-1 text-xs rounded ${filter === 'insights' ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              Insights
            </button>
          </div>
        </div>
        
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notifications to display</p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`border ${getBorderColor(notification)} rounded-md overflow-hidden ${getBackgroundColor(notification)}`}
              >
                <div className="p-3 relative">
                  {!notification.read && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-indigo-500 rounded-full"></div>
                  )}
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-0.5">
                      {getIcon(notification)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h4 className="text-sm font-medium text-gray-900 mr-2">{notification.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] px-1.5 py-0 h-4 ${
                            notification.category === 'campaigns' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            notification.category === 'contacts' ? 'border-green-200 text-green-700 bg-green-50' :
                            notification.category === 'performance' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                            'border-gray-200 text-gray-700 bg-gray-50'
                          }`}
                        >
                          <span className="flex items-center">
                            <span className="mr-1">{getCategoryIcon(notification.category)}</span>
                            <span>{notification.category}</span>
                          </span>
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                      
                      {notification.metadata?.metric && (
                        <div className="mb-2 bg-white bg-opacity-60 p-2 rounded border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{notification.metadata.metric.name}</span>
                            <div className="flex items-center">
                              <span className="text-sm font-medium mr-1">
                                {notification.metadata.metric.value.toFixed(1)}%
                              </span>
                              <span className={`text-xs flex items-center ${
                                notification.metadata.metric.trend === 'up' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {notification.metadata.metric.trend === 'up' ? (
                                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                ) : (
                                  <ArrowUpRight className="h-3 w-3 mr-0.5 transform rotate-180" />
                                )}
                                {notification.metadata.metric.change.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {notification.metadata?.link && (
                        <a 
                          href={notification.metadata.link} 
                          className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center"
                        >
                          {notification.metadata.linkText || 'View details'}
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </a>
                      )}
                      
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400">{notification.timestamp}</span>
                        
                        <div className="flex items-center gap-1">
                          <button className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" />
                            Mark as read
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartNotificationsWidget;