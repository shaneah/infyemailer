import { useState } from "react";
import StatsCards from "./StatsCards";
import CampaignsTable from "./CampaignsTable";
import AnalyticsChart from "./AnalyticsChart";
import AudienceGrowth from "./AudienceGrowth";
import QuickActions from "./QuickActions";
import NewCampaignModal from "@/modals/NewCampaignModal";
import ComposeEmailModal from "@/modals/ComposeEmailModal";

const Dashboard = () => {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showComposeEmailModal, setShowComposeEmailModal] = useState(false);

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <button type="button" className="btn btn-sm btn-outline-secondary">Share</button>
            <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
          </div>
          <button 
            type="button" 
            className="btn btn-sm btn-primary"
            onClick={() => setShowNewCampaignModal(true)}
          >
            <i className="bi bi-plus-lg me-1"></i>
            New Campaign
          </button>
        </div>
      </div>

      <StatsCards />
      <CampaignsTable />

      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <AnalyticsChart />
        </div>
        <div className="col-md-4">
          <AudienceGrowth />
        </div>
      </div>

      <QuickActions onCreateEmail={() => setShowComposeEmailModal(true)} />
      
      {showNewCampaignModal && 
        <NewCampaignModal onClose={() => setShowNewCampaignModal(false)} />
      }
      
      {showComposeEmailModal && 
        <ComposeEmailModal onClose={() => setShowComposeEmailModal(false)} />
      }
    </>
  );
};

export default Dashboard;
