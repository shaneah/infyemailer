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
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{clientUser.company || 'Client'} Dashboard</h1>
            <p className="text-gray-500">Welcome back, {clientUser.name}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="border-[#d4af37]/50 client-btn-outline"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-[#d4af37]/20 client-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Email Credits</p>
                  {creditsLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{emailCredits?.remaining || 0}</p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Inbox className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Used: {emailCredits?.used || 0}</span>
                  <span>Total: {emailCredits?.total || 0}</span>
                </div>
                <Progress value={emailCredits ? (emailCredits.used / emailCredits.total) * 100 : 0} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#d4af37]/20 client-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Campaigns</p>
                  {campaignsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{campaigns?.length || 0}</p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Active: {campaigns?.filter((c: any) => c.status === 'active').length || 0}</span>
                  <span>Draft: {campaigns?.filter((c: any) => c.status === 'draft').length || 0}</span>
                </div>
                <div className="bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    <div className="bg-green-500 h-full" style={{ width: `${campaigns ? (campaigns.filter((c: any) => c.status === 'active').length / campaigns.length) * 100 : 0}%` }}></div>
                    <div className="bg-amber-500 h-full" style={{ width: `${campaigns ? (campaigns.filter((c: any) => c.status === 'draft').length / campaigns.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#d4af37]/20 client-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Contacts</p>
                  {contactsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{contacts?.length || 0}</p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Active: {contacts?.filter((c: any) => c.status === 'active').length || 0}</span>
                  <span>Growth: +{contacts?.filter((c: any) => {
                    const createdAt = new Date(c.createdAt);
                    const now = new Date();
                    return (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24) < 30; // Last 30 days
                  }).length || 0} this month</span>
                </div>
                <Progress value={contacts ? (contacts.filter((c: any) => c.status === 'active').length / contacts.length) * 100 : 0} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#d4af37]/20 client-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Templates</p>
                  {templatesLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{templates?.length || 0}</p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Settings2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Custom: {templates?.filter((t: any) => t.isCustom).length || 0}</span>
                  <span>Standard: {templates?.filter((t: any) => !t.isCustom).length || 0}</span>
                </div>
                <div className="bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    <div className="bg-purple-500 h-full" style={{ width: `${templates ? (templates.filter((t: any) => t.isCustom).length / templates.length) * 100 : 0}%` }}></div>
                    <div className="bg-blue-500 h-full" style={{ width: `${templates ? (templates.filter((t: any) => !t.isCustom).length / templates.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center mb-8">
          <Tabs
            defaultValue="overview"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex justify-center mb-6">
              <TabsList className="bg-[#f8f9fa] dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a]">Overview</TabsTrigger>
                <TabsTrigger value="campaigns" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a]">Campaigns</TabsTrigger>
                <TabsTrigger value="contacts" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a]">Contacts</TabsTrigger>
                <TabsTrigger value="templates" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a]">Templates</TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a]">Analytics</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f172a]">Settings</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview">
              <h2 className="text-2xl font-semibold mb-4">Welcome to Your Dashboard</h2>
              <p className="mb-6 text-gray-600">This is your client portal dashboard where you can manage your email marketing campaigns, contacts, and templates. Use the tabs above to navigate between different sections.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="border-[#d4af37]/20 client-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recent Performance</CardTitle>
                    <CardDescription>Your latest campaign statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
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
                            <div className="flex justify-between mb-1 text-sm">
                              <div className="flex items-center">
                                <span>Open Rate</span>
                                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                              </div>
                              <span className="font-semibold">{analyticsData?.overview?.openRate || 0}%</span>
                            </div>
                            <Progress value={analyticsData?.overview?.openRate || 0} className="h-2 bg-gray-200" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <div className="flex items-center">
                                <span>Click Rate</span>
                                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                              </div>
                              <span className="font-semibold">{analyticsData?.overview?.clickRate || 0}%</span>
                            </div>
                            <Progress value={analyticsData?.overview?.clickRate || 0} className="h-2 bg-gray-200" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <div className="flex items-center">
                                <span>Bounce Rate</span>
                                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                              </div>
                              <span className="font-semibold">{analyticsData?.overview?.bounceRate || 0}%</span>
                            </div>
                            <Progress value={analyticsData?.overview?.bounceRate || 0} className="h-2 bg-gray-200" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <div className="flex items-center">
                                <span>Unsubscribe Rate</span>
                                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                              </div>
                              <span className="font-semibold">{analyticsData?.overview?.unsubscribeRate || 0}%</span>
                            </div>
                            <Progress value={analyticsData?.overview?.unsubscribeRate || 0} className="h-2 bg-gray-200" />
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-[#d4af37]/20 client-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>Get started with these common tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Create New Campaign
                      </Button>
                      <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                        <Users className="mr-2 h-4 w-4" />
                        Add New Contacts
                      </Button>
                      <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                        <Settings2 className="mr-2 h-4 w-4" />
                        Design New Template
                      </Button>
                      <Button className="w-full justify-start bg-amber-600 hover:bg-amber-700">
                        <Inbox className="mr-2 h-4 w-4" />
                        View Reports
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border-[#d4af37]/20 client-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Campaign Activity</CardTitle>
                  <CardDescription>Your recent campaign performance</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {topCampaignsLoading ? (
                    <div className="p-4 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Campaign</th>
                          <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Date</th>
                          <th className="text-right py-3 px-4 font-medium">Status</th>
                          <th className="text-right py-3 px-4 font-medium">Opens</th>
                          <th className="text-right py-3 px-4 font-medium">Clicks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCampaignsData && topCampaignsData.slice(0, 5).map((campaign: any, index: number) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{campaign.name}</td>
                            <td className="py-3 px-4 hidden sm:table-cell">{campaign.date || "Recent"}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                                campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {campaign.status && typeof campaign.status === 'object' ? campaign.status.label : campaign.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`${campaign.opens > 50 
                                ? 'text-green-600' 
                                : campaign.opens > 30 
                                  ? 'text-yellow-600' 
                                  : 'text-red-600'}`}
                              >
                                {campaign.opens}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`${campaign.clicks > 30 
                                ? 'text-green-600' 
                                : campaign.clicks > 15 
                                  ? 'text-yellow-600' 
                                  : 'text-red-600'}`}
                              >
                                {campaign.clicks}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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