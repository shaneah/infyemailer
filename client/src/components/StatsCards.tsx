import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

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

  // Map Bootstrap style colors to Tailwind colors
  const colorMap: Record<string, string> = {
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    primary: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="shadow-sm hover:shadow transition-shadow">
            <CardContent className="pt-6">
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="flex items-center">
                <Skeleton className="h-8 w-24 mr-2" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-4 w-40 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats && stats.map((stat: Stat) => (
        <Card 
          key={stat.id} 
          className="shadow-sm hover:shadow transition-shadow"
        >
          <CardContent className="pt-6">
            <h3 className="text-sm font-normal text-muted-foreground mb-1">{stat.title}</h3>
            <div className="flex items-center">
              <div className="text-2xl font-bold mr-2">{stat.value}</div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[stat.change.color] || 'bg-gray-100 text-gray-800'}`}>
                {stat.change.value}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.comparison}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
