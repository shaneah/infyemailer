import { useState } from "react";
import { Chart } from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { chartData } from "@/lib/chartData";

const timeRanges = ["Week", "Month", "Quarter"];

const AnalyticsChart = () => {
  const [timeRange, setTimeRange] = useState("Week");
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/analytics', timeRange],
    initialData: chartData[timeRange.toLowerCase()],
  });

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Performance Analytics</h5>
        <div className="btn-group">
          {timeRanges.map((range) => (
            <button
              key={range}
              type="button"
              className={`btn btn-sm btn-outline-secondary ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        <div className="position-relative" style={{ height: '300px' }}>
          {isLoading ? (
            <div className="bg-light rounded w-100 h-100 d-flex justify-content-center align-items-center">
              <div className="text-center p-4">
                <i className="bi bi-hourglass-split fs-1 text-secondary mb-3"></i>
                <p className="mb-0">Loading chart data...</p>
              </div>
            </div>
          ) : (
            <Chart 
              data={data} 
              height={300}
              series={[
                { name: "Opens", type: "line" },
                { name: "Clicks", type: "line" },
                { name: "Conversions", type: "area" }
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
