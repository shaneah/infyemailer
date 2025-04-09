import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const StatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div className="row g-3 mb-4">
        {[...Array(4)].map((_, index) => (
          <div className="col-md-3" key={index}>
            <div className="card hover-card h-100">
              <div className="card-body">
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="d-flex align-items-center">
                  <Skeleton className="h-8 w-24 me-2" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-4 w-40 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="row g-3 mb-4">
      {stats?.map((stat) => (
        <div className="col-md-3" key={stat.id}>
          <div className="card hover-card h-100">
            <div className="card-body">
              <h6 className="card-title text-muted fw-normal">{stat.title}</h6>
              <div className="d-flex align-items-center">
                <div className="fs-2 fw-bold me-2">{stat.value}</div>
                <span className={`badge bg-${stat.change.color} rounded-pill`}>{stat.change.value}</span>
              </div>
              <small className="text-muted">{stat.comparison}</small>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
