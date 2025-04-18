import { useState, useEffect, useCallback } from 'react';
import { Widget, WidgetType, widgetTitles } from './useWidgets';
import { useToast } from '@/hooks/use-toast';

// Types for widget interaction data
export interface WidgetInteraction {
  widgetId: string;
  widgetType: WidgetType;
  viewCount: number;
  interactionCount: number;
  lastViewed: Date;
  lastInteracted: Date | null;
  score: number;
}

// Widget category types
export type WidgetCategory = 
  | 'analytics' 
  | 'performance' 
  | 'content' 
  | 'audience' 
  | 'planning'
  | 'ai';

// Define categories for different widget types
export const widgetCategories: Record<WidgetType, WidgetCategory> = {
  activeCampaigns: 'analytics',
  totalEmails: 'analytics',
  openRate: 'performance',
  clickRate: 'performance',
  contacts: 'audience',
  emailPerformance: 'performance',
  deviceBreakdown: 'analytics',
  recentCampaigns: 'analytics',
  calendar: 'planning',
  tasks: 'planning',
  notes: 'planning',
  aiInsights: 'ai',
  optimalSendTime: 'performance',
  upcomingCampaigns: 'planning',
  audienceGrowth: 'audience',
  realtimeMetrics: 'performance',
  emailHealthScore: 'performance',
  campaignROI: 'analytics',
  engagementHeatmap: 'analytics',
  smartNotifications: 'analytics',
  aiRecommendations: 'ai',
  campaignPerformanceAnalyzer: 'performance',
  userJourney: 'audience'
};

// User persona types based on behavior
export type UserPersona = 
  | 'analyst'      // Focuses on data and metrics
  | 'content-creator' // Focuses on design and content
  | 'planner'      // Focuses on scheduling and organization
  | 'marketer'     // Balanced approach
  | 'executive'    // High-level overview
  | 'undefined';   // Not enough data yet

// Preferred widget categories for each persona
const personaPreferences: Record<UserPersona, WidgetCategory[]> = {
  'analyst': ['analytics', 'performance', 'ai'],
  'content-creator': ['content', 'audience', 'ai'],
  'planner': ['planning', 'analytics', 'performance'],
  'marketer': ['performance', 'audience', 'analytics', 'ai'],
  'executive': ['analytics', 'performance', 'audience'],
  'undefined': ['analytics', 'performance', 'audience', 'planning', 'content', 'ai']
};

export const useWidgetRecommendations = (
  currentWidgets: Widget[],
  clientData: any
) => {
  const [interactionData, setInteractionData] = useState<Record<string, WidgetInteraction>>({});
  const [userPersona, setUserPersona] = useState<UserPersona>('undefined');
  const [recommendations, setRecommendations] = useState<WidgetType[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Initialize interaction data from localStorage
  useEffect(() => {
    const loadInteractionData = () => {
      try {
        const savedData = localStorage.getItem('widget-interactions');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          
          // Convert date strings back to Date objects
          Object.keys(parsed).forEach(key => {
            parsed[key].lastViewed = new Date(parsed[key].lastViewed);
            if (parsed[key].lastInteracted) {
              parsed[key].lastInteracted = new Date(parsed[key].lastInteracted);
            }
          });
          
          setInteractionData(parsed);
        }
      } catch (error) {
        console.error('Error loading widget interaction data', error);
      }
    };

    loadInteractionData();
  }, []);

  // Save interaction data to localStorage when it changes
  useEffect(() => {
    if (Object.keys(interactionData).length > 0) {
      try {
        localStorage.setItem('widget-interactions', JSON.stringify(interactionData));
      } catch (error) {
        console.error('Error saving widget interaction data', error);
      }
    }
  }, [interactionData]);

  // Record a widget view
  const recordWidgetView = useCallback((widget: Widget) => {
    setInteractionData(prev => {
      const widgetId = widget.id;
      const existingData = prev[widgetId] || {
        widgetId,
        widgetType: widget.type,
        viewCount: 0,
        interactionCount: 0,
        lastViewed: new Date(),
        lastInteracted: null,
        score: 0
      };

      const updatedData = {
        ...existingData,
        viewCount: existingData.viewCount + 1,
        lastViewed: new Date(),
        // Update score based on recent view (recency factor)
        score: existingData.score + 1
      };

      return {
        ...prev,
        [widgetId]: updatedData
      };
    });
  }, []);

  // Record a widget interaction (click, configure, etc.)
  const recordWidgetInteraction = useCallback((widget: Widget) => {
    setInteractionData(prev => {
      const widgetId = widget.id;
      const existingData = prev[widgetId] || {
        widgetId,
        widgetType: widget.type,
        viewCount: 0,
        interactionCount: 0,
        lastViewed: new Date(),
        lastInteracted: null,
        score: 0
      };

      const updatedData = {
        ...existingData,
        interactionCount: existingData.interactionCount + 1,
        lastInteracted: new Date(),
        // Interaction is weighted higher than a view
        score: existingData.score + 3
      };

      return {
        ...prev,
        [widgetId]: updatedData
      };
    });
  }, []);

  // Determine user persona based on interaction data
  const analyzeUserPersona = useCallback(() => {
    // If not enough data, return undefined
    if (Object.keys(interactionData).length < 3) {
      return 'undefined';
    }

    // Calculate category scores based on interactions
    const categoryScores: Record<WidgetCategory, number> = {
      analytics: 0,
      performance: 0,
      content: 0,
      audience: 0,
      planning: 0,
      ai: 0
    };

    // Sum up scores by category
    Object.values(interactionData).forEach(interaction => {
      const category = widgetCategories[interaction.widgetType];
      categoryScores[category] += interaction.score;
    });

    // Find the dominant categories
    const sortedCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category as WidgetCategory);

    // Top two categories determine the persona
    const topCategories = sortedCategories.slice(0, 2);

    // Determine persona based on top categories
    if (topCategories.includes('analytics') && 
        (topCategories.includes('performance') || topCategories.includes('ai'))) {
      return 'analyst';
    } else if (topCategories.includes('content') || 
               (topCategories.includes('audience') && topCategories.includes('ai'))) {
      return 'content-creator';
    } else if (topCategories.includes('planning')) {
      return 'planner';
    } else if (topCategories.includes('performance') && 
               (topCategories.includes('audience') || topCategories.includes('analytics'))) {
      return 'marketer';
    } else if (topCategories.includes('analytics') && topCategories.includes('audience')) {
      return 'executive';
    }

    return 'marketer'; // Default to marketer if no clear pattern
  }, [interactionData]);

  // Generate widget recommendations based on user persona and client data
  const generateRecommendations = useCallback(() => {
    setIsAnalyzing(true);
    
    // Determine current user persona
    const persona = analyzeUserPersona();
    setUserPersona(persona);

    // Get visible widget types
    const visibleWidgetTypes = currentWidgets
      .filter(w => w.visible)
      .map(w => w.type);
    
    // Get preferred categories for the persona
    const preferredCategories = personaPreferences[persona];
    
    // Find widgets in preferred categories that aren't currently visible
    const candidateWidgets = Object.entries(widgetCategories)
      .filter(([type, category]) => 
        !visibleWidgetTypes.includes(type as WidgetType) && 
        preferredCategories.includes(category)
      )
      .map(([type]) => type as WidgetType);
    
    // Limit to 3 recommendations
    const topRecommendations = candidateWidgets.slice(0, 3);
    
    // If we don't have enough recommendations, add some default ones
    if (topRecommendations.length < 3) {
      const defaultRecommendations: WidgetType[] = [
        'aiRecommendations', 
        'campaignPerformanceAnalyzer', 
        'userJourney', 
        'engagementHeatmap', 
        'realtimeMetrics'
      ].filter(type => !visibleWidgetTypes.includes(type) && 
                      !topRecommendations.includes(type));
      
      // Add default recommendations until we have 3
      while (topRecommendations.length < 3 && defaultRecommendations.length > 0) {
        topRecommendations.push(defaultRecommendations.shift()!);
      }
    }
    
    setRecommendations(topRecommendations);
    setIsAnalyzing(false);
    
    return topRecommendations;
  }, [currentWidgets, analyzeUserPersona]);

  // Get a description of why a widget is recommended
  const getRecommendationReason = useCallback((widgetType: WidgetType): string => {
    const category = widgetCategories[widgetType];
    
    switch (userPersona) {
      case 'analyst':
        if (category === 'analytics') return 'Based on your focus on data analysis';
        if (category === 'performance') return 'To help you track key performance metrics';
        if (category === 'ai') return 'For AI-driven insights aligned with your analytical approach';
        break;
      case 'content-creator':
        if (category === 'content') return 'To support your content creation workflow';
        if (category === 'audience') return 'To help you understand your audience better';
        if (category === 'ai') return 'For AI-powered content recommendations';
        break;
      case 'planner':
        if (category === 'planning') return 'To enhance your campaign planning';
        if (category === 'analytics') return 'For important analytics to support your planning';
        break;
      case 'marketer':
        if (category === 'performance') return 'For marketing performance insights';
        if (category === 'audience') return 'To help you connect with your audience';
        if (category === 'analytics') return 'For data-driven marketing decisions';
        break;
      case 'executive':
        if (category === 'analytics') return 'For high-level analytics you need';
        if (category === 'performance') return 'For key performance oversight';
        break;
      default:
        if (category === 'ai') return 'Recommended for enhanced insights';
        if (category === 'analytics') return 'For better tracking of your campaigns';
        if (category === 'performance') return 'To monitor important performance metrics';
    }
    
    return 'Recommended based on your usage patterns';
  }, [userPersona]);

  // Reset interaction data
  const resetInteractionData = useCallback(() => {
    localStorage.removeItem('widget-interactions');
    setInteractionData({});
    setUserPersona('undefined');
    setRecommendations([]);
    
    toast({
      title: "Widget recommendations reset",
      description: "Your personalization data has been cleared.",
    });
  }, [toast]);

  return {
    recordWidgetView,
    recordWidgetInteraction,
    generateRecommendations,
    getRecommendationReason,
    resetInteractionData,
    recommendations,
    userPersona,
    isAnalyzing,
    interactionData
  };
};