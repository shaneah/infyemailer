import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const CampaignsTable = () => {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['/api/campaigns'],
  });

  if (isLoading) {
    return (
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Campaigns</h5>
          <a href="#" className="btn btn-sm btn-link text-decoration-none">View all</a>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Campaign</th>
                <th scope="col">Status</th>
                <th scope="col">Recipients</th>
                <th scope="col">Open Rate</th>
                <th scope="col">Click Rate</th>
                <th scope="col">Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, index) => (
                <tr key={index}>
                  <td>
                    <div className="d-flex align-items-center">
                      <Skeleton className="h-10 w-10 rounded mr-2"/>
                      <div>
                        <Skeleton className="h-5 w-32 mb-1"/>
                        <Skeleton className="h-4 w-24"/>
                      </div>
                    </div>
                  </td>
                  <td><Skeleton className="h-6 w-16"/></td>
                  <td><Skeleton className="h-5 w-12"/></td>
                  <td><Skeleton className="h-5 w-24"/></td>
                  <td><Skeleton className="h-5 w-24"/></td>
                  <td><Skeleton className="h-5 w-24"/></td>
                  <td><Skeleton className="h-8 w-24"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Recent Campaigns</h5>
        <a href="#" className="btn btn-sm btn-link text-decoration-none">View all</a>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col">Campaign</th>
              <th scope="col">Status</th>
              <th scope="col">Recipients</th>
              <th scope="col">Open Rate</th>
              <th scope="col">Click Rate</th>
              <th scope="col">Date</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns?.map((campaign) => (
              <tr key={campaign.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className={`bg-${campaign.icon.color} bg-opacity-10 p-2 rounded me-2`}>
                      <i className={`bi bi-${campaign.icon.name} text-${campaign.icon.color}`}></i>
                    </div>
                    <div>
                      <div className="fw-semibold">{campaign.name}</div>
                      <small className="text-muted">{campaign.subtitle}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge bg-${campaign.status.color}`}>
                    {campaign.status.label}
                  </span>
                </td>
                <td>{campaign.recipients.toLocaleString()}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="me-2">{campaign.openRate}%</div>
                    <div className="progress flex-grow-1" style={{ height: '5px', width: '80px' }}>
                      <div className="progress-bar bg-success" role="progressbar" style={{ width: `${campaign.openRate}%` }}></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="me-2">{campaign.clickRate}%</div>
                    <div className="progress flex-grow-1" style={{ height: '5px', width: '80px' }}>
                      <div className="progress-bar bg-info" role="progressbar" style={{ width: `${campaign.clickRate}%` }}></div>
                    </div>
                  </div>
                </td>
                <td>{campaign.date}</td>
                <td>
                  <div className="btn-group">
                    <button type="button" className="btn btn-sm btn-outline-secondary">
                      {campaign.status.label === 'Scheduled' ? 'Edit' : 'View'}
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle dropdown-toggle-split">
                      <span className="visually-hidden">Toggle Dropdown</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignsTable;
