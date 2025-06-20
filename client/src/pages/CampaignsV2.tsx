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
  const [location, setLocation] = useLocation();
  
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

  // Get a unique background gradient based on campaign ID
  const bgGradients = [
    "bg-gradient-to-br from-violet-50 to-purple-50 border-purple-200",
    "bg-gradient-to-br from-emerald-50 to-teal-50 border-teal-200",
    "bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200", 
    "bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200",
    "bg-gradient-to-br from-pink-50 to-rose-50 border-rose-200"
  ];
  
  const bgGradient = bgGradients[campaign.id % bgGradients.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${bgGradient} rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300`}
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
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={() => setLocation(`/campaigns/${campaign.id}`)}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={() => setLocation(`/email-performance?campaignId=${campaign.id}`)}
        >
          <BarChart4 className="h-3.5 w-3.5 mr-1" />
          Analytics
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={() => window.open(`/email-preview/${campaign.id}`, '_blank')}
        >
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
  
  // More vibrant, colorful gradient combinations
  const gradients = [
    "from-purple-500 to-pink-600",
    "from-emerald-400 to-teal-600",
    "from-amber-400 to-orange-500",
    "from-blue-400 to-indigo-600"
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
  const [location, setLocation] = useLocation();
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [initialTemplateId, setInitialTemplateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Get user type first
  const { data: userData } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    }
  });

  // Get campaigns based on user type
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<any[]>({
    queryKey: ['/api/campaigns', userData?.role],
    queryFn: async () => {
      // If user is admin, use admin endpoint
      if (userData?.role === 'admin') {
        const response = await fetch('/api/admin/campaigns', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch admin campaigns');
        }
        return response.json();
      }
      
      // Otherwise use client endpoint
      const response = await fetch('/api/campaigns', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch client campaigns');
      }
      return response.json();
    },
    enabled: !!userData, // Only run query when we have user data
    initialData: [],
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 5,
    refetchOnMount: true,
    refetchInterval: 60000,
  });
  
  const { data: campaignStats, isLoading: statsLoading } = useQuery<any[]>({
    queryKey: ['/api/campaigns/stats'],
    initialData: [],
    staleTime: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
    retry: 5,
    refetchOnMount: true,
    refetchInterval: 60000, // Poll every minute for updates
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
      {/* Header section with vibrant gradient background */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-2xl p-8 shadow-2xl mb-8 text-white overflow-hidden relative"
      >
        {/* Advanced decorative elements for a modern look */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 mix-blend-overlay opacity-20 blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-400 to-teal-400 mix-blend-overlay opacity-20 blur-2xl"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuLWNpcmNsZXMiIHg9IjAiIHk9IjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDEzKSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMS41IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybi1jaXJjbGVzKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center bg-white/10 backdrop-blur-md rounded-full px-4 py-1 border border-white/20 mb-4">
              <div className="h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></div>
              <span className="text-xs font-medium text-white/90">Campaign Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-white flex items-center">
              Email Campaigns
              <span className="ml-3 text-xs font-normal bg-cyan-400/20 text-cyan-100 px-2 py-0.5 rounded-md border border-cyan-400/30">
                {campaigns.length} Campaigns
              </span>
            </h1>
            <p className="text-white/90 max-w-2xl text-base">
              Create, manage, and track the performance of your email marketing campaigns all in one place.
              Leverage advanced analytics to optimize your strategy for better results.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 shadow-lg shadow-black/5">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-400/20 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/70">Active Campaigns</p>
                    <p className="text-2xl font-bold">{campaigns.filter(c => c.status.label === "Active").length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 shadow-lg shadow-black/5">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-400/20 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/70">Sent Last 30 Days</p>
                    <p className="text-2xl font-bold">
                      {campaigns.filter(c => c.status.label === "Sent").length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 shadow-lg shadow-black/5">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-400/20 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/70">Avg. Open Rate</p>
                    <p className="text-2xl font-bold">
                      {Math.round(campaigns.reduce((sum, c) => sum + c.openRate, 0) / (campaigns.length || 1))}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 lg:mt-0">
            <Button 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md w-full sm:w-auto transition-all duration-300"
              variant="outline"
              size="sm"
              onClick={() => setLocation('/templates')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Templates
            </Button>
            <Button 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30 border-0 w-full sm:w-auto transition-all duration-300"
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
            <Search className="h-4 w-4 text-purple-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2.5 w-full border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm bg-white/70 shadow-sm"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-50">
            <div className="text-xs font-medium text-purple-500">
              {filteredCampaigns.length} results
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-1 rounded-lg">
              <TabsTrigger 
                value="all" 
                className={`text-xs px-3 py-1.5 ${activeTab === 'all' ? 
                'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md' : 
                'text-gray-600 hover:text-purple-600 transition-colors'}`}
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className={`text-xs px-3 py-1.5 ${activeTab === 'active' ? 
                'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 
                'text-gray-600 hover:text-emerald-600 transition-colors'}`}
              >
                Active
              </TabsTrigger>
              <TabsTrigger 
                value="sent" 
                className={`text-xs px-3 py-1.5 ${activeTab === 'sent' ? 
                'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 
                'text-gray-600 hover:text-amber-600 transition-colors'}`}
              >
                Sent
              </TabsTrigger>
              <TabsTrigger 
                value="draft" 
                className={`text-xs px-3 py-1.5 ${activeTab === 'draft' ? 
                'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-md' : 
                'text-gray-600 hover:text-blue-600 transition-colors'}`}
              >
                Drafts
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="hidden lg:flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs border border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-colors"
              onClick={() => {
                // Open filter modal or drawer here when implemented
                alert('Filter functionality will be available soon!');
              }}
            >
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
              onClick={() => {
                // Export functionality 
                alert('Export functionality will be available soon!');
              }}
            >
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
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl border border-pink-200 border-dashed shadow-sm flex flex-col items-center justify-center p-5 hover:shadow-md hover:border-pink-300 transition-all duration-300 cursor-pointer overflow-hidden relative"
            onClick={() => setShowNewCampaignModal(true)}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-purple-300 to-pink-300"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-to-tr from-orange-300 to-rose-300"></div>
            </div>
            
            <div className="relative z-10">
              <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-3 mb-4 transform hover:rotate-12 transition-transform shadow-md">
                <PlusCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 mb-2">
                Create New Campaign
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">Launch your next stunning email campaign</p>
              <Button 
                size="sm" 
                className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700 shadow-sm"
                onClick={() => setShowNewCampaignModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Campaign
              </Button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl border border-pink-200 p-8 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gradient-to-tr from-orange-300 to-rose-300 transform -translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <div className="relative z-10">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 inline-flex items-center justify-center mb-4 shadow-md">
              <Mail className="h-8 w-8 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 mb-2">
              {searchQuery.trim() !== "" ? "No matching campaigns" : "Start your email marketing journey"}
            </h3>
            
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery.trim() !== "" 
                ? <span>No campaigns matching "<span className="font-medium text-purple-600">{searchQuery}</span>" were found. Try a different search term.</span> 
                : "Create your first email campaign to engage with your audience. Our intuitive tools make it easy to design, send, and track effective email marketing campaigns."}
            </p>
            
            <Button 
              onClick={() => setShowNewCampaignModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              {searchQuery.trim() !== "" ? "Create New Campaign" : "Get Started"}
            </Button>
          </div>
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