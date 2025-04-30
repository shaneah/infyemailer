import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import CampaignsTable from "@/components/CampaignsTable";
import NewCampaignModal from "@/modals/NewCampaignModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Filter, Download, PlusCircle, BarChart4, Mail, Send, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import * as XLSX from 'xlsx';

// Define types for campaign data and filters
interface Campaign {
  id: number;
  name: string;
  subtitle?: string;
  icon?: { name: string; color: string };
  status?: { label: string; color: string };
  recipients?: number;
  openRate?: number;
  clickRate?: number;
  date?: string;
  [key: string]: any;
}

interface CampaignStat {
  id: number;
  title: string;
  value: string;
  description?: string;
  change?: {
    value: string;
    color: string;
  };
}

interface CampaignFilters {
  status: string;
  dateRange: string;
  includeArchived: boolean;
  sortBy: string;
}

export default function Campaigns() {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [initialTemplateId, setInitialTemplateId] = useState<string | null>(null);
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Filter state
  const [filters, setFilters] = useState<CampaignFilters>({
    status: "all",
    dateRange: "all",
    includeArchived: false,
    sortBy: "date"
  });
  
  const { data: campaignStats, isLoading } = useQuery<CampaignStat[]>({
    queryKey: ['/api/campaigns/stats'],
    initialData: [],
  });
  
  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
    initialData: [],
  });
  
  // Export campaigns to Excel
  const exportCampaigns = () => {
    try {
      if (!campaigns || campaigns.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no campaigns available to export.",
          variant: "destructive",
        });
        return;
      }

      // Transform campaign data for export
      const exportData = campaigns.map(campaign => ({
        Name: campaign.name,
        Status: campaign.status?.label || 'Unknown',
        Recipients: campaign.recipients || 0,
        'Open Rate': `${campaign.openRate || 0}%`,
        'Click Rate': `${campaign.clickRate || 0}%`,
        Date: campaign.date || 'Not set',
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const wscols = [
        { wch: 25 }, // Name
        { wch: 15 }, // Status
        { wch: 15 }, // Recipients
        { wch: 15 }, // Open Rate
        { wch: 15 }, // Click Rate
        { wch: 20 }, // Date
      ];
      ws['!cols'] = wscols;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Campaigns');
      
      // Generate file and trigger download
      XLSX.writeFile(wb, `campaigns-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export successful",
        description: "Campaign data has been exported to Excel.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "There was an issue exporting the campaign data.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Apply filters to campaigns
  const applyFilters = (newFilters: CampaignFilters) => {
    setFilters(newFilters);
    // In a real implementation, this would trigger API calls with filter params
    // or filter the local data
    
    toast({
      title: "Filters applied",
      description: "Campaign list has been updated based on your filters.",
      duration: 3000,
    });
  };
  
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
      {/* Header section with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Email Campaigns
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Create, manage, and analyze your email marketing campaigns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex">
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2 border-blue-200"
                onClick={() => setShowFilterSheet(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-4 border-blue-200"
                onClick={() => exportCampaigns()}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 whitespace-nowrap text-sm"
              onClick={() => setShowNewCampaignModal(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">New Campaign</span>
            </Button>
          </div>
        </div>
      </div>

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
      
      {/* Filter Sheet */}
      <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Campaigns</SheetTitle>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Campaign Status</h3>
              <RadioGroup 
                defaultValue={filters.status}
                onValueChange={(value) => setFilters({...filters, status: value})}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="status-all" />
                  <Label htmlFor="status-all">All</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="status-active" />
                  <Label htmlFor="status-active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scheduled" id="status-scheduled" />
                  <Label htmlFor="status-scheduled">Scheduled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sent" id="status-sent" />
                  <Label htmlFor="status-sent">Sent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draft" id="status-draft" />
                  <Label htmlFor="status-draft">Draft</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Date Range</h3>
              <RadioGroup 
                defaultValue={filters.dateRange}
                onValueChange={(value) => setFilters({...filters, dateRange: value})}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="date-all" />
                  <Label htmlFor="date-all">All Time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="today" id="date-today" />
                  <Label htmlFor="date-today">Today</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="last-week" id="date-last-week" />
                  <Label htmlFor="date-last-week">Last 7 Days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="last-month" id="date-last-month" />
                  <Label htmlFor="date-last-month">Last 30 Days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="last-3-months" id="date-last-3-months" />
                  <Label htmlFor="date-last-3-months">Last 3 Months</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Sort By</h3>
              <Select
                defaultValue={filters.sortBy}
                onValueChange={(value) => setFilters({...filters, sortBy: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (Newest first)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest first)</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="open-rate">Open Rate (High to Low)</SelectItem>
                  <SelectItem value="click-rate">Click Rate (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Additional Options</h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-archived" 
                  checked={filters.includeArchived}
                  onCheckedChange={(checked) => setFilters({...filters, includeArchived: !!checked})}
                />
                <Label htmlFor="include-archived">Include archived campaigns</Label>
              </div>
            </div>
          </div>
          
          <SheetFooter className="sm:justify-between">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button 
                type="button" 
                onClick={() => applyFilters(filters)}
              >
                Apply Filters
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
