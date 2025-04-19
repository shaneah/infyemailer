import { useCallback } from 'react';
import { Widget, WidgetType } from './useWidgets';

/**
 * Simplified hook that replaces AI widget recommendations
 * This version doesn't actually track or recommend anything
 */
export const useWidgetRecommendations = () => {
  // Record a widget view - does nothing in this version
  const recordWidgetView = useCallback((widget: Widget) => {
    // No-op function
  }, []);

  // Record widget interaction - does nothing in this version
  const recordWidgetInteraction = useCallback((widget: Widget) => {
    // No-op function
  }, []);

  // Get widget recommendations - returns basic non-AI widgets
  const getRecommendations = useCallback((count: number = 3): WidgetType[] => {
    return ['totalEmails', 'openRate', 'recentCampaigns'];
  }, []);
  
  // Added for compatibility with previous implementation
  const generateRecommendations = useCallback((): WidgetType[] => {
    return ['totalEmails', 'openRate', 'recentCampaigns'];
  }, []);
  
  const getRecommendationReason = useCallback((widgetType: WidgetType): string => {
    return "This widget provides useful data visualization.";
  }, []);

  // Show a recommendation toast - does nothing
  const showRecommendation = useCallback(() => {
    // No-op function
  }, []);

  return {
    recordWidgetView,
    recordWidgetInteraction,
    getRecommendations,
    showRecommendation,
    generateRecommendations,
    getRecommendationReason,
    userPersona: 'marketer', // Default non-AI user persona
    isAnalyzing: false
  };
}

export default useWidgetRecommendations;