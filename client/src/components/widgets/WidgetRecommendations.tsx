import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useWidgets, WidgetType, widgetTitles } from '@/hooks/useWidgets';
import { useWidgetRecommendations } from '@/hooks/useWidgetRecommendations';
import { BadgeCheck, BarChart2, Brain, Calendar, LineChart, Mail, Sparkles, User, UserCheck, PieChart, Zap, MousePointer } from 'lucide-react';

interface WidgetRecommendationsProps {
  clientData: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Icons for widget categories
const categoryIcons = {
  'analytics': <BarChart2 className="h-5 w-5 text-blue-600" />,
  'performance': <LineChart className="h-5 w-5 text-green-600" />,
  'audience': <User className="h-5 w-5 text-purple-600" />,
  'planning': <Calendar className="h-5 w-5 text-amber-600" />,
  'ai': <Brain className="h-5 w-5 text-indigo-600" />,
  'content': <Mail className="h-5 w-5 text-rose-600" />,
  'default': <Zap className="h-5 w-5 text-gray-600" />
};

const widgetIcons: Record<WidgetType, React.ReactNode> = {
  'activeCampaigns': <Mail className="h-4 w-4" />,
  'totalEmails': <Mail className="h-4 w-4" />,
  'openRate': <Mail className="h-4 w-4" />,
  'clickRate': <MousePointer className="h-4 w-4" />,
  'contacts': <Users className="h-4 w-4" />,
  'emailPerformance': <BarChart2 className="h-4 w-4" />,
  'deviceBreakdown': <Smartphone className="h-4 w-4" />,
  'recentCampaigns': <Clock className="h-4 w-4" />,
  'calendar': <Calendar className="h-4 w-4" />,
  'tasks': <CheckSquare className="h-4 w-4" />,
  'notes': <FileText className="h-4 w-4" />,
  'aiInsights': <Brain className="h-4 w-4" />,
  'optimalSendTime': <Clock className="h-4 w-4" />,
  'upcomingCampaigns': <Calendar className="h-4 w-4" />,
  'audienceGrowth': <TrendingUp className="h-4 w-4" />,
  'realtimeMetrics': <Activity className="h-4 w-4" />,
  'emailHealthScore': <Heart className="h-4 w-4" />,
  'campaignROI': <DollarSign className="h-4 w-4" />,
  'engagementHeatmap': <Grid className="h-4 w-4" />,
  'smartNotifications': <Bell className="h-4 w-4" />,
  'aiRecommendations': <Brain className="h-4 w-4" />,
  'campaignPerformanceAnalyzer': <PieChart className="h-4 w-4" />,
  'userJourney': <GitCommit className="h-4 w-4" />
};

// Import missing icons from Lucide
import { 
  Users, Smartphone, Clock, CheckSquare, FileText, 
  TrendingUp, Activity, Heart, DollarSign, Grid, Bell, GitCommit
} from 'lucide-react';

const WidgetRecommendations: React.FC<WidgetRecommendationsProps> = ({ 
  clientData, 
  open, 
  onOpenChange 
}) => {
  const { widgets, addWidget } = useWidgets();
  const { 
    recommendations,
    userPersona,
    generateRecommendations,
    getRecommendationReason,
    isAnalyzing
  } = useWidgetRecommendations(widgets, clientData);
  
  const [localRecommendations, setLocalRecommendations] = useState<WidgetType[]>([]);

  // Generate recommendations when the dialog opens
  useEffect(() => {
    if (open) {
      const recs = generateRecommendations();
      setLocalRecommendations(recs);
    }
  }, [open, generateRecommendations]);

  const handleAddWidget = (widgetType: WidgetType) => {
    addWidget(widgetType);
    
    // Update local recommendations to remove the added widget
    setLocalRecommendations(prev => prev.filter(type => type !== widgetType));
    
    // If all recommendations have been added, close the dialog
    if (localRecommendations.length <= 1) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>Personalized Widget Recommendations</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Based on your usage patterns, we've identified widgets that might be valuable for your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        {/* Usage Insights Section */}
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-purple-900">Smart Widget Suggestions</h3>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Personalized Dashboard</p>
              <p className="text-sm text-gray-600">
                Recommendations based on your usage patterns and dashboard interactions
              </p>
            </div>
          </div>
        </div>
        
        {isAnalyzing ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin mr-2 h-6 w-6 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
            <p>Analyzing your preferences...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {localRecommendations.length > 0 ? (
              localRecommendations.map(widgetType => (
                <Card key={widgetType} className="border border-gray-200 overflow-hidden transition-all hover:border-purple-200 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-100 p-1.5 rounded text-purple-700">
                          {widgetIcons[widgetType]}
                        </div>
                        <CardTitle className="text-base">{widgetTitles[widgetType]}</CardTitle>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs h-7 px-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                        onClick={() => handleAddWidget(widgetType)}
                      >
                        <BadgeCheck className="mr-1 h-3 w-3" />
                        Add Widget
                      </Button>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      {getRecommendationReason(widgetType)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">All recommended widgets have been added to your dashboard!</p>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Recommendations are based on your usage patterns and dashboard interactions.
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetRecommendations;