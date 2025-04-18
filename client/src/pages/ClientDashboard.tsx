import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ClientSidebar from "@/components/ClientSidebar";
import DashboardWidgets from "@/components/widgets/DashboardWidgets";
import WidgetManager from "@/components/widgets/WidgetManager";
import { Widget, WidgetsProvider, defaultWidgets } from "@/hooks/useWidgets";

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
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-md border border-purple-200">
          <CardHeader className="bg-purple-50 border-b border-purple-100">
            <CardTitle className="text-xl text-purple-800">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-slate-600">There was an error loading your dashboard data. Please try again later.</p>
            <Button 
              onClick={handleLogout} 
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <WidgetsProvider>
      <div className="flex flex-col overflow-hidden min-h-screen bg-white">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Header */}
          <header className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-md">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="lg"
                className="lg:hidden text-white hover:bg-blue-700/50 mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </Button>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
                <p className="text-sm text-blue-100 mt-0.5">Overview & Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {clientData && (
                <div className="flex items-center bg-blue-800/50 rounded-full px-4 py-2 border border-blue-700/50">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></div>
                  <span className="text-sm text-blue-50">
                    Welcome, <span className="font-medium">{clientData.clientName}</span>
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto relative z-10 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto py-6 px-4">
              {/* Page introduction */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-300">Your Email Marketing at a Glance</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      Track performance metrics and visualize campaign results
                    </p>
                  </div>
                  {/* Widget Management Controls */}
                  <div className="flex items-center">
                    <WidgetManager clientData={clientData} />
                  </div>
                </div>
                
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-800 to-blue-400 rounded-full opacity-70"></div>
              </div>
              
              {/* Customizable Dashboard Widgets */}
              <DashboardWidgets clientData={clientData} />
            </div>
          </main>
        </div>
      </div>
    </WidgetsProvider>
  );
}