import { useState, useEffect } from "react";
import StatsCards from "./StatsCards";
import CampaignsTable from "./CampaignsTable";
import AnalyticsChart from "./AnalyticsChart";
import AudienceGrowth from "./AudienceGrowth";
import QuickActions from "./QuickActions";
import NewCampaignModal from "@/modals/NewCampaignModal";
import ComposeEmailModal from "@/modals/ComposeEmailModal";
import { Terminal, Share, Download, BarChart3, Plus, ChevronRight, Activity, Mail, Database, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showComposeEmailModal, setShowComposeEmailModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInitializing, setIsInitializing] = useState(true);

  // Simulating AI interface "initializing" state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, []);

  // Get recent system activity
  const { data: stats } = useQuery({ 
    queryKey: ['/api/stats'],
    staleTime: 60000
  });

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

  // ASCII art for terminal effect
  const asciiArt = `
  ██╗███╗   ██╗███████╗██╗   ██╗███╗   ███╗ █████╗ ██╗██╗     ███████╗██████╗ 
  ██║████╗  ██║██╔════╝╚██╗ ██╔╝████╗ ████║██╔══██╗██║██║     ██╔════╝██╔══██╗
  ██║██╔██╗ ██║█████╗   ╚████╔╝ ██╔████╔██║███████║██║██║     █████╗  ██████╔╝
  ██║██║╚██╗██║██╔══╝    ╚██╔╝  ██║╚██╔╝██║██╔══██║██║██║     ██╔══╝  ██╔══██╗
  ██║██║ ╚████║██║        ██║   ██║ ╚═╝ ██║██║  ██║██║███████╗███████╗██║  ██║
  ╚═╝╚═╝  ╚═══╝╚═╝        ╚═╝   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
  `;

  return (
    <div className="bg-[#0a0a16] text-[#e0e0ff] p-6 min-h-screen animate-fade-in">
      {isInitializing ? (
        // Terminal startup animation
        <div className="font-mono text-sm">
          <div className="mb-5 text-xs">
            <pre className="text-[#36d7ff] whitespace-pre overflow-x-auto">{asciiArt}</pre>
          </div>
          <div className="space-y-2 animate-fade-in">
            <div className="flex gap-2">
              <span className="text-[#36d7ff]">[SYS]</span> 
              <span>Initializing reporting interface...</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#36d7ff]">[NET]</span> 
              <span>Connecting to database server...</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#36d7ff]">[DATA]</span> 
              <span>Loading analytics modules...</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#36d7ff]">[UI]</span> 
              <span>Rendering data visualizations...</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#36d7ff]">[API]</span> 
              <span>Fetching campaign metrics...</span>
            </div>
            <div className="h-4 bg-[#101024] mt-3 relative overflow-hidden rounded">
              <div className="absolute inset-0 bg-[#36d7ff] bg-opacity-50 animate-progress-indeterminate"></div>
            </div>
          </div>
        </div>
      ) : (
        // Main dashboard content
        <>
          <div className="flex justify-between items-center mb-8 border-b border-[#1e1e3a] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#8b8ba7] font-mono mb-1">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-[#00ff9d] rounded-full animate-pulse"></div>
                  <span>SYSTEM ONLINE</span>
                </div>
                <span>•</span>
                <span>{formattedTime}</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center text-[#e0e0ff]">
                <Terminal className="mr-2 h-6 w-6 text-[#36d7ff]" />
                Analytics Dashboard
                <Badge variant="outline" className="ml-3 font-mono text-xs bg-[#101024] text-[#8b8ba7] border-[#1e1e3a]">v3.4.2</Badge>
              </h1>
              <p className="text-[#8b8ba7] font-light">
                Real-time reporting and analytics for your email marketing campaigns
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#101024] border-[#1e1e3a] hover:bg-[#151536] text-[#8b8ba7] hover:text-[#e0e0ff]"
              >
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#101024] border-[#1e1e3a] hover:bg-[#151536] text-[#8b8ba7] hover:text-[#e0e0ff]"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button 
                size="sm" 
                className="bg-[#36d7ff] hover:bg-[#1bc4ff] text-[#0a0a16]"
                onClick={() => setShowNewCampaignModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Campaign
              </Button>
            </div>
          </div>

          <div className="font-mono text-xs text-[#8b8ba7] mb-4 flex items-center">
            <div className="mr-3 flex items-center">
              <BarChart3 className="h-4 w-4 mr-1 text-[#36d7ff]" />
              <span>METRICS</span>
            </div>
            <div className="h-px bg-[#1e1e3a] flex-grow"></div>
          </div>

          <div className="animate-fade-in animation-delay-300">
            <StatsCards />
          </div>
          
          <div className="font-mono text-xs text-[#8b8ba7] mt-8 mb-4 flex items-center">
            <div className="mr-3 flex items-center">
              <Mail className="h-4 w-4 mr-1 text-[#36d7ff]" />
              <span>CAMPAIGNS</span>
            </div>
            <div className="h-px bg-[#1e1e3a] flex-grow"></div>
          </div>

          <div className="animate-fade-in animation-delay-500">
            <Card className="bg-[#101024] border-[#1e1e3a] shadow-md overflow-hidden mb-8">
              <CardContent className="p-0">
                <CampaignsTable />
              </CardContent>
            </Card>
          </div>

          <div className="font-mono text-xs text-[#8b8ba7] mt-8 mb-4 flex items-center">
            <div className="mr-3 flex items-center">
              <Activity className="h-4 w-4 mr-1 text-[#36d7ff]" />
              <span>PERFORMANCE</span>
            </div>
            <div className="h-px bg-[#1e1e3a] flex-grow"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 animate-fade-in animation-delay-700">
              <Card className="bg-[#101024] border-[#1e1e3a] shadow-md overflow-hidden h-full">
                <div className="px-4 py-3 border-b border-[#1e1e3a] flex justify-between items-center">
                  <h3 className="font-medium text-[#e0e0ff] flex items-center text-sm">
                    <Activity className="h-4 w-4 mr-2 text-[#36d7ff]" />
                    Email Performance
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-[#1e1e3a] text-[#e0e0ff] hover:bg-[#252550]">30 Days</Badge>
                    <Badge variant="outline" className="border-[#1e1e3a] text-[#8b8ba7] hover:bg-[#151536]">60 Days</Badge>
                    <Badge variant="outline" className="border-[#1e1e3a] text-[#8b8ba7] hover:bg-[#151536]">90 Days</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <AnalyticsChart />
                </CardContent>
              </Card>
            </div>
            <div className="animate-fade-in animation-delay-900">
              <Card className="bg-[#101024] border-[#1e1e3a] shadow-md overflow-hidden h-full">
                <div className="px-4 py-3 border-b border-[#1e1e3a] flex justify-between items-center">
                  <h3 className="font-medium text-[#e0e0ff] flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-[#36d7ff]" />
                    Audience Growth
                  </h3>
                  <Badge variant="outline" className="text-[#00ff9d] border-[#00ff9d]/30 bg-[#00ff9d]/10">
                    +4.2%
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <AudienceGrowth />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="font-mono text-xs text-[#8b8ba7] mt-8 mb-4 flex items-center">
            <div className="mr-3 flex items-center">
              <Database className="h-4 w-4 mr-1 text-[#36d7ff]" />
              <span>QUICK ACCESS</span>
            </div>
            <div className="h-px bg-[#1e1e3a] flex-grow"></div>
          </div>

          <div className="animate-fade-in animation-delay-1000">
            <QuickActions onCreateEmail={() => setShowComposeEmailModal(true)} />
          </div>
          
          <div className="mt-10 pt-6 border-t border-[#1e1e3a] flex justify-between items-center">
            <div className="text-xs text-[#8b8ba7] font-mono">
              <div className="flex items-center mb-1">
                <div className="w-2 h-2 bg-[#36d7ff] rounded-full animate-pulse mr-2"></div>
                <span>AI Engine: GPT-4o • System ready</span>
              </div>
              <div>© {new Date().getFullYear()} Infinity Tech. All rights reserved.</div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="link" size="sm" className="text-[#8b8ba7] hover:text-[#36d7ff]">
                Documentation
              </Button>
              <Button variant="link" size="sm" className="text-[#8b8ba7] hover:text-[#36d7ff]">
                Support
              </Button>
              <Button variant="link" size="sm" className="text-[#8b8ba7] hover:text-[#36d7ff]">
                Settings
              </Button>
            </div>
          </div>
          
          {showNewCampaignModal && 
            <NewCampaignModal onClose={() => setShowNewCampaignModal(false)} />
          }
          
          {showComposeEmailModal && 
            <ComposeEmailModal onClose={() => setShowComposeEmailModal(false)} />
          }
        </>
      )}
    </div>
  );
};

export default Dashboard;
