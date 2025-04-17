import React from 'react';
import { Widget, useWidgets, WidgetType } from '@/hooks/useWidgets';
import ActiveCampaignsWidget from './ActiveCampaignsWidget';
import TotalEmailsWidget from './TotalEmailsWidget';
import OpenRateWidget from './OpenRateWidget';
import EmailPerformanceWidget from './EmailPerformanceWidget';
import DeviceBreakdownWidget from './DeviceBreakdownWidget';
import RecentCampaignsWidget from './RecentCampaignsWidget';
import WidgetManager from './WidgetManager';

interface DashboardWidgetsProps {
  clientData: any; // The dashboard data
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ clientData }) => {
  const { widgets, removeWidget } = useWidgets();

  // Filter visible widgets and sort by row/col for display
  const visibleWidgets = widgets
    .filter(widget => widget.visible)
    .sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      }
      return a.row - b.row;
    });

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