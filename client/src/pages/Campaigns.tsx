import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import CampaignsTable from "@/components/CampaignsTable";
import NewCampaignModal from "@/modals/NewCampaignModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Filter, Download, PlusCircle, BarChart4, Mail, Send, Users } from "lucide-react";

export default function Campaigns() {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [initialTemplateId, setInitialTemplateId] = useState<string | null>(null);
  const [location] = useLocation();
  const { data: campaignStats, isLoading } = useQuery({
    queryKey: ['/api/campaigns/stats'],
  });
  
  useEffect(() => {
    // Check if the URL has a templateId parameter
    const params = new URLSearchParams(location.split('?')[1]);
    const templateId = params.get('templateId');
    
    if (templateId) {
      setInitialTemplateId(templateId);
      setShowNewCampaignModal(true);
    }
  }, [location]);

  return (
    <div className="space-y-6 px-4 py-6 max-w-[1600px] mx-auto">
      {/* Header with modern blue gradient design */}
      <header className="relative z-20 -mt-6 -mx-4 mb-6 px-4 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-md">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-white">Email Campaigns</h1>
                <p className="text-sm text-blue-100 mt-0.5">Create, manage, and analyze your email campaigns</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex">
                <Button variant="outline" size="sm" className="mr-2 border-blue-700 bg-blue-800/50 text-blue-50 hover:bg-blue-800 hover:text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="mr-4 border-blue-700 bg-blue-800/50 text-blue-50 hover:bg-blue-800 hover:text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <Button 
                className="bg-blue-700 hover:bg-blue-600 text-white whitespace-nowrap text-sm border border-blue-600"
                onClick={() => setShowNewCampaignModal(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="whitespace-nowrap">New Campaign</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats cards with modern styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4">
                <Skeleton className="h-5 w-32 mb-3" />
                <div className="flex items-center">
                  <Skeleton className="h-10 w-24 mr-3" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-4 w-40 mt-3" />
              </div>
            </div>
          ))
        ) : (
          campaignStats?.map((stat) => {
            // Determine icon based on title
            let StatIcon = BarChart4;
            if (stat.title.includes('Campaign')) StatIcon = Mail;
            if (stat.title.includes('Sent')) StatIcon = Send;
            if (stat.title.includes('Subscriber')) StatIcon = Users;
            
            // Determine gradient colors based on stat ID or title
            let gradientFrom = 'from-blue-500';
            let gradientTo = 'to-indigo-500';
            
            if (stat.id === 2 || stat.title.includes('Open')) {
              gradientFrom = 'from-emerald-500';
              gradientTo = 'to-teal-500';
            } else if (stat.id === 3 || stat.title.includes('Click')) {
              gradientFrom = 'from-amber-500';
              gradientTo = 'to-yellow-500';
            } else if (stat.id === 4 || stat.title.includes('Bounce')) {
              gradientFrom = 'from-rose-500';
              gradientTo = 'to-pink-500';
            }
            
            return (
              <div key={stat.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-200">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.title}</p>
                    <div className={`p-1.5 sm:p-2 rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white`}>
                      <StatIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-lg sm:text-2xl font-bold mr-2 sm:mr-3">{stat.value}</div>
                    {stat.change && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${
                        stat.change.color === 'success' ? 'bg-green-100 text-green-800' : 
                        stat.change.color === 'danger' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {stat.change.value}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{stat.description}</p>
                </div>
                {/* Bottom border with gradient */}
                <div className={`h-1 w-full bg-gradient-to-r ${gradientFrom} ${gradientTo}`}></div>
              </div>
            );
          })
        )}
      </div>

      {/* Main content */}
      <div className="bg-white p-0 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <CampaignsTable />
      </div>

      {showNewCampaignModal && (
        <NewCampaignModal 
          onClose={() => {
            setShowNewCampaignModal(false);
            setInitialTemplateId(null);
          }} 
          initialTemplateId={initialTemplateId}
        />
      )}
    </div>
  );
}
