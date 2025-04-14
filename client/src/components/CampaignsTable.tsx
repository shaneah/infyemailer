import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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
      <div className="rounded-lg border shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Recent Campaigns</h3>
          <div className="text-sm px-3 py-1.5 rounded-md border bg-white">
            View all
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Campaign</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Recipients</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Open Rate</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Click Rate</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Date</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...Array(4)].map((_, index) => (
                <tr key={index}>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-md mr-3"/>
                      <div>
                        <Skeleton className="h-5 w-32 mb-1"/>
                        <Skeleton className="h-3 w-24"/>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-6 w-20 rounded-full"/>
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-5 w-12"/>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-10 mr-2"/>
                      <Skeleton className="h-1.5 w-24 rounded-full"/>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-10 mr-2"/>
                      <Skeleton className="h-1.5 w-24 rounded-full"/>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-5 w-24"/>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center space-x-2">
                      <Skeleton className="h-9 w-20 rounded-md"/>
                      <Skeleton className="h-9 w-9 rounded-md"/>
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
    <div className="rounded-lg border shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h3 className="text-lg font-semibold">Recent Campaigns</h3>
        <Link href="/campaigns" className="text-sm px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 transition-colors">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Campaign</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Recipients</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Open Rate</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Click Rate</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-500">Date</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{campaign.name}</div>
                      <div className="text-xs text-slate-500">{campaign.subtitle || 'Email campaign'}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block
                    ${campaign.status.color === 'success' ? 'bg-green-100 text-green-800' : 
                     campaign.status.color === 'warning' ? 'bg-amber-100 text-amber-800' : 
                     campaign.status.color === 'danger' ? 'bg-red-100 text-red-800' : 
                     campaign.status.color === 'info' ? 'bg-blue-100 text-blue-800' :
                     campaign.status.color === 'primary' ? 'bg-indigo-100 text-indigo-800' : 
                     'bg-slate-100 text-slate-800'}`}>
                    {campaign.status.label}
                  </span>
                </td>
                <td className="py-4 px-6 font-medium text-slate-700">
                  {campaign.recipients.toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <span className="font-medium text-slate-900 mr-2">{campaign.openRate}%</span>
                    <div className="bg-slate-200 h-1.5 rounded-full w-24">
                      <div 
                        className="h-full rounded-full bg-blue-500" 
                        style={{ width: `${Math.min(100, campaign.openRate)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <span className="font-medium text-slate-900 mr-2">{campaign.clickRate}%</span>
                    <div className="bg-slate-200 h-1.5 rounded-full w-24">
                      <div 
                        className="h-full rounded-full bg-indigo-500" 
                        style={{ width: `${Math.min(100, campaign.clickRate)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-700">
                  {campaign.date}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="inline-flex items-center space-x-2">
                    <Link 
                      href={`/campaigns/${campaign.id}`} 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View
                    </Link>
                    <div className="relative inline-block text-left group">
                      <button 
                        type="button" 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                      </button>
                      <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10 divide-y divide-gray-100">
                        <div className="py-1">
                          <Link 
                            href={`/campaigns/${campaign.id}`} 
                            className="group flex items-center px-4 py-2 text-sm hover:bg-slate-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 9.88V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path>
                              <polygon points="11 15 15 20 20 15"></polygon>
                              <line x1="15" y1="9" x2="15" y2="20"></line>
                            </svg>
                            Analytics
                          </Link>
                          <Link 
                            href={`/campaigns/${campaign.id}/edit`} 
                            className="group flex items-center px-4 py-2 text-sm hover:bg-slate-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                          </Link>
                          <button 
                            className="group flex w-full items-center px-4 py-2 text-sm hover:bg-slate-50"
                            onClick={(e) => {
                              e.preventDefault();
                              window.confirm('Do you want to duplicate this campaign?');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Duplicate
                          </button>
                        </div>
                        <div className="py-1">
                          <button 
                            className="group flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-slate-50"
                            onClick={(e) => {
                              e.preventDefault();
                              if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
                                deleteCampaignMutation.mutate(campaign.id);
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Delete
                          </button>
                        </div>
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
