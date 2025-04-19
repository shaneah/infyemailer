import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Share } from "lucide-react";
import NewCampaignModal from "@/modals/NewCampaignModal";
import ComposeEmailModal from "@/modals/ComposeEmailModal";
import { WidgetsProvider } from "@/hooks/useWidgets";
import DashboardWidgets from "@/components/widgets/DashboardWidgets";
import WidgetManager from "@/components/widgets/WidgetManager";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showComposeEmailModal, setShowComposeEmailModal] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch necessary data for dashboard widgets
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
          return {
            activeCampaigns: 5,
            totalEmails: 48250,
            openRate: 23.7,
            clickRate: 4.2,
            contactsCount: 5278
          };
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
        return {
          activeCampaigns: 5,
          totalEmails: 48250,
          openRate: 23.7,
          clickRate: 4.2,
          contactsCount: 5278
        };
      }
    }
  });

  // Prepare client data for widgets
  useEffect(() => {
    if (!isLoadingStats && statsData) {
      setClientData({
        stats: statsData,
        performanceData: [
          { name: "Jan", opens: 68, clicks: 14 },
          { name: "Feb", opens: 72, clicks: 16 },
          { name: "Mar", opens: 85, clicks: 18 },
          { name: "Apr", opens: 92, clicks: 21 },
          { name: "May", opens: 78, clicks: 17 },
          { name: "Jun", opens: 82, clicks: 19 }
        ],
        deviceData: [
          { name: "Mobile", value: 48 },
          { name: "Desktop", value: 38 },
          { name: "Tablet", value: 14 }
        ]
      });
      setLoading(false);
    }
  }, [isLoadingStats, statsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 relative">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="ml-4 text-slate-700 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <WidgetsProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="container mx-auto px-4 py-6 flex-1">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 mb-6 border-b border-slate-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-sm bg-blue-900 flex items-center justify-center text-white mr-3 shadow-sm">
                <span className="font-bold">EM</span>
              </div>
              <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm" className="flex items-center gap-1 border-slate-200 text-slate-600 hover:bg-slate-100">
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 border-slate-200 text-slate-600 hover:bg-slate-100">
                <FileText className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button 
                variant="default" 
                size="sm"
                className="flex items-center gap-1 bg-blue-800 hover:bg-blue-900 shadow-sm"
                onClick={() => setShowNewCampaignModal(true)}
              >
                <Plus className="h-4 w-4" />
                <span>New Campaign</span>
              </Button>
            </div>
          </div>

          {/* Welcome Banner */}
          <div className="bg-blue-900 rounded-md shadow-sm mb-8 p-5 text-white">
            <h2 className="text-lg font-semibold mb-2">Welcome to Your Email Marketing Dashboard</h2>
            <p className="opacity-90 max-w-2xl text-sm">Track performance metrics, manage campaigns, and optimize your email marketing strategy all in one place.</p>
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
        
        {/* Footer */}
        <footer className="py-3 px-6 bg-white border-t border-slate-200">
          <div className="container mx-auto flex justify-between items-center text-xs text-slate-500">
            <div>Email Marketing Platform © 2025</div>
            <div className="flex items-center gap-4">
              <span>Help</span>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </footer>
      </div>
    </WidgetsProvider>
  );
};

export default Dashboard;
