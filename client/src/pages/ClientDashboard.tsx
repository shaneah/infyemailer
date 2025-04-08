import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Inbox, BarChart3, Users, Calendar, MailCheck, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ClientSidebar from "@/components/ClientSidebar";

type ClientDashboardProps = {
  clientId?: string;
};

export default function ClientDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get client user info from session storage
  const getClientUser = () => {
    const sessionUser = sessionStorage.getItem('clientUser');
    
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch (error) {
        console.error('Error parsing client user', error);
        return null;
      }
    }
    
    return null;
  };

  const clientUser = getClientUser();

  useEffect(() => {
    // Moved getClientUser inside the effect to avoid infinite loop
    const currentClientUser = getClientUser();
    
    // If no client user is logged in, redirect to client login
    if (!currentClientUser) {
      toast({
        title: "Access denied",
        description: "Please log in to access your dashboard",
        variant: "destructive"
      });
      setLocation('/client-login');
      return;
    }

    // Fetch client data (campaigns, stats, etc.)
    const fetchClientData = async () => {
      try {
        setLoading(true);
        // Simulated data - in a real app, this would fetch from the API
        // const response = await fetch(`/api/client-dashboard/${currentClientUser.clientId}`);
        // const data = await response.json();
        
        // For now, using mock data based on the logged-in client
        setClientData({
          clientName: currentClientUser.clientName,
          clientCompany: currentClientUser.clientCompany,
          stats: {
            activeCampaigns: 3,
            totalEmails: 12500,
            openRate: 24.8,
            clickRate: 3.6,
            contactsCount: 4560
          },
          recentCampaigns: [
            { id: 1, name: "Monthly Newsletter", date: "2025-03-15", status: "Completed", opens: 2430, clicks: 358 },
            { id: 2, name: "Product Launch", date: "2025-03-28", status: "Ongoing", opens: 1856, clicks: 312 },
            { id: 3, name: "Spring Promotion", date: "2025-04-01", status: "Scheduled", opens: 0, clicks: 0 }
          ],
          performanceData: [
            { name: "Jan", opens: 65, clicks: 12 },
            { name: "Feb", opens: 59, clicks: 10 },
            { name: "Mar", opens: 80, clicks: 15 },
            { name: "Apr", opens: 81, clicks: 16 },
            { name: "May", opens: 56, clicks: 8 },
            { name: "Jun", opens: 55, clicks: 7 }
          ],
          deviceData: [
            { name: "Mobile", value: 45 },
            { name: "Desktop", value: 35 },
            { name: "Tablet", value: 20 }
          ]
        });
      } catch (error) {
        console.error("Error fetching client data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
    // removeClientUser from dependencies to avoid infinite loop
  }, [setLocation, toast]);

  // For the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const handleLogout = () => {
    // Clear session storage and localStorage
    sessionStorage.removeItem('clientUser');
    localStorage.removeItem('clientUser');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
    
    // Redirect to login page
    setLocation('/client-login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-red-500">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error loading your dashboard data. Please try again later.</p>
            <Button onClick={handleLogout} className="mt-4">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#2D1164] text-white shadow-md">
          <div className="container mx-auto py-5 px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="lg:hidden text-white hover:bg-[#4A1DAE]"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={24} />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">InfyMailer Client Portal</h1>
                  <p className="text-sm font-medium text-white">{clientData.clientCompany}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 lg:hidden">
                <span className="hidden sm:inline font-medium">Welcome, {clientData.clientName}</span>
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="text-white border-white hover:bg-[#4A1DAE] font-medium"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h2>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-[#4A1DAE]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-bold text-gray-800">Active Campaigns</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-[#4A1DAE]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{clientData.stats.activeCampaigns}</div>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Currently running email campaigns</p>
                </CardContent>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-[#4A1DAE]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-bold text-gray-800">Total Emails</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Inbox className="h-5 w-5 text-[#4A1DAE]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{clientData.stats.totalEmails.toLocaleString()}</div>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Sent across all campaigns</p>
                </CardContent>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-[#4A1DAE]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-bold text-gray-800">Open Rate</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <MailCheck className="h-5 w-5 text-[#4A1DAE]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{clientData.stats.openRate}%</div>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Average across all campaigns</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow border-t-4 border-[#4A1DAE]">
                <CardHeader className="pb-2">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <BarChart className="h-4 w-4 text-[#4A1DAE]" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">Email Performance</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600 font-medium">
                    Open and click rates over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={clientData.performanceData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 20
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                      <XAxis dataKey="name" tick={{fill: '#666'}} />
                      <YAxis tick={{fill: '#666'}} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="opens" fill="#4A1DAE" name="Opens" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="clicks" fill="#7C3AED" name="Clicks" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow border-t-4 border-[#4A1DAE]">
                <CardHeader className="pb-2">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <PieChart className="h-4 w-4 text-[#4A1DAE]" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">Device Breakdown</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600 font-medium">
                    Email opens by device type
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clientData.deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {clientData.deviceData.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={[
                              "#4A1DAE", "#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD"
                            ][index % 5]} 
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns */}
            <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-[#4A1DAE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gray-800">Recent Campaigns</CardTitle>
                <CardDescription className="text-gray-600">
                  Your latest email marketing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-gray-800">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Campaign</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Opens</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientData.recentCampaigns.map((campaign: any) => (
                        <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-medium">{campaign.name}</td>
                          <td className="py-4 px-4">{new Date(campaign.date).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                              campaign.status === "Completed" ? "bg-green-100 text-green-800" :
                              campaign.status === "Ongoing" ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium">{campaign.opens.toLocaleString()}</td>
                          <td className="py-4 px-4 font-medium">{campaign.clicks.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}