import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define campaign type
interface Campaign {
  id: number;
  name: string;
  subtitle: string;
  icon: {
    name: string;
    color: string;
  };
  status: {
    label: string;
    color: string;
  };
  recipients: number;
  openRate: number;
  clickRate: number;
  date: string;
}

const CampaignsTable = () => {
  const { toast } = useToast();
  const { data: campaigns = [], isLoading, isError, refetch } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
    staleTime: 10000, // Reduce stale time to 10 seconds
    retry: 2, // Retry failed requests
    refetchOnWindowFocus: true
  });
  
  // For debugging purposes - log the campaigns data
  console.log("Campaigns data:", campaigns);
  
  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      await apiRequest('DELETE', `/api/campaigns/${campaignId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: "Campaign deleted",
        description: "The campaign has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete campaign: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="card card-luxury mb-4 shadow-gold-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-[#1a3a5f] font-medium">Recent Campaigns</h5>
          <div className="btn-outline-gold text-sm px-3 py-1 rounded">View all</div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-luxury w-full">
            <thead>
              <tr>
                <th className="w-1/4">Campaign</th>
                <th className="w-1/12">Status</th>
                <th className="w-1/12">Recipients</th>
                <th className="w-1/8">Open Rate</th>
                <th className="w-1/8">Click Rate</th>
                <th className="w-1/8">Date</th>
                <th className="w-1/8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, index) => (
                <tr key={index}>
                  <td>
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded mr-2"/>
                      <div>
                        <Skeleton className="h-5 w-32 mb-1"/>
                        <Skeleton className="h-4 w-24"/>
                      </div>
                    </div>
                  </td>
                  <td><Skeleton className="h-6 w-16 rounded-full"/></td>
                  <td><Skeleton className="h-5 w-12"/></td>
                  <td>
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-10 mr-2"/>
                      <Skeleton className="h-2 w-20 rounded-full"/>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-10 mr-2"/>
                      <Skeleton className="h-2 w-20 rounded-full"/>
                    </div>
                  </td>
                  <td><Skeleton className="h-5 w-24"/></td>
                  <td className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-8 w-16 rounded"/>
                      <Skeleton className="h-8 w-8 rounded"/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-luxury mb-4 shadow-gold-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-[#1a3a5f] font-medium">Recent Campaigns</h5>
        <a href="#" className="btn-outline-gold text-sm px-3 py-1 rounded hover:shadow-gold-sm transition-all">View all</a>
      </div>
      <div className="overflow-x-auto">
        <table className="table-luxury w-full">
          <thead>
            <tr>
              <th className="w-1/4">Campaign</th>
              <th className="w-1/12">Status</th>
              <th className="w-1/12">Recipients</th>
              <th className="w-1/8">Open Rate</th>
              <th className="w-1/8">Click Rate</th>
              <th className="w-1/8">Date</th>
              <th className="w-1/8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>
                  <div className="flex items-center">
                    <div className={`bg-opacity-10 p-2 rounded mr-2 bg-[#1a3a5f]`}>
                      <i className={`bi bi-${campaign.icon.name} text-[#1a3a5f]`}></i>
                    </div>
                    <div>
                      <div className="font-medium text-[#1a3a5f]">{campaign.name}</div>
                      <div className="text-xs text-gray-500">{campaign.subtitle}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-opacity-15 
                    ${campaign.status.color === 'success' ? 'bg-green-100 text-green-800' : 
                     campaign.status.color === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                     campaign.status.color === 'danger' ? 'bg-red-100 text-red-800' : 
                     campaign.status.color === 'info' ? 'bg-blue-100 text-blue-800' : 
                     'bg-gray-100 text-gray-800'}`}>
                    {campaign.status.label}
                  </span>
                </td>
                <td>
                  <span className="font-medium">{campaign.recipients.toLocaleString()}</span>
                </td>
                <td>
                  <div className="flex items-center">
                    <div className="mr-2 font-medium">{campaign.openRate}%</div>
                    <div className="bg-gray-200 h-1.5 rounded-full flex-grow max-w-[80px]">
                      <div 
                        className="h-full rounded-full bg-[#d4af37]" 
                        style={{ width: `${campaign.openRate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center">
                    <div className="mr-2 font-medium">{campaign.clickRate}%</div>
                    <div className="bg-gray-200 h-1.5 rounded-full flex-grow max-w-[80px]">
                      <div 
                        className="h-full rounded-full bg-[#1a3a5f]" 
                        style={{ width: `${campaign.clickRate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td>{campaign.date}</td>
                <td className="text-right">
                  <div className="flex justify-end space-x-2">
                    <a 
                      href={`/template-builder/${campaign.id}`} 
                      className="btn-outline-gold text-xs px-2 py-1 rounded inline-flex items-center"
                    >
                      <span>{campaign.status.label === 'Scheduled' || campaign.status.label === 'Draft' ? 'Edit' : 'View'}</span>
                    </a>
                    <div className="relative group">
                      <button 
                        type="button" 
                        className="btn-outline-gold text-xs px-2 py-1 rounded inline-flex items-center"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-gold-lg border border-gray-200 hidden group-hover:block z-10">
                        <ul className="py-1">
                          <li>
                            <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" href={`/campaigns/${campaign.id}`}>
                              <i className="bi bi-bar-chart mr-2"></i> View Analytics
                            </a>
                          </li>
                          <li>
                            <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" href={`/template-builder/${campaign.id}`}>
                              <i className="bi bi-pencil mr-2"></i> Edit Campaign
                            </a>
                          </li>
                          <li>
                            <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" href="#" onClick={(e) => {
                              e.preventDefault();
                              window.confirm('Do you want to duplicate this campaign?');
                            }}>
                              <i className="bi bi-files mr-2"></i> Duplicate
                            </a>
                          </li>
                          <li className="border-t border-gray-200">
                            <a 
                              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100" 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
                                  deleteCampaignMutation.mutate(campaign.id);
                                }
                              }}
                            >
                              <i className="bi bi-trash mr-2"></i> Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
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
