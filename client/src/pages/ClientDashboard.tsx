import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Menu, BarChart3, Mail, Users, Bell, Settings, LogOut, ChevronRight, Calendar, BarChart, PieChart, UserPlus, Zap, Award, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardWidgets from "@/components/widgets/DashboardWidgets";
import WidgetManager from "@/components/widgets/WidgetManager";
import { WidgetsProvider } from "@/hooks/useWidgets";
import { Progress } from "@/components/ui/progress";

type ClientDashboardProps = {
  clientId?: string;
  onOpenSidebar?: () => void;
};

export default function ClientDashboard({ onOpenSidebar }: ClientDashboardProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<string>("blue");
  
  // Available theme options
  const themes = {
    blue: {
      primary: "from-blue-600 to-blue-400",
      secondary: "from-indigo-600 to-blue-400",
      accent: "bg-blue-600",
      textAccent: "text-blue-600",
      bgLight: "bg-blue-50",
      borderLight: "border-blue-100",
      hoverLight: "hover:bg-blue-100",
      buttonPrimary: "bg-blue-600 hover:bg-blue-700",
      progressColor: "bg-blue-600"
    },
    purple: {
      primary: "from-purple-600 to-fuchsia-400",
      secondary: "from-indigo-600 to-purple-400",
      accent: "bg-purple-600",
      textAccent: "text-purple-600",
      bgLight: "bg-purple-50",
      borderLight: "border-purple-100",
      hoverLight: "hover:bg-purple-100",
      buttonPrimary: "bg-purple-600 hover:bg-purple-700",
      progressColor: "bg-purple-600"
    },
    teal: {
      primary: "from-teal-600 to-emerald-400",
      secondary: "from-cyan-600 to-teal-400",
      accent: "bg-teal-600",
      textAccent: "text-teal-600",
      bgLight: "bg-teal-50",
      borderLight: "border-teal-100",
      hoverLight: "hover:bg-teal-100",
      buttonPrimary: "bg-teal-600 hover:bg-teal-700",
      progressColor: "bg-teal-600"
    },
    amber: {
      primary: "from-amber-500 to-orange-400",
      secondary: "from-red-500 to-amber-400",
      accent: "bg-amber-500",
      textAccent: "text-amber-500",
      bgLight: "bg-amber-50",
      borderLight: "border-amber-100",
      hoverLight: "hover:bg-amber-100",
      buttonPrimary: "bg-amber-500 hover:bg-amber-600",
      progressColor: "bg-amber-500"
    }
  };
  
  // Use the current selected theme (defaulting to blue)
  const theme = themes[currentTheme as keyof typeof themes];

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
    // First verify server-side session
    const verifySession = async () => {
      try {
        setLoading(true);
        
        // Call server to verify session
        const response = await fetch('/api/client/verify-session', {
          credentials: 'include' // Important for session cookies
        });
        
        if (!response.ok) {
          // Session is invalid, redirect to login
          toast({
            title: "Session expired",
            description: "Please log in again to continue",
            variant: "destructive"
          });
          setLocation('/client-login');
          return false;
        }
        
        const data = await response.json();
        console.log("Session verification response:", data);
        return data.verified;
      } catch (error) {
        console.error("Session verification error:", error);
        toast({
          title: "Authentication error",
          description: "Please log in again to continue",
          variant: "destructive"
        });
        setLocation('/client-login');
        return false;
      }
    };
    
    // Fetch client data after session verification
    const fetchClientData = async () => {
      // First verify session
      const isAuthenticated = await verifySession();
      if (!isAuthenticated) return;
      
      try {
        // Get local client data from storage
        const currentClientUser = getClientUser();
        
        if (!currentClientUser) {
          toast({
            title: "Access denied",
            description: "Please log in to access your dashboard",
            variant: "destructive"
          });
          setLocation('/client-login');
          return;
        }
        
        // Use client data from storage (in a real app, would fetch from API)
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

  const handleLogout = async () => {
    try {
      // Call the server-side logout endpoint
      const response = await fetch('/api/client-logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to logout properly');
      }
      
      // Also clear client-side storage
      sessionStorage.removeItem('clientUser');
      localStorage.removeItem('clientUser');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
      
      // Redirect to login page
      setLocation('/client-login');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if server logout fails, clear client-side storage and redirect
      sessionStorage.removeItem('clientUser');
      localStorage.removeItem('clientUser');
      setLocation('/client-login');
    }
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-white/30 rounded-full animate-ping"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-white font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className={`bg-gradient-to-r ${theme.primary} text-white`}>
            <CardTitle className="text-xl">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-slate-600">There was an error loading your dashboard data. Please try again later.</p>
            <Button 
              onClick={handleLogout} 
              className={`mt-6 ${theme.buttonPrimary} text-white w-full`}
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate campaign status badges with appropriate colors
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">Completed</span>;
      case 'ongoing':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">Ongoing</span>;
      case 'scheduled':
        return <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 font-medium">Scheduled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 font-medium">{status}</span>;
    }
  };

  // Calculate weekly performance for quick stats
  const weeklyPerformance = {
    emails: 2340,
    opens: 748,
    clicks: 186,
    openRate: 32.0,
    clickRate: 8.0,
    growth: 5.2
  };

  return (
    <WidgetsProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Theme Selector Bar */}
        <div className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-sm border-b z-30 py-1.5 px-4 flex justify-end space-x-2">
          <button 
            onClick={() => setCurrentTheme("blue")} 
            className={`h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 ${currentTheme === "blue" ? "ring-2 ring-offset-2 ring-blue-500" : "opacity-70"}`} 
          />
          <button 
            onClick={() => setCurrentTheme("purple")} 
            className={`h-6 w-6 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-400 ${currentTheme === "purple" ? "ring-2 ring-offset-2 ring-purple-500" : "opacity-70"}`} 
          />
          <button 
            onClick={() => setCurrentTheme("teal")} 
            className={`h-6 w-6 rounded-full bg-gradient-to-r from-teal-600 to-emerald-400 ${currentTheme === "teal" ? "ring-2 ring-offset-2 ring-teal-500" : "opacity-70"}`} 
          />
          <button 
            onClick={() => setCurrentTheme("amber")} 
            className={`h-6 w-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 ${currentTheme === "amber" ? "ring-2 ring-offset-2 ring-amber-500" : "opacity-70"}`} 
          />
        </div>

        {/* Header with background gradient and company info */}
        <header className="pt-10 pb-6 px-4 sm:px-6 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-10 z-0"></div>
          
          <div className="relative z-10 container mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="lg:hidden text-gray-700 hover:bg-white/20 hover:text-gray-900"
                  onClick={() => onOpenSidebar ? onOpenSidebar() : null}
                >
                  <Menu size={24} />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome, {clientData.clientName}</h1>
                  <p className="text-gray-600">{clientData.clientCompany}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                  </Button>
                </div>
                
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <Settings size={20} />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto max-w-7xl px-4 sm:px-6 pb-12 relative z-10">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <Card className="shadow-md border-0 overflow-hidden">
              <div className={`h-1 w-full ${theme.accent}`}></div>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
                    <h3 className="text-2xl font-bold mt-1">{clientData.stats.activeCampaigns}</h3>
                  </div>
                  <div className={`p-3 rounded-full ${theme.bgLight}`}>
                    <BarChart3 className={`h-5 w-5 ${theme.textAccent}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs">
                  <span className="text-green-600 font-medium flex items-center">
                    <ChevronRight className="h-3 w-3 rotate-90" />
                    +12% this month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 overflow-hidden">
              <div className={`h-1 w-full ${theme.accent}`}></div>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Emails Sent</p>
                    <h3 className="text-2xl font-bold mt-1">{clientData.stats.totalEmails.toLocaleString()}</h3>
                  </div>
                  <div className={`p-3 rounded-full ${theme.bgLight}`}>
                    <Mail className={`h-5 w-5 ${theme.textAccent}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs">
                  <span className="text-green-600 font-medium flex items-center">
                    <ChevronRight className="h-3 w-3 rotate-90" />
                    {weeklyPerformance.emails.toLocaleString()} this week
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 overflow-hidden">
              <div className={`h-1 w-full ${theme.accent}`}></div>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Open Rate</p>
                    <h3 className="text-2xl font-bold mt-1">{clientData.stats.openRate}%</h3>
                  </div>
                  <div className={`p-3 rounded-full ${theme.bgLight}`}>
                    <BarChart className={`h-5 w-5 ${theme.textAccent}`} />
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={clientData.stats.openRate} className="h-1.5" indicator={theme.progressColor} />
                </div>
                <div className="mt-1.5 flex items-center text-xs">
                  <span className="text-green-600 font-medium flex items-center">
                    <ChevronRight className="h-3 w-3 rotate-90" />
                    Industry avg: 21.5%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 overflow-hidden">
              <div className={`h-1 w-full ${theme.accent}`}></div>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Contacts</p>
                    <h3 className="text-2xl font-bold mt-1">{clientData.stats.contactsCount.toLocaleString()}</h3>
                  </div>
                  <div className={`p-3 rounded-full ${theme.bgLight}`}>
                    <Users className={`h-5 w-5 ${theme.textAccent}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs">
                  <span className="text-green-600 font-medium flex items-center">
                    <ChevronRight className="h-3 w-3 rotate-90" />
                    +{weeklyPerformance.growth}% growth rate
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-5">
              {/* Campaign Performance Chart */}
              <Card className="shadow-md border-0">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">Campaign Performance</CardTitle>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="h-8 text-xs">Weekly</Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs">Monthly</Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs">Yearly</Button>
                    </div>
                  </div>
                  <CardDescription>
                    Open and click metrics for the last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full rounded-md overflow-hidden p-4 flex">
                    <div className="flex-1 flex flex-col justify-end space-y-1">
                      {/* Fake chart bars for visualization */}
                      <div className="grid grid-cols-7 gap-2 h-full items-end">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                          <div key={day} className="flex flex-col items-center space-y-1">
                            <div className="w-full flex flex-col items-center">
                              <div 
                                className={`w-full rounded-t-sm bg-gradient-to-b ${theme.primary} group-hover:opacity-80`} 
                                style={{ height: `${Math.floor(120 + Math.random() * 120)}px` }}
                              ></div>
                              <div 
                                className="w-full rounded-t-sm bg-blue-200" 
                                style={{ height: `${Math.floor(50 + Math.random() * 60)}px` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 px-6 flex justify-between items-center border-t">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className={`h-3 w-3 rounded-sm ${theme.accent}`}></div>
                      <span className="text-xs text-gray-500">Opens</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="h-3 w-3 rounded-sm bg-blue-200"></div>
                      <span className="text-xs text-gray-500">Clicks</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Opens: <span className="font-bold">{weeklyPerformance.opens}</span> | 
                    Clicks: <span className="font-bold">{weeklyPerformance.clicks}</span>
                  </div>
                </CardFooter>
              </Card>
              
              {/* Recent Campaigns */}
              <Card className="shadow-md border-0">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">Recent Campaigns</CardTitle>
                    <Button variant="outline" size="sm" className="h-8">View All</Button>
                  </div>
                  <CardDescription>
                    Your latest email marketing campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opens</th>
                          <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                          <th className="py-3 px-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {clientData.recentCampaigns.map((campaign: any) => (
                          <tr key={campaign.id} className="hover:bg-gray-50">
                            <td className="py-4 px-2 text-sm font-medium text-gray-900">{campaign.name}</td>
                            <td className="py-4 px-2 text-sm text-gray-500">{campaign.date}</td>
                            <td className="py-4 px-2">{getStatusBadge(campaign.status)}</td>
                            <td className="py-4 px-2 text-sm text-gray-700">{campaign.opens > 0 ? campaign.opens.toLocaleString() : '-'}</td>
                            <td className="py-4 px-2 text-sm text-gray-700">{campaign.clicks > 0 ? campaign.clicks.toLocaleString() : '-'}</td>
                            <td className="py-4 px-2 text-center">
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">View</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-4 space-y-5">
              {/* Upcoming Tasks */}
              <Card className="shadow-md border-0">
                <CardHeader className={`py-4 bg-gradient-to-r ${theme.secondary} text-white`}>
                  <CardTitle className="text-base font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2" /> 
                    Upcoming Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-white border rounded-md shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">Spring Campaign Review</h4>
                          <p className="text-xs text-gray-500 mt-1">Due tomorrow at 3:00 PM</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 font-medium">Urgent</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white border rounded-md shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">Segment Summer Mailing List</h4>
                          <p className="text-xs text-gray-500 mt-1">Due in 3 days</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 font-medium">Medium</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white border rounded-md shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">Update Email Templates</h4>
                          <p className="text-xs text-gray-500 mt-1">Due next week</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">Low</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4">
                  <Button variant="outline" size="sm" className="w-full">View All Tasks</Button>
                </CardFooter>
              </Card>
              
              {/* Device Breakdown */}
              <Card className="shadow-md border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold">Audience Devices</CardTitle>
                  <CardDescription>
                    How your subscribers are reading emails
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex justify-center py-3">
                    <div className="w-36 h-36 rounded-full border-8 border-gray-100 relative flex items-center justify-center">
                      {/* Simplified pie chart for visual */}
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className={`absolute top-0 right-0 left-0 bottom-0 ${theme.accent} transform origin-bottom-left rotate-[162deg]`}></div>
                        <div className="absolute top-0 right-0 left-0 bottom-0 bg-green-500 transform origin-bottom-left rotate-[72deg]"></div>
                        <div className="absolute top-0 right-0 left-0 bottom-0 bg-amber-500 transform origin-bottom-left rotate-0"></div>
                      </div>
                      <div className="w-[calc(100%-16px)] h-[calc(100%-16px)] rounded-full bg-white flex items-center justify-center">
                        <PieChart className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 mt-4 gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold">{clientData.deviceData[0].value}%</span>
                      <div className="flex items-center mt-1">
                        <div className={`h-2 w-2 rounded-full ${theme.accent} mr-1`}></div>
                        <span className="text-xs text-gray-500">Mobile</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold">{clientData.deviceData[1].value}%</span>
                      <div className="flex items-center mt-1">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                        <span className="text-xs text-gray-500">Desktop</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold">{clientData.deviceData[2].value}%</span>
                      <div className="flex items-center mt-1">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
                        <span className="text-xs text-gray-500">Tablet</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card className="shadow-md border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center">
                      <UserPlus className="h-5 w-5 mb-1" />
                      <span className="text-xs">Add Contact</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center">
                      <Mail className="h-5 w-5 mb-1" />
                      <span className="text-xs">New Campaign</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center">
                      <Target className="h-5 w-5 mb-1" />
                      <span className="text-xs">Segment Audience</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center">
                      <Award className="h-5 w-5 mb-1" />
                      <span className="text-xs">View Reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* AI Recommendations */}
              <Card className="shadow-md border-0 bg-gradient-to-br from-slate-800 to-slate-950 text-white">
                <CardHeader className="pb-2 border-b border-white/10">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-yellow-400" /> 
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 pb-4 space-y-3">
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-medium flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 mr-1.5"></span>
                      Send Time Optimization
                    </h4>
                    <p className="text-xs text-white/70">Schedule your emails for Tuesday at 10am for 18% higher open rates.</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-medium flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 mr-1.5"></span>
                      Subject Line Suggestion
                    </h4>
                    <p className="text-xs text-white/70">Using emojis in subject lines could improve your open rates by 15%.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Advanced Widgets Section */}
          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Advanced Analytics</h2>
              <WidgetManager />
            </div>
            
            <DashboardWidgets clientData={clientData} />
          </div>
        </main>
      </div>
    </WidgetsProvider>
  );
}