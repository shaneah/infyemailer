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