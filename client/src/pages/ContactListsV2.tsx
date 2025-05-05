import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Icons
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Users, 
  Grid2X2, 
  ListFilter, 
  Clock, 
  Tag, 
  ArrowUpRight, 
  LayoutList, 
  BarChart
} from "lucide-react";

// Schema for new list form
const listFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  tags: z.string().optional(),
});

// Color utility function
const getTagBadgeColors = (tag: string) => {
  const tagColors: { [key: string]: string } = {
    'Active': 'bg-green-100 text-green-800 border-green-300',
    'Newsletter': 'bg-purple-100 text-purple-800 border-purple-300',
    'VIP': 'bg-purple-100 text-purple-800 border-purple-300',
    'Customer': 'bg-blue-100 text-blue-800 border-blue-300',
    'Event': 'bg-amber-100 text-amber-800 border-amber-300',
    'Webinar': 'bg-blue-100 text-blue-800 border-blue-300',
    'Product Launch': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Marketing': 'bg-pink-100 text-pink-800 border-pink-300'
  };
  return tagColors[tag] || 'bg-slate-100 text-slate-800 border-slate-300';
};

// Visual components
const ListAnalytics: React.FC<{ lists: any[] }> = ({ lists }) => {
  // Calculate total contacts
  const totalContacts = lists.reduce((sum, list) => sum + list.contactCount, 0);
  
  // Calculate average metrics
  const calculateAverageRate = (key: string) => {
    if (lists.length === 0) return 0;
    const sum = lists.reduce((acc, list) => acc + (list[key] || 0), 0);
    return (sum / lists.length).toFixed(1);
  };
  
  const avgOpenRate = calculateAverageRate('openRate');
  const avgClickRate = calculateAverageRate('clickRate');
  
  // Calculate growth indicator
  const growth = 9.7; // Simulated for demo
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">List Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-slate-50 border-none relative">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-1">
              <div className="uppercase text-xs font-medium text-slate-500">TOTAL LISTS</div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Active</Badge>
            </div>
            <div className="text-3xl font-bold">{lists.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-none relative">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-1">
              <div className="uppercase text-xs font-medium text-purple-700">TOTAL CONTACTS</div>
              {growth > 0 && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {growth}%
                </Badge>
              )}
            </div>
            <div className="text-3xl font-bold text-purple-700">{totalContacts.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-none">
          <CardContent className="p-4">
            <div className="uppercase text-xs font-medium text-amber-700 mb-1">AVG. OPEN RATE</div>
            <div className="text-3xl font-bold text-amber-700">{avgOpenRate}%</div>
            <div className="text-xs text-amber-600 mt-1">Across all lists</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-none">
          <CardContent className="p-4">
            <div className="uppercase text-xs font-medium text-green-700 mb-1">AVG. CLICK RATE</div>
            <div className="text-3xl font-bold text-green-700">{avgClickRate}%</div>
            <div className="text-xs text-green-600 mt-1">Across all lists</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        Data updated: 5/5/2025 2:25:19 PM
      </div>
    </div>
  );
};

const TagsOverview: React.FC = () => {
  const tags = [
    { name: 'Active', count: 1, id: 1 },
    { name: 'Newsletter', count: 1, id: 2 },
    { name: 'VIP', count: 1, id: 3 },
    { name: 'Customer', count: 1, id: 4 },
    { name: 'Event', count: 1, id: 5 },
    { name: 'Webinar', count: 1, id: 6 },
    { name: 'Product Launch', count: 1, id: 7 },
    { name: 'Marketing', count: 1, id: 8 }
  ];
  
  return (
    <div className="mb-6 mt-4">
      <h3 className="text-base font-medium mb-3">Tags Overview</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <div 
            key={tag.id}
            className={`rounded-md px-3 py-1 text-xs ${getTagBadgeColors(tag.name)}`}
          >
            {tag.name} <span className="ml-1 opacity-80">({tag.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TopPerformingLists: React.FC = () => {
  const topLists = [
    { 
      id: 1, 
      name: 'VIP Customers', 
      engagement: 94,
    },
    { 
      id: 2, 
      name: 'Newsletter Subscribers', 
      engagement: 83,
    }
  ];
  
  return (
    <div className="mb-6">
      <h3 className="text-base font-medium mb-3">Top Performing Lists</h3>
      <div className="space-y-3">
        {topLists.map(list => (
          <div key={list.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{list.name}</div>
              <div className="text-xs text-gray-500">{list.engagement}% engagement</div>
            </div>
            <div className="w-32 bg-green-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full" 
                style={{ width: `${list.engagement}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// List card component
const ListCard: React.FC<{ 
  list: any;
  onManageContacts: (listId: number) => void;
  onDuplicate: (listId: number) => void;
  onMenu: (listId: number) => void;
}> = ({ list, onManageContacts, onDuplicate, onMenu }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg font-semibold">{list.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onMenu(list.id)}>
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
        <CardDescription>{list.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-1 mb-3">
          {list.tags && list.tags.map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className={getTagBadgeColors(tag)}>
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Contacts</div>
            <div className="flex items-center gap-1">
              <div className="text-lg font-semibold">{list.contactCount.toLocaleString()}</div>
              {list.growthRate > 0 && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                  +{list.growthRate}%
                </Badge>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Engagement</div>
            <div className="flex items-center gap-1">
              <div className="text-lg font-semibold">{list.engagementScore}%</div>
              {list.growthRate > 0 && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                  +{list.growthRate}%
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="h-3 w-3" />
            Last updated: {list.lastUpdated}
          </div>
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Last campaign: {list.lastCampaign}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1"
          onClick={() => onManageContacts(list.id)}
        >
          Manage Contacts
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDuplicate(list.id)}
        >
          Duplicate
        </Button>
      </CardFooter>
    </Card>
  );
};

// Main component
const ContactListsV2: React.FC = () => {
  // State management
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [showCreateListDialog, setShowCreateListDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [currentList, setCurrentList] = useState<any>(null);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Form management
  const form = useForm<z.infer<typeof listFormSchema>>({
    resolver: zodResolver(listFormSchema),
    defaultValues: {
      name: "",
      description: "",
      tags: "",
    },
  });
  
  // Mock list data - would be fetched from API in real implementation
  const lists = [
    {
      id: 1,
      name: "Newsletter Subscribers",
      contactCount: 1240,
      description: "All active newsletter subscribers",
      lastUpdated: "3/15/2025",
      tags: ["Active", "Newsletter"],
      growthRate: 12.4,
      openRate: 24.8,
      clickRate: 3.2,
      engagementScore: 83,
      lastCampaign: "Monthly Update - March 2025"
    },
    {
      id: 2,
      name: "Product Launch Interests",
      contactCount: 890,
      description: "Contacts interested in our new product launch",
      lastUpdated: "2/6/2025",
      tags: ["Product Launch", "Marketing"],
      growthRate: 6.7,
      openRate: 32.5,
      clickRate: 7.8,
      engagementScore: 81,
      lastCampaign: "Product Teaser - February 2025"
    },
    {
      id: 3,
      name: "VIP Customers",
      contactCount: 156,
      description: "High-value customers with premium status",
      lastUpdated: "2/20/2025",
      tags: ["VIP", "Customer"],
      growthRate: 3.6,
      openRate: 56.2,
      clickRate: 12.5,
      engagementScore: 94,
      lastCampaign: "Exclusive Offer - February 2025"
    },
    {
      id: 4,
      name: "Webinar Attendees - March 2025",
      contactCount: 435,
      description: "People who registered for our March webinar",
      lastUpdated: "3/5/2025",
      tags: ["Event", "Webinar"],
      growthRate: 0,
      openRate: 38.4,
      clickRate: 5.2,
      engagementScore: 76,
      lastCampaign: "Webinar Follow-up - March 2025"
    }
  ];
  
  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: async (listData: any) => {
      // This would be a real API call in production
      console.log("Creating list:", listData);
      // Simulate API request
      return { ...listData, id: Math.floor(Math.random() * 1000) };
    },
    onSuccess: () => {
      // This would invalidate the query cache in production
      toast({
        title: "List created",
        description: "New list has been successfully created.",
      });
      setShowCreateListDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create list.",
        variant: "destructive",
      });
    },
  });
  
  // Update list mutation
  const updateListMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // This would be a real API call in production
      console.log("Updating list:", id, data);
      // Simulate API request
      return { ...data, id };
    },
    onSuccess: () => {
      toast({
        title: "List updated",
        description: "List has been successfully updated.",
      });
      setShowCreateListDialog(false);
      setCurrentList(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update list.",
        variant: "destructive",
      });
    },
  });
  
  // Filter lists based on search query and tag
  const filteredLists = lists.filter((list) => {
    const matchesSearch = 
      searchQuery === "" ||
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.description && list.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTag =
      selectedTag === "all" ||
      (list.tags && list.tags.some((tag: string) => tag.toLowerCase() === selectedTag.toLowerCase()));
    
    return matchesSearch && matchesTag;
  });
  
  // Sort lists based on sort by selection
  const sortedLists = [...filteredLists].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "contacts") {
      return b.contactCount - a.contactCount;
    } else if (sortBy === "engagement") {
      return b.engagementScore - a.engagementScore;
    } else if (sortBy === "date") {
      // Assuming lastUpdated is a date string in MM/DD/YYYY format
      const dateA = new Date(a.lastUpdated);
      const dateB = new Date(b.lastUpdated);
      return dateB.getTime() - dateA.getTime();
    }
    return 0;
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof listFormSchema>) => {
    const formattedValues = {
      ...values,
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : []
    };
    
    if (currentList) {
      updateListMutation.mutate({
        id: currentList.id,
        data: formattedValues
      });
    } else {
      createListMutation.mutate(formattedValues);
    }
  };
  
  // Handle edit list
  const handleEditList = (list: any) => {
    setCurrentList(list);
    form.reset({
      name: list.name,
      description: list.description || "",
      tags: list.tags ? list.tags.join(", ") : "",
    });
    setShowCreateListDialog(true);
  };
  
  // Handle manage contacts
  const handleManageContacts = (listId: number) => {
    toast({
      title: "Manage Contacts",
      description: `Opening contacts management for list ${listId}`,
    });
    // In a real app, this would navigate to a contacts management page for this list
  };
  
  // Handle duplicate list
  const handleDuplicateList = (listId: number) => {
    toast({
      title: "Duplicate List",
      description: `Duplicating list ${listId}`,
    });
    // In a real app, this would create a duplicate of the list
  };
  
  // Handle list menu
  const handleListMenu = (listId: number) => {
    const list = lists.find(l => l.id === listId);
    if (list) {
      handleEditList(list);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Contact Lists</h1>
          </div>
          <p className="text-gray-500 mt-1">Organize and manage your audience segments</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid2X2 className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
          
          <Button 
            variant="default" 
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
            onClick={() => {
              setCurrentList(null);
              form.reset({
                name: "",
                description: "",
                tags: "",
              });
              setShowCreateListDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create List
          </Button>
        </div>
      </div>
      
      {/* Analytics section */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <ListAnalytics lists={lists} />
        </div>
        <div className="xl:col-span-1">
          <div className="space-y-4">
            <TagsOverview />
            <TopPerformingLists />
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search lists by name or description..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={selectedTag}
            onValueChange={setSelectedTag}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="contacts">Sort by Contacts</SelectItem>
              <SelectItem value="engagement">Sort by Engagement</SelectItem>
              <SelectItem value="date">Sort by Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilterDialog(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Lists grid/list */}
      {sortedLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 p-3 rounded-full mb-4">
            <Users className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium">No lists found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery || selectedTag !== "all" 
              ? "Try adjusting your filters"
              : "Create your first list to get started"}
          </p>
          <Button 
            variant="default"
            className="mt-4"
            onClick={() => {
              setCurrentList(null);
              form.reset();
              setShowCreateListDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create List
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedLists.map((list) => (
            <ListCard 
              key={list.id} 
              list={list} 
              onManageContacts={handleManageContacts}
              onDuplicate={handleDuplicateList}
              onMenu={handleListMenu}
            />
          ))}
        </div>
      )}
      
      {/* Create/Edit List Dialog */}
      <Dialog open={showCreateListDialog} onOpenChange={setShowCreateListDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{currentList ? "Edit List" : "Create New List"}</DialogTitle>
            <DialogDescription>
              {currentList 
                ? "Update list details and settings." 
                : "Create a new segment to organize your contacts."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">List Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Newsletter Subscribers"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose of this list..."
                    className="h-20"
                    {...form.register("description")}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (Comma Separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g. Newsletter, Active, VIP"
                    {...form.register("tags")}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add tags to categorize and filter your lists easily
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowCreateListDialog(false);
                  setCurrentList(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createListMutation.isPending || updateListMutation.isPending}
              >
                {createListMutation.isPending || updateListMutation.isPending ? (
                  currentList ? "Updating..." : "Creating..."
                ) : (
                  currentList ? "Update List" : "Create List"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filter Contact Lists</DialogTitle>
            <DialogDescription>
              Refine your lists based on specific criteria and engagement metrics.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">List Status</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="tag-newsletter" />
                  <label htmlFor="tag-newsletter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Newsletter
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="tag-vip" />
                  <label htmlFor="tag-vip" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    VIP
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="tag-customer" />
                  <label htmlFor="tag-customer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Customer
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="tag-event" />
                  <label htmlFor="tag-event" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Event
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="tag-webinar" />
                  <label htmlFor="tag-webinar" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Webinar
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="tag-product" />
                  <label htmlFor="tag-product" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Product
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Contact Count</Label>
              <div className="flex items-center space-x-4">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="min-contacts" className="text-xs text-gray-500">Minimum</Label>
                  <Input
                    id="min-contacts"
                    type="number"
                    placeholder="0"
                    className="col-span-2"
                  />
                </div>
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="max-contacts" className="text-xs text-gray-500">Maximum</Label>
                  <Input
                    id="max-contacts"
                    type="number" 
                    placeholder="10000"
                    className="col-span-2"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Engagement Rate</Label>
              <div className="px-2">
                <Slider defaultValue={[0, 100]} max={100} step={1} />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">0%</span>
                  <span className="text-xs text-gray-500">50%</span>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-created">Created Date</Label>
              <Select defaultValue="any">
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="quarter">Last 3 months</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowFilterDialog(false)}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Reset filter logic would go here
                  toast({
                    title: "Filters cleared",
                    description: "All filters have been reset to default values."
                  });
                }}
              >
                Reset
              </Button>
              <Button 
                onClick={() => {
                  // Apply filter logic would go here
                  toast({
                    title: "Filters applied",
                    description: "The list has been filtered according to your criteria."
                  });
                  setShowFilterDialog(false);
                }}
              >
                Apply Filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactListsV2;