import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Inbox, BarChart3, Users, Calendar, MailCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ClientDashboardProps = {
  clientId?: string;
};

export default function ClientDashboard({ clientId }: ClientDashboardProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get client user info from session/localStorage
  const getClientUser = () => {
    const sessionUser = sessionStorage.getItem('clientUser');
    const localUser = localStorage.getItem('clientUser');
    
    if (sessionUser) {
      return JSON.parse(sessionUser);
    }
    
    if (localUser) {
      return JSON.parse(localUser);
    }
    
    return null;
  };

  const clientUser = getClientUser();

  useEffect(() => {
    // If no client user is logged in, redirect to client login
    if (!clientUser) {
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
        // const response = await fetch(`/api/client-dashboard/${clientUser.clientId}`);
        // const data = await response.json();
        
        // For now, using mock data based on the logged-in client
        setClientData({
          clientName: clientUser.clientName,
          clientCompany: clientUser.clientCompany,
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
  }, [clientUser, setLocation, toast]);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">InfyMailer Client Portal</h1>
              <p className="text-sm opacity-80">{clientData.clientCompany}</p>
            </div>
            <div className="flex items-center gap-4">
              <span>Welcome, {clientData.clientName}</span>
              <Button variant="outline" onClick={handleLogout} className="text-white border-white hover:bg-white/20">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto py-8 px-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientData.stats.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">Currently running email campaigns</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientData.stats.totalEmails.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Sent across all campaigns</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <MailCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientData.stats.openRate}%</div>
              <p className="text-xs text-muted-foreground">Average across all campaigns</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Email Performance</CardTitle>
              <CardDescription>
                Open and click rates over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clientData.performanceData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="opens" fill="#8884d8" name="Opens" />
                  <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>
                Email opens by device type
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientData.deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {clientData.deviceData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>
              Your latest email marketing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Campaign</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Opens</th>
                    <th className="text-left py-3 px-4">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.recentCampaigns.map((campaign: any) => (
                    <tr key={campaign.id} className="border-b">
                      <td className="py-3 px-4">{campaign.name}</td>
                      <td className="py-3 px-4">{new Date(campaign.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          campaign.status === "Completed" ? "bg-green-100 text-green-800" :
                          campaign.status === "Ongoing" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{campaign.opens.toLocaleString()}</td>
                      <td className="py-3 px-4">{campaign.clicks.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}