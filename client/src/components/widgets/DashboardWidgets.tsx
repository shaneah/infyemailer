import React from 'react';
import { Widget, useWidgets, WidgetType } from '@/hooks/useWidgets';
import ActiveCampaignsWidget from './ActiveCampaignsWidget';
import TotalEmailsWidget from './TotalEmailsWidget';
import OpenRateWidget from './OpenRateWidget';
import EmailPerformanceWidget from './EmailPerformanceWidget';
import DeviceBreakdownWidget from './DeviceBreakdownWidget';
import RecentCampaignsWidget from './RecentCampaignsWidget';
import AIInsightsWidget from './AIInsightsWidget';
import OptimalSendTimeWidget from './OptimalSendTimeWidget';
import UpcomingCampaignsWidget from './UpcomingCampaignsWidget';
import AudienceGrowthWidget from './AudienceGrowthWidget';
import RealTimeMetricsWidget from './RealTimeMetricsWidget';
import EmailHealthScoreWidget from './EmailHealthScoreWidget';
import CampaignROIWidget from './CampaignROIWidget';
import EngagementHeatmapWidget from './EngagementHeatmapWidget';
import SmartNotificationsWidget from './SmartNotificationsWidget';
import WidgetManager from './WidgetManager';

interface DashboardWidgetsProps {
  clientData: any; // The dashboard data
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ clientData }) => {
  const { widgets, removeWidget, updateWidgetConfig } = useWidgets();

  // Filter visible widgets and sort by row/col for display
  const visibleWidgets = widgets
    .filter(widget => widget.visible)
    .sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      }
      return a.row - b.row;
    });

  // Type definitions for mock data
  type Campaign = {
    id: number;
    name: string;
    scheduledDate: string;
    status: string;
  };

  type Task = {
    id: number;
    title: string;
    dueDate: string;
    status: 'completed' | 'pending' | 'overdue';
    campaignId?: number;
  };

  // Mock data for our new advanced widgets
  const mockData = {
    // For upcoming campaigns widget
    upcomingCampaignsData: {
      campaigns: [
        { id: 101, name: "Holiday Newsletter", scheduledDate: "2025-12-20T10:00:00", status: "Scheduled" },
        { id: 102, name: "New Year Promotion", scheduledDate: "2025-12-28T09:00:00", status: "Scheduled" },
        { id: 103, name: "February Flash Sale", scheduledDate: "2026-02-01T10:30:00", status: "Scheduled" }
      ] as Campaign[],
      tasks: [
        { id: 1, title: "Prepare holiday graphics", dueDate: "2025-12-10T17:00:00", status: "completed" as const },
        { id: 2, title: "Draft newsletter content", dueDate: "2025-12-15T17:00:00", status: "pending" as const, campaignId: 101 },
        { id: 3, title: "Review February campaign plan", dueDate: "2026-01-15T17:00:00", status: "pending" as const, campaignId: 103 },
        { id: 4, title: "Segment audience for New Year promo", dueDate: "2025-12-20T17:00:00", status: "pending" as const, campaignId: 102 },
        { id: 5, title: "A/B test subject lines", dueDate: "2025-12-18T17:00:00", status: "pending" as const, campaignId: 101 }
      ] as Task[]
    },
    
    // For audience growth widget
    audienceGrowthData: {
      subscriberGrowth: [
        { date: "Apr 1", subscribers: 120, unsubscribes: 15 },
        { date: "Apr 5", subscribers: 85, unsubscribes: 10 },
        { date: "Apr 10", subscribers: 142, unsubscribes: 12 },
        { date: "Apr 15", subscribers: 95, unsubscribes: 8 },
        { date: "Apr 20", subscribers: 110, unsubscribes: 18 },
        { date: "Apr 25", subscribers: 135, unsubscribes: 14 },
        { date: "Apr 30", subscribers: 168, unsubscribes: 11 },
      ],
      totalContacts: clientData.stats.contactsCount || 4560,
      growthRate: 4.8
    },
    
    // Campaign ROI widget data
    campaignROIData: {
      campaigns: [
        { name: "Monthly Newsletter", cost: 450, revenue: 2700, roi: 6.0 },
        { name: "Product Launch", cost: 1200, revenue: 8400, roi: 7.0 },
        { name: "Spring Sale", cost: 800, revenue: 5600, roi: 7.0 },
        { name: "Email Design Test", cost: 350, revenue: 1050, roi: 3.0 },
        { name: "Audience Retargeting", cost: 550, revenue: 2750, roi: 5.0 },
        { name: "Customer Appreciation", cost: 600, revenue: 1800, roi: 3.0 }
      ],
      targetROI: 4.5,
      averageROI: 5.2
    },
    
    // Engagement heatmap widget data
    engagementHeatmapData: {
      hourlyEngagement: {
        monday: [2, 1, 1, 0, 0, 1, 4, 12, 28, 45, 65, 72, 68, 62, 58, 55, 52, 60, 48, 38, 28, 15, 8, 4],
        tuesday: [3, 2, 0, 0, 0, 2, 5, 15, 35, 58, 75, 80, 78, 72, 62, 58, 55, 62, 45, 35, 22, 12, 8, 5],
        wednesday: [2, 1, 0, 0, 0, 1, 4, 12, 30, 52, 70, 75, 70, 65, 62, 60, 58, 62, 50, 38, 25, 15, 10, 4],
        thursday: [4, 2, 1, 0, 0, 2, 6, 18, 38, 58, 68, 75, 72, 68, 65, 62, 60, 65, 52, 42, 30, 18, 12, 6],
        friday: [3, 2, 1, 0, 0, 1, 4, 15, 35, 50, 62, 68, 65, 62, 58, 55, 52, 58, 45, 35, 22, 15, 10, 5],
        saturday: [2, 1, 0, 0, 0, 0, 2, 8, 18, 28, 38, 42, 45, 42, 38, 35, 32, 35, 32, 28, 22, 15, 8, 4],
        sunday: [1, 0, 0, 0, 0, 0, 1, 5, 12, 20, 28, 35, 38, 35, 30, 28, 25, 28, 25, 22, 18, 12, 6, 2]
      },
      totalEmailsSent: 125000,
      peakDay: 'tuesday',
      peakHour: 11,
      metrics: [
        { type: 'opens', title: 'Opens', color: 'indigo' },
        { type: 'clicks', title: 'Clicks', color: 'green' },
        { type: 'conversions', title: 'Conversions', color: 'purple' }
      ]
    },
    
    // Smart notifications widget data
    smartNotificationsData: {
      notifications: [
        {
          id: '1',
          type: 'alert',
          priority: 'high',
          title: 'Bounce Rate Increase',
          message: 'Your recent campaign shows a 15% increase in bounce rate compared to your average. Check your contact list quality.',
          timestamp: '12 min ago',
          read: false,
          category: 'campaigns',
          metadata: {
            link: '/campaigns/analytics',
            linkText: 'View Campaign Details',
            metric: {
              name: 'Bounce Rate',
              value: 8.5,
              change: 15.2,
              trend: 'up'
            }
          }
        },
        {
          id: '2',
          type: 'insight',
          priority: 'medium',
          title: 'Engagement Peak Detected',
          message: 'Tuesday at 11am consistently shows the highest engagement. Consider scheduling important campaigns during this time window.',
          timestamp: '1 hour ago',
          read: false,
          category: 'performance',
          metadata: {
            link: '/analytics/timing',
            linkText: 'View Timing Analysis'
          }
        },
        {
          id: '3',
          type: 'recommendation',
          priority: 'medium',
          title: 'Subject Line Opportunity',
          message: 'Adding personalization to your subject lines could improve your open rates by 20% based on industry data.',
          timestamp: '3 hours ago',
          read: false,
          category: 'campaigns',
          metadata: {
            link: '/campaigns/templates',
            linkText: 'Edit Templates'
          }
        },
        {
          id: '4',
          type: 'action',
          priority: 'high',
          title: 'Campaign Approval Needed',
          message: '"Spring Promotion" campaign needs your review and approval before scheduled send tomorrow.',
          timestamp: '5 hours ago',
          read: true,
          category: 'campaigns',
          metadata: {
            link: '/campaigns/spring-promotion',
            linkText: 'Review Campaign'
          }
        },
        {
          id: '5',
          type: 'insight',
          priority: 'low',
          title: 'Click Rate Improving',
          message: 'Your click-through rate has increased by 3.2% over the last 30 days. Your content changes appear to be working.',
          timestamp: 'Yesterday',
          read: true,
          category: 'performance',
          metadata: {
            metric: {
              name: 'Click Rate',
              value: 4.8,
              change: 3.2,
              trend: 'up'
            }
          }
        }
      ]
    }
  };

  // Render the appropriate widget based on its type
  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'activeCampaigns':
        return (
          <ActiveCampaignsWidget 
            key={widget.id}
            widget={widget}
            data={{
              activeCampaigns: clientData.stats.activeCampaigns,
              weeklyActive: 2 // Placeholder, would come from API
            }}
            onRemove={removeWidget}
          />
        );
      
      case 'totalEmails':
        return (
          <TotalEmailsWidget 
            key={widget.id}
            widget={widget}
            data={{
              totalEmails: clientData.stats.totalEmails,
              monthlyEmails: 1250 // Placeholder, would come from API
            }}
            onRemove={removeWidget}
          />
        );
      
      case 'openRate':
        return (
          <OpenRateWidget 
            key={widget.id}
            widget={widget}
            data={{
              openRate: clientData.stats.openRate,
              comparison: 3.2 // Placeholder, would come from API
            }}
            onRemove={removeWidget}
          />
        );
      
      case 'clickRate':
        return (
          <OpenRateWidget 
            key={widget.id}
            widget={{...widget, title: 'Click Rate'}}
            data={{
              openRate: clientData.stats.clickRate,
              comparison: 1.8 // Placeholder, would come from API
            }}
            onRemove={removeWidget}
          />
        );
      
      case 'emailPerformance':
        return (
          <EmailPerformanceWidget 
            key={widget.id}
            widget={widget}
            data={{
              performanceData: clientData.performanceData
            }}
            onRemove={removeWidget}
          />
        );
      
      case 'deviceBreakdown':
        return (
          <DeviceBreakdownWidget 
            key={widget.id}
            widget={widget}
            data={{
              deviceData: clientData.deviceData
            }}
            onRemove={removeWidget}
          />
        );
      
      case 'recentCampaigns':
        return (
          <RecentCampaignsWidget 
            key={widget.id}
            widget={widget}
            data={{
              recentCampaigns: clientData.recentCampaigns
            }}
            onRemove={removeWidget}
          />
        );
        
      // New advanced widgets
      case 'aiInsights':
        return (
          <AIInsightsWidget 
            key={widget.id}
            widget={widget}
            data={{
              performanceData: clientData.performanceData,
              recentCampaigns: clientData.recentCampaigns,
              stats: clientData.stats
            }}
            onRemove={removeWidget}
          />
        );
        
      case 'optimalSendTime':
        return (
          <OptimalSendTimeWidget 
            key={widget.id}
            widget={widget}
            onConfig={(config) => updateWidgetConfig(widget.id, config)}
            onRemove={removeWidget}
          />
        );
        
      case 'upcomingCampaigns':
        return (
          <UpcomingCampaignsWidget 
            key={widget.id}
            widget={widget}
            data={mockData.upcomingCampaignsData}
            onRemove={removeWidget}
          />
        );
        
      case 'audienceGrowth':
        return (
          <AudienceGrowthWidget 
            key={widget.id}
            widget={widget}
            data={mockData.audienceGrowthData}
            onRemove={removeWidget}
          />
        );
      
      case 'realtimeMetrics':
        return (
          <RealTimeMetricsWidget
            key={widget.id}
            widget={widget}
            onRemove={removeWidget}
          />
        );
        
      case 'emailHealthScore':
        return (
          <EmailHealthScoreWidget
            key={widget.id}
            widget={widget}
            data={{
              performanceData: clientData.performanceData,
              stats: clientData.stats
            }}
            onRemove={removeWidget}
          />
        );
        
      // Our new widgets
      case 'campaignROI':
        return (
          <CampaignROIWidget
            key={widget.id}
            widget={widget}
            data={mockData.campaignROIData}
            onRemove={removeWidget}
          />
        );
        
      case 'engagementHeatmap':
        return (
          <EngagementHeatmapWidget
            key={widget.id}
            widget={widget}
            data={mockData.engagementHeatmapData}
            onRemove={removeWidget}
          />
        );
        
      case 'smartNotifications':
        return (
          <SmartNotificationsWidget
            key={widget.id}
            widget={widget}
            data={mockData.smartNotificationsData}
            onRemove={removeWidget}
          />
        );
      
      default:
        return null;
    }
  };

  // Group widgets by row
  const widgetsByRow = visibleWidgets.reduce<Record<number, Widget[]>>((acc, widget) => {
    if (!acc[widget.row]) {
      acc[widget.row] = [];
    }
    acc[widget.row].push(widget);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <WidgetManager />
      </div>

      {Object.entries(widgetsByRow).map(([row, rowWidgets]) => (
        <div 
          key={`row-${row}`} 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {rowWidgets.map(widget => renderWidget(widget))}
        </div>
      ))}
    </div>
  );
};

export default DashboardWidgets;