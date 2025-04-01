import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chart } from "@/components/ui/chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { chartData } from "@/lib/chartData";

const periods = ["7 Days", "30 Days", "90 Days", "12 Months"];

export default function Analytics() {
  const [period, setPeriod] = useState("30 Days");
  
  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['/api/analytics/performance', period],
    initialData: chartData.month,
  });
  
  const { data: deviceData, isLoading: isLoadingDevices } = useQuery({
    queryKey: ['/api/analytics/devices', period],
  });
  
  const { data: geographyData, isLoading: isLoadingGeography } = useQuery({
    queryKey: ['/api/analytics/geography', period],
  });
  
  const { data: topCampaignsData, isLoading: isLoadingTopCampaigns } = useQuery({
    queryKey: ['/api/analytics/top-campaigns', period],
  });

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Analytics</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <button type="button" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-download me-1"></i> Export
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-printer me-1"></i> Print
            </button>
          </div>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Performance Overview</h5>
            <div>
              <select 
                className="form-select form-select-sm"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {periods.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card border-0 bg-primary bg-opacity-10">
                <div className="card-body">
                  <h6 className="text-muted mb-2">Open Rate</h6>
                  {isLoadingPerformance ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="d-flex align-items-end gap-2">
                      <div className="fs-1 fw-bold">42.8%</div>
                      <div className="text-success mb-1">
                        <i className="bi bi-arrow-up-short"></i> 3.2%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-success bg-opacity-10">
                <div className="card-body">
                  <h6 className="text-muted mb-2">Click Rate</h6>
                  {isLoadingPerformance ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="d-flex align-items-end gap-2">
                      <div className="fs-1 fw-bold">18.2%</div>
                      <div className="text-success mb-1">
                        <i className="bi bi-arrow-up-short"></i> 1.8%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-warning bg-opacity-10">
                <div className="card-body">
                  <h6 className="text-muted mb-2">Bounce Rate</h6>
                  {isLoadingPerformance ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="d-flex align-items-end gap-2">
                      <div className="fs-1 fw-bold">3.5%</div>
                      <div className="text-danger mb-1">
                        <i className="bi bi-arrow-up-short"></i> 0.4%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-danger bg-opacity-10">
                <div className="card-body">
                  <h6 className="text-muted mb-2">Unsubscribes</h6>
                  {isLoadingPerformance ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="d-flex align-items-end gap-2">
                      <div className="fs-1 fw-bold">1.2%</div>
                      <div className="text-success mb-1">
                        <i className="bi bi-arrow-down-short"></i> 0.3%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ height: '350px' }}>
            {isLoadingPerformance ? (
              <div className="d-flex justify-content-center align-items-center h-100 bg-light rounded">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <Chart 
                data={performanceData} 
                height={350}
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

      <div className="row g-4">
        <div className="col-md-6">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Top Performing Campaigns</h5>
            </CardHeader>
            <CardContent>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Opens</th>
                      <th>Clicks</th>
                      <th>Conversions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTopCampaigns ? (
                      [...Array(5)].map((_, index) => (
                        <tr key={index}>
                          <td><Skeleton className="h-5 w-32" /></td>
                          <td><Skeleton className="h-5 w-16" /></td>
                          <td><Skeleton className="h-5 w-16" /></td>
                          <td><Skeleton className="h-5 w-16" /></td>
                        </tr>
                      ))
                    ) : (
                      topCampaignsData?.map((campaign) => (
                        <tr key={campaign.id}>
                          <td>{campaign.name}</td>
                          <td>{campaign.opens}%</td>
                          <td>{campaign.clicks}%</td>
                          <td>{campaign.conversions}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-md-6">
          <Tabs defaultValue="devices">
            <div className="card">
              <div className="card-header">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="devices">Device Breakdown</TabsTrigger>
                  <TabsTrigger value="geography">Geography</TabsTrigger>
                </TabsList>
              </div>
              <div className="card-body">
                <TabsContent value="devices" className="mt-0">
                  {isLoadingDevices ? (
                    <div className="d-flex justify-content-center align-items-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-md-6">
                        <div className="bg-light rounded d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                          <div className="text-center">
                            <p>Pie chart showing device breakdown</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="list-group list-group-flush">
                          {deviceData?.map((device) => (
                            <div className="list-group-item px-0 d-flex justify-content-between align-items-center" key={device.name}>
                              <div>
                                <i className={`bi bi-${device.icon} me-2`}></i>
                                {device.name}
                              </div>
                              <div className="fw-bold">{device.percentage}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="geography" className="mt-0">
                  {isLoadingGeography ? (
                    <div className="d-flex justify-content-center align-items-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Country</th>
                            <th>Opens</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {geographyData?.map((country) => (
                            <tr key={country.code}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <span className="me-2">{country.flag}</span>
                                  {country.name}
                                </div>
                              </td>
                              <td>{country.opens}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2">{country.percentage}%</div>
                                  <div className="progress flex-grow-1" style={{ height: '5px', width: '80px' }}>
                                    <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${country.percentage}%` }}></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}
