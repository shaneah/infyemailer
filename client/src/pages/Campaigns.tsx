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
    <div className="space-y-8">
      {/* Header section with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Email Campaigns
            </h1>
            <p className="text-slate-600 mt-1">
              Create, manage, and analyze your email marketing campaigns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex">
              <Button variant="outline" size="sm" className="mr-2 border-blue-200">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="mr-4 border-blue-200">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => setShowNewCampaignModal(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>
      </div>

      {/* Stats cards with modern styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5">
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
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <div className={`p-2 rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white`}>
                      <StatIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold mr-3">{stat.value}</div>
                    {stat.change && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        stat.change.color === 'success' ? 'bg-green-100 text-green-800' : 
                        stat.change.color === 'danger' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {stat.change.value}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
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
