import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardWidgets from "@/components/widgets/DashboardWidgets";
import WidgetManager from "@/components/widgets/WidgetManager";
import { Widget, WidgetsProvider, defaultWidgets } from "@/hooks/useWidgets";
import DynamicWelcomeMessage from "@/components/DynamicWelcomeMessage";

type ClientDashboardProps = {
  clientId?: string;
  onOpenSidebar?: () => void;
};

export default function ClientDashboard({ onOpenSidebar }: ClientDashboardProps) {
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
          setLocation('/login');
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
          setLocation('/login');
          return;
        }
        
        // Use client data from storage with proper naming
        setClientData({
          clientName: currentClientUser.firstName || 'Client User',
          clientCompany: currentClientUser.email?.split('@')[1]?.split('.')[0] || 'Company',
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
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if server logout fails, clear client-side storage and redirect
      sessionStorage.removeItem('clientUser');
      localStorage.removeItem('clientUser');
      setLocation('/login');
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
      <div className="flex min-h-screen bg-white">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border-b border-gray-200">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="lg"
                className="lg:hidden text-gray-700 hover:bg-gray-100 mr-2"
                onClick={() => onOpenSidebar ? onOpenSidebar() : null}
              >
                <Menu size={24} />
              </Button>
              <h1 className="text-xl font-semibold text-purple-800">Dashboard</h1>
            </div>
            
            <div className="flex items-center mt-2 sm:mt-0">
              {clientData && (
                <div className="bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                  <DynamicWelcomeMessage 
                    clientName={clientData.clientName} 
                    className="text-purple-800"
                  />
                </div>
              )}
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6 relative z-10 bg-white">
            <div className="container mx-auto">
              {/* Widget Management Controls */}
              <div className="mb-4 flex justify-end">
                <WidgetManager />
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