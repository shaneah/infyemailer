import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Mail, ArrowUpRight, ArrowDownRight, TrendingUp, Activity } from "lucide-react";

interface Stat {
  id: number;
  title: string;
  value: string;
  change: {
    value: string;
    color: string;
  };
  comparison: string;
}

const StatsCards = () => {
  const { data: stats, isLoading } = useQuery<Stat[]>({
    queryKey: ['/api/stats'],
  });

  const statIcons = {
    1: <Users className="h-5 w-5 text-[#36d7ff]" />,
    2: <Mail className="h-5 w-5 text-[#36d7ff]" />,
    3: <TrendingUp className="h-5 w-5 text-[#36d7ff]" />,
    4: <Activity className="h-5 w-5 text-[#36d7ff]" />
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-[#101024] border-[#1e1e3a] shadow-md">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-32 mb-2 bg-[#1e1e3a]" />
              <div className="flex items-center">
                <Skeleton className="h-8 w-24 mr-2 bg-[#1e1e3a]" />
                <Skeleton className="h-6 w-12 bg-[#1e1e3a]" />
              </div>
              <Skeleton className="h-3 w-40 mt-2 bg-[#1e1e3a]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats && stats.map((stat) => (
        <Card 
          key={stat.id} 
          className="bg-[#101024] border-[#1e1e3a] shadow-md hover:border-[#36d7ff]/30 transition-all duration-200"
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h6 className="text-[#8b8ba7] text-sm font-medium flex items-center">
                {statIcons[stat.id as keyof typeof statIcons] || <BarChart3 className="h-5 w-5 mr-2 text-[#36d7ff]" />}
                <span className="ml-2">{stat.title}</span>
              </h6>
              
              <Badge 
                variant={stat.change.color === 'success' ? 'outline' : 'destructive'} 
                className={
                  stat.change.color === 'success' 
                    ? 'text-[#00ff9d] border-[#00ff9d]/30 bg-[#00ff9d]/10' 
                    : 'text-[#ff6b6b] border-[#ff6b6b]/30 bg-[#ff6b6b]/10'
                }
              >
                <span className="flex items-center text-xs">
                  {stat.change.color === 'success' ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stat.change.value}
                </span>
              </Badge>
            </div>
            
            <div className="flex items-baseline mb-1">
              <div className="text-3xl font-bold text-[#e0e0ff] font-mono">{stat.value}</div>
            </div>
            
            <div className="text-xs text-[#8b8ba7]">{stat.comparison}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
