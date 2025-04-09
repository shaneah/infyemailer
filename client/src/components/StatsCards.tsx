import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Mail, ArrowUpRight, ArrowDownRight, TrendingUp, Activity } from "lucide-react";

const StatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  const statIcons = {
    1: <Users className="h-5 w-5 text-primary" />,
    2: <Mail className="h-5 w-5 text-primary" />,
    3: <TrendingUp className="h-5 w-5 text-primary" />,
    4: <Activity className="h-5 w-5 text-primary" />
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700 shadow-md">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-32 mb-2 bg-gray-700" />
              <div className="flex items-center">
                <Skeleton className="h-8 w-24 mr-2 bg-gray-700" />
                <Skeleton className="h-6 w-12 bg-gray-700" />
              </div>
              <Skeleton className="h-3 w-40 mt-2 bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats?.map((stat) => (
        <Card 
          key={stat.id} 
          className="bg-gray-800 border-gray-700 shadow-md hover:border-gray-600 transition-all duration-200"
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h6 className="text-gray-400 text-sm font-medium flex items-center">
                {statIcons[stat.id as keyof typeof statIcons] || <BarChart3 className="h-5 w-5 mr-2 text-primary" />}
                <span className="ml-2">{stat.title}</span>
              </h6>
              
              <Badge 
                variant={stat.change.color === 'success' ? 'outline' : 'destructive'} 
                className={
                  stat.change.color === 'success' 
                    ? 'text-green-400 border-green-400/30 bg-green-400/10' 
                    : 'text-red-400 border-red-400/30 bg-red-400/10'
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
              <div className="text-3xl font-bold text-white font-mono">{stat.value}</div>
            </div>
            
            <div className="text-xs text-gray-500">{stat.comparison}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
