import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const AudienceGrowth = () => {
  const { data: audienceStats, isLoading } = useQuery({
    queryKey: ['/api/audience/growth'],
  });

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-header">
          <h5 className="mb-0">Audience Growth</h5>
        </div>
        <div className="card-body">
          {[...Array(4)].map((_, index) => (
            <div className="mb-4" key={index}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="mb-0">Audience Growth</h5>
      </div>
      <div className="card-body">
        {audienceStats?.map((stat, index) => (
          <div className={index < audienceStats.length - 1 ? "mb-4" : ""} key={stat.id}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div>{stat.label}</div>
              <div className={`text-${stat.changeColor}`}>{stat.change}</div>
            </div>
            <div className="progress" style={{ height: '6px' }}>
              <div 
                className={`progress-bar bg-${stat.barColor}`} 
                role="progressbar" 
                style={{ width: `${stat.percentage}%` }} 
                aria-valuenow={stat.percentage} 
                aria-valuemin={0} 
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudienceGrowth;
