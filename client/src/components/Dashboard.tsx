import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatsCards from "./StatsCards";
import CampaignsTable from "./CampaignsTable";
import AnalyticsChart from "./AnalyticsChart";
import AudienceGrowth from "./AudienceGrowth";
import QuickActions from "./QuickActions";
import NewCampaignModal from "@/modals/NewCampaignModal";
import ComposeEmailModal from "@/modals/ComposeEmailModal";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Share, 
  Download, 
  CalendarDays, 
  Bell, 
  Users, 
  Mail, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// Dashboard component with advanced visuals
const Dashboard = () => {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showComposeEmailModal, setShowComposeEmailModal] = useState(false);
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // Update the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Format greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Format date
  const formatDate = () => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(currentTime);
  };

  // Sample notifications for the dashboard
  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
    initialData: [
      { id: 1, title: 'Campaign "Monthly Newsletter" completed', time: '1 hour ago', unread: true },
      { id: 2, title: 'New subscriber added to your list', time: '3 hours ago', unread: false },
      { id: 3, title: 'Weekly analytics report available', time: '1 day ago', unread: false }
    ],
  });

  // Export dashboard to Excel
  const exportDashboard = () => {
    try {
      // Get data from each component
      // In a real app, we'd pull this data from the store or pass it as props
      const data = [
        {
          campaign: 'Monthly Newsletter',
          sent: 12483,
          openRate: '46.2%',
          clickRate: '21.8%',
          date: 'May 15, 2023'
        },
        {
          campaign: 'Subject Line Testing',
          sent: 5000,
          openRate: '38.5%',
          clickRate: '12.3%',
          date: 'April 25, 2025'
        },
        {
          campaign: 'Email Design Testing',
          sent: 3500,
          openRate: '42.1%',
          clickRate: '15.7%',
          date: 'April 30, 2025'
        }
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
      
      // Generate file and trigger download
      XLSX.writeFile(wb, 'dashboard-report.xlsx');
      
      toast({
        title: "Export successful",
        description: "Dashboard data has been exported to Excel.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "There was an issue exporting the dashboard data.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with greeting and date */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-10"></div>
        <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute top-0 left-0 h-24 w-64 rounded-full bg-white/10 blur-3xl"></div>
        
        <div className="relative z-10 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {getGreeting()}, Admin
            </h1>
            <div className="mt-2 flex items-center text-indigo-100">
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>{formatDate()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-none">
                <Bell className="h-4 w-4 mr-1" />
                <span>Notifications</span>
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center text-white">
                  {notifications.filter(n => n.unread).length}
                </span>
              </Button>
            </div>
            
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowNewCampaignModal(true)}
                  className="bg-white text-indigo-600 hover:bg-indigo-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>New Campaign</span>
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
            <CardContent className="p-4 flex flex-col items-center">
              <Users className="h-6 w-6 mb-2 text-indigo-200" />
              <div className="text-2xl font-bold">2,458</div>
              <div className="text-xs text-indigo-200">Total Subscribers</div>
            </CardContent>
          </Card>
          
          <Card className="border-none bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
            <CardContent className="p-4 flex flex-col items-center">
              <Mail className="h-6 w-6 mb-2 text-indigo-200" />
              <div className="text-2xl font-bold">87.3%</div>
              <div className="text-xs text-indigo-200">Avg. Open Rate</div>
            </CardContent>
          </Card>
          
          <Card className="border-none bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
            <CardContent className="p-4 flex flex-col items-center">
              <Sparkles className="h-6 w-6 mb-2 text-indigo-200" />
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-indigo-200">Active Campaigns</div>
            </CardContent>
          </Card>
          
          <Card className="border-none bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
            <CardContent className="p-4 flex flex-col items-center">
              <ChevronRight className="h-6 w-6 mb-2 text-indigo-200" />
              <div className="text-2xl font-bold">35.8%</div>
              <div className="text-xs text-indigo-200">Avg. CTR</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dashboard tabs */}
      <div className="flex items-center space-x-1 border-b mb-6">
        <Button 
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          className={`rounded-none border-b-2 ${activeTab === 'overview' ? 'border-primary' : 'border-transparent'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Button>
        <Button 
          variant={activeTab === 'analytics' ? 'default' : 'ghost'}
          className={`rounded-none border-b-2 ${activeTab === 'analytics' ? 'border-primary' : 'border-transparent'}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </Button>
        <Button 
          variant={activeTab === 'campaigns' ? 'default' : 'ghost'}
          className={`rounded-none border-b-2 ${activeTab === 'campaigns' ? 'border-primary' : 'border-transparent'}`}
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns
        </Button>
        <div className="flex-grow"></div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => {
              const shareUrl = window.location.href;
              navigator.clipboard.writeText(shareUrl)
                .then(() => {
                  toast({
                    title: "Dashboard URL copied",
                    description: "Share link has been copied to your clipboard.",
                    duration: 3000,
                  });
                })
                .catch(err => {
                  console.error('Failed to copy URL: ', err);
                  toast({
                    title: "Failed to copy URL",
                    description: "Please try again or copy manually.",
                    variant: "destructive",
                    duration: 3000,
                  });
                });
            }}
          >
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={exportDashboard}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Dashboard content based on active tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <>
              <div className="mb-8">
                <StatsCards />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
                <div className="md:col-span-8">
                  <AnalyticsChart />
                </div>
                <div className="md:col-span-4">
                  <AudienceGrowth />
                </div>
              </div>
              
              <div className="mb-8">
                <QuickActions onCreateEmail={() => setShowComposeEmailModal(true)} />
              </div>
            </>
          )}
          
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg border-l-4 border-l-violet-500">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Email Performance Metrics</h3>
                  <div className="space-y-4">
                    {['Open Rate', 'Click Rate', 'Bounce Rate', 'Unsubscribe Rate'].map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-600">{metric}</div>
                        <div className="w-2/3">
                          <div className="bg-gray-100 h-2 rounded-full w-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                index === 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                index === 1 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                                index === 2 ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                                'bg-gradient-to-r from-amber-400 to-yellow-500'
                              }`}
                              style={{ width: `${[87, 42, 3, 0.8][index]}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500">0%</span>
                            <span className="text-xs font-medium">{[87, 42, 3, 0.8][index]}%</span>
                            <span className="text-xs text-gray-500">100%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg border-l-4 border-l-indigo-500">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Top Performing Content</h3>
                  <div className="space-y-3">
                    {['Welcome Series', 'Product Launch', 'Weekly Newsletter', 'Abandoned Cart'].map((content, index) => (
                      <div key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          index === 0 ? 'bg-indigo-100 text-indigo-600' :
                          index === 1 ? 'bg-emerald-100 text-emerald-600' :
                          index === 2 ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{content}</div>
                          <div className="text-xs text-gray-500">
                            {[92, 88, 76, 71][index]}% Open Rate • {[54, 47, 33, 29][index]}% Click Rate
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'campaigns' && <CampaignsTable />}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      {showNewCampaignModal && 
        <NewCampaignModal onClose={() => setShowNewCampaignModal(false)} />
      }
      
      {showComposeEmailModal && 
        <ComposeEmailModal onClose={() => setShowComposeEmailModal(false)} />
      }
    </div>
  );
};

export default Dashboard;
