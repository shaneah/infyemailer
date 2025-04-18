import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Share } from "lucide-react";
import NewCampaignModal from "@/modals/NewCampaignModal";
import ComposeEmailModal from "@/modals/ComposeEmailModal";
import { WidgetsProvider } from "@/hooks/useWidgets";
import DashboardWidgets from "@/components/widgets/DashboardWidgets";
import WidgetManager from "@/components/widgets/WidgetManager";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

const Dashboard = () => {
  const { user } = useAuth();
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showComposeEmailModal, setShowComposeEmailModal] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch necessary data for dashboard widgets
  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch dashboard stats: ${errorText}`);
      }
      return await response.json();
    }
  });

  // Prepare client data for widgets
  useEffect(() => {
    // Only proceed if we have stats data and not in loading state
    if (!isLoadingStats) {
      if (statsData) {
        // Use the real stats data from the API
        setClientData({
          stats: statsData,
          // We still need to handle the performance and device data
          // In a real app, these would come from APIs too, but we'll
          // just use this as placeholder UI until those APIs are implemented
          performanceData: [],
          deviceData: []
        });
      } else if (statsError) {
        // If there's an error, we don't set client data but we do stop loading
        console.error('Error loading dashboard data:', statsError);
      }
      // Whether we have data or an error, we're no longer loading
      setLoading(false);
    }
  }, [isLoadingStats, statsData, statsError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 relative">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200/30 rounded-full animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="ml-4 text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <WidgetsProvider isAdmin={true} userId={user?.id}>
      <div className="container mx-auto px-4">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 mb-6 border-b">
          <h1 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowNewCampaignModal(true)}
            >
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </Button>
          </div>
        </div>

        {/* Widget Management Controls */}
        <div className="mb-6 flex justify-end">
          <WidgetManager clientData={clientData} />
        </div>
        
        {/* Customizable Dashboard Widgets */}
        <DashboardWidgets clientData={clientData} />
        
        {/* Modals */}
        {showNewCampaignModal && 
          <NewCampaignModal onClose={() => setShowNewCampaignModal(false)} />
        }
        
        {showComposeEmailModal && 
          <ComposeEmailModal onClose={() => setShowComposeEmailModal(false)} />
        }
      </div>
    </WidgetsProvider>
  );
};

export default Dashboard;
