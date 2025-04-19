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
      <div className="min-h-screen flex flex-col bg-white">
        <div className="container mx-auto px-4 py-4 flex-1">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 mb-6 border-b border-slate-100">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-sm bg-blue-800 flex items-center justify-center text-white mr-3">
                <span className="font-bold">EM</span>
              </div>
              <h1 className="text-xl font-semibold text-blue-800">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <Button 
                variant="default" 
                size="sm"
                className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800"
                onClick={() => setShowNewCampaignModal(true)}
              >
                <Plus className="h-4 w-4" />
                <span>New Campaign</span>
              </Button>
            </div>
          </div>

          {/* Simple Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-500 mb-1">Active Campaigns</h3>
              <p className="text-2xl font-bold text-blue-800">{statsData?.activeCampaigns || 0}</p>
            </div>
            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-500 mb-1">Total Emails Sent</h3>
              <p className="text-2xl font-bold text-blue-800">{statsData?.totalEmails || 0}</p>
            </div>
            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-500 mb-1">Average Open Rate</h3>
              <p className="text-2xl font-bold text-blue-800">{statsData?.openRate || 0}%</p>
            </div>
          </div>
          
          {/* Simplified Widget Section */}
          <div className="mb-6">
            <h2 className="text-base font-medium text-slate-700 mb-3">Campaign Performance</h2>
            <DashboardWidgets clientData={clientData} />
          </div>
          
          {/* Modals */}
          {showNewCampaignModal && 
            <NewCampaignModal onClose={() => setShowNewCampaignModal(false)} />
          }
          
          {showComposeEmailModal && 
            <ComposeEmailModal onClose={() => setShowComposeEmailModal(false)} />
          }
        </div>
        
        {/* Footer */}
        <footer className="py-3 px-6 bg-white border-t border-slate-100">
          <div className="container mx-auto flex justify-between items-center text-xs text-slate-400">
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
