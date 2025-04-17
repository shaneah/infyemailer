import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, ChevronDown, Info, Mail, Check, BarChart3, Clock, Activity } from 'lucide-react';
import './client-portal.css';

const ClientPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [, setLocation] = useLocation();
  const [clientUser, setClientUser] = useState(null);
  
  useEffect(() => {
    // Check for client user in session storage
    const sessionUser = sessionStorage.getItem('clientUser');
    if (!sessionUser) {
      setLocation('/client-login');
      return;
    }
    
    try {
      const userData = JSON.parse(sessionUser);
      setClientUser(userData);
    } catch (error) {
      console.error('Error parsing client user from session storage:', error);
      sessionStorage.removeItem('clientUser');
      setLocation('/client-login');
    }
  }, [setLocation]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('clientUser');
    setLocation('/client-login');
  };

  // Mock data for the client portal
  const { data: emailCredits, isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/client/credits'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Dashboard data
  const { data: devicesData, isLoading: devicesLoading } = useQuery({
    queryKey: ['/api/analytics/devices'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: geographyData, isLoading: geographyLoading } = useQuery({
    queryKey: ['/api/analytics/geography'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: topCampaignsData, isLoading: topCampaignsLoading } = useQuery({
    queryKey: ['/api/analytics/top-campaigns'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: emailAnalytics, isLoading: emailAnalyticsLoading } = useQuery({
    queryKey: ['/api/analytics/email'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (!clientUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Portal...</h2>
          <p className="text-gray-500">Please wait while we retrieve your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-portal-container client-theme">
      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Client Portal</h1>
            <p className="text-gray-500">Welcome back, {clientUser.name}</p>
          </div>
          
          <Button 
            variant="outline" 
            className="border-[#d4af37]/50 client-btn-outline"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-[#d4af37]/20 client-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email Credits</p>
                  {creditsLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">{emailCredits?.used || 0}</span>
                      <span className="text-gray-500 ml-1">/ {emailCredits?.total || 0}</span>
                    </div>
                  )}
                </div>
                <div className="h-12 w-12 rounded-full bg-[#0a1929]/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-[#0a1929]" />
                </div>
              </div>
              <div className="mt-4">
                <Progress 
                  value={emailCredits ? (emailCredits.used / emailCredits.total) * 100 : 0} 
                  className="h-2" 
                />
                <p className="mt-2 text-xs text-gray-500">
                  Last updated: {emailCredits?.lastUpdated || 'Today'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#d4af37]/20 client-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Campaigns</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">3</span>
                    <span className="text-green-500 ml-2 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      All Running
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-[#0a1929]/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-[#0a1929]" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Average open rate:</span>
                  <span className="font-semibold">32.8%</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span>Average click rate:</span>
                  <span className="font-semibold">8.4%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#d4af37]/20 client-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Campaigns</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">2</span>
                    <span className="text-amber-500 ml-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Scheduled
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-[#0a1929]/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-[#0a1929]" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm">
                  <p className="text-gray-500">Next campaign:</p>
                  <p className="font-medium">Summer Collection Launch</p>
                  <p className="text-xs text-gray-500 mt-1">Scheduled for June 15, 2023</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs
          defaultValue="overview"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="bg-[#f8f9fa] dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a]">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a]">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a]">
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="contacts" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a]">
              Contacts
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a]">
              Templates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card className="border-[#d4af37]/20 client-card mb-6">
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Your campaign performance at a glance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {emailAnalyticsLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium flex items-center">
                              Open Rate 
                              <Info className="ml-1 h-3.5 w-3.5 text-gray-400" />
                            </span>
                            <span className="text-sm font-bold">{emailAnalytics?.overview?.openRate || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${emailAnalytics?.overview?.openRate || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {emailAnalytics?.overview?.openRate > 25 ? 'Good' : 'Needs improvement'} compared to industry average (25%)
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium flex items-center">
                              Click Rate 
                              <Info className="ml-1 h-3.5 w-3.5 text-gray-400" />
                            </span>
                            <span className="text-sm font-bold">{emailAnalytics?.overview?.clickRate || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${emailAnalytics?.overview?.clickRate || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {emailAnalytics?.overview?.clickRate > 3 ? 'Good' : 'Needs improvement'} compared to industry average (3%)
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium flex items-center">
                              Bounce Rate 
                              <Info className="ml-1 h-3.5 w-3.5 text-gray-400" />
                            </span>
                            <span className="text-sm font-bold">{emailAnalytics?.overview?.bounceRate || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-red-600 h-2.5 rounded-full" 
                              style={{ width: `${emailAnalytics?.overview?.bounceRate || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {emailAnalytics?.overview?.bounceRate < 2 ? 'Good' : 'Needs improvement'} compared to industry average (2%)
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium flex items-center">
                              Unsubscribe Rate 
                              <Info className="ml-1 h-3.5 w-3.5 text-gray-400" />
                            </span>
                            <span className="text-sm font-bold">{emailAnalytics?.overview?.unsubscribeRate || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-yellow-600 h-2.5 rounded-full" 
                              style={{ width: `${emailAnalytics?.overview?.unsubscribeRate || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {emailAnalytics?.overview?.unsubscribeRate < 0.5 ? 'Good' : 'Needs improvement'} compared to industry average (0.5%)
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-[#d4af37]/20 client-card">
                  <CardHeader>
                    <CardTitle>Device Breakdown</CardTitle>
                    <CardDescription>How your subscribers open emails</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {devicesLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {devicesData && devicesData.length > 0 ? (
                          devicesData.map((device, i) => (
                            <div key={i}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{device.name}</span>
                                <span className="text-sm font-bold">{device.percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    i === 0 ? 'bg-blue-600' : 
                                    i === 1 ? 'bg-green-600' : 'bg-purple-600'
                                  }`}
                                  style={{ width: `${device.percentage}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {device.count.toLocaleString()} opens
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No device data available</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="border-[#d4af37]/20 client-card mb-6">
                  <CardHeader>
                    <CardTitle>Top Campaigns</CardTitle>
                    <CardDescription>Your best performing campaigns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topCampaignsLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : (
                      <div>
                        {topCampaignsData && topCampaignsData.length > 0 ? (
                          <div className="space-y-6">
                            {topCampaignsData.slice(0, 3).map((campaign, i) => (
                              <div key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium">{campaign.name}</p>
                                    <p className="text-xs text-gray-500">{campaign.date || "Recent"}</p>
                                  </div>
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                                    campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {campaign.status && typeof campaign.status === 'object' ? campaign.status.label : campaign.status || 'Unknown'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                  <div className="text-center p-2 bg-blue-50 rounded">
                                    <p className="text-xs text-gray-500">Opens</p>
                                    <p className={`font-bold ${
                                      campaign.opens > 50 ? 'text-green-600' : 
                                      campaign.opens > 30 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>{campaign.opens}%</p>
                                  </div>
                                  <div className="text-center p-2 bg-green-50 rounded">
                                    <p className="text-xs text-gray-500">Clicks</p>
                                    <p className={`font-bold ${
                                      campaign.clicks > 30 ? 'text-green-600' : 
                                      campaign.clicks > 15 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>{campaign.clicks}%</p>
                                  </div>
                                  <div className="text-center p-2 bg-purple-50 rounded">
                                    <p className="text-xs text-gray-500">Converts</p>
                                    <p className={`font-bold ${
                                      campaign.conversions > 10 ? 'text-green-600' : 
                                      campaign.conversions > 5 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>{campaign.conversions}%</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No campaign data available</p>
                        )}
                        
                        <Button variant="outline" className="w-full mt-4 border-[#d4af37]/30">
                          View All Campaigns
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-[#d4af37]/20 client-card">
                  <CardHeader>
                    <CardTitle>Geographic Performance</CardTitle>
                    <CardDescription>Where your subscribers are located</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {geographyLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : (
                      <div>
                        {geographyData && geographyData.length > 0 ? (
                          <div className="space-y-3">
                            {geographyData.map((country, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="text-lg mr-2">{country.flag}</span>
                                  <span className="font-medium">{country.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm mr-4">{country.percentage}%</span>
                                  <span className="text-xs text-gray-500">{country.opens} opens</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No geographic data available</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <h2 className="text-2xl font-semibold mb-4">Analytics Dashboard</h2>
            <p className="mb-6">View detailed analytics for your email campaigns.</p>
          </TabsContent>
          
          <TabsContent value="campaigns">
            <h2 className="text-2xl font-semibold mb-4">Campaigns</h2>
            <p className="mb-6">Manage your email marketing campaigns.</p>
          </TabsContent>
          
          <TabsContent value="contacts">
            <h2 className="text-2xl font-semibold mb-4">Contacts</h2>
            <p className="mb-6">Manage your contact lists and subscribers.</p>
          </TabsContent>
          
          <TabsContent value="templates">
            <h2 className="text-2xl font-semibold mb-4">Email Templates</h2>
            <p className="mb-6">Browse and create email templates for your campaigns.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientPortal;