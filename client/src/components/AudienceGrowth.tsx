import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AudienceStat {
  id: number;
  label: string;
  change: string;
  changeColor: string;
  percentage: number;
  barColor: string;
}

const AudienceGrowth = () => {
  const { data: audienceStats, isLoading } = useQuery<AudienceStat[]>({
    queryKey: ['/api/audience/growth'],
    initialData: [],
  });

  if (isLoading) {
    return (
      <Card className="shadow-md border border-gray-200 hover:shadow-gold-sm transition-shadow duration-300 h-full">
        <CardHeader className="pb-2 border-b border-gray-100">
          <CardTitle className="text-lg font-medium text-[#1a3a5f]">Audience Growth</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {[...Array(4)].map((_, index) => (
            <div className="mb-4" key={index}>
              <div className="flex justify-between items-center mb-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Map Bootstrap colors to our luxury theme colors
  const getBarColor = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-[#1a3a5f]';
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-[#d4af37]';
      case 'danger': return 'bg-red-500';
      case 'info': return 'bg-blue-400';
      default: return 'bg-[#1a3a5f]';
    }
  };

  // Map text colors
  const getTextColor = (color: string) => {
    switch (color) {
      case 'success': return 'text-emerald-500';
      case 'danger': return 'text-red-500';
      case 'warning': return 'text-[#d4af37]';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="shadow-md border border-gray-200 hover:shadow-gold-sm transition-shadow duration-300 h-full">
      <CardHeader className="pb-2 border-b border-gray-100">
        <CardTitle className="text-lg font-medium text-[#1a3a5f]">Audience Growth</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {audienceStats?.map((stat, index) => (
          <div className={index < audienceStats.length - 1 ? "mb-4" : ""} key={stat.id}>
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-700 font-medium">{stat.label}</div>
              <div className={`flex items-center ${getTextColor(stat.changeColor)}`}>
                {stat.changeColor === 'success' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : stat.changeColor === 'danger' ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : null}
                <span className="text-xs font-medium">{stat.change}</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${getBarColor(stat.barColor)}`} 
                style={{ width: `${stat.percentage}%` }}
                role="progressbar" 
                aria-valuenow={stat.percentage} 
                aria-valuemin={0} 
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AudienceGrowth;
