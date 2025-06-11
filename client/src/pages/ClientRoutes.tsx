import React, { useState, useEffect } from 'react';
import ClientSidebar from '@/components/ClientSidebar';
import ClientDashboard from '@/pages/ClientDashboard';
import { useToast } from '@/hooks/use-toast';
import { Switch, Route, useLocation, Redirect } from 'wouter';
import NotFound from '@/pages/not-found';
import { Mail, BarChart3, Activity, Globe, Grid, List } from 'lucide-react';
import CreateCampaignModal from '@/modals/CreateCampaignModal';
import AddContactModal from '@/modals/AddContactModal';
import CreateListModal from '@/modals/CreateListModal';
import CreateTemplateModal from '@/modals/CreateTemplateModal';
import ClientTemplates from '@/pages/ClientTemplates';
import ClientContacts from '@/pages/ClientContacts';
import BasicTemplateBuilder from '@/pages/BasicTemplateBuilder';
import ClientEmailPerformance from '@/pages/ClientEmailPerformance';
import ClientABTestingAdvanced from '@/pages/ClientABTestingAdvanced';
import ClientABTestingNew from '@/pages/ClientABTestingNew';
import ClientAITools from '@/pages/ClientAITools';
import ClientAdvancedAnalytics from '@/pages/ClientAdvancedAnalytics';
import AdvancedAnalyticsTest from '@/pages/AdvancedAnalyticsTest';
import { ReportingComingSoon } from '@/pages/ComingSoonPage';
import ClientSecurity from '@/pages/ClientSecurity';
import ClientBilling from '@/pages/ClientBilling';
import ClientSettings from '@/pages/ClientSettings';
import NewCampaignModal from '@/modals/NewCampaignModal';

// Advanced Campaigns component with modern UI
const ClientCampaigns = ({ onCreateCampaign }: { onCreateCampaign: () => void }) => {
  // State to manage campaign data and UI
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  
  // Campaign data state
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Fetch campaigns on component mount
  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      // Use the client-specific endpoint
      const response = await fetch('/api/client-campaigns', {
        credentials: 'include' // Important for session cookies
      });
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const data = await response.json();
      console.log('Fetched client campaigns:', data);
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Filter campaigns based on search term and filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || campaign.status.label.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateFilter) {
      const campaignDate = new Date(campaign.date);
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = campaignDate.toDateString() === today.toDateString();
          break;
        case 'week':
          matchesDate = campaignDate >= weekAgo;
          break;
        case 'month':
          matchesDate = campaignDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="p-6">
      {/* Header with enhanced styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Email Campaigns
            </h1>
            <p className="text-gray-500 text-sm">Manage and monitor your email marketing campaigns</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : campaigns.length === 0 ? (
        // Empty state
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-4">Create your first email campaign to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Campaign
            </button>
          </div>
        </div>
      ) : (
        // Campaign list/grid view
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('grid')}
                className={`p-2 rounded-lg ${activeView === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`p-2 rounded-lg ${activeView === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Campaign Grid/List */}
          <div className={activeView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${
                  activeView === 'list' ? 'flex items-center p-4' : 'p-6'
                }`}
              >
                <div className={activeView === 'list' ? 'flex-1' : ''}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        campaign.icon?.color === 'primary' ? 'bg-indigo-100 text-indigo-600' :
                        campaign.icon?.color === 'success' ? 'bg-green-100 text-green-600' :
                        campaign.icon?.color === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-500">{campaign.subtitle}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status.label === 'Sent' ? 'bg-green-100 text-green-700' :
                      campaign.status.label === 'Scheduled' ? 'bg-yellow-100 text-yellow-700' :
                      campaign.status.label === 'Draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {campaign.status.label}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Recipients</span>
                      <span className="font-medium">{campaign.recipients}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Open Rate</span>
                      <span className="font-medium">{campaign.openRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Click Rate</span>
                      <span className="font-medium">{campaign.clickRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{campaign.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          fetchCampaigns();
          if (onCreateCampaign) onCreateCampaign();
        }}
      />
    </div>
  );
};

const ClientLists = ({ onCreateList }: { onCreateList: () => void }) => {
  // State to manage lists data
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  
  // Enhanced list data with more metrics
  const [lists, setLists] = useState([
    {
      id: 1,
      name: "Newsletter Subscribers",
      contactCount: 1240,
      description: "All active newsletter subscribers",
      lastUpdated: "2025-03-15",
      tags: ["Active", "Newsletter"],
      growthRate: 12.4,
      openRate: 24.8,
      clickRate: 3.2,
      unsubscribeRate: 0.7,
      color: "indigo",
      engagementScore: 83,
      lastCampaign: "Monthly Update - March 2025"
    },
    {
      id: 2,
      name: "VIP Customers",
      contactCount: 156,
      description: "High-value customers with premium status",
      lastUpdated: "2025-02-20",
      tags: ["VIP", "Customer"],
      growthRate: 3.6,
      openRate: 42.5,
      clickRate: 8.3,
      unsubscribeRate: 0.2,
      color: "rose",
      engagementScore: 94,
      lastCampaign: "Exclusive Offer - February 2025"
    },
    {
      id: 3,
      name: "Webinar Attendees - March 2025",
      contactCount: 435,
      description: "People who registered for our March webinar",
      lastUpdated: "2025-03-10",
      tags: ["Event", "Webinar"],
      growthRate: 0,
      openRate: 31.2,
      clickRate: 5.7,
      unsubscribeRate: 1.2,
      color: "emerald",
      engagementScore: 76,
      lastCampaign: "Webinar Follow-up - March 2025"
    },
    {
      id: 4,
      name: "Product Launch Interests",
      contactCount: 890,
      description: "Contacts interested in our new product launch",
      lastUpdated: "2025-02-05",
      tags: ["Product Launch", "Marketing"],
      growthRate: 8.7,
      openRate: 29.4,
      clickRate: 4.8,
      unsubscribeRate: 0.9,
      color: "amber",
      engagementScore: 81,
      lastCampaign: "Product Teaser - February 2025"
    }
  ]);
  
  // All unique tags from lists
  const allTags = Array.from(new Set(lists.flatMap(list => list.tags)));
  
  // Filter lists based on search and filters
  const filteredLists = lists.filter(list => {
    let matchesSearch = true;
    let matchesTag = true;
    
    if (searchTerm) {
      matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      list.description.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    if (selectedTag) {
      matchesTag = list.tags.includes(selectedTag);
    }
    
    return matchesSearch && matchesTag;
  });
  
  // Sort lists
  const sortedLists = [...filteredLists].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'date') {
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    } else if (sortBy === 'contacts') {
      return b.contactCount - a.contactCount;
    } else if (sortBy === 'engagement') {
      return b.engagementScore - a.engagementScore;
    }
    return 0;
  });
  
  // Calculate growth indicators
  const totalContacts = lists.reduce((sum, list) => sum + list.contactCount, 0);
  const contactsLastMonth = 2480; // Simulated historical data
  const monthlyGrowth = ((totalContacts - contactsLastMonth) / contactsLastMonth) * 100;
  
  // Function to get color classes based on list color
  const getColorClasses = (color: string) => {
    switch(color) {
      case 'indigo':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-600',
          border: 'border-indigo-200',
          hover: 'hover:bg-indigo-600 hover:text-white',
          gradient: 'from-indigo-500 to-indigo-700'
        };
      case 'rose':
        return {
          bg: 'bg-rose-100',
          text: 'text-rose-600',
          border: 'border-rose-200',
          hover: 'hover:bg-rose-600 hover:text-white',
          gradient: 'from-rose-500 to-rose-700'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-600',
          border: 'border-emerald-200',
          hover: 'hover:bg-emerald-600 hover:text-white',
          gradient: 'from-emerald-500 to-emerald-700'
        };
      case 'amber':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-600',
          border: 'border-amber-200',
          hover: 'hover:bg-amber-600 hover:text-white',
          gradient: 'from-amber-500 to-amber-700'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          border: 'border-gray-200',
          hover: 'hover:bg-gray-600 hover:text-white',
          gradient: 'from-gray-500 to-gray-700'
        };
    }
  };
  
  // Function to render tag badges with consistent styling
  const renderTag = (tag: string, className?: string) => (
    <span 
      className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${className || 'bg-purple-100 text-purple-800'}`}
    >
      {tag}
    </span>
  );
  
  // Function to handle list duplication
  const handleDuplicateList = (id: number) => {
    const listToDuplicate = lists.find(l => l.id === id);
    if (!listToDuplicate) return;
    
    const newList = {
      ...listToDuplicate,
      id: Math.max(...lists.map(l => l.id)) + 1,
      name: `${listToDuplicate.name} (Copy)`,
      lastUpdated: new Date().toISOString().split('T')[0],
      contactCount: 0,
      growthRate: 0,
      openRate: 0,
      clickRate: 0,
      unsubscribeRate: 0,
      engagementScore: 0,
      lastCampaign: ""
    };
    
    setLists([...lists, newList]);
  };
  
  return (
    <div className="p-8">
      {/* Header with enhanced styling and gradient */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <line x1="8" x2="21" y1="6" y2="6"></line>
              <line x1="8" x2="21" y1="12" y2="12"></line>
              <line x1="8" x2="21" y1="18" y2="18"></line>
              <line x1="3" x2="3.01" y1="6" y2="6"></line>
              <line x1="3" x2="3.01" y1="12" y2="12"></line>
              <line x1="3" x2="3.01" y1="18" y2="18"></line>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Contact Lists
            </h1>
            <p className="text-gray-500 text-sm">Organize and manage your audience segments</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
                viewMode === 'grid' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
                viewMode === 'list' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
          
          <button 
            onClick={onCreateList}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            <span>Create List</span>
          </button>
        </div>
      </div>
      
      {/* Enhanced Analytics Dashboard */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 mb-6 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - metrics */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">List Analytics</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className="flex justify-between">
                  <p className="text-xs font-medium text-indigo-600 uppercase">Total Lists</p>
                  <span className="bg-indigo-100 text-indigo-600 text-xs px-2 rounded-full">Active</span>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-800">{lists.length}</p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex justify-between">
                  <p className="text-xs font-medium text-purple-600 uppercase">Total Contacts</p>
                  {monthlyGrowth > 0 ? (
                    <span className="bg-green-100 text-green-600 text-xs px-2 rounded-full flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      {monthlyGrowth.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-600 text-xs px-2 rounded-full">Flat</span>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-800">{totalContacts.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-rose-50 rounded-lg p-3">
                <div className="flex justify-between">
                  <p className="text-xs font-medium text-rose-600 uppercase">Avg. Open Rate</p>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-800">
                    {(lists.reduce((sum, list) => sum + list.openRate, 0) / lists.length).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="flex justify-between">
                  <p className="text-xs font-medium text-emerald-600 uppercase">Avg. Click Rate</p>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-800">
                    {(lists.reduce((sum, list) => sum + list.clickRate, 0) / lists.length).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 italic">
              Data updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {/* Right column - tag cloud */}
          <div className="md:w-1/3 border-l border-gray-100 pl-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Tags Overview</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {allTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all 
                    ${selectedTag === tag 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {tag}
                  <span className="ml-1 text-xs opacity-70">
                    ({lists.filter(l => l.tags.includes(tag)).length})
                  </span>
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">Top Performing Lists</h3>
              <div className="space-y-2">
                {[...lists].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 2).map(list => (
                  <div key={`top-${list.id}`} className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${getColorClasses(list.color).bg}`}></div>
                    <span className="text-sm font-medium truncate">{list.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{list.engagementScore}% engagement</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search lists by name or description..." 
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <div className="relative">
              <button
                onClick={() => setShowTagMenu(!showTagMenu)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg flex items-center gap-2 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">
                  {selectedTag ? selectedTag : 'All Tags'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showTagMenu && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                  <button
                    onClick={() => {
                      setSelectedTag('');
                      setShowTagMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${!selectedTag ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                  >
                    All Tags
                  </button>
                  {allTags.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedTag(tag);
                        setShowTagMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedTag === tag ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-700 appearance-none bg-white pr-8"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date Updated</option>
              <option value="contacts">Sort by Size</option>
              <option value="engagement">Sort by Engagement</option>
            </select>
            
            <button className="px-4 py-2.5 bg-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors text-sm text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Advanced Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Empty State or Loading */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : sortedLists.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-8 text-center">
          <div className="mx-auto bg-indigo-50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lists Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {searchTerm || selectedTag ? 
              "No lists match your current search criteria. Try adjusting your filters or search terms." : 
              "You haven't created any contact lists yet. Lists help you organize your contacts and target specific audiences."}
          </p>
          <button 
            onClick={onCreateList}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Your First List
          </button>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sortedLists.map(list => {
                const colorClasses = getColorClasses(list.color);
                
                return (
                  <div key={list.id} className="group bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden">
                    <div className={`h-2 w-full bg-gradient-to-r ${colorClasses.gradient}`}></div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-200">{list.name}</h3>
                        <div className="relative">
                          <button className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {/* Dropdown menu would go here */}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{list.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {list.tags.map((tag, idx) => (
                          <span key={`${list.id}-tag-${idx}`}>
                            {renderTag(tag, `${colorClasses.bg} ${colorClasses.text}`)}
                          </span>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gray-50 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Contacts</span>
                            {list.growthRate > 0 && (
                              <span className="text-xs text-green-600 font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                </svg>
                                {list.growthRate}%
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-bold">{list.contactCount.toLocaleString()}</div>
                        </div>
                        
                        <div className="bg-gray-50 rounded p-2">
                          <span className="text-xs text-gray-500 block mb-1">Engagement</span>
                          <div className="text-lg font-bold">{list.engagementScore}%</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Last updated: {new Date(list.lastUpdated).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Last campaign: {list.lastCampaign || 'None'}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-between">
                      <button className={`text-sm font-medium ${colorClasses.text} hover:underline`}>
                        Manage Contacts
                      </button>
                      <button className="text-indigo-600 text-sm font-medium hover:underline" onClick={() => handleDuplicateList(list.id)}>
                        Duplicate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 mb-8 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">List Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedLists.map((list) => {
                      const colorClasses = getColorClasses(list.color);
                      
                      return (
                        <tr key={list.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-10 w-1 rounded-full ${colorClasses.bg} mr-3`}></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{list.name}</div>
                                <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{list.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {list.tags.map((tag, idx) => (
                                <span key={`${list.id}-tag-table-${idx}`}>
                                  {renderTag(tag, `${colorClasses.bg} ${colorClasses.text}`)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">{list.contactCount.toLocaleString()}</span>
                              {list.growthRate > 0 && (
                                <span className="text-xs text-green-600 ml-2 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                  </svg>
                                  {list.growthRate}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 max-w-[100px]">
                              <div className={`h-2.5 rounded-full bg-gradient-to-r ${colorClasses.gradient}`} style={{ width: `${list.engagementScore}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500">{list.engagementScore}% score</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(list.lastUpdated).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {list.openRate}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Modern Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{sortedLists.length}</span> of <span className="font-medium text-gray-900">{lists.length}</span> lists
            </div>
            
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 focus:ring-2 focus:ring-indigo-600 disabled:opacity-50" disabled>
                <span className="sr-only">Previous</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                1
              </button>
              <button className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 focus:ring-2 focus:ring-indigo-600 disabled:opacity-50" disabled>
                <span className="sr-only">Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

const ClientReports = () => {
  // State for reports
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('overview');
  
  const overviewStats = {
    totalSent: 45621,
    opens: 28743,
    openRate: 63.0,
    clicks: 9865,
    clickRate: 21.6,
    bounces: 824,
    bounceRate: 1.8,
    unsubscribes: 196,
    unsubscribeRate: 0.4
  };
  
  const monthlyData = [
    { month: 'Jan', sent: 8432, opened: 5376, clicked: 1854 },
    { month: 'Feb', sent: 7865, opened: 4932, clicked: 1689 },
    { month: 'Mar', sent: 9276, opened: 5891, clicked: 2067 },
    { month: 'Apr', sent: 11243, opened: 7187, clicked: 2541 },
    { month: 'May', sent: 8805, opened: 5357, clicked: 1714 }
  ];
  
  const deviceData = [
    { device: 'Mobile', percentage: 61, color: 'bg-blue-500' },
    { device: 'Desktop', percentage: 31, color: 'bg-green-500' },
    { device: 'Tablet', percentage: 8, color: 'bg-purple-500' }
  ];
  
  const geoData = [
    { country: 'United States', percentage: 42, count: 19161 },
    { country: 'United Kingdom', percentage: 15, count: 6843 },
    { country: 'Canada', percentage: 11, count: 5018 },
    { country: 'Australia', percentage: 9, count: 4106 },
    { country: 'Germany', percentage: 6, count: 2737 },
    { country: 'France', percentage: 5, count: 2281 },
    { country: 'Other', percentage: 12, count: 5475 }
  ];
  
  const topCampaigns = [
    { 
      id: 1, 
      name: 'Monthly Newsletter - March', 
      sent: 12450,
      openRate: 68.4,
      clickRate: 24.7
    },
    { 
      id: 2, 
      name: 'Spring Promotion', 
      sent: 8765,
      openRate: 72.1,
      clickRate: 31.5
    },
    { 
      id: 3, 
      name: 'Product Launch - Premium Series', 
      sent: 10234,
      openRate: 64.8,
      clickRate: 27.3
    },
    { 
      id: 4, 
      name: 'Customer Loyalty Program', 
      sent: 6500,
      openRate: 59.6,
      clickRate: 18.9
    }
  ];
  
  const renderReportContent = () => {
    switch(reportType) {
      case 'overview':
        return (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Total Sent</h3>
                  <div className="bg-blue-100 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold">{overviewStats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Open Rate</h3>
                  <div className="bg-green-100 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold">{overviewStats.openRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{overviewStats.opens.toLocaleString()} opens</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Click Rate</h3>
                  <div className="bg-purple-100 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold">{overviewStats.clickRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{overviewStats.clicks.toLocaleString()} clicks</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Bounce Rate</h3>
                  <div className="bg-red-100 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold">{overviewStats.bounceRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{overviewStats.bounces.toLocaleString()} bounces</p>
              </div>
            </div>
            
            {/* Monthly Performance Chart */}
            <div className="bg-white rounded-lg shadow border border-gray-100 mb-6">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium">Monthly Performance</h3>
              </div>
              <div className="p-4 h-64 flex items-end justify-between">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center w-1/6">
                    <div className="relative w-full h-40 flex items-end mb-2">
                      <div className="absolute bottom-0 left-0 right-0 mx-auto w-4 bg-blue-100 rounded-t" style={{ height: `${(data.sent / 12000) * 100}%` }}></div>
                      <div className="absolute bottom-0 left-0 right-0 mx-auto w-4 bg-green-100 rounded-t" style={{ height: `${(data.opened / 12000) * 100}%`, left: '8px' }}></div>
                      <div className="absolute bottom-0 left-0 right-0 mx-auto w-4 bg-purple-100 rounded-t" style={{ height: `${(data.clicked / 12000) * 100}%`, left: '16px' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 flex justify-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">Sent</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">Opened</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-100 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">Clicked</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Campaigns */}
            <div className="bg-white rounded-lg shadow border border-gray-100 mb-6">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium">Top Performing Campaigns</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCampaigns.map((campaign, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="py-3 px-4 text-sm">{campaign.name}</td>
                        <td className="py-3 px-4 text-sm text-right">{campaign.sent.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-right">
                          <span className={`font-medium ${campaign.openRate > 65 ? 'text-green-600' : 'text-gray-900'}`}>
                            {campaign.openRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          <span className={`font-medium ${campaign.clickRate > 25 ? 'text-green-600' : 'text-gray-900'}`}>
                            {campaign.clickRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      case 'devices':
        return (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h3 className="font-medium mb-4">Device Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                {deviceData.map((item, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.device}</span>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-48 w-48 rounded-full bg-gray-200 flex items-center justify-center">
                  <div className="absolute top-0 left-0 right-0 bottom-0">
                    <div className="absolute inset-0 bg-blue-500" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 50% 100%)' }}></div>
                    <div className="absolute inset-0 bg-green-500" style={{ clipPath: 'polygon(50% 50%, 50% 0, 0 0, 0 50%)' }}></div>
                    <div className="absolute inset-0 bg-purple-500" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 100%, 20% 100%)' }}></div>
                  </div>
                  <div className="z-10 bg-white h-32 w-32 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'geography':
        return (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h3 className="font-medium mb-4">Geographic Distribution</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {geoData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">{item.country}</td>
                      <td className="py-3 px-4 text-sm text-right">{item.count.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-right">{item.percentage}%</td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return <div>Select a report type</div>;
    }
  };
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Email Reports</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">Last Year</option>
          </select>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Report Type Navigation */}
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          onClick={() => setReportType('overview')} 
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 ${reportType === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setReportType('devices')} 
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 ${reportType === 'devices' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Devices
        </button>
        <button 
          onClick={() => setReportType('geography')} 
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 ${reportType === 'geography' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Geography
        </button>
      </div>
      
      {/* Report Content */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : renderReportContent()}
    </div>
  );
};
const ClientDomains = () => {
  const [domains, setDomains] = useState([
    {
      id: 1,
      name: "marketing.yourdomain.com",
      status: "Verified",
      dateAdded: "2025-02-15",
      usedIn: 5,
      isDefault: true
    },
    {
      id: 2,
      name: "newsletter.yourdomain.com",
      status: "Pending",
      dateAdded: "2025-03-22",
      usedIn: 2,
      isDefault: false
    },
    {
      id: 3,
      name: "promo.yourdomain.com",
      status: "Failed",
      dateAdded: "2025-03-28",
      usedIn: 0,
      isDefault: false
    }
  ]);

  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  const statusColors = {
    Verified: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Failed: "bg-red-100 text-red-800"
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <Globe className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold">Domains</h1>
        </div>
        <button 
          onClick={() => setShowAddDomainModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          <span>Add Domain</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
        </button>
      </div>
      
      {/* Domain Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Domains</h3>
          <p className="text-2xl font-bold">{domains.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Verified Domains</h3>
          <p className="text-2xl font-bold">{domains.filter(d => d.status === 'Verified').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Default Domain</h3>
          <p className="text-lg font-medium text-gray-800 truncate">
            {domains.find(d => d.isDefault)?.name || '—'}
          </p>
        </div>
      </div>
      
      {/* Domains Table */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Domain Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date Added</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Used In</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Default</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">No domains found.</td>
                </tr>
              ) : (
                domains.map(domain => (
                  <tr key={domain.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{domain.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[domain.status as keyof typeof statusColors]}`}>
                        {domain.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(domain.dateAdded).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {domain.usedIn} {domain.usedIn === 1 ? 'campaign' : 'campaigns'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {domain.isDefault ? 
                        <span className="text-green-600 font-medium">Yes</span> : 
                        <span className="text-gray-400">No</span>
                      }
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {!domain.isDefault && domain.status === 'Verified' && (
                          <button 
                            className="text-blue-600 hover:text-blue-800" 
                            title="Set as Default"
                            onClick={() => {
                              const updatedDomains = domains.map(d => ({
                                ...d,
                                isDefault: d.id === domain.id
                              }));
                              setDomains(updatedDomains);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"></path><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path><path d="M22 19H2"></path></svg>
                          </button>
                        )}
                        {domain.status === 'Pending' && (
                          <button 
                            className="text-yellow-600 hover:text-yellow-800" 
                            title="Verify Domain"
                            onClick={() => {
                              const updatedDomains = domains.map(d => 
                                d.id === domain.id ? {...d, status: 'Verified'} : d
                              );
                              setDomains(updatedDomains);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                          </button>
                        )}
                        <button 
                          className="text-red-600 hover:text-red-800" 
                          title="Delete"
                          onClick={() => {
                            if (domain.isDefault) {
                              alert("Cannot delete the default domain. Please set another domain as default first.");
                              return;
                            }
                            if (domain.usedIn > 0) {
                              alert(`This domain is used in ${domain.usedIn} campaigns. Please remove it from all campaigns first.`);
                              return;
                            }
                            setDomains(domains.filter(d => d.id !== domain.id));
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Domain Modal */}
      {showAddDomainModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Domain</h3>
              <div className="mb-4">
                <label htmlFor="domain-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Domain Name
                </label>
                <input
                  id="domain-name"
                  type="text"
                  placeholder="e.g., emails.yourdomain.com"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add a subdomain that will be used for your email campaigns.
                </p>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowAddDomainModal(false);
                    setNewDomain('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={!newDomain.includes('.')}
                  onClick={() => {
                    if (newDomain) {
                      const newId = Math.max(...domains.map(d => d.id), 0) + 1;
                      const today = new Date().toISOString().split('T')[0];
                      const isFirstDomain = domains.length === 0;
                      
                      setDomains([
                        ...domains,
                        {
                          id: newId,
                          name: newDomain,
                          status: 'Pending',
                          dateAdded: today,
                          usedIn: 0,
                          isDefault: isFirstDomain
                        }
                      ]);
                      
                      setShowAddDomainModal(false);
                      setNewDomain('');
                    }
                  }}
                >
                  Add Domain
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const ClientEmailValidation: React.FC = () => {
  const [singleEmail, setSingleEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<any>(null);
  const [batchResults, setBatchResults] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [showTypoSuggestion, setShowTypoSuggestion] = useState(false);
  const { toast } = useToast();

  // ... rest of the component code ...

  return (
    <div className="p-6">
      {/* ... component JSX ... */}
    </div>
  );
};

const ClientABTesting = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-primary/10 p-2 rounded-full">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">A/B Testing</h1>
    </div>
    
    {/* Overview Card */}
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100 mb-6">
      <h2 className="text-lg font-semibold mb-3">A/B Testing Overview</h2>
      <p className="text-gray-600 mb-4">
        A/B testing allows you to test different variations of your emails to see which performs better. Create multiple versions of your email and send them to different segments of your audience to optimize your campaign performance.
      </p>
      <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-blue-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          <div>
            <h3 className="font-medium text-blue-700">Getting Started</h3>
            <p className="text-sm text-blue-600">To begin A/B testing, create a campaign and add multiple email variations to test different subject lines, content, or layouts.</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Feature Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 text-teal-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Subject Line Testing</h3>
        <p className="text-gray-600">Test different subject lines to improve open rates and engagement.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Content Testing</h3>
        <p className="text-gray-600">Compare different layouts, images, or copy to determine what resonates best.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Sender Testing</h3>
        <p className="text-gray-600">Test different sender names or email addresses to find the best performer.</p>
      </div>
    </div>
    
    {/* Coming Soon Section */}
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-100 p-6">
      <h2 className="text-lg font-semibold mb-3 text-blue-800">Coming Soon</h2>
      <p className="text-blue-700 mb-4">We're working on adding more advanced A/B testing features:</p>
      <ul className="space-y-2">
        <li className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
          <span>Automated winner selection based on your goals</span>
        </li>
        <li className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
          <span>Multi-variable testing (test multiple elements at once)</span>
        </li>
        <li className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
          <span>Advanced analytics and reporting for test results</span>
        </li>
      </ul>
    </div>
  </div>
);
// Legacy ClientSettings component has been replaced with the imported ClientSettings component

export default function ClientRoutes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientUser, setClientUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // States for modals
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  
  // Handle client logout
  const handleLogout = async () => {
    try {
      // Call the server-side logout endpoint
      const response = await fetch('/api/client-logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear client-side storage regardless of response
      sessionStorage.removeItem('clientUser');
      localStorage.removeItem('clientUser');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
      
      // Redirect to login page
      setLocation('/client-login');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if server logout fails, clear client-side storage and redirect
      sessionStorage.removeItem('clientUser');
      localStorage.removeItem('clientUser');
      setLocation('/client-login');
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    
    // First check client user in session storage for quick load
    const sessionUser = sessionStorage.getItem('clientUser');
    let userData = null;
    
    if (sessionUser) {
      try {
        userData = JSON.parse(sessionUser);
        if (isMounted) {
          setClientUser(userData);
        }
      } catch (error) {
        console.error('Error parsing client user from session storage:', error);
        sessionStorage.removeItem('clientUser');
      }
    }
    
    // Always verify session with server regardless of local session storage
    async function verifySession() {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/client/verify-session', {
          method: 'GET',
          credentials: 'include', // Important for cookies/session
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        console.log('Session verification response:', {
          status: response.status,
          data,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (response.ok && data.verified && data.user) {
          // Update client user data from server
          if (isMounted) {
            setClientUser(data.user);
            // Update session storage with latest data
            sessionStorage.setItem('clientUser', JSON.stringify(data.user));
          }
          console.log('Client session verified successfully');
        } else {
          throw new Error(data.message || 'Session verification failed');
        }
      } catch (error) {
        console.error('Session verification error:', error);
        // Clear invalid session data
        sessionStorage.removeItem('clientUser');
        if (isMounted) {
          setClientUser(null);
          toast({
            title: "Authentication required",
            description: "Please login to access the client portal",
            variant: "destructive"
          });
          setLocation('/client-login');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    verifySession();
    
    return () => {
      isMounted = false;
    };
  }, [setLocation, toast]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-500 text-sm">Verifying your session...</p>
      </div>
    );
  }
  
  if (!clientUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-xl font-medium mb-2">Session Expired</p>
        <p className="text-gray-500 mb-4">Your session has expired or is invalid</p>
        <button 
          onClick={() => setLocation('/client-login')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all"
        >
          Return to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-background">
      <ClientSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 overflow-auto">
        <Switch>
          <Route path="/client-dashboard">
            <ClientDashboard onOpenSidebar={() => setSidebarOpen(true)} />
          </Route>
          <Route path="/client-campaigns">
            <ClientCampaigns onCreateCampaign={() => setShowCreateCampaignModal(true)} />
          </Route>
          <Route path="/client-contacts">
            <ClientContacts onAddContact={() => setShowAddContactModal(true)} />
          </Route>
          <Route path="/client-lists">
            <ClientLists onCreateList={() => setShowCreateListModal(true)} />
          </Route>
          <Route path="/client-templates">
            <ClientTemplates onCreateTemplate={() => setShowCreateTemplateModal(true)} />
          </Route>
          <Route path="/client-template-builder">
            <BasicTemplateBuilder isClientPortal={true} />
          </Route>
          <Route path="/client-email-performance">
            <ClientEmailPerformance />
          </Route>
          <Route path="/client-advanced-analytics">
            <ClientAdvancedAnalytics />
          </Route>
          <Route path="/client-reports">
            <ClientReports />
          </Route>
          <Route path="/client-domains">
            <ClientDomains />
          </Route>
          <Route path="/client-email-validation">
            <ClientEmailValidation />
          </Route>
          <Route path="/client-ab-testing/:id">
            <ClientABTestingNew />
          </Route>
          <Route path="/client-ab-testing">
            <ClientABTestingNew />
          </Route>
          <Route path="/client-settings">
            <ClientSettings />
          </Route>
          <Route path="/client-security">
            <ClientSecurity />
          </Route>
          <Route path="/client-billing">
            <ClientBilling />
          </Route>
          <Route path="/client-ai-tools">
            <ClientAITools />
          </Route>
          <Route path="/client-reporting">
            <ReportingComingSoon />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
        
        {/* Modals */}
        <CreateCampaignModal 
          open={showCreateCampaignModal} 
          onOpenChange={setShowCreateCampaignModal}
          onSuccess={() => {
            // Refresh campaigns list
            const campaignsComponent = document.querySelector('[data-component="client-campaigns"]');
            if (campaignsComponent) {
              const event = new CustomEvent('refresh-campaigns');
              campaignsComponent.dispatchEvent(event);
            }
          }}
        />
        {showAddContactModal && 
          <AddContactModal isOpen={showAddContactModal} onClose={() => setShowAddContactModal(false)} />
        }
        {showCreateListModal && 
          <CreateListModal isOpen={showCreateListModal} onClose={() => setShowCreateListModal(false)} />
        }
        {showCreateTemplateModal && 
          <CreateTemplateModal open={showCreateTemplateModal} onOpenChange={() => setShowCreateTemplateModal(false)} />
        }
      </main>
    </div>
  );
}