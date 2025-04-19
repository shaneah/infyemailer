import { useState, useEffect, useCallback } from 'react';
import { Widget, WidgetType, widgetTitles } from './useWidgets';
import { useToast } from '@/hooks/use-toast';

// Types for widget interaction data
export interface WidgetInteraction {
  widgetId: string;
  widgetType: WidgetType;
  viewCount: number;
  interactionCount: number;
  durationSpent: number; // Time spent in seconds
  lastViewed: Date;
  lastInteracted: Date | null;
  score: number;
  actionHistory: WidgetAction[]; // History of actions for more detailed analysis
  feedback: 'positive' | 'negative' | 'neutral' | null; // User feedback about the widget
}

// Widget action types for detailed tracking
export interface WidgetAction {
  type: 'view' | 'click' | 'configure' | 'expand' | 'minimize' | 'refresh' | 'download' | 'feedback';
  timestamp: Date;
  context?: string; // Additional context about the action
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
  | 'power-user'   // Advanced user using many features
  | 'undefined';   // Not enough data yet

// Usage context to refine recommendations
export interface UsageContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  sessionDuration: 'short' | 'medium' | 'long';
  deviceType: 'desktop' | 'tablet' | 'mobile';
}

// Widget relations map to suggest complementary widgets
const complementaryWidgets: Record<WidgetType, WidgetType[]> = {
  // Analytics widgets pair well with these
  activeCampaigns: ['campaignROI', 'emailPerformance', 'openRate', 'clickRate'],
  totalEmails: ['emailPerformance', 'deviceBreakdown', 'openRate', 'clickRate'],
  openRate: ['emailPerformance', 'campaignROI', 'clickRate', 'emailHealthScore'],
  clickRate: ['emailPerformance', 'campaignROI', 'openRate', 'emailHealthScore'],
  
  // Audience widgets
  contacts: ['audienceGrowth', 'userJourney', 'aiRecommendations'],
  userJourney: ['engagementHeatmap', 'audienceGrowth', 'aiRecommendations'],
  audienceGrowth: ['contacts', 'emailPerformance', 'userJourney'],
  
  // Performance widgets
  emailPerformance: ['openRate', 'clickRate', 'campaignROI', 'campaignPerformanceAnalyzer'],
  deviceBreakdown: ['emailPerformance', 'engagementHeatmap', 'emailHealthScore'],
  realtimeMetrics: ['emailPerformance', 'smartNotifications', 'engagementHeatmap'],
  emailHealthScore: ['openRate', 'clickRate', 'emailPerformance'],
  campaignROI: ['activeCampaigns', 'emailPerformance', 'campaignPerformanceAnalyzer'],
  campaignPerformanceAnalyzer: ['emailPerformance', 'campaignROI', 'engagementHeatmap'],
  optimalSendTime: ['emailPerformance', 'campaignROI', 'aiRecommendations'],
  engagementHeatmap: ['emailPerformance', 'deviceBreakdown', 'userJourney'],
  
  // Planning widgets
  calendar: ['tasks', 'upcomingCampaigns', 'optimalSendTime'],
  tasks: ['calendar', 'upcomingCampaigns', 'notes'],
  notes: ['tasks', 'aiInsights', 'calendar'],
  upcomingCampaigns: ['calendar', 'tasks', 'optimalSendTime'],
  
  // AI widgets
  aiInsights: ['aiRecommendations', 'emailPerformance', 'campaignROI'],
  aiRecommendations: ['aiInsights', 'campaignPerformanceAnalyzer', 'optimalSendTime'],
  smartNotifications: ['realtimeMetrics', 'aiRecommendations', 'upcomingCampaigns'],
  
  // Default for any new widgets
  recentCampaigns: ['activeCampaigns', 'emailPerformance', 'upcomingCampaigns'],
};

// Preferred widget categories for each persona
const personaPreferences: Record<UserPersona, { 
  categories: WidgetCategory[],
  weights: Record<WidgetCategory, number>
}> = {
  'analyst': {
    categories: ['analytics', 'performance', 'ai'],
    weights: {
      analytics: 0.40,
      performance: 0.30,
      ai: 0.15,
      audience: 0.10,
      planning: 0.03,
      content: 0.02
    }
  },
  'content-creator': {
    categories: ['content', 'audience', 'ai'],
    weights: {
      content: 0.35,
      audience: 0.30,
      ai: 0.20,
      performance: 0.10,
      analytics: 0.03,
      planning: 0.02
    }
  },
  'planner': {
    categories: ['planning', 'analytics', 'performance'],
    weights: {
      planning: 0.40,
      analytics: 0.25,
      performance: 0.20,
      ai: 0.08,
      audience: 0.05,
      content: 0.02
    }
  },
  'marketer': {
    categories: ['performance', 'audience', 'analytics', 'ai'],
    weights: {
      performance: 0.30,
      audience: 0.25,
      analytics: 0.20,
      ai: 0.15,
      planning: 0.07,
      content: 0.03
    }
  },
  'executive': {
    categories: ['analytics', 'performance', 'audience'],
    weights: {
      analytics: 0.35,
      performance: 0.30,
      audience: 0.20,
      ai: 0.10,
      planning: 0.03,
      content: 0.02
    }
  },
  'power-user': {
    categories: ['ai', 'analytics', 'performance', 'audience', 'planning'],
    weights: {
      ai: 0.30,
      analytics: 0.25,
      performance: 0.20,
      audience: 0.15,
      planning: 0.07,
      content: 0.03
    }
  },
  'undefined': {
    categories: ['analytics', 'performance', 'audience', 'planning', 'content', 'ai'],
    weights: {
      analytics: 0.20,
      performance: 0.20,
      audience: 0.15,
      ai: 0.15,
      planning: 0.15,
      content: 0.15
    }
  }
};

// Business value scores for different widget types to prioritize high-value widgets
const businessValueScores: Record<WidgetType, number> = {
  activeCampaigns: 7,
  totalEmails: 6,
  openRate: 8,
  clickRate: 8,
  contacts: 7,
  emailPerformance: 9,
  deviceBreakdown: 6,
  recentCampaigns: 5,
  calendar: 4,
  tasks: 3,
  notes: 2,
  aiInsights: 8,
  optimalSendTime: 7,
  upcomingCampaigns: 6,
  audienceGrowth: 7,
  realtimeMetrics: 8,
  emailHealthScore: 7,
  campaignROI: 10,
  engagementHeatmap: 9,
  smartNotifications: 6,
  aiRecommendations: 9,
  campaignPerformanceAnalyzer: 10,
  userJourney: 8
};

// Thresholds for considering a user a power user
const POWER_USER_THRESHOLDS = {
  totalInteractions: 50,
  uniqueWidgetsInteracted: 7,
  daysActive: 5,
  complexWidgetsUsed: 3,
};

export const useWidgetRecommendations = (
  currentWidgets: Widget[],
  clientData: any
) => {
  const [interactionData, setInteractionData] = useState<Record<string, WidgetInteraction>>({});
  const [userPersona, setUserPersona] = useState<UserPersona>('undefined');
  const [usageContext, setUsageContext] = useState<UsageContext | null>(null);
  const [recommendations, setRecommendations] = useState<WidgetType[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFirstSession, setIsFirstSession] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [lastActiveTimestamp, setLastActiveTimestamp] = useState<Date>(new Date());
  const [sessionHistory, setSessionHistory] = useState<Date[]>([]);
  const { toast } = useToast();

  // Detect usage context
  useEffect(() => {
    const detectUsageContext = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Time of day detection
      let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
      if (hour >= 5 && hour < 12) {
        timeOfDay = 'morning';
      } else if (hour >= 12 && hour < 17) {
        timeOfDay = 'afternoon';
      } else if (hour >= 17 && hour < 22) {
        timeOfDay = 'evening';
      } else {
        timeOfDay = 'night';
      }
      
      // Day of week detection
      const dayOfWeek = day === 0 || day === 6 ? 'weekend' : 'weekday';
      
      // Device type detection
      let deviceType: 'desktop' | 'tablet' | 'mobile';
      if (window.innerWidth < 768) {
        deviceType = 'mobile';
      } else if (window.innerWidth < 1024) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop';
      }
      
      // Session duration - calculated based on time since session start
      const sessionDurationMinutes = (now.getTime() - sessionStartTime.getTime()) / (1000 * 60);
      let sessionDuration: 'short' | 'medium' | 'long';
      if (sessionDurationMinutes < 5) {
        sessionDuration = 'short';
      } else if (sessionDurationMinutes < 15) {
        sessionDuration = 'medium';
      } else {
        sessionDuration = 'long';
      }
      
      setUsageContext({
        timeOfDay,
        dayOfWeek,
        sessionDuration,
        deviceType
      });
    };
    
    // Detect context at initialization and on window resize
    detectUsageContext();
    window.addEventListener('resize', detectUsageContext);
    
    // Update context periodically to refresh session duration
    const contextUpdateInterval = setInterval(detectUsageContext, 5 * 60 * 1000); // Every 5 minutes
    
    return () => {
      window.removeEventListener('resize', detectUsageContext);
      clearInterval(contextUpdateInterval);
    };
  }, [sessionStartTime]);

  // Track user session
  useEffect(() => {
    // Track first session
    const firstSessionSeen = localStorage.getItem('widget-first-session-seen');
    if (!firstSessionSeen) {
      setIsFirstSession(true);
      localStorage.setItem('widget-first-session-seen', 'true');
    } else {
      setIsFirstSession(false);
    }
    
    // Record session start
    setSessionStartTime(new Date());
    
    // Load session history
    try {
      const savedSessions = localStorage.getItem('widget-session-history');
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions);
        setSessionHistory(sessions.map((s: string) => new Date(s)));
      }
    } catch (error) {
      console.error('Error loading session history', error);
    }
    
    // Add current session to history
    const now = new Date();
    setSessionHistory(prev => {
      // Keep only the last 30 sessions
      const updatedSessions = [...prev, now].slice(-30);
      
      // Save to localStorage
      try {
        localStorage.setItem('widget-session-history', 
          JSON.stringify(updatedSessions.map(d => d.toISOString())));
      } catch (error) {
        console.error('Error saving session history', error);
      }
      
      return updatedSessions;
    });
    
    // Set up inactivity tracking
    const trackActivity = () => {
      setLastActiveTimestamp(new Date());
    };
    
    window.addEventListener('mousemove', trackActivity);
    window.addEventListener('click', trackActivity);
    window.addEventListener('keypress', trackActivity);
    window.addEventListener('scroll', trackActivity);
    
    return () => {
      window.removeEventListener('mousemove', trackActivity);
      window.removeEventListener('click', trackActivity);
      window.removeEventListener('keypress', trackActivity);
      window.removeEventListener('scroll', trackActivity);
    };
  }, []);

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
            
            // Make sure action history is properly converted
            if (parsed[key].actionHistory) {
              parsed[key].actionHistory = parsed[key].actionHistory.map((action: any) => ({
                ...action,
                timestamp: new Date(action.timestamp)
              }));
            } else {
              // Initialize if missing
              parsed[key].actionHistory = [];
            }
            
            // Initialize feedback if missing
            if (parsed[key].feedback === undefined) {
              parsed[key].feedback = null;
            }
            
            // Initialize durationSpent if missing
            if (parsed[key].durationSpent === undefined) {
              parsed[key].durationSpent = 0;
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

  // Track active widget viewing time
  useEffect(() => {
    if (!activeWidgetId) return;
    
    // Update time spent on active widget every 5 seconds
    const timeSpentInterval = setInterval(() => {
      const now = new Date();
      const timeSinceLastActive = (now.getTime() - lastActiveTimestamp.getTime()) / 1000;
      
      // Only update if user has been active within the last 30 seconds
      if (timeSinceLastActive <= 30) {
        setInteractionData(prev => {
          const widget = prev[activeWidgetId];
          if (!widget) return prev;
          
          return {
            ...prev,
            [activeWidgetId]: {
              ...widget,
              durationSpent: widget.durationSpent + 5,
              // Very small score increase for continued viewing
              score: widget.score + 0.1
            }
          };
        });
      }
    }, 5000);
    
    return () => {
      clearInterval(timeSpentInterval);
    };
  }, [activeWidgetId, lastActiveTimestamp]);

  // Apply time decay to widget scores periodically to keep recommendations fresh
  useEffect(() => {
    const applyTimeDecay = () => {
      const now = new Date();
      
      setInteractionData(prev => {
        const updated = { ...prev };
        
        Object.keys(updated).forEach(widgetId => {
          const widget = updated[widgetId];
          const daysSinceLastView = (now.getTime() - widget.lastViewed.getTime()) / (1000 * 60 * 60 * 24);
          
          // Apply a decay factor based on time since last view
          if (daysSinceLastView > 1) {
            // 5% score decay per day of inactivity, but never below zero
            const decayFactor = Math.pow(0.95, Math.min(daysSinceLastView, 30));
            updated[widgetId] = {
              ...widget,
              score: Math.max(0, widget.score * decayFactor)
            };
          }
        });
        
        return updated;
      });
    };
    
    // Apply decay once at initialization and then daily
    applyTimeDecay();
    const decayInterval = setInterval(applyTimeDecay, 24 * 60 * 60 * 1000);
    
    return () => {
      clearInterval(decayInterval);
    };
  }, []);

  // Record a widget view with enhanced metrics
  const recordWidgetView = useCallback((widget: Widget) => {
    setActiveWidgetId(widget.id);
    setLastActiveTimestamp(new Date());
    
    setInteractionData(prev => {
      const widgetId = widget.id;
      const now = new Date();
      
      const existingData = prev[widgetId] || {
        widgetId,
        widgetType: widget.type,
        viewCount: 0,
        interactionCount: 0,
        durationSpent: 0,
        lastViewed: now,
        lastInteracted: null,
        score: 0,
        actionHistory: [],
        feedback: null
      };
      
      // Calculate a view score that incorporates recency and frequency
      const timeSinceLastView = existingData.lastViewed 
        ? (now.getTime() - existingData.lastViewed.getTime()) / (1000 * 60 * 60) 
        : 24;
      
      // Higher score for returning after a while (rediscovery factor)
      const recencyBonus = timeSinceLastView > 4 ? 0.5 : 0;
      // Diminishing returns for frequent views in short timespan
      const frequencyFactor = timeSinceLastView < 0.1 ? 0.3 : 1;
      
      // Add current action to history
      const updatedHistory = [
        ...existingData.actionHistory,
        {
          type: 'view' as const,
          timestamp: now
        }
      ].slice(-20); // Keep last 20 actions
      
      const updatedData = {
        ...existingData,
        viewCount: existingData.viewCount + 1,
        lastViewed: now,
        actionHistory: updatedHistory,
        // Enhanced score calculation
        score: existingData.score + (1 * frequencyFactor + recencyBonus)
      };

      return {
        ...prev,
        [widgetId]: updatedData
      };
    });
  }, []);

  // Record detailed widget interaction
  const recordWidgetInteraction = useCallback((
    widget: Widget, 
    actionType: 'click' | 'configure' | 'expand' | 'minimize' | 'refresh' | 'download' = 'click',
    context?: string
  ) => {
    setActiveWidgetId(widget.id);
    setLastActiveTimestamp(new Date());
    
    setInteractionData(prev => {
      const widgetId = widget.id;
      const now = new Date();
      
      const existingData = prev[widgetId] || {
        widgetId,
        widgetType: widget.type,
        viewCount: 0,
        interactionCount: 0,
        durationSpent: 0,
        lastViewed: now,
        lastInteracted: null,
        score: 0,
        actionHistory: [],
        feedback: null
      };
      
      // Action-specific scoring
      let actionScore = 0;
      switch (actionType) {
        case 'click':
          actionScore = 2;
          break;
        case 'configure':
          actionScore = 3;
          break;
        case 'expand':
          actionScore = 2.5;
          break;
        case 'minimize':
          actionScore = 1;
          break;
        case 'refresh':
          actionScore = 1.5;
          break;
        case 'download':
          actionScore = 4;
          break;
        default:
          actionScore = 2;
      }
      
      // Add current action to history
      const action: WidgetAction = {
        type: actionType,
        timestamp: now,
        context
      };
      
      const updatedHistory = [...existingData.actionHistory, action].slice(-20); // Keep last 20 actions

      const updatedData = {
        ...existingData,
        interactionCount: existingData.interactionCount + 1,
        lastInteracted: now,
        lastViewed: now, // Update last viewed time too
        actionHistory: updatedHistory,
        // Enhanced score calculation with business value factor
        score: existingData.score + (actionScore * (businessValueScores[widget.type] / 5))
      };

      return {
        ...prev,
        [widgetId]: updatedData
      };
    });
  }, []);

  // Record widget feedback
  const recordWidgetFeedback = useCallback((
    widget: Widget,
    feedback: 'positive' | 'negative' | 'neutral'
  ) => {
    setInteractionData(prev => {
      const widgetId = widget.id;
      const now = new Date();
      
      const existingData = prev[widgetId] || {
        widgetId,
        widgetType: widget.type,
        viewCount: 0,
        interactionCount: 0,
        durationSpent: 0,
        lastViewed: now,
        lastInteracted: null,
        score: 0,
        actionHistory: [],
        feedback: null
      };
      
      // Score adjustment based on feedback
      let feedbackScoreAdjustment = 0;
      switch (feedback) {
        case 'positive':
          feedbackScoreAdjustment = 5;
          break;
        case 'negative':
          feedbackScoreAdjustment = -3;
          break;
        case 'neutral':
          feedbackScoreAdjustment = 1;
          break;
      }
      
      // Add feedback action to history
      const feedbackAction: WidgetAction = {
        type: 'feedback',
        timestamp: now,
        context: `feedback:${feedback}`
      };
      
      const updatedHistory = [
        ...existingData.actionHistory,
        feedbackAction
      ].slice(-20);

      const updatedData = {
        ...existingData,
        feedback,
        interactionCount: existingData.interactionCount + 1,
        lastInteracted: now,
        actionHistory: updatedHistory,
        // Adjust score based on feedback
        score: Math.max(0, existingData.score + feedbackScoreAdjustment)
      };

      return {
        ...prev,
        [widgetId]: updatedData
      };
    });
    
    // Show toast acknowledging feedback
    toast({
      title: feedback === 'positive' 
        ? "Thanks for the positive feedback!" 
        : (feedback === 'negative' ? "We'll improve this widget" : "Thanks for your feedback"),
      description: "Your feedback helps us personalize your dashboard.",
      variant: feedback === 'positive' ? "default" : (feedback === 'negative' ? "destructive" : "default"),
    });
  }, [toast]);

  // Set a widget as active
  const setWidgetActive = useCallback((widgetId: string | null) => {
    setActiveWidgetId(widgetId);
    if (widgetId) {
      setLastActiveTimestamp(new Date());
    }
  }, []);
  
  // Determine if user is a power user
  const isPowerUser = useCallback(() => {
    // Not enough data
    if (Object.keys(interactionData).length < 5) {
      return false;
    }
    
    // Calculate power user metrics
    const totalInteractions = Object.values(interactionData)
      .reduce((sum, widget) => sum + widget.interactionCount, 0);
    
    const uniqueWidgetsInteracted = Object.values(interactionData)
      .filter(widget => widget.interactionCount > 0)
      .length;
    
    // Count days active from session history
    const uniqueDays = new Set(
      sessionHistory.map(date => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)
    ).size;
    
    // Count complex widgets (AI and Performance Analyzers)
    const complexWidgetsUsed = Object.values(interactionData)
      .filter(widget => 
        (widget.widgetType.includes('ai') || widget.widgetType.includes('Analyzer')) && 
        widget.interactionCount > 2
      )
      .length;
    
    // Check against thresholds
    return (
      totalInteractions >= POWER_USER_THRESHOLDS.totalInteractions &&
      uniqueWidgetsInteracted >= POWER_USER_THRESHOLDS.uniqueWidgetsInteracted && 
      uniqueDays >= POWER_USER_THRESHOLDS.daysActive &&
      complexWidgetsUsed >= POWER_USER_THRESHOLDS.complexWidgetsUsed
    );
  }, [interactionData, sessionHistory]);

  // Enhanced user persona analysis that incorporates comprehensive patterns
  const analyzeUserPersona = useCallback(() => {
    // First check if this is a power user
    if (isPowerUser()) {
      return 'power-user';
    }
    
    // If not enough data, return undefined
    if (Object.keys(interactionData).length < 3) {
      return 'undefined';
    }

    // Calculate weighted category scores based on interactions
    const categoryScores: Record<WidgetCategory, number> = {
      analytics: 0,
      performance: 0,
      content: 0,
      audience: 0,
      planning: 0,
      ai: 0
    };
    
    // For each widget, calculate its contribution to category scores
    Object.values(interactionData).forEach(interaction => {
      const category = widgetCategories[interaction.widgetType];
      
      // Complex weighting factors
      const viewWeight = 0.3;
      const interactionWeight = 0.6;
      const durationWeight = 0.1;
      
      // Calculate recency (inverse of days since last interaction)
      const now = new Date();
      const daysSinceLastView = interaction.lastViewed
        ? (now.getTime() - interaction.lastViewed.getTime()) / (1000 * 60 * 60 * 24)
        : 30;
      const recencyFactor = Math.max(0.2, Math.min(1, 1 - (daysSinceLastView / 30)));
      
      // Calculate weighted score for this widget
      const weightedScore = 
        (interaction.viewCount * viewWeight) +
        (interaction.interactionCount * interactionWeight) +
        (Math.min(300, interaction.durationSpent) / 300 * durationWeight);
      
      // Apply recency and add to category
      categoryScores[category] += weightedScore * recencyFactor;
    });
    
    // Apply business value weighting to each category
    Object.entries(widgetCategories).forEach(([type, category]) => {
      const businessValue = businessValueScores[type as WidgetType] || 5;
      categoryScores[category] += (businessValue / 10) * 0.2; // Small boost based on business value
    });
    
    // Add context-based adjustments
    if (usageContext) {
      // Executives often work in the morning or evening
      if ((usageContext.timeOfDay === 'morning' || usageContext.timeOfDay === 'evening') && 
          usageContext.dayOfWeek === 'weekday') {
        categoryScores.analytics *= 1.1;
      }
      
      // Content creators often work longer sessions
      if (usageContext.sessionDuration === 'long') {
        categoryScores.content *= 1.1;
      }
      
      // Planners often work weekdays
      if (usageContext.dayOfWeek === 'weekday') {
        categoryScores.planning *= 1.1;
      }
    }

    // Find the dominant categories
    const sortedCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category as WidgetCategory);

    // Top two categories determine the persona with more complex logic
    const topCategories = sortedCategories.slice(0, 2);
    const topCategoryScore = categoryScores[sortedCategories[0]];
    const secondCategoryScore = categoryScores[sortedCategories[1]] || 0;
    
    // Check how dominant the top category is
    const topCategoryDominance = topCategoryScore / (secondCategoryScore + 0.001);
    
    // If one category is very dominant (>2x the next category)
    if (topCategoryDominance > 2) {
      switch (sortedCategories[0]) {
        case 'analytics': return 'analyst';
        case 'content': return 'content-creator';
        case 'planning': return 'planner';
        case 'performance': return 'marketer';
        case 'audience': return 'content-creator';
        case 'ai': return 'analyst';
      }
    }
    
    // Otherwise use more nuanced classification based on combinations
    if (topCategories.includes('analytics') && 
        (topCategories.includes('performance') || topCategories.includes('ai'))) {
      return 'analyst';
    } else if (topCategories.includes('content') || 
               (topCategories.includes('audience') && topCategories.includes('ai'))) {
      return 'content-creator';
    } else if (topCategories.includes('planning') && 
               (topCategories.includes('analytics') || topCategories.includes('performance'))) {
      return 'planner';
    } else if (topCategories.includes('performance') && 
               (topCategories.includes('audience') || topCategories.includes('analytics'))) {
      return 'marketer';
    } else if (topCategories.includes('analytics') && topCategories.includes('audience')) {
      return 'executive';
    }

    // Default fallback based on highest scoring category
    switch (sortedCategories[0]) {
      case 'analytics': return 'analyst';
      case 'performance': return 'marketer';
      case 'content': return 'content-creator';
      case 'audience': return 'content-creator';
      case 'planning': return 'planner';
      case 'ai': return 'analyst';
      default: return 'marketer';
    }
  }, [interactionData, usageContext, isPowerUser]);

  // Generate intelligent widget recommendations
  const generateRecommendations = useCallback(() => {
    setIsAnalyzing(true);
    
    // Determine current user persona
    const persona = analyzeUserPersona();
    setUserPersona(persona);

    // Get visible widget types
    const visibleWidgetTypes = currentWidgets
      .filter(w => w.visible)
      .map(w => w.type);
    
    // Get widget types the user has interacted with
    const interactedWidgetTypes = Object.values(interactionData)
      .filter(w => w.interactionCount > 0)
      .map(w => w.widgetType);
    
    // Calculate potential candidates with sophisticated scoring
    const candidateScores: Record<string, number> = {};
    
    // First pass: filter to widgets not currently visible
    const availableCandidates = Object.keys(widgetCategories)
      .filter(type => !visibleWidgetTypes.includes(type as WidgetType)) as WidgetType[];
    
    // Score each candidate
    availableCandidates.forEach(widgetType => {
      let score = 0;
      const category = widgetCategories[widgetType];
      
      // 1. Persona category preference (primary factor)
      const categoryWeight = personaPreferences[persona].weights[category];
      score += categoryWeight * 10;
      
      // 2. Business value score (secondary factor)
      score += (businessValueScores[widgetType] / 10) * 3;
      
      // 3. Complementary widget bonus
      interactedWidgetTypes.forEach(interactedType => {
        if (complementaryWidgets[interactedType]?.includes(widgetType)) {
          // Higher bonus for frequently used widgets
          const interaction = Object.values(interactionData)
            .find(i => i.widgetType === interactedType);
          
          if (interaction) {
            // Normalize score to 0-1 range
            const normalizedScore = Math.min(1, interaction.score / 20);
            score += normalizedScore * 2;
          } else {
            score += 0.5; // Small bonus if it's complementary but no interaction data
          }
        }
      });
      
      // 4. Context-based adjustments
      if (usageContext) {
        // Morning/evening executives prefer analytics and performance
        if ((usageContext.timeOfDay === 'morning' || usageContext.timeOfDay === 'evening') &&
            (category === 'analytics' || category === 'performance')) {
          score += 0.5;
        }
        
        // Mobile users prefer compact widgets
        if (usageContext.deviceType === 'mobile' && 
            (widgetType === 'smartNotifications' || widgetType === 'activeCampaigns')) {
          score += 1;
        }
        
        // Planning widgets more useful during longer sessions
        if (usageContext.sessionDuration === 'long' && category === 'planning') {
          score += 0.5;
        }
        
        // AI widgets score higher in the evening when there's time to review insights
        if (usageContext.timeOfDay === 'evening' && category === 'ai') {
          score += 0.7;
        }
      }
      
      // 5. First-time user guidance
      if (isFirstSession) {
        // Prioritize simpler widgets for new users
        const simpleWidgets: WidgetType[] = ['activeCampaigns', 'totalEmails', 'contacts', 'calendar'];
        if (simpleWidgets.includes(widgetType)) {
          score += 2;
        }
        
        // Deprioritize complex widgets for new users
        const complexWidgets: WidgetType[] = ['aiRecommendations', 'campaignPerformanceAnalyzer', 'engagementHeatmap'];
        if (complexWidgets.includes(widgetType)) {
          score -= 1;
        }
      }
      
      // 6. Client data relevance
      if (clientData) {
        // If client has many contacts, suggest audience widgets
        if (clientData.stats?.contactsCount > 100 && category === 'audience') {
          score += 1;
        }
        
        // If client has high email volume, suggest performance widgets
        if (clientData.stats?.totalEmails > 1000 && category === 'performance') {
          score += 1;
        }
        
        // If client has active campaigns, suggest campaign analytics
        const campaignWidgets: WidgetType[] = ['campaignROI', 'campaignPerformanceAnalyzer'];
        if (clientData.stats?.activeCampaigns > 0 && campaignWidgets.includes(widgetType)) {
          score += 1.5;
        }
      }
      
      candidateScores[widgetType] = score;
    });
    
    // Sort candidates by score
    const rankedCandidates = Object.entries(candidateScores)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type as WidgetType);
    
    // Get top 5 recommendations
    const topRecommendations = rankedCandidates.slice(0, 5);
    
    // Fallback if we don't have enough recommendations
    if (topRecommendations.length < 3) {
      const defaultRecommendationOptions: WidgetType[] = [
        'aiRecommendations', 
        'campaignPerformanceAnalyzer', 
        'userJourney', 
        'engagementHeatmap', 
        'realtimeMetrics'
      ];
      
      const defaultRecommendations = defaultRecommendationOptions.filter(
        type => !visibleWidgetTypes.includes(type) && !topRecommendations.includes(type)
      );
      
      // Add default recommendations until we have at least 3
      while (topRecommendations.length < 3 && defaultRecommendations.length > 0) {
        topRecommendations.push(defaultRecommendations.shift()!);
      }
    }
    
    setRecommendations(topRecommendations);
    setIsAnalyzing(false);
    
    return topRecommendations;
  }, [currentWidgets, analyzeUserPersona, interactionData, usageContext, isFirstSession, clientData]);

  // Enhanced recommendation reason with contextual awareness
  const getRecommendationReason = useCallback((widgetType: WidgetType): string => {
    const category = widgetCategories[widgetType];
    
    // Check if this widget complements currently used widgets
    const complementsExisting = currentWidgets
      .filter(w => w.visible)
      .some(w => complementaryWidgets[w.type]?.includes(widgetType));
    
    // Check if it's a business-critical widget
    const isHighValueWidget = businessValueScores[widgetType] >= 8;
    
    // Check if it matches current usage context
    const mobileWidgets: WidgetType[] = ['smartNotifications', 'activeCampaigns'];
    const matchesContext = usageContext && (
      (usageContext.timeOfDay === 'morning' && category === 'analytics') ||
      (usageContext.timeOfDay === 'evening' && category === 'ai') ||
      (usageContext.deviceType === 'mobile' && mobileWidgets.includes(widgetType))
    );
    
    // Check if it's relevant to client data
    const campaignWidgets: WidgetType[] = ['campaignROI', 'campaignPerformanceAnalyzer'];
    const isDataRelevant = clientData && (
      (clientData.stats?.contactsCount > 100 && category === 'audience') ||
      (clientData.stats?.totalEmails > 1000 && category === 'performance') ||
      (clientData.stats?.activeCampaigns > 0 && campaignWidgets.includes(widgetType))
    );
    
    // If it's the user's first session, provide more educational reasons
    if (isFirstSession) {
      const essentialWidgets: WidgetType[] = ['activeCampaigns', 'totalEmails', 'openRate'];
      if (essentialWidgets.includes(widgetType)) {
        return 'Essential widget to get started with your dashboard';
      }
      
      const insightWidgets: WidgetType[] = ['emailPerformance', 'deviceBreakdown'];
      if (insightWidgets.includes(widgetType)) {
        return 'Provides key insights into your email campaign performance';
      }
      
      const aiWidgets: WidgetType[] = ['aiInsights', 'aiRecommendations'];
      if (aiWidgets.includes(widgetType)) {
        return 'Leverages AI to provide actionable marketing insights';
      }
    }
    
    // If it complements existing widgets, prioritize this reason
    if (complementsExisting) {
      return `Works well with your existing dashboard widgets`;
    }
    
    // If it's relevant to client data, prioritize this reason
    if (isDataRelevant) {
      if (category === 'audience' && clientData.stats?.contactsCount > 100) {
        return `Optimized for your contact list of ${clientData.stats.contactsCount} contacts`;
      }
      if (category === 'performance' && clientData.stats?.totalEmails > 1000) {
        return `Valuable for analyzing your high volume of ${clientData.stats.totalEmails} emails`;
      }
      if (campaignWidgets.includes(widgetType) && clientData.stats?.activeCampaigns > 0) {
        return `Helps optimize your ${clientData.stats.activeCampaigns} active campaign${clientData.stats.activeCampaigns > 1 ? 's' : ''}`;
      }
    }
    
    // If it matches current context, use this reason
    if (matchesContext) {
      if (usageContext?.timeOfDay === 'morning' && category === 'analytics') {
        return 'Perfect for morning review of your marketing metrics';
      }
      if (usageContext?.timeOfDay === 'evening' && category === 'ai') {
        return 'Provides AI-powered insights to review at the end of your day';
      }
      if (usageContext?.deviceType === 'mobile' && mobileWidgets.includes(widgetType)) {
        return 'Optimized for mobile viewing with at-a-glance insights';
      }
    }
    
    // If it's a high-value widget, highlight this
    if (isHighValueWidget) {
      return 'High-impact widget that most successful marketers use';
    }
    
    // Default to persona-based reasons as fallback
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
        if (category === 'planning') return 'To enhance your campaign planning process';
        if (category === 'analytics') return 'For important analytics to support your planning';
        break;
      case 'marketer':
        if (category === 'performance') return 'For marketing performance insights you need';
        if (category === 'audience') return 'To help you connect with your audience effectively';
        if (category === 'analytics') return 'For data-driven marketing decisions';
        break;
      case 'executive':
        if (category === 'analytics') return 'For the high-level analytics you rely on';
        if (category === 'performance') return 'For key performance oversight in one view';
        break;
      case 'power-user':
        if (category === 'ai') return 'Advanced AI widget for power users like you';
        if (category === 'analytics') return 'Sophisticated analytics for your advanced dashboard';
        if (category === 'performance') return 'Detailed performance metrics that match your expertise';
        break;
      default:
        if (category === 'ai') return 'Recommended for enhanced marketing insights';
        if (category === 'analytics') return 'For better tracking of your campaigns and engagement';
        if (category === 'performance') return 'To monitor important performance metrics for your emails';
    }
    
    return 'Recommended based on your usage patterns and marketing needs';
  }, [userPersona, currentWidgets, usageContext, isFirstSession, clientData]);

  // Reset interaction data
  const resetInteractionData = useCallback(() => {
    localStorage.removeItem('widget-interactions');
    localStorage.removeItem('widget-session-history');
    localStorage.removeItem('widget-first-session-seen');
    
    setInteractionData({});
    setUserPersona('undefined');
    setSessionHistory([new Date()]);
    setRecommendations([]);
    setIsFirstSession(true);
    
    toast({
      title: "Widget recommendations reset",
      description: "Your personalization data has been cleared. Recommendations will adapt as you use the dashboard.",
    });
  }, [toast]);

  return {
    // Core tracking functions
    recordWidgetView,
    recordWidgetInteraction,
    recordWidgetFeedback,
    setWidgetActive,
    
    // Recommendation functions
    generateRecommendations,
    getRecommendationReason,
    resetInteractionData,
    
    // State
    recommendations,
    userPersona,
    isPowerUser: isPowerUser(),
    isAnalyzing,
    interactionData,
    usageContext,
    isFirstSession
  };
};