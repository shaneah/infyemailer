import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, TrendingUp, TrendingDown, ChevronRight, Users } from "lucide-react";
import { motion } from "framer-motion";

interface Stat {
  id: number;
  title: string;
  value: string;
  change: {
    value: string;
    color: string;
  };
  comparison: string;
  progress?: number;
  icon?: string;
}

const StatsCards = () => {
  const { data: stats, isLoading } = useQuery<Stat[]>({
    queryKey: ['/api/stats'],
  });

  // Map Bootstrap style colors to Tailwind colors
  const colorMap: Record<string, string> = {
    success: "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600",
    danger: "bg-gradient-to-r from-rose-500/10 to-red-500/10 text-rose-600",
    warning: "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-600",
    primary: "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600",
    secondary: "bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-600",
    info: "bg-gradient-to-r from-cyan-500/10 to-sky-500/10 text-cyan-600",
    violet: "bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-600",
  };

  const iconMap: Record<string, React.ReactNode> = {
    email: <svg className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.75 6.75V17.25C21.75 18.3546 20.8546 19.25 19.75 19.25H4.25C3.14543 19.25 2.25 18.3546 2.25 17.25V6.75M21.75 6.75C21.75 5.64543 20.8546 4.75 19.75 4.75H4.25C3.14543 4.75 2.25 5.64543 2.25 6.75M21.75 6.75V6.99271C21.75 7.77443 21.3447 8.49009 20.6792 8.90067L13.1792 13.4007C12.4561 13.8435 11.5439 13.8435 10.8208 13.4007L3.32078 8.90067C2.65535 8.49009 2.25 7.77443 2.25 6.99271V6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>,
    users: <Users className="h-6 w-6 text-violet-600" />,
    click: <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.0427 8.46519C14.3295 7.75322 13.2731 7.53352 12.3487 7.90692L4.40908 11.0977C3.20096 11.5705 2.88222 13.1452 3.82648 14.0848L4.54831 14.8038C4.73017 14.9849 4.97317 15.0876 5.22786 15.0876H9.01584C9.16317 15.0876 9.28292 15.2074 9.28292 15.3547V19.138C9.28292 19.3918 9.38535 19.634 9.56566 19.815L10.2893 20.5372C11.2307 21.4771 12.8035 21.1591 13.2768 19.9534L16.4866 12.0338C16.8609 11.1106 16.6414 10.0545 15.9313 9.34092" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M13.803 10.2596L18.4281 5.63452" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>,
    trend: <TrendingUp className="h-6 w-6 text-emerald-600" />,
    campaign: <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5584 19.4999H4.4414C3.63339 19.4999 3.16937 18.5936 3.65029 17.9531L7.64456 12.5759C7.84481 12.309 8.16089 12.1599 8.496 12.1656C8.83189 12.1714 9.14241 12.3323 9.33322 12.6071L10.4617 14.2391C10.673 14.541 11.0211 14.7103 11.3877 14.6875C11.7543 14.6646 12.0782 14.4533 12.2473 14.129L13.4914 11.6407C13.6582 11.3197 13.9729 11.1122 14.33 11.0947C14.687 11.0773 15.0209 11.2519 15.2198 11.5563L20.3671 19.0062C20.8206 19.6668 20.3493 19.4999 19.5584 19.4999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M20.25 19.5H3.75C3.33579 19.5 3 19.8358 3 20.25C3 20.6642 3.33579 21 3.75 21H20.25C20.6642 21 21 20.6642 21 20.25C21 19.8358 20.6642 19.5 20.25 19.5Z" fill="currentColor"></path><path d="M7.5 3.75C7.5 3.33579 7.16421 3 6.75 3C6.33579 3 6 3.33579 6 3.75V7.5C6 7.91421 6.33579 8.25 6.75 8.25C7.16421 8.25 7.5 7.91421 7.5 7.5V3.75Z" fill="currentColor"></path><path d="M12.75 3C13.1642 3 13.5 3.33579 13.5 3.75V7.5C13.5 7.91421 13.1642 8.25 12.75 8.25C12.3358 8.25 12 7.91421 12 7.5V3.75C12 3.33579 12.3358 3 12.75 3Z" fill="currentColor"></path><path d="M18 3.75C18 3.33579 17.6642 3 17.25 3C16.8358 3 16.5 3.33579 16.5 3.75V7.5C16.5 7.91421 16.8358 8.25 17.25 8.25C17.6642 8.25 18 7.91421 18 7.5V3.75Z" fill="currentColor"></path></svg>,
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-shadow overflow-hidden border-none bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-0">
              <div className="p-6">
                <Skeleton className="h-5 w-28 mb-3" />
                <div className="flex items-center">
                  <Skeleton className="h-9 w-24 mr-2" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-40 mt-3" />
              </div>
              <div className="h-2 w-full bg-gray-100">
                <Skeleton className="h-2 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // If we don't have stats from the API, use static data
  const defaultStats: Stat[] = [
    {
      id: 1,
      title: "Total Subscribers",
      value: "23,578",
      change: { value: "↑ 12.5%", color: "success" },
      comparison: "vs. previous month",
      progress: 85,
      icon: "users"
    },
    {
      id: 2,
      title: "Avg. Open Rate",
      value: "54.2%",
      change: { value: "↑ 3.2%", color: "success" },
      comparison: "vs. industry average (21%)",
      progress: 54,
      icon: "email"
    },
    {
      id: 3,
      title: "Avg. Click Rate",
      value: "31.8%",
      change: { value: "↓ 1.3%", color: "danger" },
      comparison: "vs. previous month",
      progress: 32,
      icon: "click"
    },
    {
      id: 4,
      title: "Active Campaigns",
      value: "12",
      change: { value: "↑ 4", color: "primary" },
      comparison: "from last week",
      progress: 60,
      icon: "campaign"
    }
  ];

  const displayStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {displayStats.map((stat: Stat, index: number) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-none bg-gradient-to-br from-white to-gray-50 group">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                  <div className="rounded-full p-2 bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    {stat.icon && iconMap[stat.icon]}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-3xl font-bold mr-3 bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-violet-700 transition-all">
                    {stat.value}
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center ${colorMap[stat.change.color] || 'bg-gray-100/50 text-gray-800'}`}>
                    {stat.change.value.includes('↑') ? (
                      <ArrowUp className="h-3.5 w-3.5 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5 mr-0.5" />
                    )}
                    {stat.change.value.replace('↑', '').replace('↓', '')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  {stat.comparison}
                  {stat.change.color === 'success' && <TrendingUp className="h-3 w-3 ml-1 text-emerald-500" />}
                  {stat.change.color === 'danger' && <TrendingDown className="h-3 w-3 ml-1 text-rose-500" />}
                </p>
              </div>
              <div className="h-1.5 w-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                <div 
                  className={`h-full ${
                    stat.change.color === 'success' ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                    stat.change.color === 'danger' ? 'bg-gradient-to-r from-rose-400 to-red-500' :
                    stat.change.color === 'warning' ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                    stat.change.color === 'primary' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                    stat.change.color === 'violet' ? 'bg-gradient-to-r from-violet-400 to-purple-500' :
                    'bg-gradient-to-r from-gray-400 to-slate-500'
                  }`}
                  style={{ width: `${stat.progress || 50}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
