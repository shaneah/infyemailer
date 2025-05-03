import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
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
  ChevronRight, 
  BarChart4, 
  PieChart, 
  MailPlus,
  Users,
  ListChecks,
  Calendar,
  Bell,
  Inbox
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const DashboardV2 = () => {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showComposeEmailModal, setShowComposeEmailModal] = useState(false);
  
  // Define the campaign stats type
  interface CampaignStat {
    id: number;
    title: string;
    value: string;
    change?: string;
    icon?: string;
  }

  // Fetch campaign stats for the quick insights section
  const { data: campaignStats = [] } = useQuery<CampaignStat[]>({
    queryKey: ['/api/campaigns/stats'],
  });

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  // Insight card component for rendering quick stats
  const InsightCard = ({ icon, title, value, trend, color = "blue" }: { 
    icon: React.ReactNode, 
    title: string, 
    value: string, 
    trend?: { direction: 'up' | 'down' | 'neutral', value: string },
    color?: "blue" | "purple" | "indigo" | "green" | "amber" | "rose"
  }) => {
    const colorMap = {
      blue: {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
        iconBg: "bg-blue-100 dark:bg-blue-800/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800/30"
      },
      purple: {
        bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
        iconBg: "bg-purple-100 dark:bg-purple-800/30",
        iconColor: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-800/30"
      },
      indigo: {
        bg: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20",
        iconBg: "bg-indigo-100 dark:bg-indigo-800/30",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        border: "border-indigo-200 dark:border-indigo-800/30"
      },
      green: {
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
        iconBg: "bg-emerald-100 dark:bg-emerald-800/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-800/30"
      },
      amber: {
        bg: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
        iconBg: "bg-amber-100 dark:bg-amber-800/30",
        iconColor: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-800/30"
      },
      rose: {
        bg: "bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20",
        iconBg: "bg-rose-100 dark:bg-rose-800/30",
        iconColor: "text-rose-600 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-800/30"
      }
    };
    
    const colors = colorMap[color];
    
    return (
      <motion.div 
        className={`rounded-xl shadow-sm ${colors.bg} border ${colors.border} p-4 flex items-center`}
        variants={itemVariants}
      >
        <div className={`p-3 rounded-full ${colors.iconBg} ${colors.iconColor} mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className="flex items-center">
            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">{value}</h4>
            {trend && (
              <div className={`ml-2 flex items-center text-xs font-medium ${
                trend.direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 
                trend.direction === 'down' ? 'text-rose-600 dark:text-rose-400' : 
                'text-gray-500 dark:text-gray-400'
              }`}>
                {trend.direction === 'up' && (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {trend.direction === 'down' && (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {trend.value}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero section with welcome message */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 shadow-lg"
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-bold mb-2 text-white">Welcome to Infinity Mailer</h1>
            <p className="text-white/90 max-w-xl">
              Your dashboard provides a comprehensive overview of your email marketing performance. 
              Create new campaigns, track analytics, and manage your audience all in one place.
            </p>
            <div className="mt-6 flex space-x-3">
              <Button 
                onClick={() => setShowNewCampaignModal(true)}
                className="bg-white text-indigo-700 hover:bg-blue-50 hover:text-indigo-800 border-0 shadow-md flex items-center gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span>New Campaign</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                <span>View Notifications</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20 shadow-inner">
              <div className="text-xs text-white/70 mb-1">Today's Statistics</div>
              <div className="flex gap-4">
                <div>
                  <div className="text-3xl font-bold">32</div>
                  <div className="text-xs text-white/70">Emails sent</div>
                </div>
                <div className="border-l border-white/20"></div>
                <div>
                  <div className="text-3xl font-bold">18</div>
                  <div className="text-xs text-white/70">Opens</div>
                </div>
                <div className="border-l border-white/20"></div>
                <div>
                  <div className="text-3xl font-bold">7</div>
                  <div className="text-xs text-white/70">Clicks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main stats cards */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <StatsCards />
      </motion.div>
      
      {/* Quick insights section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Quick Insights
          </h2>
          <Button variant="ghost" size="sm" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <span>View All Analytics</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {campaignStats?.length > 0 ? (
            <>
              <InsightCard 
                icon={<BarChart4 className="h-5 w-5" />} 
                title="Active Campaigns"
                value={campaignStats[0]?.value || "0"}
                trend={{ direction: 'up', value: '+12%' }}
                color="blue"
              />
              <InsightCard 
                icon={<MailPlus className="h-5 w-5" />} 
                title="Drafts"
                value={campaignStats[1]?.value || "0"}
                color="purple"
              />
              <InsightCard 
                icon={<Users className="h-5 w-5" />} 
                title="Audience Growth"
                value={campaignStats[2]?.value || "0"}
                trend={{ direction: 'up', value: '+3.2%' }}
                color="green"
              />
              <InsightCard 
                icon={<PieChart className="h-5 w-5" />} 
                title="Conversion Rate"
                value="5.7%"
                trend={{ direction: 'up', value: '+0.8%' }}
                color="amber"
              />
            </>
          ) : (
            <>
              <InsightCard 
                icon={<BarChart4 className="h-5 w-5" />} 
                title="Active Campaigns"
                value="3"
                trend={{ direction: 'up', value: '+12%' }}
                color="blue"
              />
              <InsightCard 
                icon={<MailPlus className="h-5 w-5" />} 
                title="Drafts"
                value="5"
                color="purple"
              />
              <InsightCard 
                icon={<Users className="h-5 w-5" />} 
                title="Audience Growth"
                value="356"
                trend={{ direction: 'up', value: '+3.2%' }}
                color="green"
              />
              <InsightCard 
                icon={<PieChart className="h-5 w-5" />} 
                title="Conversion Rate"
                value="5.7%"
                trend={{ direction: 'up', value: '+0.8%' }}
                color="amber"
              />
            </>
          )}
        </div>
      </motion.div>
      
      {/* Campaigns table */}
      <motion.div 
        className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <CampaignsTable />
      </motion.div>

      {/* Analytics and audience growth section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="md:col-span-8">
          <AnalyticsChart />
        </div>
        <div className="md:col-span-4">
          <AudienceGrowth />
        </div>
      </motion.div>

      {/* Activity feed and upcoming section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        {/* Activity feed */}
        <Card className="shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Recent Activity
            </h3>
            <Button variant="ghost" size="sm" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <div className="px-6 py-4 flex items-start">
                <div className="bg-blue-100 dark:bg-blue-800/30 p-2 rounded-full text-blue-600 dark:text-blue-400 mr-4">
                  <Inbox className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Monthly Newsletter Sent</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">2h ago</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Successfully delivered to 12,483 subscribers</p>
                </div>
              </div>
              <div className="px-6 py-4 flex items-start">
                <div className="bg-purple-100 dark:bg-purple-800/30 p-2 rounded-full text-purple-600 dark:text-purple-400 mr-4">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900 dark:text-gray-100">24 New Subscribers</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">5h ago</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">From the Product Launch sign-up form</p>
                </div>
              </div>
              <div className="px-6 py-4 flex items-start">
                <div className="bg-emerald-100 dark:bg-emerald-800/30 p-2 rounded-full text-emerald-600 dark:text-emerald-400 mr-4">
                  <BarChart4 className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Analytics Report Ready</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">1d ago</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monthly performance report has been generated</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Upcoming section */}
        <Card className="shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Upcoming Campaigns
            </h3>
            <Button variant="ghost" size="sm" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
              <span>Schedule New</span>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <div className="px-6 py-4 flex items-start">
                <div className="bg-amber-100 dark:bg-amber-800/30 p-2 rounded-full text-amber-600 dark:text-amber-400 mr-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Subject Line Testing</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400">Tomorrow</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">A/B test with 3 subject line variants</p>
                </div>
              </div>
              <div className="px-6 py-4 flex items-start">
                <div className="bg-indigo-100 dark:bg-indigo-800/30 p-2 rounded-full text-indigo-600 dark:text-indigo-400 mr-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Email Design Testing</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400">Apr 30</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Testing 2 layout variations for engagement</p>
                </div>
              </div>
              <div className="px-6 py-4 flex items-start">
                <div className="bg-rose-100 dark:bg-rose-800/30 p-2 rounded-full text-rose-600 dark:text-rose-400 mr-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900 dark:text-gray-100">May Monthly Newsletter</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400">May 15</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monthly update to all subscribers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick actions section */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <QuickActions onCreateEmail={() => setShowComposeEmailModal(true)} />
      </motion.div>

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

export default DashboardV2;