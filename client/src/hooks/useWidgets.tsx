import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Widget types - AI-related widgets removed
export type WidgetType = 
  | 'activeCampaigns' 
  | 'totalEmails' 
  | 'openRate' 
  | 'clickRate' 
  | 'contacts' 
  | 'emailPerformance' 
  | 'deviceBreakdown'
  | 'recentCampaigns'
  | 'calendar'
  | 'tasks'
  | 'notes'
  | 'optimalSendTime'
  | 'upcomingCampaigns'
  | 'audienceGrowth'
  | 'realtimeMetrics'
  | 'emailHealthScore'
  | 'campaignROI'
  | 'engagementHeatmap';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  col: number;
  row: number;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  config?: any;
}

// Sizes for different widget types - AI-related widgets removed
export const widgetSizes: Record<WidgetType, 'small' | 'medium' | 'large'> = {
  activeCampaigns: 'small',
  totalEmails: 'small',
  openRate: 'small',
  clickRate: 'small',
  contacts: 'small',
  emailPerformance: 'large',
  deviceBreakdown: 'medium',
  recentCampaigns: 'large',
  calendar: 'medium',
  tasks: 'medium',
  notes: 'medium',
  optimalSendTime: 'medium',
  upcomingCampaigns: 'medium',
  audienceGrowth: 'medium',
  realtimeMetrics: 'large',
  emailHealthScore: 'large',
  campaignROI: 'large',
  engagementHeatmap: 'large'
};

// Widget titles - AI-related widgets removed
export const widgetTitles: Record<WidgetType, string> = {
  activeCampaigns: 'Active Campaigns',
  totalEmails: 'Total Emails',
  openRate: 'Open Rate',
  clickRate: 'Click Rate',
  contacts: 'Contact Count',
  emailPerformance: 'Email Performance',
  deviceBreakdown: 'Device Breakdown',
  recentCampaigns: 'Recent Campaigns',
  calendar: 'Campaign Calendar',
  tasks: 'Tasks',
  notes: 'Notes',
  optimalSendTime: 'Optimal Send Times',
  upcomingCampaigns: 'Upcoming Campaigns & Tasks',
  audienceGrowth: 'Audience Growth',
  realtimeMetrics: 'Real-Time Engagement Metrics',
  emailHealthScore: 'Email Health Score',
  campaignROI: 'Campaign ROI Tracker',
  engagementHeatmap: 'Engagement Heatmap'
};

// Default widgets configuration
export const defaultWidgets: Widget[] = [
  { id: '1', type: 'activeCampaigns', title: 'Active Campaigns', col: 0, row: 0, size: 'small', visible: true },
  { id: '2', type: 'totalEmails', title: 'Total Emails', col: 1, row: 0, size: 'small', visible: true },
  { id: '3', type: 'openRate', title: 'Open Rate', col: 2, row: 0, size: 'small', visible: true },
  { id: '4', type: 'emailPerformance', title: 'Email Performance', col: 0, row: 1, size: 'large', visible: true },
  { id: '5', type: 'deviceBreakdown', title: 'Device Breakdown', col: 2, row: 1, size: 'medium', visible: true },
  { id: '6', type: 'recentCampaigns', title: 'Recent Campaigns', col: 0, row: 2, size: 'large', visible: true }
];

// Available widgets for the add widget modal - expanded with all non-AI widgets
export const availableWidgets: WidgetType[] = [
  'activeCampaigns',
  'totalEmails',
  'openRate',
  'clickRate',
  'contacts',
  'emailPerformance',
  'deviceBreakdown',
  'recentCampaigns',
  'calendar',
  'tasks',
  'notes',
  'upcomingCampaigns',
  'audienceGrowth',
  'realtimeMetrics',
  'emailHealthScore',
  'campaignROI',
  'engagementHeatmap',
  'optimalSendTime'
];

// Context type
interface WidgetsContextType {
  widgets: Widget[];
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, col: number, row: number) => void;
  resetToDefault: () => void;
  toggleWidgetVisibility: (id: string) => void;
  updateWidgetConfig: (id: string, config: any) => void;
}

// Create the context
const WidgetsContext = createContext<WidgetsContextType | undefined>(undefined);

// Context provider
export const WidgetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  // Load widgets from localStorage on mount and filter out AI-related widgets
  useEffect(() => {
    const savedWidgets = localStorage.getItem('dashboard-widgets');
    if (savedWidgets) {
      try {
        // Parse saved widgets and filter out any AI-related ones
        const parsedWidgets = JSON.parse(savedWidgets);
        const filteredWidgets = parsedWidgets.filter((w: Widget) => 
          !w.type.toLowerCase().includes('ai') && 
          !w.type.includes('smart') &&
          !w.type.includes('userJourney') &&
          !w.type.includes('campaignPerformanceAnalyzer')
        );
        setWidgets(filteredWidgets);
      } catch (error) {
        console.error('Error loading widgets from localStorage:', error);
        setWidgets(defaultWidgets);
      }
    } else {
      setWidgets(defaultWidgets);
    }
  }, []);

  // Save widgets to localStorage when they change
  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
    }
  }, [widgets]);

  // Add a new widget
  const addWidget = (type: WidgetType) => {
    // Check if widget already exists and is just hidden
    const existingWidget = widgets.find(w => w.type === type && !w.visible);
    if (existingWidget) {
      toggleWidgetVisibility(existingWidget.id);
      return;
    }

    // Create a new widget
    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      title: widgetTitles[type],
      size: widgetSizes[type],
      col: 0, // Will be positioned automatically
      row: widgets.length, // Add to the bottom
      visible: true
    };

    setWidgets([...widgets, newWidget]);
  };

  // Remove a widget
  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(widget => widget.id !== id));
  };

  // Move a widget with swapping functionality
  const moveWidget = (id: string, targetCol: number, targetRow: number) => {
    // Find the widget we want to move
    const movingWidget = widgets.find(w => w.id === id);
    if (!movingWidget) return;
    
    // Find any widget that's already in the target position
    const targetWidget = widgets.find(w => 
      w.visible && w.row === targetRow && w.col === targetCol && w.id !== id
    );
    
    // Update widget positions
    setWidgets(widgets.map(widget => {
      // Update the moving widget to its new position
      if (widget.id === id) {
        return { ...widget, col: targetCol, row: targetRow };
      }
      
      // If there's a widget in the target position, swap it to the moving widget's old position
      if (targetWidget && widget.id === targetWidget.id) {
        return { ...widget, col: movingWidget.col, row: movingWidget.row };
      }
      
      // Leave other widgets unchanged
      return widget;
    }));
  };

  // Reset to default widgets
  const resetToDefault = () => {
    localStorage.removeItem('dashboard-widgets');
    setWidgets(defaultWidgets);
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = (id: string) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, visible: !widget.visible } : widget
    ));
  };

  // Update widget configuration
  const updateWidgetConfig = (id: string, config: any) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, config: { ...widget.config, ...config } } : widget
    ));
  };

  const value = {
    widgets,
    addWidget,
    removeWidget,
    moveWidget,
    resetToDefault,
    toggleWidgetVisibility,
    updateWidgetConfig
  };

  return (
    <WidgetsContext.Provider value={value}>
      {children}
    </WidgetsContext.Provider>
  );
};

// Custom hook to use the widgets context
export const useWidgets = () => {
  const context = useContext(WidgetsContext);
  if (context === undefined) {
    throw new Error('useWidgets must be used within a WidgetsProvider');
  }
  return context;
};