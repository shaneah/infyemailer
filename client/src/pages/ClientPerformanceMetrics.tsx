import React from 'react';
import ClientLayout from '@/components/layouts/ClientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PerformanceMetricCard from '@/components/charts/PerformanceMetricCard';
import EmojiReactionGenerator from '@/components/charts/EmojiReactionGenerator';

const generateSampleData = (days: number, average: number, variance: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate a random value around the average with the specified variance
    const randomValue = average + (Math.random() * 2 - 1) * variance;
    data.push({
      date: dateStr,
      value: Math.max(0, randomValue), // Ensure no negative values
    });
  }
  
  return data;
};

const ClientPerformanceMetrics: React.FC = () => {
  // Sample data for the performance metrics
  const openRateData = generateSampleData(30, 25.7, 5);
  const clickRateData = generateSampleData(30, 3.2, 1);
  const conversionRateData = generateSampleData(30, 3.5, 0.8);
  const deliverabilityData = generateSampleData(30, 97.5, 1.5);
  const engagementData = generateSampleData(30, 35.6, 7);
  const roiData = generateSampleData(30, 42.8, 10);
  
  // Get the latest values (current performance)
  const currentOpenRate = openRateData[openRateData.length - 1].value;
  const currentClickRate = clickRateData[clickRateData.length - 1].value;
  const currentConversionRate = conversionRateData[conversionRateData.length - 1].value;
  const currentDeliverability = deliverabilityData[deliverabilityData.length - 1].value;
  const currentEngagement = engagementData[engagementData.length - 1].value;
  const currentRoi = roiData[roiData.length - 1].value;

  return (
    <ClientLayout>
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Performance Metrics</h1>
          <p className="text-muted-foreground">
            Monitor your email campaign performance with contextual insights.
          </p>
        </div>

        {/* Introduction to emoji reactions */}
        <Card>
          <CardHeader>
            <CardTitle>Smart Metric Reactions</CardTitle>
            <CardDescription>
              Our smart reactions help you quickly understand your campaign performance relative to industry benchmarks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Exceptional Performance</h3>
                <div className="flex items-center space-x-3 mb-1">
                  <EmojiReactionGenerator type="openRate" value={40} benchmark={21.33} showValue={false} size="large" />
                  <div>
                    <p className="font-medium">High open rate (40%)</p>
                    <p className="text-sm text-muted-foreground">Well above industry average</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Average Performance</h3>
                <div className="flex items-center space-x-3 mb-1">
                  <EmojiReactionGenerator type="clickRate" value={2.5} benchmark={2.62} showValue={false} size="large" />
                  <div>
                    <p className="font-medium">Average click rate (2.5%)</p>
                    <p className="text-sm text-muted-foreground">Close to industry benchmark</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Needs Improvement</h3>
                <div className="flex items-center space-x-3 mb-1">
                  <EmojiReactionGenerator type="conversionRate" value={1.2} benchmark={3.0} showValue={false} size="large" />
                  <div>
                    <p className="font-medium">Low conversion rate (1.2%)</p>
                    <p className="text-sm text-muted-foreground">Below industry average</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key performance metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PerformanceMetricCard
            title="Open Rate"
            description="Percentage of recipients who opened your emails"
            metricType="openRate"
            currentValue={currentOpenRate}
            benchmark={21.33}
            data={openRateData}
            valueFormat="percent"
          />
          
          <PerformanceMetricCard
            title="Click Rate"
            description="Percentage of recipients who clicked on links"
            metricType="clickRate"
            currentValue={currentClickRate}
            benchmark={2.62}
            data={clickRateData}
            valueFormat="percent"
          />
          
          <PerformanceMetricCard
            title="Conversion Rate"
            description="Percentage of recipients who completed desired actions"
            metricType="conversionRate"
            currentValue={currentConversionRate}
            benchmark={3.0}
            data={conversionRateData}
            valueFormat="percent"
          />
          
          <PerformanceMetricCard
            title="Deliverability Rate"
            description="Percentage of emails that reached the inbox"
            metricType="deliverability"
            currentValue={currentDeliverability}
            benchmark={98.0}
            data={deliverabilityData}
            valueFormat="percent"
          />
          
          <PerformanceMetricCard
            title="Engagement Score"
            description="Overall recipient engagement with your campaigns"
            metricType="engagement"
            currentValue={currentEngagement}
            benchmark={30.0}
            data={engagementData}
            valueFormat="percent"
          />
          
          <PerformanceMetricCard
            title="ROI"
            description="Return on investment from your email campaigns"
            metricType="roi"
            currentValue={currentRoi}
            benchmark={35.0}
            data={roiData}
            valueFormat="percent"
          />
        </div>

        {/* More examples of the emoji reaction component in different contexts */}
        <Card>
          <CardHeader>
            <CardTitle>Metric Breakdown</CardTitle>
            <CardDescription>
              Detailed breakdown of your campaign performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Recent Campaign Open Rate</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{currentOpenRate.toFixed(2)}%</span>
                    <EmojiReactionGenerator type="openRate" value={currentOpenRate} showValue={false} />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Recent Campaign Click Rate</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{currentClickRate.toFixed(2)}%</span>
                    <EmojiReactionGenerator type="clickRate" value={currentClickRate} showValue={false} />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Average Engagement</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{currentEngagement.toFixed(2)}%</span>
                    <EmojiReactionGenerator type="engagement" value={currentEngagement} showValue={false} />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Campaign ROI</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{currentRoi.toFixed(2)}%</span>
                    <EmojiReactionGenerator type="roi" value={currentRoi} showValue={false} />
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium mb-4">Performance Insights</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <EmojiReactionGenerator 
                      type="openRate" 
                      value={currentOpenRate} 
                      showValue={false} 
                      size="small" 
                    />
                    <span>Your open rate is {currentOpenRate > 21.33 ? 'above' : 'below'} the industry average of 21.33%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <EmojiReactionGenerator 
                      type="clickRate" 
                      value={currentClickRate} 
                      showValue={false} 
                      size="small" 
                    />
                    <span>Your click rate is {currentClickRate > 2.62 ? 'above' : 'below'} the industry average of 2.62%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <EmojiReactionGenerator 
                      type="conversionRate" 
                      value={currentConversionRate} 
                      showValue={false} 
                      size="small" 
                    />
                    <span>Your conversion rate is {currentConversionRate > 3.0 ? 'above' : 'below'} the industry average of 3.0%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <EmojiReactionGenerator 
                      type="roi" 
                      value={currentRoi} 
                      showValue={false} 
                      size="small" 
                    />
                    <span>Your ROI is {currentRoi > 35.0 ? 'above' : 'below'} the industry average of 35.0%</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default ClientPerformanceMetrics;