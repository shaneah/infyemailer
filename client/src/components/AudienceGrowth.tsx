import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, BarChart4, Info, LineChart, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // Default stats to use if no data is returned from API
  const defaultStats: AudienceStat[] = [
    {
      id: 1,
      label: "Email Subscribers",
      change: "+12.3%",
      changeColor: "success",
      percentage: 76,
      barColor: "primary"
    },
    {
      id: 2,
      label: "Social Media Followers",
      change: "+8.7%",
      changeColor: "success",
      percentage: 64,
      barColor: "info"
    },
    {
      id: 3,
      label: "Repeat Customers",
      change: "-2.4%",
      changeColor: "danger",
      percentage: 41,
      barColor: "warning"
    },
    {
      id: 4,
      label: "Active Engagement",
      change: "+15.8%",
      changeColor: "success",
      percentage: 87,
      barColor: "success"
    }
  ];

  const displayStats = audienceStats && audienceStats.length > 0 ? audienceStats : defaultStats;

  if (isLoading) {
    return (
      <Card className="shadow-xl border-none bg-gradient-to-br from-white to-gray-50 transition-shadow duration-300 h-full overflow-hidden">
        <CardHeader className="pb-2 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {[...Array(4)].map((_, index) => (
            <div className="mb-6" key={index}>
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Map colors to tailwind gradient classes
  const getBarGradient = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-gradient-to-r from-indigo-500 to-blue-500';
      case 'success': return 'bg-gradient-to-r from-emerald-500 to-green-500';
      case 'warning': return 'bg-gradient-to-r from-amber-500 to-yellow-500';
      case 'danger': return 'bg-gradient-to-r from-red-500 to-rose-500';
      case 'info': return 'bg-gradient-to-r from-cyan-500 to-blue-500';
      case 'violet': return 'bg-gradient-to-r from-violet-500 to-purple-500';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  // Map text colors
  const getTextColor = (color: string) => {
    switch (color) {
      case 'success': return 'text-emerald-500';
      case 'danger': return 'text-red-500';
      case 'warning': return 'text-amber-500';
      case 'info': return 'text-blue-500';
      case 'violet': return 'text-violet-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="shadow-xl border-none bg-gradient-to-br from-white to-gray-50 transition-shadow duration-300 h-full overflow-hidden">
      <CardHeader className="pb-2 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center">
              Audience Growth
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-2 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Growth metrics for your audience segments over the last 30 days.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription className="text-gray-500 text-xs mt-1">
              Tracking growth across all audience segments
            </CardDescription>
          </div>
          <div className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors">
            <LineChart className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {displayStats.map((stat, index) => (
            <motion.div 
              key={stat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full ${getBarGradient(stat.barColor)} mr-2`}></div>
                  <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                </div>
                <div className={`flex items-center px-2 py-1 rounded-full ${stat.changeColor === 'success' ? 'bg-green-50' : stat.changeColor === 'danger' ? 'bg-red-50' : 'bg-gray-50'}`}>
                  {stat.changeColor === 'success' ? (
                    <ArrowUpRight className={`h-3 w-3 mr-1 ${getTextColor(stat.changeColor)}`} />
                  ) : stat.changeColor === 'danger' ? (
                    <TrendingDown className={`h-3 w-3 mr-1 ${getTextColor(stat.changeColor)}`} />
                  ) : null}
                  <span className={`text-xs font-semibold ${getTextColor(stat.changeColor)}`}>{stat.change}</span>
                </div>
              </div>
              <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className={`absolute top-0 left-0 h-full rounded-full ${getBarGradient(stat.barColor)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                />
                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 rounded-full"></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">{stat.percentage}% complete</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-indigo-600 font-medium cursor-help">View details</span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <div className="text-xs">
                        <p className="font-medium mb-1">Growth breakdown:</p>
                        <ul className="space-y-1">
                          <li>• Last 7 days: {stat.changeColor === 'success' ? '+' : ''}2.1%</li>
                          <li>• Last 30 days: {stat.change}</li>
                          <li>• Year to date: {stat.changeColor === 'success' ? '+' : ''}19.3%</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudienceGrowth;
