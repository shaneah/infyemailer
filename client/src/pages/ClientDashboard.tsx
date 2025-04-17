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
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, ChevronDown, Info, Inbox, Users, BarChart3, Settings2 } from 'lucide-react';
import './client-portal.css';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientUser, setClientUser] = useState<any>(null);
  
  useEffect(() => {
    // Check for client user in session storage
    const sessionUser = sessionStorage.getItem('clientUser');
    if (!sessionUser) {
      toast({
        title: "Authentication required",
        description: "Please login to access the client portal",
        variant: "destructive"
      });
      setLocation('/client-login');
      return;
    }
    
    try {
      const userData = JSON.parse(sessionUser);
      setClientUser(userData);
    } catch (error) {
      console.error('Error parsing client user from session storage:', error);
      sessionStorage.removeItem('clientUser');
      toast({
        title: "Session error",
        description: "Please login again",
        variant: "destructive"
      });
      setLocation('/client-login');
    }
  }, [setLocation, toast]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('clientUser');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
    setLocation('/client-login');
  };

  // Mock data for the client dashboard using React Query
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({ 
    queryKey: ['/api/campaigns'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: emailCredits, isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/client/credits'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/client/templates'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/contacts'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/email'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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

  if (!clientUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-gray-500">Please wait while we retrieve your data</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="client-portal-container client-theme min-h-screen">
      <div className="client-subtle-pattern"></div>
      <div className="container mx-auto px-4 py-6">
        <div className="premium-header mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{clientUser.company || 'Client'} Dashboard</h1>
              <p className="text-white/70">Welcome back, {clientUser.name}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="client-btn-outline border-white/30 text-white hover:bg-white/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <Card className="client-card stat-card premium-card-highlight">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Email Credits</p>
                  {creditsLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="stat-value">{emailCredits?.remaining || 0}</p>
                  )}
                </div>
                <div className="icon-container">
                  <Inbox className="h-6 w-6 text-[#3a86ff]" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="client-text-secondary">Used: {emailCredits?.used || 0}</span>
                  <span className="client-text-secondary">Total: {emailCredits?.total || 0}</span>
                </div>
                <div className="client-progress-container">
                  <div 
                    className="client-progress-bar" 
                    style={{ width: `${emailCredits ? (emailCredits.used / emailCredits.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="client-card stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Campaigns</p>
                  {campaignsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="stat-value">{campaigns?.length || 0}</p>
                  )}
                </div>
                <div className="icon-container">
                  <BarChart3 className="h-6 w-6 text-[#f59e0b]" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="client-text-secondary">Active: {campaigns?.filter((c: any) => c.status === 'active').length || 0}</span>
                  <span className="client-text-secondary">Draft: {campaigns?.filter((c: any) => c.status === 'draft').length || 0}</span>
                </div>
                <div className="client-progress-container">
                  <div className="flex h-full">
                    <div className="client-progress-success h-full" style={{ width: `${campaigns ? (campaigns.filter((c: any) => c.status === 'active').length / campaigns.length) * 100 : 0}%` }}></div>
                    <div className="client-progress-warning h-full" style={{ width: `${campaigns ? (campaigns.filter((c: any) => c.status === 'draft').length / campaigns.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="client-card stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Contacts</p>
                  {contactsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="stat-value">{contacts?.length || 0}</p>
                  )}
                </div>
                <div className="icon-container">
                  <Users className="h-6 w-6 text-[#10b981]" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="client-text-secondary">Active: {contacts?.filter((c: any) => c.status === 'active').length || 0}</span>
                  <span className="client-text-secondary">Growth: +{contacts?.filter((c: any) => {
                    const createdAt = new Date(c.createdAt);
                    const now = new Date();
                    return (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24) < 30; // Last 30 days
                  }).length || 0} this month</span>
                </div>
                <div className="client-progress-container">
                  <div 
                    className="client-progress-success" 
                    style={{ width: `${contacts ? (contacts.filter((c: any) => c.status === 'active').length / contacts.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="client-card stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Templates</p>
                  {templatesLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="stat-value">{templates?.length || 0}</p>
                  )}
                </div>
                <div className="icon-container">
                  <Settings2 className="h-6 w-6 text-[#8b5cf6]" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="client-text-secondary">Custom: {templates?.filter((t: any) => t.isCustom).length || 0}</span>
                  <span className="client-text-secondary">Standard: {templates?.filter((t: any) => !t.isCustom).length || 0}</span>
                </div>
                <div className="client-progress-container">
                  <div className="flex h-full">
                    <div 
                      className="h-full" 
                      style={{ 
                        width: `${templates ? (templates.filter((t: any) => t.isCustom).length / templates.length) * 100 : 0}%`,
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)'
                      }}
                    ></div>
                    <div 
                      className="h-full" 
                      style={{ 
                        width: `${templates ? (templates.filter((t: any) => !t.isCustom).length / templates.length) * 100 : 0}%`,
                        background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <Tabs
            defaultValue="overview"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex justify-center mb-6">
              <TabsList className="client-tabs-list shadow-sm">
                <TabsTrigger value="overview" className="client-tab">Overview</TabsTrigger>
                <TabsTrigger value="campaigns" className="client-tab">Campaigns</TabsTrigger>
                <TabsTrigger value="contacts" className="client-tab">Contacts</TabsTrigger>
                <TabsTrigger value="templates" className="client-tab">Templates</TabsTrigger>
                <TabsTrigger value="analytics" className="client-tab">Analytics</TabsTrigger>
                <TabsTrigger value="settings" className="client-tab">Settings</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview">
              <h2 className="text-2xl font-semibold mb-4">Welcome to Your Dashboard</h2>
              <p className="mb-6 text-gray-600">This is your client portal dashboard where you can manage your email marketing campaigns, contacts, and templates. Use the tabs above to navigate between different sections.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="client-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recent Performance</CardTitle>
                    <CardDescription>Your latest campaign statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      {analyticsLoading ? (
                        <>
                          <Skeleton className="h-12 w-full mb-4" />
                          <Skeleton className="h-12 w-full mb-4" />
                          <Skeleton className="h-12 w-full mb-4" />
                          <Skeleton className="h-12 w-full" />
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="flex justify-between mb-2 text-sm">
                              <div className="flex items-center">
                                <span className="font-medium">Open Rate</span>
                                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                              </div>
                              <span className="font-bold text-[#3a86ff]">{analyticsData?.overview?.openRate || 0}%</span>
                            </div>
                            <div className="client-progress-container">
                              <div 
                                className="h-full" 
                                style={{ 
                                  width: `${analyticsData?.overview?.openRate || 0}%`,
                                  background: 'linear-gradient(90deg, #3a86ff 0%, #60a5fa 100%)'
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {(analyticsData?.overview?.openRate || 0) > 25 ? '✓ Good' : '⚠ Needs improvement'} compared to industry average (25%)
                            </p>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2 text-sm">
                              <div className="flex items-center">
                                <span className="font-medium">Click Rate</span>
                                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                              </div>
                              <span className="font-bold text-[#10b981]">{analyticsData?.overview?.clickRate || 0}%</span>
                            </div>
                            <div className="client-progress-container">
                              <div 
                                className="client-progress-success" 
                                style={{ width: `${analyticsData?.overview?.clickRate || 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {(analyticsData?.overview?.clickRate || 0) > 3 ? '✓ Good' : '⚠ Needs improvement'} compared to industry average (3%)
                            </p>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2 text-sm">
                              <div className="flex items-center">
                                <span className="font-medium">Bounce Rate</span>
                                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                              </div>
                              <span className="font-bold text-[#ef4444]">{analyticsData?.overview?.bounceRate || 0}%</span>
                            </div>
                            <div className="client-progress-container">
                              <div 
                                className="client-progress-danger" 
                                style={{ width: `${analyticsData?.overview?.bounceRate || 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {(analyticsData?.overview?.bounceRate || 0) < 2 ? '✓ Good' : '⚠ Needs improvement'} compared to industry average (2%)
                            </p>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2 text-sm">
                              <div className="flex items-center">
                                <span className="font-medium">Unsubscribe Rate</span>
                                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                              </div>
                              <span className="font-bold text-[#f59e0b]">{analyticsData?.overview?.unsubscribeRate || 0}%</span>
                            </div>
                            <div className="client-progress-container">
                              <div 
                                className="client-progress-warning"
                                style={{ width: `${analyticsData?.overview?.unsubscribeRate || 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {(analyticsData?.overview?.unsubscribeRate || 0) < 0.5 ? '✓ Good' : '⚠ Needs improvement'} compared to industry average (0.5%)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="client-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>Get started with these common tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button className="w-full justify-start client-btn-primary">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Create New Campaign
                      </Button>
                      <Button className="w-full justify-start" 
                        style={{ 
                          background: 'linear-gradient(to right, #10b981, #059669)',
                          color: 'white' 
                        }}>
                        <Users className="mr-2 h-4 w-4" />
                        Add New Contacts
                      </Button>
                      <Button className="w-full justify-start" 
                        style={{ 
                          background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
                          color: 'white' 
                        }}>
                        <Settings2 className="mr-2 h-4 w-4" />
                        Design New Template
                      </Button>
                      <Button className="w-full justify-start" 
                        style={{ 
                          background: 'linear-gradient(to right, #f59e0b, #d97706)',
                          color: 'white' 
                        }}>
                        <Inbox className="mr-2 h-4 w-4" />
                        View Reports
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="client-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Campaign Activity</CardTitle>
                  <CardDescription>Your recent campaign performance</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {topCampaignsLoading ? (
                    <div className="p-6 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-6 font-semibold text-gray-600">Campaign</th>
                            <th className="text-left py-3 px-6 font-semibold text-gray-600 hidden sm:table-cell">Date</th>
                            <th className="text-center py-3 px-6 font-semibold text-gray-600">Status</th>
                            <th className="text-right py-3 px-6 font-semibold text-gray-600">Opens</th>
                            <th className="text-right py-3 px-6 font-semibold text-gray-600">Clicks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topCampaignsData && topCampaignsData.slice(0, 5).map((campaign: any, index: number) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6 font-medium">{campaign.name}</td>
                              <td className="py-4 px-6 text-gray-500 hidden sm:table-cell">{campaign.date || "Recent"}</td>
                              <td className="py-4 px-6 text-center">
                                <span className={`client-badge ${
                                  (campaign.status === 'active' || (campaign.status && campaign.status.label === 'Active') || (campaign.status && campaign.status.label === 'Sent')) ? 'client-badge-success' : 
                                  (campaign.status === 'draft' || (campaign.status && campaign.status.label === 'Draft') || (campaign.status && campaign.status.label === 'Scheduled')) ? 'client-badge-warning' : 
                                  (campaign.status === 'completed' || (campaign.status && campaign.status.label === 'Completed')) ? 'client-badge-info' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {campaign.status && typeof campaign.status === 'object' ? campaign.status.label : campaign.status || 'Unknown'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right font-medium">
                                <span className={`${campaign.opens > 50 
                                  ? 'text-[#10b981]' 
                                  : campaign.opens > 30 
                                    ? 'text-[#f59e0b]' 
                                    : 'text-[#ef4444]'}`}
                                >
                                  {campaign.opens}%
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right font-medium">
                                <span className={`${campaign.clicks > 30 
                                  ? 'text-[#10b981]' 
                                  : campaign.clicks > 15 
                                    ? 'text-[#f59e0b]' 
                                    : 'text-[#ef4444]'}`}
                                >
                                  {campaign.clicks}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      <div className="p-4 flex justify-center">
                        <Button 
                          variant="outline"
                          className="client-btn-outline"
                        >
                          View All Campaigns
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="campaigns">
              <h2 className="text-2xl font-semibold mb-4">Your Campaigns</h2>
              <p className="mb-6 text-gray-600">View and manage your email marketing campaigns here.</p>
            </TabsContent>
            
            <TabsContent value="contacts">
              <h2 className="text-2xl font-semibold mb-4">Contact Management</h2>
              <p className="mb-6 text-gray-600">Manage your subscriber lists and contact information.</p>
            </TabsContent>
            
            <TabsContent value="templates">
              <h2 className="text-2xl font-semibold mb-4">Email Templates</h2>
              <p className="mb-6 text-gray-600">Browse, create, and edit email templates for your campaigns.</p>
            </TabsContent>
            
            <TabsContent value="analytics">
              <h2 className="text-2xl font-semibold mb-4">Campaign Analytics</h2>
              <p className="mb-6 text-gray-600">In-depth analytics and reporting for your email campaigns.</p>
            </TabsContent>
            
            <TabsContent value="settings">
              <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
              <div className="flex justify-end mb-6">
                <Button variant="outline" className="border-[#d4af37]/50">Save Changes</Button>
              </div>
              
              <p className="mb-6 text-gray-500">This tab will allow you to manage your account settings.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;