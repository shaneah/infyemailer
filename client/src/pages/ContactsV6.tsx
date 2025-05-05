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
  DialogTitle
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
import { Textarea } from "@/components/ui/textarea";
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
  Eye, 
  List,
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

// Color utility functions
const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'Active': 'bg-green-500',
    'Inactive': 'bg-gray-400',
    'Pending': 'bg-amber-500',
    'Unsubscribed': 'bg-red-500',
    'Unknown': 'bg-purple-500',
    'Bounced': 'bg-red-500'
  };
  return colors[status] || 'bg-slate-500';
};

const getStatusBadgeColors = (status: string) => {
  const colors: { [key: string]: string } = {
    'Active': 'bg-green-100 text-green-800 border-green-300',
    'Inactive': 'bg-gray-100 text-gray-800 border-gray-300',
    'Pending': 'bg-amber-100 text-amber-800 border-amber-300',
    'Subscribed': 'bg-blue-100 text-blue-800 border-blue-300',
    'Unsubscribed': 'bg-red-100 text-red-800 border-red-300',
    'Bounced': 'bg-red-100 text-red-800 border-red-300'
  };
  return colors[status] || 'bg-purple-100 text-purple-800 border-purple-300';
};

const getTagBadgeColors = (tag: string) => {
  const tagColors: { [key: string]: string } = {
    'Lead': 'bg-blue-100 text-blue-800 border-blue-300',
    'Customer': 'bg-green-100 text-green-800 border-green-300',
    'Newsletter': 'bg-purple-100 text-purple-800 border-purple-300',
    'Event': 'bg-amber-100 text-amber-800 border-amber-300',
    'VIP': 'bg-purple-100 text-purple-800 border-purple-300',
    'Webinar': 'bg-blue-100 text-blue-800 border-blue-300',
    'Product Launch': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Former Customer': 'bg-gray-100 text-gray-800 border-gray-300'
  };
  return tagColors[tag] || 'bg-slate-100 text-slate-800 border-slate-300';
};

// Visual components
const ContactAnalytics: React.FC<{ contacts: any[] }> = ({ contacts }) => {
  // Calculate statistics
  const totalContacts = contacts.length;
  
  const activeContacts = contacts.filter(c => c.status === 'Active').length;
  const activePercentage = totalContacts > 0 ? (activeContacts / totalContacts) * 100 : 0;
  
  const inactiveContacts = contacts.filter(c => c.status === 'Inactive').length;
  const inactivePercentage = totalContacts > 0 ? (inactiveContacts / totalContacts) * 100 : 0;
  
  const bouncedContacts = contacts.filter(c => c.status === 'Bounced').length;
  const bouncedPercentage = totalContacts > 0 ? (bouncedContacts / totalContacts) * 100 : 0;

  // Engagement data - simulated here
  const engagementData = [
    { label: 'High (45%)', color: 'bg-green-500', percentage: 45 },
    { label: 'Medium (35%)', color: 'bg-amber-500', percentage: 35 },
    { label: 'Low (20%)', color: 'bg-red-500', percentage: 20 }
  ];
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Contact Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-50 border-none">
          <CardContent className="p-4">
            <div className="uppercase text-xs font-medium text-slate-500 mb-1">TOTAL CONTACTS</div>
            <div className="text-3xl font-bold">{totalContacts} <span className="text-sm text-slate-500 font-normal">contacts</span></div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-none">
          <CardContent className="p-4">
            <div className="uppercase text-xs font-medium text-green-700 mb-1">ACTIVE</div>
            <div className="text-3xl font-bold text-green-700">{activeContacts}</div>
            <div className="text-xs text-green-600 mt-1">{activePercentage.toFixed(0)}%</div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-none">
          <CardContent className="p-4">
            <div className="uppercase text-xs font-medium text-amber-700 mb-1">INACTIVE</div>
            <div className="text-3xl font-bold text-amber-700">{inactiveContacts}</div>
            <div className="text-xs text-amber-600 mt-1">{inactivePercentage.toFixed(0)}%</div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-none">
          <CardContent className="p-4">
            <div className="uppercase text-xs font-medium text-red-700 mb-1">BOUNCED</div>
            <div className="text-3xl font-bold text-red-700">{bouncedContacts}</div>
            <div className="text-xs text-red-600 mt-1">{bouncedPercentage.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Engagement Distribution</h3>
        <div className="text-xs text-slate-500 mb-1">Based on open rates, clicks and activity</div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          {engagementData.map((segment, index) => (
            <div 
              key={index}
              className={`h-full ${segment.color} float-left`}
              style={{ width: `${segment.percentage}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {engagementData.map((segment, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div className={`w-2 h-2 rounded-full ${segment.color}`}></div>
              <span>{segment.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TagOverview: React.FC = () => {
  const tags = [
    { name: 'Customer', count: 4, id: 1 },
    { name: 'Newsletter', count: 2, id: 2 },
    { name: 'Lead', count: 3, id: 3 },
    { name: 'Event', count: 1, id: 4 },
    { name: 'VIP', count: 1, id: 5 },
    { name: 'Webinar', count: 1, id: 6 },
    { name: 'Product Launch', count: 1, id: 7 },
    { name: 'Former Customer', count: 1, id: 8 }
  ];
  
  return (
    <div className="mb-6 mt-4">
      <h3 className="text-base font-medium mb-3">Tag Overview</h3>
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

const TopEngagedContacts: React.FC = () => {
  const topContacts = [
    { 
      id: 1, 
      name: 'Robert Jones', 
      email: 'robert.jones@example.com',
      engagementScore: 95,
      avatar: 'RJ'
    },
    { 
      id: 2, 
      name: 'John Smith', 
      email: 'john.smith@example.com',
      engagementScore: 86,
      avatar: 'JS'
    },
    { 
      id: 3, 
      name: 'Amanda Wilson', 
      email: 'amanda.wilson@example.com',
      engagementScore: 81,
      avatar: 'AW'
    }
  ];
  
  return (
    <div className="mb-6">
      <h3 className="text-base font-medium mb-3">Top Engaged Contacts</h3>
      <div className="space-y-3">
        {topContacts.map(contact => (
          <div key={contact.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={contact.id === 1 ? "bg-orange-500" : 
                                         contact.id === 2 ? "bg-blue-500" : 
                                         "bg-purple-500"}>
                  {contact.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{contact.name}</div>
                <div className="text-xs text-gray-500">{contact.email}</div>
              </div>
            </div>
            <div className="w-32 bg-green-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full" 
                style={{ width: `${contact.engagementScore}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main component
const ContactsV6: React.FC = () => {
  // State management
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [currentContact, setCurrentContact] = useState<any>(null);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
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
    queryFn: async () => {
      const res = await fetch('/api/contacts');
      if (!res.ok) {
        throw new Error(`Failed to fetch contacts: ${res.status} ${res.statusText}`);
      }
      return res.json();
    },
    initialData: [
      {
        id: 1,
        name: "Amanda Wilson",
        email: "amanda.wilson@example.com",
        status: "Active",
        tags: ["Lead", "Webinar"],
        source: "Webinar",
        engagement: 81,
        dateAdded: "3/22/2025"
      },
      {
        id: 2,
        name: "David Miller",
        email: "david.miller@example.com",
        status: "Inactive",
        tags: ["Former Customer"],
        source: "Import",
        engagement: 5,
        dateAdded: "10/12/2024"
      },
      {
        id: 3,
        name: "Emily Johnson",
        email: "emily.johnson@example.com",
        status: "Active",
        tags: ["Lead", "Event"],
        source: "Webinar",
        engagement: 72,
        dateAdded: "2/3/2025"
      },
      {
        id: 4,
        name: "Jessica Brown",
        email: "jessica.brown@example.com",
        status: "Active",
        tags: ["Customer", "Newsletter"],
        source: "Website",
        engagement: 67,
        dateAdded: "2/15/2025"
      },
      {
        id: 5,
        name: "John Smith",
        email: "john.smith@example.com",
        status: "Active",
        tags: ["Customer", "Newsletter"],
        source: "Website",
        engagement: 86,
        dateAdded: "1/15/2025"
      },
      {
        id: 6,
        name: "Michael Williams",
        email: "michael.williams@example.com",
        status: "Inactive",
        tags: ["Customer", "Product Launch"],
        source: "Referral",
        engagement: 23,
        dateAdded: "11/20/2024"
      },
      {
        id: 7,
        name: "Robert Jones",
        email: "robert.jones@example.com",
        status: "Active",
        tags: ["Customer", "VIP"],
        source: "Direct",
        engagement: 95,
        dateAdded: "12/5/2024"
      }
    ],
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
      setShowAddContactDialog(false);
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
      const res = await apiRequest('PATCH', `/api/contacts/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact updated",
        description: "Contact has been successfully updated.",
      });
      setShowAddContactDialog(false);
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
  
  // Filter contacts based on search query, status, and tag
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      searchQuery === "" ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      selectedStatus === "all" ||
      (contact.status?.toLowerCase() === selectedStatus.toLowerCase());
    
    const matchesTag =
      selectedTag === "all" ||
      (contact.tags && 
       (typeof contact.tags === "string"
         ? contact.tags.toLowerCase().includes(selectedTag.toLowerCase())
         : contact.tags.some((tag: string) => 
             tag.toLowerCase() === selectedTag.toLowerCase())));
    
    return matchesSearch && matchesStatus && matchesTag;
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof contactFormSchema>) => {
    if (currentContact) {
      updateContactMutation.mutate({
        id: currentContact.id,
        data: values
      });
    } else {
      createContactMutation.mutate(values);
    }
  };
  
  // Handle edit contact
  const handleEditContact = (contact: any) => {
    setCurrentContact(contact);
    form.reset({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      status: contact.status || "Active",
      tags: typeof contact.tags === 'string' ? contact.tags : (contact.tags || []).join(", "),
      source: contact.source || "",
      company: contact.company || "",
      jobTitle: contact.jobTitle || "",
      notes: contact.notes || "",
    });
    setShowAddContactDialog(true);
  };
  
  // Handle delete contact
  const handleDeleteContact = (id: number) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      deleteContactMutation.mutate(id);
    }
  };
  
  // Toggle contact selection
  const toggleContactSelection = (id: number) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };
  
  // Toggle select all contacts
  useEffect(() => {
    if (selectAll) {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  }, [selectAll, filteredContacts]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <User className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          </div>
          <p className="text-gray-500 mt-1">Manage your audience and track engagement</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("table")}
            >
              <Table className="h-4 w-4 mr-1" />
              Table
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("cards")}
            >
              <Grid className="h-4 w-4 mr-1" />
              Cards
            </Button>
          </div>
          
          <Button 
            variant="default" 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
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
              setShowAddContactDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Contact
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Import
          </Button>
        </div>
      </div>
      
      {/* Analytics and Tag Overview sections */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <ContactAnalytics contacts={contacts} />
        </div>
        <div className="xl:col-span-1">
          <div className="space-y-4">
            <TagOverview />
            <TopEngagedContacts />
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contacts by name, email or notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="bounced">Bounced</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={selectedTag}
            onValueChange={setSelectedTag}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="engagement">Sort by Engagement</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Contact table/grid */}
      {isLoadingContacts ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p>Loading contacts...</p>
          </div>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 p-3 rounded-full mb-4">
            <Users className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium">No contacts found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery || selectedStatus !== "all" || selectedTag !== "all" 
              ? "Try adjusting your filters"
              : "Add your first contact to get started"}
          </p>
          <Button 
            variant="default"
            className="mt-4"
            onClick={() => {
              setCurrentContact(null);
              form.reset();
              setShowAddContactDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Contact
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              Showing {filteredContacts.length} of {contacts.length} contacts
            </p>
            <Button variant="outline" size="sm" onClick={() => setSelectAll(!selectAll)}>
              {selectAll ? "Deselect All" : "Select All"}
            </Button>
          </div>
          
          {viewMode === "table" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={() => setSelectAll(!selectAll)}
                      />
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleContactSelection(contact.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={
                              contact.name === "Robert Jones" ? "bg-orange-500" :
                              contact.name === "John Smith" ? "bg-blue-500" :
                              contact.name === "Amanda Wilson" ? "bg-purple-500" :
                              contact.name === "Jessica Brown" ? "bg-emerald-500" :
                              contact.name === "Emily Johnson" ? "bg-pink-500" :
                              contact.name === "David Miller" ? "bg-red-500" :
                              "bg-gray-500"
                            }>
                              {contact.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-xs text-gray-500">
                              {contact.source}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColors(contact.status)}>
                          {contact.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={contact.engagement} 
                            className="h-2 w-16" 
                          />
                          <span className="text-sm">{contact.engagement}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(contact.tags) 
                            ? contact.tags.map((tag: string, index: number) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className={getTagBadgeColors(tag)}
                                >
                                  {tag}
                                </Badge>
                              ))
                            : typeof contact.tags === 'string' 
                              ? contact.tags.split(',').map((tag: string, index: number) => (
                                  <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className={getTagBadgeColors(tag.trim())}
                                  >
                                    {tag.trim()}
                                  </Badge>
                                ))
                              : null
                          }
                        </div>
                      </TableCell>
                      <TableCell>{contact.dateAdded}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditContact(contact)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
              {filteredContacts.map((contact) => (
                <Card key={contact.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className={
                            contact.name === "Robert Jones" ? "bg-orange-500" :
                            contact.name === "John Smith" ? "bg-blue-500" :
                            contact.name === "Amanda Wilson" ? "bg-purple-500" :
                            contact.name === "Jessica Brown" ? "bg-emerald-500" :
                            contact.name === "Emily Johnson" ? "bg-pink-500" :
                            contact.name === "David Miller" ? "bg-red-500" :
                            "bg-gray-500"
                          }>
                            {contact.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleContactSelection(contact.id)}
                        />
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <h3 className="font-semibold">{contact.name}</h3>
                        <p className="text-sm text-blue-600">{contact.email}</p>
                        <p className="text-xs text-gray-500">Source: {contact.source}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="outline" className={getStatusBadgeColors(contact.status)}>
                          {contact.status}
                        </Badge>
                        
                        {Array.isArray(contact.tags) 
                          ? contact.tags.map((tag: string, index: number) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className={getTagBadgeColors(tag)}
                              >
                                {tag}
                              </Badge>
                            ))
                          : typeof contact.tags === 'string' 
                            ? contact.tags.split(',').map((tag: string, index: number) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className={getTagBadgeColors(tag.trim())}
                                >
                                  {tag.trim()}
                                </Badge>
                              ))
                            : null
                        }
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Engagement:</span>
                        <Progress 
                          value={contact.engagement} 
                          className="h-2 flex-1" 
                        />
                        <span className="text-xs font-medium">{contact.engagement}%</span>
                      </div>
                    </div>
                    
                    <div className="flex border-t divide-x">
                      <Button 
                        variant="ghost" 
                        className="flex-1 rounded-none h-10" 
                        onClick={() => handleEditContact(contact)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="flex-1 rounded-none h-10 text-red-600 hover:text-red-700 hover:bg-red-50" 
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Add/Edit Contact Dialog */}
      <Dialog open={showAddContactDialog} onOpenChange={setShowAddContactDialog}>
        <DialogContent className="w-[calc(100%-32px)] sm:max-w-[600px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl">{currentContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
            <DialogDescription>
              {currentContact 
                ? "Update contact information and preferences." 
                : "Enter contact details to add them to your list."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Full name" 
                          {...field} 
                          className="py-6 sm:py-2 text-base sm:text-sm"
                          inputMode="text"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Email address" 
                          {...field} 
                          className="py-6 sm:py-2 text-base sm:text-sm"
                          inputMode="email"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Phone number" 
                          {...field} 
                          className="py-6 sm:py-2 text-base sm:text-sm"
                          inputMode="tel"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Bounced">Bounced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">Tags (Comma Separated)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. VIP, Newsletter, Lead" 
                          {...field} 
                          className="py-6 sm:py-2 text-base sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">Source</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                            <SelectValue placeholder="Select a source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Import">Import</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                          <SelectItem value="Webinar">Webinar</SelectItem>
                          <SelectItem value="Direct">Direct</SelectItem>
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
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">Company (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Company name" 
                          {...field} 
                          className="py-6 sm:py-2 text-base sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">Job Title (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Job title" 
                          {...field} 
                          className="py-6 sm:py-2 text-base sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information about this contact..." 
                        className="min-h-[100px] py-3 text-base sm:text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddContactDialog(false);
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
                  {createContactMutation.isPending || updateContactMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {currentContact ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    currentContact ? "Update Contact" : "Add Contact"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsV6;