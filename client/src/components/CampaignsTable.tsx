import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Define campaign type
interface Campaign {
  id: number;
  name: string;
  status: string;
  metadata?: {
    subtitle?: string;
    icon?: {
      name: string;
      color: string;
    };
    recipients?: number;
    openRate?: number;
    clickRate?: number;
    date?: string;
  };
}

const CampaignsTable = () => {
  const { toast } = useToast();
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { data: campaigns = [], isLoading, isError, refetch } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
    staleTime: 10000, // Reduce stale time to 10 seconds
    retry: 2, // Retry failed requests
    refetchOnWindowFocus: true
  });
  
  // For debugging purposes - log the campaigns data
  console.log("Campaigns data:", campaigns);
  
  // Function to toggle a dropdown
  const toggleDropdown = (campaignId: number) => {
    if (activeDropdown === campaignId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(campaignId);
    }
  };
  
  // Add click outside handler to close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close dropdown when clicking outside the dropdown
      if (activeDropdown !== null) {
        const target = event.target as Node;
        const buttons = document.querySelectorAll('.action-button');
        let clickedOnButton = false;
        
        // Check if click was on any action button
        buttons.forEach(button => {
          if (button.contains(target)) {
            clickedOnButton = true;
          }
        });
        
        // If not clicking on button or dropdown content, close dropdown
        const dropdowns = document.querySelectorAll('.campaign-actions-dropdown');
        let clickedInDropdown = false;
        
        dropdowns.forEach(dropdown => {
          if (dropdown.contains(target)) {
            clickedInDropdown = true;
          }
        });
        
        if (!clickedOnButton && !clickedInDropdown) {
          setActiveDropdown(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);
  
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
      <div>
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Recent Campaigns
          </h3>
          <div className="text-sm px-4 py-2 rounded-md border border-blue-200 bg-white shadow-sm flex items-center gap-1">
            View all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Campaign</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Recipients</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Open Rate</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Click Rate</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...Array(4)].map((_, index) => (
                <tr key={index}>
                  <td className="py-5 px-6">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full mr-4"/>
                      <div>
                        <Skeleton className="h-5 w-32 mb-1"/>
                        <Skeleton className="h-3 w-24"/>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <Skeleton className="h-7 w-24 rounded-full"/>
                  </td>
                  <td className="py-5 px-6">
                    <Skeleton className="h-5 w-16"/>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-10 mr-3"/>
                      <Skeleton className="h-2 w-28 rounded-full"/>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-10 mr-3"/>
                      <Skeleton className="h-2 w-28 rounded-full"/>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <Skeleton className="h-5 w-24"/>
                  </td>
                  <td className="py-5 px-6 text-right">
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
    <div>
      <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Recent Campaigns
        </h3>
        <Link href="/campaigns" className="text-sm px-4 py-2 rounded-md border border-blue-200 bg-white hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1 cursor-pointer">
          View all
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Campaign</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Recipients</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Open Rate</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Click Rate</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="py-5 px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mr-4 shadow-sm border border-blue-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{campaign.name}</div>
                      <div className="text-xs text-gray-500">{campaign.metadata?.subtitle || 'Email campaign'}</div>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-6">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium inline-block
                    ${campaign.status === 'active' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' : 
                     campaign.status === 'scheduled' ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200' : 
                     campaign.status === 'failed' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200' : 
                     campaign.status === 'draft' ? 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border border-blue-200' :
                     campaign.status === 'sent' ? 'bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-800 border border-indigo-200' : 
                     'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border border-slate-200'}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </td>
                <td className="py-5 px-6 font-medium text-gray-700">
                  {campaign.metadata?.recipients?.toLocaleString() || '0'}
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 mr-3">{campaign.metadata?.openRate || 0}%</span>
                    <div className="bg-gray-200 h-2 rounded-full w-28">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" 
                        style={{ width: `${Math.min(100, campaign.metadata?.openRate || 0)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 mr-3">{campaign.metadata?.clickRate || 0}%</span>
                    <div className="bg-gray-200 h-2 rounded-full w-28">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" 
                        style={{ width: `${Math.min(100, campaign.metadata?.clickRate || 0)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-5 px-6 text-gray-700">
                  {campaign.metadata?.date || 'N/A'}
                </td>
                <td className="py-5 px-6 text-right">
                  <div className="inline-flex items-center space-x-2">
                    <Link 
                      href={`/campaigns/${campaign.id}`} 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-blue-200 bg-white hover:bg-blue-50 shadow-sm h-9 px-3 group cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span className="group-hover:translate-x-0.5 transition-transform duration-150">View</span>
                    </Link>
                    <div className="relative inline-block text-left">
                      {/* React-state based dropdown implementation */}
                      <button 
                        type="button" 
                        aria-label="Campaign actions"
                        title="Campaign actions"
                        data-campaign-id={campaign.id.toString()}
                        data-action-button="true"
                        onClick={() => toggleDropdown(campaign.id)}
                        className="action-button inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 shadow-sm h-9 w-9 p-0 relative group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                        <span className={`absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full ${activeDropdown === campaign.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}></span>
                      </button>
                      <div 
                        id={`dropdown-${campaign.id}`} 
                        className={`campaign-actions-dropdown absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${activeDropdown === campaign.id ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'} z-10 divide-y divide-gray-100 border border-blue-100 transition-all duration-150`}
                      >
                        <div className="p-1">
                          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                            Campaign Actions
                          </div>
                          <Link 
                            href={`/email-performance?campaignId=${campaign.id}`} 
                            className="group flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 9.88V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path>
                              <polygon points="11 15 15 20 20 15"></polygon>
                              <line x1="15" y1="9" x2="15" y2="20"></line>
                            </svg>
                            <span className="group-hover:translate-x-0.5 transition-transform duration-150">Analytics</span>
                          </Link>
                          <Link 
                            href={`/template-builder?campaignId=${campaign.id}`} 
                            className="group flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            <span className="group-hover:translate-x-0.5 transition-transform duration-150">Edit</span>
                          </Link>
                          <button 
                            className="group flex w-full items-center px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                            onClick={(e) => {
                              e.preventDefault();
                              window.confirm('Do you want to duplicate this campaign?');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span className="group-hover:translate-x-0.5 transition-transform duration-150">Duplicate</span>
                          </button>
                        </div>
                        <div className="p-1">
                          <button 
                            className="group flex w-full items-center px-3 py-2 text-sm rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                            onClick={(e) => {
                              e.preventDefault();
                              if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
                                deleteCampaignMutation.mutate(campaign.id);
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 text-red-400 group-hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            <span className="group-hover:translate-x-0.5 transition-transform duration-150">Delete</span>
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
