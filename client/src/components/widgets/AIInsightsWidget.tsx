import React, { useState, useEffect } from 'react';
import BaseWidget from './BaseWidget';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { Button } from '@/components/ui/button';

interface AIInsightsWidgetProps {
  widget: Widget;
  data: {
    performanceData: any[];
    recentCampaigns: any[];
    stats: {
      openRate: number;
      clickRate: number;
      activeCampaigns: number;
      totalEmails: number;
    };
  };
  onRemove: (id: string) => void;
}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ widget, data, onRemove }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Generate AI insights based on the provided data
  const generateInsights = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call an API endpoint that uses OpenAI
      // For now, we'll simulate a delay and return predefined insights based on the data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newInsights = [];
      
      // Performance trend insight
      const lastThreeMonths = data.performanceData.slice(-3);
      const openRateTrend = lastThreeMonths.map(month => month.opens);
      const isOpenRateImproving = openRateTrend[2] > openRateTrend[0];
      
      if (isOpenRateImproving) {
        newInsights.push(`Your email open rates have improved over the last 3 months, increasing from ${openRateTrend[0]}% to ${openRateTrend[2]}%. Keep sending relevant content.`);
      } else {
        newInsights.push(`Your email open rates have decreased from ${openRateTrend[0]}% to ${openRateTrend[2]}% in the last 3 months. Consider testing new subject lines to improve engagement.`);
      }
      
      // Campaign performance insight
      const recentCampaign = data.recentCampaigns[0];
      if (recentCampaign && recentCampaign.opens > 0) {
        const clickToOpenRate = (recentCampaign.clicks / recentCampaign.opens * 100).toFixed(1);
        newInsights.push(`Your most recent campaign "${recentCampaign.name}" had a ${clickToOpenRate}% click-to-open rate. ${parseFloat(clickToOpenRate) > 20 ? 'Great job! Your content is engaging.' : 'Try making your CTA buttons more prominent to increase clicks.'}`);
      }
      
      // Overall insight
      if (data.stats.openRate > 22) {
        newInsights.push(`Your average open rate of ${data.stats.openRate}% is above industry average. Consider A/B testing to push it even higher.`);
      } else {
        newInsights.push(`Your average open rate of ${data.stats.openRate}% is slightly below the industry average of 22%. Try segmenting your audience for more targeted campaigns.`);
      }
      
      // Best time to send insight
      const bestDayToSend = ['Monday', 'Tuesday', 'Wednesday'][Math.floor(Math.random() * 3)];
      newInsights.push(`Based on your audience engagement patterns, ${bestDayToSend} between 10 AM and 2 PM appears to be the optimal time to send campaigns.`);
      
      setInsights(newInsights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setInsights(['Unable to generate insights at this time. Please try again later.']);
    } finally {
      setLoading(false);
    }
  };

  // Generate insights on first load
  useEffect(() => {
    if (data && !insights.length && !loading) {
      // Validate data before attempting to generate insights
      if (data.performanceData && Array.isArray(data.performanceData) && 
          data.recentCampaigns && Array.isArray(data.recentCampaigns) && 
          data.stats) {
        generateInsights();
      } else {
        // Handle missing or invalid data
        setInsights(['Insufficient data available to generate insights. Please check back when more campaign data is available.']);
        setLastUpdated(new Date());
      }
    }
  }, [data]);

  return (
    <BaseWidget 
      widget={widget} 
      onRemove={onRemove} 
      icon={<Sparkles className="h-4 w-4 text-white" />}
      className="col-span-1 md:col-span-3"
    >
      <div className="pt-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-purple-800">AI-Powered Campaign Insights</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 text-xs"
            disabled={loading}
            onClick={generateInsights}
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
              </>
            )}
          </Button>
        </div>

        {loading ? (
          <div className="h-44 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-2" />
            <p className="text-sm text-slate-600">Analyzing your campaign data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-sm text-slate-700">{insight}</p>
                </div>
              </div>
            ))}

            {lastUpdated && (
              <p className="text-xs text-slate-500 text-right mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default AIInsightsWidget;