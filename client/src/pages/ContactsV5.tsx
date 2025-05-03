import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Icons
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Mail, 
  CheckCircle, 
  User, 
  Users, 
  ListFilter, 
  Grid, 
  LayoutGrid, 
  PieChart, 
  BarChart4, 
  UserPlus, 
  RefreshCw, 
  Tag, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Calendar, 
  Eye, 
  List, 
  XCircle, 
  Send, 
  Activity,
  Inbox,
  Settings,
  Bookmark,
  Star,
  AlertCircle
} from "lucide-react";

// Schema for new contact form
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  status: z.string().optional(),
  tags: z.string().optional(),
  source: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  notes: z.string().optional(),
});

// Status distribution component
const StatusDistribution = ({ contacts }: { contacts: any[] }) => {
  // Calculate status counts
  const statusCounts: { [key: string]: number } = {};
  contacts.forEach((contact: any) => {
    const status = contact.status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // Calculate percentages
  const total = contacts.length;
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / total) * 100)
  }));

  // Status colors
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Active': 'bg-green-500',
      'Inactive': 'bg-gray-400',
      'Pending': 'bg-amber-500',
      'Subscribed': 'bg-blue-500',
      'Unsubscribed': 'bg-red-500',
      'Unknown': 'bg-purple-500'
    };
    return colors[status] || 'bg-slate-500';
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-500" />
          Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusData.map(({ status, count, percentage }) => (
            <div key={status} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(status)} mr-2`}></div>
                  <span className="text-sm font-medium">{status}</span>
                </div>
                <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Tag overview component
const TagOverview = ({ contacts }: { contacts: any[] }) => {
  // Extract and count tags
  const tagCounts: { [key: string]: number } = {};
  contacts.forEach((contact: any) => {
    if (contact.tags) {
      const tags = typeof contact.tags === 'string' 
        ? contact.tags.split(',').map((t: any): string => t.trim()) 
        : [contact.tags];
      
      tags.forEach((tag: string) => {
        if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  // Convert to array and sort by count
  const tagData = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Show top 5 tags

  // Tag colors
  const getTagColor = (index: number): string => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-300',
      'bg-purple-100 text-purple-800 border-purple-300',
      'bg-green-100 text-green-800 border-green-300',
      'bg-amber-100 text-amber-800 border-amber-300',
      'bg-rose-100 text-rose-800 border-rose-300',
      'bg-indigo-100 text-indigo-800 border-indigo-300',
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Tag className="h-5 w-5 text-blue-500" />
          Top Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tagData.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tagData.map(({ tag, count }, index) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className={`text-xs px-2 py-1 ${getTagColor(index)}`}
              >
                {tag} <span className="ml-1 text-xs opacity-70">({count})</span>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No tags found</p>
        )}
      </CardContent>
    </Card>
  );
};

// Recent activity component
const RecentActivity = () => {
  const activities = [
    { 
      id: 1, 
      type: 'email_sent', 
      title: 'Campaign Email Sent', 
      description: 'Monthly newsletter sent to 2,543 contacts',
      time: '2 hours ago',
      icon: <Send className="h-4 w-4" />,
      color: 'text-blue-500 bg-blue-100'
    },
    { 
      id: 2, 
      type: 'contact_added', 
      title: '15 New Contacts Added', 
      description: 'Imported from CSV file',
      time: '5 hours ago',
      icon: <UserPlus className="h-4 w-4" />,
      color: 'text-green-500 bg-green-100'
    },
    { 
      id: 3, 
      type: 'tag_update', 
      title: 'Tags Updated', 
      description: 'Added "VIP" tag to 48 contacts',
      time: 'Yesterday',
      icon: <Tag className="h-4 w-4" />,
      color: 'text-purple-500 bg-purple-100'
    },
  ];

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 flex items-start">
              <div className={`${activity.color} p-2 rounded-full mr-3`}>
                {activity.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Contact grid item 
const ContactGridItem = ({ contact, onEdit, onDelete }: { contact: any, onEdit: (id: number) => void, onDelete: (id: number) => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
            {contact.avatarUrl ? (
              <AvatarImage src={contact.avatarUrl} alt={contact.name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-700 text-white">
                {contact.name ? contact.name.substring(0, 2).toUpperCase() : "CN"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => onEdit(contact.id)}>
              <Edit className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => onDelete(contact.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete contact</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          <h3 className="font-semibold text-lg">{contact.name}</h3>
          <p className="text-sm text-blue-600">{contact.email}</p>
          {contact.phone && <p className="text-sm text-gray-500">{contact.phone}</p>}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {contact.status && (
            <Badge variant="outline" className={`
              ${contact.status === 'Active' ? 'bg-green-100 text-green-800 border-green-300' : 
                contact.status === 'Inactive' ? 'bg-gray-100 text-gray-800 border-gray-300' : 
                contact.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                contact.status === 'Subscribed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                contact.status === 'Unsubscribed' ? 'bg-red-100 text-red-800 border-red-300' :
                'bg-purple-100 text-purple-800 border-purple-300'
              }
            `}>
              {contact.status}
            </Badge>
          )}
          
          {contact.tags && typeof contact.tags === 'string' && contact.tags.split(',').map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {tag.trim()}
            </Badge>
          ))}
        </div>

        <div className="text-xs text-gray-500 flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Added {new Date(contact.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-3 w-3 mr-1" />
            <span>0 campaigns</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main component
const ContactsV5: React.FC = () => {
  // State management
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [currentContact, setCurrentContact] = useState<any>(null);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Form management
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "Active",
      tags: "",
      source: "",
      company: "",
      jobTitle: "",
      notes: "",
    },
  });
  
  // Fetch contacts
  const { 
    data: contacts = [], 
    isLoading: isLoadingContacts,
    refetch: refetchContacts
  } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
    initialData: [],
  });
  
  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      const res = await apiRequest('POST', '/api/contacts', contactData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact created",
        description: "New contact has been successfully added.",
      });
      setShowContactDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create contact.",
        variant: "destructive",
      });
    },
  });
  
  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest('PUT', `/api/contacts/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact updated",
        description: "Contact has been successfully updated.",
      });
      setShowContactDialog(false);
      setCurrentContact(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact.",
        variant: "destructive",
      });
    },
  });
  
  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/contacts/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact deleted",
        description: "Contact has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contact.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof contactFormSchema>) => {
    if (currentContact) {
      updateContactMutation.mutate({
        id: currentContact.id,
        data: values,
      });
    } else {
      createContactMutation.mutate(values);
    }
  };
  
  // Handle edit contact
  const handleEditContact = (id: number) => {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      setCurrentContact(contact);
      form.reset({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        status: contact.status || "Active",
        tags: contact.tags || "",
        source: contact.source || "",
        company: contact.company || "",
        jobTitle: contact.jobTitle || "",
        notes: contact.notes || "",
      });
      setShowContactDialog(true);
    }
  };
  
  // Handle delete contact
  const handleDeleteContact = (id: number) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      deleteContactMutation.mutate(id);
    }
  };
  
  // Filter contacts based on search query and filters
  const filteredContacts = contacts.filter(contact => {
    // Search query
    const matchesSearch = searchQuery === "" || 
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = selectedStatus === "all" || contact.status === selectedStatus;
    
    // Tag filter
    const matchesTag = selectedTag === "all" || 
      (contact.tags && 
        (typeof contact.tags === 'string' ? 
          contact.tags.split(',').map((t: string) => t.trim()).includes(selectedTag) : 
          contact.tags === selectedTag
        )
      );
    
    return matchesSearch && matchesStatus && matchesTag;
  });
  
  // Extract unique statuses and tags for filters
  const statuses = Array.from(new Set(contacts.map(c => c.status).filter(Boolean)));
  
  const tags = Array.from(new Set(
    contacts.flatMap((c: any) => {
      if (!c.tags) return [];
      return typeof c.tags === 'string' ? 
        c.tags.split(',').map((t: string): string => t.trim()) : 
        [c.tags];
    }).filter(Boolean)
  ));
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with gradient background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-8 mb-8 shadow-lg"
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-bold mb-2 text-white">Contact Management</h1>
            <p className="text-white/90 max-w-xl">
              Manage your contacts, segment your audience, and track engagement metrics for your email campaigns.
            </p>
            <div className="mt-6 flex space-x-3">
              <Button 
                onClick={() => {
                  setCurrentContact(null);
                  form.reset({
                    name: "",
                    email: "",
                    phone: "",
                    status: "Active",
                    tags: "",
                    source: "",
                    company: "",
                    jobTitle: "",
                    notes: "",
                  });
                  setShowContactDialog(true);
                }}
                className="bg-white text-purple-700 hover:bg-purple-50 hover:text-purple-800 border-0 shadow-md flex items-center gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Contact</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                <span>Import Contacts</span>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm">
              <CardContent className="p-4 flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Total Contacts</p>
                  <p className="text-2xl font-bold text-white">{contacts.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm">
              <CardContent className="p-4 flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Active</p>
                  <p className="text-2xl font-bold text-white">
                    {contacts.filter(c => c.status === 'Active' || c.status === 'Subscribed').length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm">
              <CardContent className="p-4 flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-3">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Avg. Open Rate</p>
                  <p className="text-2xl font-bold text-white">32.4%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
      
      {/* Filters and controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6 flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:items-center"
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search input */}
          <div className="relative w-full sm:w-64 lg:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="search"
              placeholder="Search contacts..."
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[160px] bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Tag filter */}
          <div className="flex items-center space-x-2">
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[160px] bg-white">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button 
              variant={viewMode === "grid" ? "default" : "ghost"} 
              size="sm"
              className={viewMode === "grid" ? "bg-white shadow-sm" : "bg-transparent text-gray-500"}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              <span className="text-xs">Grid</span>
            </Button>
            <Button 
              variant={viewMode === "table" ? "default" : "ghost"} 
              size="sm"
              className={viewMode === "table" ? "bg-white shadow-sm" : "bg-transparent text-gray-500"}
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4 mr-1" />
              <span className="text-xs">Table</span>
            </Button>
          </div>
          
          {/* Refresh button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchContacts()}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="text-xs">Refresh</span>
          </Button>
          
          {/* Export button */}
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="text-xs">Export</span>
          </Button>
        </div>
      </motion.div>
      
      {/* Dashboard widgets */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <StatusDistribution contacts={contacts} />
        <TagOverview contacts={contacts} />
        <RecentActivity />
      </motion.div>
      
      {/* Contacts display (grid or table) */}
      {isLoadingContacts ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-12"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-500">Loading contacts...</p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Results summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mb-4"
          >
            <p className="text-sm text-gray-500">
              Showing {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
              {(searchQuery || selectedStatus !== 'all' || selectedTag !== 'all') && ' (filtered)'}
            </p>
          </motion.div>
          
          {filteredContacts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center"
            >
              <div className="flex flex-col items-center max-w-md mx-auto">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || selectedStatus !== 'all' || selectedTag !== 'all'
                    ? "No contacts match your current filters. Try adjusting your search criteria."
                    : "You haven't added any contacts yet. Add your first contact to get started."}
                </p>
                <Button 
                  onClick={() => {
                    setCurrentContact(null);
                    form.reset();
                    setShowContactDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <AnimatePresence>
                {filteredContacts.map(contact => (
                  <ContactGridItem 
                    key={contact.id} 
                    contact={contact} 
                    onEdit={handleEditContact} 
                    onDelete={handleDeleteContact} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map(contact => (
                      <TableRow key={contact.id} className="group">
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            {contact.avatarUrl ? (
                              <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-700 text-white text-xs">
                                {contact.name ? contact.name.substring(0, 2).toUpperCase() : "CN"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          {contact.name}
                          {contact.company && (
                            <div className="text-xs text-gray-500">{contact.company}</div>
                          )}
                        </TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone || "-"}</TableCell>
                        <TableCell>
                          {contact.status && (
                            <Badge variant="outline" className={`
                              ${contact.status === 'Active' ? 'bg-green-100 text-green-800 border-green-300' : 
                                contact.status === 'Inactive' ? 'bg-gray-100 text-gray-800 border-gray-300' : 
                                contact.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                contact.status === 'Subscribed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                contact.status === 'Unsubscribed' ? 'bg-red-100 text-red-800 border-red-300' :
                                'bg-purple-100 text-purple-800 border-purple-300'
                              }
                            `}>
                              {contact.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.tags && typeof contact.tags === 'string' ? (
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.split(',').slice(0, 2).map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                              {contact.tags.split(',').length > 2 && (
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                                  +{contact.tags.split(',').length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => handleEditContact(contact.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => handleDeleteContact(contact.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
        </>
      )}
      
      {/* Add/Edit Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
            <DialogDescription>
              {currentContact ? "Update contact information" : "Fill in the details to add a new contact."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Subscribed">Subscribed</SelectItem>
                          <SelectItem value="Unsubscribed">Unsubscribed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="Tags (comma separated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Import">Import</SelectItem>
                          <SelectItem value="Manual">Manual Entry</SelectItem>
                          <SelectItem value="API">API</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about this contact"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowContactDialog(false);
                    setCurrentContact(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createContactMutation.isPending || updateContactMutation.isPending}
                >
                  {(createContactMutation.isPending || updateContactMutation.isPending) && (
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  )}
                  {currentContact ? "Update Contact" : "Add Contact"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsV5;