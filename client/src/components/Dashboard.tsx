import { useState } from "react";
import StatsCards from "./StatsCards";
import CampaignsTable from "./CampaignsTable";
import AnalyticsChart from "./AnalyticsChart";
import AudienceGrowth from "./AudienceGrowth";
import QuickActions from "./QuickActions";
import NewCampaignModal from "@/modals/NewCampaignModal";
import ComposeEmailModal from "@/modals/ComposeEmailModal";
import { Button } from "@/components/ui/button";
import { Plus, Share, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showComposeEmailModal, setShowComposeEmailModal] = useState(false);
  const { toast } = useToast();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2 mr-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => {
                // Create a shareable URL with dashboard state
                const shareUrl = window.location.href;
                
                // Copy to clipboard
                navigator.clipboard.writeText(shareUrl)
                  .then(() => {
                    toast({
                      title: "Dashboard URL copied",
                      description: "Share link has been copied to your clipboard.",
                      duration: 3000,
                    });
                  })
                  .catch(err => {
                    console.error('Failed to copy URL: ', err);
                    toast({
                      title: "Failed to copy URL",
                      description: "Please try again or copy manually.",
                      variant: "destructive",
                      duration: 3000,
                    });
                  });
              }}
            >
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => {
                try {
                  // Create sample data for export
                  const data = [
                    {
                      campaign: 'Monthly Newsletter',
                      sent: 12483,
                      openRate: '46.2%',
                      clickRate: '21.8%',
                      date: 'May 15, 2023'
                    },
                    {
                      campaign: 'Subject Line Testing',
                      sent: 5000,
                      openRate: '38.5%',
                      clickRate: '12.3%',
                      date: 'April 25, 2025'
                    },
                    {
                      campaign: 'Email Design Testing',
                      sent: 3500,
                      openRate: '42.1%',
                      clickRate: '15.7%',
                      date: 'April 30, 2025'
                    }
                  ];

                  // Create workbook and worksheet
                  const wb = XLSX.utils.book_new();
                  const ws = XLSX.utils.json_to_sheet(data);
                  
                  // Add worksheet to workbook
                  XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
                  
                  // Generate file and trigger download
                  XLSX.writeFile(wb, 'dashboard-report.xlsx');
                  
                  toast({
                    title: "Export successful",
                    description: "Dashboard data has been exported to Excel.",
                    duration: 3000,
                  });
                } catch (error) {
                  console.error('Export failed:', error);
                  toast({
                    title: "Export failed",
                    description: "There was an issue exporting the dashboard data.",
                    variant: "destructive",
                    duration: 3000,
                  });
                }
              }}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
          <Button 
            size="sm"
            onClick={() => setShowNewCampaignModal(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Campaign</span>
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <StatsCards />
      </div>
      
      <div className="mb-8">
        <CampaignsTable />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
        <div className="md:col-span-8">
          <AnalyticsChart />
        </div>
        <div className="md:col-span-4">
          <AudienceGrowth />
        </div>
      </div>

      <div className="mb-8">
        <QuickActions onCreateEmail={() => setShowComposeEmailModal(true)} />
      </div>
      
      {showNewCampaignModal && 
        <NewCampaignModal onClose={() => setShowNewCampaignModal(false)} />
      }
      
      {showComposeEmailModal && 
        <ComposeEmailModal onClose={() => setShowComposeEmailModal(false)} />
      }
    </div>
  );
};

export default Dashboard;
