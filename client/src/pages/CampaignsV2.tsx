import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import NewCampaignModal from "@/modals/NewCampaignModal";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Filter, 
  Download, 
  Plus, 
  BarChart4, 
  Mail, 
  Send, 
  Users, 
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  BookOpen,
  PlusCircle
} from "lucide-react";

// Custom campaign card component
const CampaignCard = ({ campaign }: { campaign: any }) => {
  const statusColors = {
    "Sent": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Draft": "bg-gray-100 text-gray-800 border-gray-200",
    "Scheduled": "bg-purple-100 text-purple-800 border-purple-200",
    "Running": "bg-blue-100 text-blue-800 border-blue-200",
    "Paused": "bg-amber-100 text-amber-800 border-amber-200",
    "Active": "bg-blue-100 text-blue-800 border-blue-200",
  };

  const getIconBg = (color: string) => {
    switch(color) {
      case 'primary': return 'bg-blue-100 text-blue-600';
      case 'success': return 'bg-emerald-100 text-emerald-600';
      case 'danger': return 'bg-rose-100 text-rose-600';
      case 'warning': return 'bg-amber-100 text-amber-600';
      case 'info': return 'bg-sky-100 text-sky-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Use status colors mapping, defaulting to gray if status is not in map
  const statusClass = statusColors[campaign.status.label as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200";
  const iconBg = getIconBg(campaign.icon.color);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-300"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
            <Mail className="h-5 w-5" />
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusClass}`}>
            {campaign.status.label}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{campaign.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{campaign.subtitle || 'Email campaign'}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500 mb-1">Recipients</p>
            <p className="text-sm font-semibold">{campaign.recipients.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500 mb-1">Date</p>
            <p className="text-sm font-semibold">{campaign.date}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Open Rate</span>
              <span className="text-xs font-medium text-gray-700">{campaign.openRate}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" 
                style={{ width: `${campaign.openRate}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Click Rate</span>
              <span className="text-xs font-medium text-gray-700">{campaign.clickRate}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                style={{ width: `${campaign.clickRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 p-3 flex justify-between">
        <Button variant="ghost" size="sm" className="text-xs">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
        <Button variant="ghost" size="sm" className="text-xs">
          <BarChart4 className="h-3.5 w-3.5 mr-1" />
          Analytics
        </Button>
        <Button variant="ghost" size="sm" className="text-xs">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};

// Stat card component
const StatCard = ({ stat, index }: { stat: any, index: number }) => {
  // Determine icon based on title
  let StatIcon = BarChart4;
  if (stat.title.includes('Campaign')) StatIcon = Mail;
  if (stat.title.includes('Sent')) StatIcon = Send;
  if (stat.title.includes('Subscriber')) StatIcon = Users;
  
  // Determine gradient colors based on index
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600"
  ];
  
  const gradientClass = gradients[index % gradients.length];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-200 group"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{stat.title}</p>
          <div className={`p-2 rounded-full bg-gradient-to-r ${gradientClass} text-white transform group-hover:scale-110 transition-transform`}>
            <StatIcon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-2xl font-bold mr-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
            {stat.value}
          </div>
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
        <p className="text-xs text-gray-500 mt-2 line-clamp-2 group-hover:text-gray-600 transition-colors">{stat.description}</p>
      </div>
      {/* Bottom border with gradient */}
      <div className={`h-1 w-full bg-gradient-to-r ${gradientClass}`}></div>
    </motion.div>
  );
};

export default function CampaignsV2() {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [initialTemplateId, setInitialTemplateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [location] = useLocation();
  
  const { data: campaignStats, isLoading: statsLoading } = useQuery<any[]>({
    queryKey: ['/api/campaigns/stats'],
    initialData: [],
  });
  
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<any[]>({
    queryKey: ['/api/campaigns'],
    initialData: [],
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

  // Filter campaigns based on active tab and search query
  const filteredCampaigns = campaigns.filter(campaign => {
    // First filter by tab
    if (activeTab !== "all") {
      const statusLower = campaign.status.label.toLowerCase();
      if (activeTab === "active" && statusLower !== "active" && statusLower !== "running") {
        return false;
      }
      if (activeTab === "sent" && statusLower !== "sent") {
        return false;
      }
      if (activeTab === "draft" && statusLower !== "draft") {
        return false;
      }
      if (activeTab === "scheduled" && statusLower !== "scheduled") {
        return false;
      }
    }
    
    // Then filter by search query if it exists
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return (
        campaign.name.toLowerCase().includes(query) ||
        (campaign.subtitle && campaign.subtitle.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-6 max-w-[1600px] mx-auto"
    >
      {/* Header section with gradient background */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 shadow-lg mb-8 text-white"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Email Campaigns</h1>
            <p className="text-blue-100 max-w-2xl">
              Create, manage, and track the performance of your email marketing campaigns all in one place.
              Leverage analytics to optimize your marketing strategy and achieve better results.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                <p className="text-xs text-white/70">Active Campaigns</p>
                <p className="text-xl font-bold">{campaigns.filter(c => c.status.label === "Active").length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                <p className="text-xs text-white/70">Sent Last 30 Days</p>
                <p className="text-xl font-bold">
                  {campaigns.filter(c => c.status.label === "Sent").length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                <p className="text-xs text-white/70">Avg. Open Rate</p>
                <p className="text-xl font-bold">
                  {Math.round(campaigns.reduce((sum, c) => sum + c.openRate, 0) / (campaigns.length || 1))}%
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 lg:mt-0">
            <Button 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm w-full sm:w-auto"
              variant="outline"
              size="sm"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Templates
            </Button>
            <Button 
              className="bg-white text-indigo-700 hover:bg-blue-50 hover:text-indigo-800 border-0 shadow-md w-full sm:w-auto"
              size="sm"
              onClick={() => setShowNewCampaignModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          [...Array(4)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-24 mb-3" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          campaignStats.map((stat, index) => (
            <StatCard key={stat.id || index} stat={stat} index={index} />
          ))
        )}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger 
                value="all" 
                className={`text-xs px-3 py-1.5 ${activeTab === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className={`text-xs px-3 py-1.5 ${activeTab === 'active' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
              >
                Active
              </TabsTrigger>
              <TabsTrigger 
                value="sent" 
                className={`text-xs px-3 py-1.5 ${activeTab === 'sent' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
              >
                Sent
              </TabsTrigger>
              <TabsTrigger 
                value="draft" 
                className={`text-xs px-3 py-1.5 ${activeTab === 'draft' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
              >
                Drafts
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="hidden lg:flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs border-gray-200">
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="text-xs border-gray-200">
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Campaign cards grid */}
      {campaignsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
                
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
          
          {/* "Create new" card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 border-dashed shadow-sm flex flex-col items-center justify-center p-5 hover:shadow-md hover:border-blue-300 transition-all duration-300 cursor-pointer"
            onClick={() => setShowNewCampaignModal(true)}
          >
            <div className="rounded-full bg-blue-100 p-3 mb-4">
              <PlusCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Campaign</h3>
            <p className="text-sm text-gray-500 text-center mb-2">Get started with a new email campaign</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Campaign
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
          <div className="bg-white rounded-full p-3 inline-flex items-center justify-center mb-4 shadow-sm">
            <Mail className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            {searchQuery.trim() !== "" 
              ? `No campaigns matching "${searchQuery}" were found. Try a different search term.` 
              : "You don't have any campaigns yet. Create your first campaign to get started with email marketing."}
          </p>
          <Button onClick={() => setShowNewCampaignModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      )}

      {/* Modals */}
      {showNewCampaignModal && (
        <NewCampaignModal 
          onClose={() => {
            setShowNewCampaignModal(false);
            setInitialTemplateId(null);
          }} 
          initialTemplateId={initialTemplateId}
        />
      )}
    </motion.div>
  );
}