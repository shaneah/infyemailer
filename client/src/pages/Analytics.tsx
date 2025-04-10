import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chart } from "@/components/ui/chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { chartData } from "@/lib/chartData";
import { ArrowUp, ArrowDown, Smartphone, Laptop, Tablet } from "lucide-react";

const periods = ["7 Days", "30 Days", "90 Days", "12 Months"];

export default function Analytics() {
  const [period, setPeriod] = useState("30 Days");
  
  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['/api/analytics/performance', period],
    initialData: chartData.month,
  });
  
interface Device {
    name: string;
    percentage: number;
    icon: string;
  }
  
  interface Country {
    code: string;
    name: string;
    flag: string;
    opens: number;
    percentage: number;
  }
  
  interface Campaign {
    id: number;
    name: string;
    opens: number;
    clicks: number;
    conversions: number;
  }

  const { data: deviceData, isLoading: isLoadingDevices } = useQuery<Device[]>({
    queryKey: ['/api/analytics/devices', period],
    initialData: [],
  });
  
  const { data: geographyData, isLoading: isLoadingGeography } = useQuery<Country[]>({
    queryKey: ['/api/analytics/geography', period],
    initialData: [],
  });
  
  const { data: topCampaignsData, isLoading: isLoadingTopCampaigns } = useQuery<Campaign[]>({
    queryKey: ['/api/analytics/top-campaigns', period],
    initialData: [],
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between pb-2 mb-4 border-b">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <button type="button" className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-gold-sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <button type="button" className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-gold-sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      <Card className="mb-6 shadow-gold">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-medium text-primary">Performance Overview</h5>
            <div className="w-40">
              <select 
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg overflow-hidden shadow-gold-sm bg-blue-50 border border-blue-100">
              <div className="p-4">
                <h6 className="text-sm text-gray-500 mb-2">Open Rate</h6>
                {isLoadingPerformance ? (
                  <Skeleton className="h-10 w-28" />
                ) : (
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold text-primary">42.8%</div>
                    <div className="text-green-600 mb-1 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-0.5" /> 3.2%
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-gold-sm bg-green-50 border border-green-100">
              <div className="p-4">
                <h6 className="text-sm text-gray-500 mb-2">Click Rate</h6>
                {isLoadingPerformance ? (
                  <Skeleton className="h-10 w-28" />
                ) : (
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold text-green-700">18.2%</div>
                    <div className="text-green-600 mb-1 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-0.5" /> 1.8%
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-gold-sm bg-amber-50 border border-amber-100">
              <div className="p-4">
                <h6 className="text-sm text-gray-500 mb-2">Bounce Rate</h6>
                {isLoadingPerformance ? (
                  <Skeleton className="h-10 w-28" />
                ) : (
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold text-amber-700">3.5%</div>
                    <div className="text-red-600 mb-1 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-0.5" /> 0.4%
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-gold-sm bg-red-50 border border-red-100">
              <div className="p-4">
                <h6 className="text-sm text-gray-500 mb-2">Unsubscribes</h6>
                {isLoadingPerformance ? (
                  <Skeleton className="h-10 w-28" />
                ) : (
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold text-red-700">1.2%</div>
                    <div className="text-green-600 mb-1 flex items-center">
                      <ArrowDown className="w-4 h-4 mr-0.5" /> 0.3%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="h-[350px]">
            {isLoadingPerformance ? (
              <div className="flex justify-center items-center h-full bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-gold">
          <CardHeader className="border-b">
            <h5 className="text-lg font-medium text-primary m-0">Top Performing Campaigns</h5>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opens</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoadingTopCampaigns ? (
                    [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      </tr>
                    ))
                  ) : (
                    topCampaignsData.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{campaign.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{campaign.opens}%</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{campaign.clicks}%</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{campaign.conversions}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-gold">
          <CardHeader className="p-0 border-b">
            <Tabs defaultValue="devices" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-none">
                <TabsTrigger value="devices" className="rounded-none">Device Breakdown</TabsTrigger>
                <TabsTrigger value="geography" className="rounded-none">Geography</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="devices" className="mt-0">
              {isLoadingDevices ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg flex justify-center items-center" style={{ height: '200px' }}>
                    <div className="text-center">
                      <p className="text-gray-500">Pie chart showing device breakdown</p>
                    </div>
                  </div>
                  <div>
                    <ul className="divide-y divide-gray-200">
                      {deviceData.map((device) => (
                        <li key={device.name} className="py-3 flex justify-between items-center">
                          <div className="flex items-center">
                            {device.icon === 'phone' && <Smartphone className="w-5 h-5 mr-2 text-primary" />}
                            {device.icon === 'laptop' && <Laptop className="w-5 h-5 mr-2 text-primary" />}
                            {device.icon === 'tablet' && <Tablet className="w-5 h-5 mr-2 text-primary" />}
                            <span>{device.name}</span>
                          </div>
                          <div className="font-semibold">{device.percentage}%</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="geography" className="mt-0">
              {isLoadingGeography ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opens</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {geographyData.map((country) => (
                        <tr key={country.code} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <span className="mr-2">{country.flag}</span>
                              <span className="text-sm font-medium text-gray-900">{country.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{country.opens}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-700 mr-2">{country.percentage}%</span>
                              <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${country.percentage}%` }}
                                ></div>
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
