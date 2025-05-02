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

const Dashboard = () => {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showComposeEmailModal, setShowComposeEmailModal] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2 mr-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
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
