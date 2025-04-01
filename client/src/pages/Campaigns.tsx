import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CampaignsTable from "@/components/CampaignsTable";
import NewCampaignModal from "@/modals/NewCampaignModal";
import { Skeleton } from "@/components/ui/skeleton";

export default function Campaigns() {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const { data: campaignStats, isLoading } = useQuery({
    queryKey: ['/api/campaigns/stats'],
  });

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Campaigns</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <button type="button" className="btn btn-sm btn-outline-secondary">Filter</button>
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

      <div className="row g-3 mb-4">
        {isLoading ? (
          [...Array(4)].map((_, index) => (
            <div className="col-md-3" key={index}>
              <div className="card hover-card h-100">
                <div className="card-body">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <div className="d-flex align-items-center">
                    <Skeleton className="h-8 w-24 me-2" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-4 w-40 mt-2" />
                </div>
              </div>
            </div>
          ))
        ) : (
          campaignStats?.map((stat) => (
            <div className="col-md-3" key={stat.id}>
              <div className="card hover-card h-100">
                <div className="card-body">
                  <h6 className="card-title text-muted fw-normal">{stat.title}</h6>
                  <div className="d-flex align-items-center">
                    <div className="fs-2 fw-bold me-2">{stat.value}</div>
                    {stat.change && (
                      <span className={`badge bg-${stat.change.color} rounded-pill`}>{stat.change.value}</span>
                    )}
                  </div>
                  <small className="text-muted">{stat.description}</small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CampaignsTable />

      {showNewCampaignModal && (
        <NewCampaignModal onClose={() => setShowNewCampaignModal(false)} />
      )}
    </>
  );
}
