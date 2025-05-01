import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdvancedEmailPerformance from '@/components/emails/AdvancedEmailPerformance';
import { useClientAuth } from '@/hooks/useClientAuth';

interface MetricRate {
  value: number;
  industryAvg: number;
  trend: string;
  trendValue: string;
}

interface ConversionRate {
  value: number;
  goal: number;
  trend: string;
  trendValue: string;
}

interface EmailMetrics {
  openRate: MetricRate;
  clickRate: MetricRate;
  conversionRate: ConversionRate;
  bounceRate: MetricRate;
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  unsubscribes: number;
}

interface ChartData {
  weeklyPerformance: Array<{ day: string; opens: number; clicks: number; conversions: number }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  clickDistribution: Array<{ link: string; clicks: number }>;
  engagementOverTime: Array<{ date: string; open: number; click: number; conversion: number }>;
  engagementByTimeOfDay: Array<{ hour: string; opens: number }>;
  emailClientDistribution: Array<{ client: string; percentage: number }>;
  campaignComparison: Array<{ name: string; open: number; click: number; conversion: number }>;
  subjectLinePerformance: Array<{ type: string; rate: number }>;
  sendTimeEffectiveness: Array<{ day: string; morning: number; afternoon: number; evening: number }>;
  geographicalDistribution: Array<{ country: string; opens: number }>;
  deviceOverTime: Array<{ month: string; desktop: number; mobile: number; tablet: number }>;
  subscriberEngagementSegments: Array<{ segment: string; value: number; count: number }>;
}

export default function ClientEmailPerformance() {
  const { clientUser } = useClientAuth();
  const [timeframe, setTimeframe] = useState('7days');
  const [campaignFilter, setCampaignFilter] = useState('all');
  
  // Using React Query to fetch metrics data
  const { data: metricsData } = useQuery<EmailMetrics>({
    queryKey: ['/api/client/email-performance/metrics', timeframe, campaignFilter],
    queryFn: async () => {
      console.log(`Fetching client metrics with timeframe=${timeframe}, campaignFilter=${campaignFilter}`);
      const response = await fetch(`/api/client/email-performance/metrics?timeframe=${timeframe}&campaign=${campaignFilter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      return await response.json();
    }
  });
  
  // Using React Query to fetch chart data
  const { data: chartData } = useQuery<ChartData>({
    queryKey: ['/api/client/email-performance/charts', timeframe, campaignFilter],
    queryFn: async () => {
      console.log(`Fetching client charts with timeframe=${timeframe}, campaignFilter=${campaignFilter}`);
      const response = await fetch(`/api/client/email-performance/charts?timeframe=${timeframe}&campaign=${campaignFilter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      return await response.json();
    }
  });
  
  // Fetch client campaigns for filtering
  const { data: campaignsData } = useQuery({
    queryKey: ['/api/client/campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/client/campaigns');
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const data = await response.json();
      console.log('Client campaigns data:', data);
      return data;
    }
  });
  
  return (
    <div className="w-full px-4">
      <AdvancedEmailPerformance 
        userName={clientUser?.firstName || 'Client'}
        metrics={metricsData}
        charts={chartData}
        isClient={true}
      />
    </div>
  );
}