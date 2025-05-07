import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmojiReactionGenerator, { getEmojiReaction } from './EmojiReactionGenerator';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface MetricData {
  date: string;
  value: number;
}

interface PerformanceMetricCardProps {
  title: string;
  description?: string;
  metricType: string; // e.g. 'openRate', 'clickRate', 'conversionRate'
  currentValue: number;
  benchmark?: number;
  data?: MetricData[];
  valueFormat?: string;
  className?: string;
}

const PerformanceMetricCard: React.FC<PerformanceMetricCardProps> = ({
  title,
  description,
  metricType,
  currentValue,
  benchmark,
  data = [],
  valueFormat = 'percent',
  className = '',
}) => {
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <EmojiReactionGenerator
            type={metricType}
            value={currentValue}
            benchmark={benchmark}
            valueFormat={valueFormat}
            size="medium"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {data.length > 0 && (
          <div className="h-36 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => value.split('-')[1] + '/' + value.split('-')[2]}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => 
                    valueFormat === 'percent' 
                      ? `${value}%` 
                      : valueFormat === 'currency' 
                        ? `$${value}` 
                        : value
                  }
                />
                <Tooltip 
                  formatter={(value: number) => 
                    valueFormat === 'percent' 
                      ? `${value.toFixed(2)}%` 
                      : valueFormat === 'currency' 
                        ? `$${value.toFixed(2)}` 
                        : value.toFixed(1)
                  }
                  labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                {benchmark && (
                  <Line
                    type="monotone"
                    dataKey={() => benchmark}
                    stroke="#9ca3af"
                    strokeDasharray="5 5"
                    dot={false}
                    name="Industry Benchmark"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricCard;