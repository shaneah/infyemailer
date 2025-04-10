import { useState } from "react";
import { Chart } from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { chartData } from "@/lib/chartData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const timeRanges = ["Week", "Month", "Quarter"];

const AnalyticsChart = () => {
  const [timeRange, setTimeRange] = useState("Week");
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/analytics', timeRange],
    initialData: chartData[timeRange.toLowerCase()],
  });

  return (
    <Card className="shadow-md border border-gray-200 hover:shadow-gold-sm transition-shadow duration-300 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b border-gray-100">
        <CardTitle className="text-lg font-medium text-[#1a3a5f]">Performance Analytics</CardTitle>
        <Tabs 
          value={timeRange} 
          onValueChange={(value) => setTimeRange(value)}
          className="w-auto"
        >
          <TabsList className="bg-gray-100 p-0.5">
            {timeRanges.map((range) => (
              <TabsTrigger
                key={range}
                value={range}
                className={`text-xs px-3 py-1.5 ${timeRange === range ? 'bg-white text-[#1a3a5f] shadow-sm' : 'text-gray-500 hover:text-[#1a3a5f]'}`}
              >
                {range}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative" style={{ height: '300px' }}>
          {isLoading ? (
            <div className="bg-gray-50 rounded w-full h-full flex justify-center items-center">
              <div className="text-center p-4">
                <Loader2 className="h-8 w-8 text-[#d4af37] mb-2 mx-auto animate-spin" />
                <p className="text-gray-500 text-sm">Loading chart data...</p>
              </div>
            </div>
          ) : (
            <Chart 
              data={data} 
              height={300}
              colors={["#1a3a5f", "#d4af37", "rgba(212,175,55,0.6)"]}
              series={[
                { name: "Opens", type: "line" },
                { name: "Clicks", type: "line" },
                { name: "Conversions", type: "area" }
              ]}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;
