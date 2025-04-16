import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as ReChartsPieChart, Pie, Cell, LineChart, Line, Legend 
} from "recharts";
import { 
  Activity, Inbox, BarChart3, Users, Calendar, MailCheck, Menu, 
  Sparkles, TrendingUp, Mail, ChevronRight, CircleUser, PieChart 
} from "lucide-react";
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

  // Generate animated particles for background effect
  const particles = useMemo(() => {
    const totalParticles = 50;
    return Array.from({ length: totalParticles }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.2 + 0.1
    }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a1929] via-[#112b4a] to-[#1a3a5f]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#d4af37]/30 rounded-full animate-ping"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-[#d4af37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-white/80 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#112b4a] to-[#1a3a5f] flex items-center justify-center p-6">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/10 shadow-2xl border border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-xl text-[#ff6b6b]">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80">There was an error loading your dashboard data. Please try again later.</p>
            <Button 
              onClick={handleLogout} 
              className="mt-4 bg-gradient-to-r from-[#d4af37] to-[#d4af37]/70 hover:from-[#d4af37]/70 hover:to-[#d4af37] text-white border-none"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, index) => (
          <div 
            key={index}
            className="absolute rounded-full bg-amber-300"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px rgba(245, 158, 11, 0.2)`
            }}
          />
        ))}
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-slate-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-900 to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-blue-700/15 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl"></div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="bg-slate-800/95 backdrop-blur-md border-b border-blue-900/30 text-white relative z-20 shadow-lg">
          <div className="container mx-auto py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="lg:hidden text-white hover:bg-blue-900/30"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={24} />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-amber-300 to-blue-400 inline-block text-transparent bg-clip-text">
                    InfyMailer NextGen Portal
                  </h1>
                  <div className="w-32 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent my-1"></div>
                  <p className="text-sm font-medium text-white/70">{clientData.company || 'Acme Corporation'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-500/20">
                  <CircleUser className="h-5 w-5 text-amber-300" />
                  <span className="text-sm font-medium text-white">Welcome, {clientUser?.name || 'User'}</span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="text-white border-amber-500/30 bg-blue-900/20 hover:bg-blue-800/30 hover:text-amber-300 font-medium"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 relative z-10 bg-white rounded-t-2xl">
          <div className="container mx-auto">
            <div className="flex flex-col mb-8">
              <div className="flex items-center">
                <div className="bg-blue-700/20 p-2 rounded-full mr-3">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800">Your Dashboard</h2>
              </div>
              <div className="w-32 h-0.5 bg-amber-500/50 mt-1.5 ml-11"></div>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border border-blue-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <CardTitle className="text-base font-bold text-slate-700">Active Campaigns</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-xl -mt-10 -mr-10 opacity-30"></div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 inline-block text-transparent bg-clip-text">
                    {clientData.stats.activeCampaigns}
                  </div>
                  <p className="text-sm text-slate-600 mt-1 font-medium">Currently running email campaigns</p>
                  
                  <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                    <span>2 campaigns active this week</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-blue-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <CardTitle className="text-base font-bold text-slate-700">Total Emails</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-xl -mt-10 -mr-10 opacity-30"></div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 inline-block text-transparent bg-clip-text">
                    {clientData.stats.totalEmails.toLocaleString()}
                  </div>
                  <p className="text-sm text-slate-600 mt-1 font-medium">Sent across all campaigns</p>
                  
                  <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                    <span>1,250 emails sent this month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-blue-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <CardTitle className="text-base font-bold text-slate-700">Open Rate</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <MailCheck className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-xl -mt-10 -mr-10 opacity-30"></div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 inline-block text-transparent bg-clip-text">
                    {clientData.stats.openRate}%
                  </div>
                  <p className="text-sm text-slate-600 mt-1 font-medium">Average across all campaigns</p>
                  
                  <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                    <span>3.2% higher than industry average</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="col-span-1 border border-blue-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-700">Email Performance</CardTitle>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-full px-4 flex items-center gap-2 transition-all duration-300 hover:shadow-md hover:border-blue-300 group"
                      onClick={() => setLocation('/email-performance-dashboard')}
                    >
                      <div className="relative">
                        <Activity className="h-3.5 w-3.5 group-hover:opacity-0 transition-opacity" />
                        <ChevronRight className="h-3.5 w-3.5 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span>Details</span>
                    </Button>
                  </div>
                  <CardDescription className="text-slate-500 font-medium">
                    Email opens and clicks over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px] pt-4 relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full blur-xl -mt-10 -mr-10 opacity-30"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={clientData.performanceData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.4)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(100, 116, 139, 0.8)"
                        tick={{ fill: 'rgba(71, 85, 105, 0.9)' }}
                      />
                      <YAxis 
                        stroke="rgba(100, 116, 139, 0.8)"
                        tick={{ fill: 'rgba(71, 85, 105, 0.9)' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(203, 213, 225, 0.5)',
                          borderRadius: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          color: '#334155'
                        }}
                        labelStyle={{color: '#0369a1', fontWeight: 'bold'}}
                        itemStyle={{color: '#334155'}}
                      />
                      <Legend 
                        wrapperStyle={{color: '#475569', fontSize: '12px'}}
                        formatter={(value) => <span style={{color: '#475569'}}>{value}</span>}
                      />
                      <Bar dataKey="opens" name="Opens" fill="rgba(37, 99, 235, 0.7)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="clicks" name="Clicks" fill="rgba(245, 158, 11, 0.7)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card className="col-span-1 border border-blue-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                      <PieChart className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-700">Device Breakdown</CardTitle>
                  </div>
                  <CardDescription className="text-slate-500 font-medium">
                    Email opens by device type
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px] pt-4 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-xl -mt-10 -mr-10 opacity-30"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartsPieChart>
                      {clientData?.deviceData && clientData.deviceData.length > 0 ? (
                        <>
                          <Pie
                            data={clientData.deviceData}
                            cx="50%"
                            cy="50%"
                            labelLine={{stroke: 'rgba(100, 116, 139, 0.3)'}}
                            label={({ name, percent }) => (
                              <text x={0} y={0} fill="#334155" textAnchor="middle" dominantBaseline="central">
                                {`${name}: ${(percent * 100).toFixed(0)}%`}
                              </text>
                            )}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                          >
                            {clientData.deviceData.map((entry: any, index: number) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={[
                                  "#3b82f6", "#2563eb", "#1d4ed8", 
                                  "#f59e0b", "#d97706"
                                ][index % 5]} 
                                stroke="rgba(241, 245, 249, 0.8)"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid rgba(203, 213, 225, 0.5)',
                              borderRadius: '6px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                              color: '#334155'
                            }}
                            labelStyle={{color: '#0369a1', fontWeight: 'bold'}}
                            itemStyle={{color: '#334155'}}
                          />
                        </>
                      ) : (
                        <text 
                          x="50%" 
                          y="50%" 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          fill="#64748b"
                          className="text-sm"
                        >
                          No device data available
                        </text>
                      )}
                    </ReChartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns */}
            <Card className="border border-blue-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-700">Recent Campaigns</CardTitle>
                </div>
                <CardDescription className="text-slate-500 font-medium">
                  Your latest email marketing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full blur-xl -mt-10 -mr-10 opacity-30"></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-slate-700">
                    <thead>
                      <tr className="border-b border-blue-100 bg-blue-50/80">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Campaign</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Opens</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientData.recentCampaigns.map((campaign: any) => (
                        <tr 
                          key={campaign.id} 
                          className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="py-4 px-4 font-medium text-slate-800">
                            {campaign.name}
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            {new Date(campaign.date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                              campaign.status === "Completed" 
                                ? "bg-blue-100 text-blue-800 border border-blue-200" :
                              campaign.status === "Ongoing" 
                                ? "bg-amber-100 text-amber-700 border border-amber-200" :
                              "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-800">
                            {campaign.opens.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-800">
                            {campaign.clicks.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-6 font-medium group">
                    View All Campaigns
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}