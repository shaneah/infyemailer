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
import { ScrollArea } from "@/components/ui/scroll-area";

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
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  ArrowDownUp,
  FileText,
  Building,
  Phone,
  MapPin,
  AtSign,
  Calendar,
  Briefcase,
  MessageSquare,
  Star,
  StarHalf,
  XCircle,
  CheckCircle2
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
    'Active': 'bg-emerald-500 text-white',
    'Inactive': 'bg-slate-400 text-white',
    'Pending': 'bg-amber-500 text-white',
    'Unsubscribed': 'bg-red-500 text-white',
    'Unknown': 'bg-purple-500 text-white',
    'Bounced': 'bg-rose-500 text-white'
  };
  return colors[status] || 'bg-slate-500 text-white';
};

const getStatusBadgeColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'Active': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Inactive': 'bg-slate-100 text-slate-800 border-slate-200',
    'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
    'Unsubscribed': 'bg-red-100 text-red-800 border-red-200',
    'Unknown': 'bg-purple-100 text-purple-800 border-purple-200',
    'Bounced': 'bg-rose-100 text-rose-800 border-rose-200'
  };
  return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
};

const getEngagementColor = (level: string) => {
  const colors: { [key: string]: string } = {
    'High': 'text-emerald-600',
    'Medium': 'text-amber-600',
    'Low': 'text-slate-600',
    'None': 'text-slate-400'
  };
  return colors[level] || 'text-slate-500';
};

const ContactsV7 = () => {
  // State management
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [showContactDetailsDialog, setShowContactDetailsDialog] = useState(false);
  const [currentContact, setCurrentContact] = useState<any>(null);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;
  
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
    initialData: []
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contactFormSchema>) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setShowAddContactDialog(false);
      form.reset();
      toast({
        title: "Contact Created",
        description: "New contact has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create contact: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/contacts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setShowDeleteConfirm(false);
      setContactToDelete(null);
      toast({
        title: "Contact Deleted",
        description: "Contact has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete contact: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await apiRequest("POST", "/api/contacts/bulk-delete", { ids });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setSelectedContacts([]);
      setSelectAll(false);
      toast({
        title: "Contacts Deleted",
        description: `${selectedContacts.length} contacts have been removed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete contacts: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter contacts based on search, status, and tag
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      searchQuery === "" ||
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || contact.status === selectedStatus;
      
    const matchesTag =
      selectedTag === "all" ||
      (contact.tags && contact.tags.includes(selectedTag));

    return matchesSearch && matchesStatus && matchesTag;
  });

  // Sort contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (a[sortField] === null || a[sortField] === undefined) return 1;
    if (b[sortField] === null || b[sortField] === undefined) return -1;
    
    const aValue = typeof a[sortField] === 'string' ? a[sortField].toLowerCase() : a[sortField];
    const bValue = typeof b[sortField] === 'string' ? b[sortField].toLowerCase() : b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = sortedContacts.slice(startIndex, startIndex + itemsPerPage);

  // Get unique tags
  const allTags = contacts.reduce((tags: string[], contact) => {
    if (contact.tags) {
      const contactTags = typeof contact.tags === 'string' 
        ? contact.tags.split(',').map((tag: string) => tag.trim()) 
        : contact.tags;
      
      contactTags.forEach((tag: string) => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
    return tags;
  }, []);
  
  // Get unique statuses
  const allStatuses = [...new Set(contacts.map(contact => contact.status))].filter(Boolean);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof contactFormSchema>) => {
    createContactMutation.mutate(data);
  };

  // Handle contact deletion
  const handleDeleteContact = (id: number) => {
    setContactToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteContact = () => {
    if (contactToDelete !== null) {
      deleteContactMutation.mutate(contactToDelete);
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedContacts.length > 0) {
      bulkDeleteMutation.mutate(selectedContacts);
    }
  };

  // Handle checkbox selection
  const handleContactSelection = (id: number) => {
    setSelectedContacts(prev => {
      if (prev.includes(id)) {
        return prev.filter(contactId => contactId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllContacts = () => {
    if (selectAll) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(paginatedContacts.map(contact => contact.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle view contact
  const handleViewContact = (contact: any) => {
    setCurrentContact(contact);
    setShowContactDetailsDialog(true);
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Stats for the contacts
  const contactStats = {
    total: contacts.length,
    active: contacts.filter(c => c.status === 'Active').length,
    inactive: contacts.filter(c => c.status === 'Inactive').length,
    unsubscribed: contacts.filter(c => c.status === 'Unsubscribed').length,
    bounced: contacts.filter(c => c.status === 'Bounced').length,
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Contact Management</h1>
          <p className="text-teal-100 text-sm max-w-2xl">
            Manage your contacts, track engagement, and organize your audience for targeted campaigns
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-teal-100">Total</p>
                <p className="text-2xl font-bold text-white">{contactStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/30 rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-emerald-100" />
              </div>
              <div>
                <p className="text-xs font-medium text-teal-100">Active</p>
                <p className="text-2xl font-bold text-white">{contactStats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-slate-500/30 rounded-full p-2">
                <AlertCircle className="h-5 w-5 text-slate-100" />
              </div>
              <div>
                <p className="text-xs font-medium text-teal-100">Inactive</p>
                <p className="text-2xl font-bold text-white">{contactStats.inactive}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-rose-500/30 rounded-full p-2">
                <XCircle className="h-5 w-5 text-rose-100" />
              </div>
              <div>
                <p className="text-xs font-medium text-teal-100">Unsubscribed</p>
                <p className="text-2xl font-bold text-white">{contactStats.unsubscribed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/30 rounded-full p-2">
                <Mail className="h-5 w-5 text-amber-100" />
              </div>
              <div>
                <p className="text-xs font-medium text-teal-100">Bounced</p>
                <p className="text-2xl font-bold text-white">{contactStats.bounced}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Actions */}
      <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
          <div className="relative lg:col-span-5">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="text"
              placeholder="Search contacts..."
              className="pl-9 bg-gray-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="lg:col-span-2">
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
              <SelectTrigger className="bg-gray-50">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {allStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="lg:col-span-2">
            <Select value={selectedTag} onValueChange={(value) => setSelectedTag(value)}>
              <SelectTrigger className="bg-gray-50">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Tag" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 lg:col-span-3 justify-end">
            <Button 
              variant="outline" 
              className="border-gray-200 gap-1 text-gray-700"
              onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
            >
              {viewMode === "table" ? (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden md:inline">Cards</span>
                </>
              ) : (
                <>
                  <List className="h-4 w-4" />
                  <span className="hidden md:inline">Table</span>
                </>
              )}
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    className="bg-teal-600 hover:bg-teal-700 gap-1.5"
                    onClick={() => {
                      form.reset();
                      setShowAddContactDialog(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden md:inline">Add Contact</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new contact</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {/* Bulk Actions (if contacts selected) */}
      <AnimatePresence>
        {selectedContacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-gray-200 p-3 bg-white shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAllContacts} />
              <span>
                <span className="font-medium">{selectedContacts.length}</span> {selectedContacts.length === 1 ? 'contact' : 'contacts'} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-gray-700 border-gray-200"
                onClick={() => {
                  setSelectedContacts([]);
                  setSelectAll(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete Selected
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Contacts Display */}
      {isLoadingContacts ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
            <span className="text-gray-500">Loading contacts...</span>
          </div>
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center h-64">
            <div className="bg-gray-100 p-3 rounded-full mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-lg mb-1">No Contacts Found</h3>
            <p className="text-gray-500 text-sm text-center mb-4 max-w-md">
              You don't have any contacts yet. Add your first contact to get started with your email campaigns.
            </p>
            <Button onClick={() => setShowAddContactDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Contact
            </Button>
          </CardContent>
        </Card>
      ) : filteredContacts.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center h-64">
            <div className="bg-gray-100 p-3 rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-lg mb-1">No Matching Contacts</h3>
            <p className="text-gray-500 text-sm text-center mb-4 max-w-md">
              No contacts match your current filters. Try adjusting your search criteria or clear filters to see all contacts.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
                setSelectedTag("all");
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={paginatedContacts.length > 0 && selectedContacts.length === paginatedContacts.length}
                    onCheckedChange={handleSelectAllContacts}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Contact
                    {sortField === 'name' && (
                      <ArrowDownUp className={`h-3.5 w-3.5 ml-1 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortField === 'email' && (
                      <ArrowDownUp className={`h-3.5 w-3.5 ml-1 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      <ArrowDownUp className={`h-3.5 w-3.5 ml-1 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">Engagement</TableHead>
                <TableHead className="hidden lg:table-cell">Tags</TableHead>
                <TableHead 
                  className="hidden md:table-cell cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('addedDate')}
                >
                  <div className="flex items-center">
                    Date Added
                    {sortField === 'addedDate' && (
                      <ArrowDownUp className={`h-3.5 w-3.5 ml-1 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContacts.map((contact) => (
                <TableRow 
                  key={contact.id}
                  className="group hover:bg-gray-50"
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleContactSelection(contact.id)}
                    />
                  </TableCell>
                  <TableCell 
                    className="font-medium cursor-pointer"
                    onClick={() => handleViewContact(contact)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-gray-200">
                        <AvatarImage src={contact.avatarUrl} />
                        <AvatarFallback className="bg-teal-100 text-teal-800">
                          {contact.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center">
                          {contact.name}
                          <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                        </div>
                        {contact.company && (
                          <div className="text-xs text-gray-500">{contact.company}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`${getStatusBadgeColor(contact.status)} border text-xs font-medium px-2.5 py-0.5`}
                    >
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      {(contact.engagement || 'Low') === 'High' ? (
                        <>
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        </>
                      ) : (contact.engagement || 'Low') === 'Medium' ? (
                        <>
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <Star className="h-3.5 w-3.5 text-gray-300" />
                        </>
                      ) : (
                        <>
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <Star className="h-3.5 w-3.5 text-gray-300" />
                          <Star className="h-3.5 w-3.5 text-gray-300" />
                        </>
                      )}
                      <span className={`text-xs ${getEngagementColor(contact.engagement || 'Low')}`}>
                        {contact.engagement || 'Low'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {contact.tags && typeof contact.tags === 'string' 
                        ? contact.tags.split(',').map((tag: string, i: number) => (
                            <Badge 
                              key={i}
                              variant="outline" 
                              className="text-xs bg-gray-50 border-gray-200 text-gray-700 font-normal"
                            >
                              {tag.trim()}
                            </Badge>
                          ))
                        : Array.isArray(contact.tags) 
                          ? contact.tags.map((tag: string, i: number) => (
                              <Badge 
                                key={i}
                                variant="outline" 
                                className="text-xs bg-gray-50 border-gray-200 text-gray-700 font-normal"
                              >
                                {tag}
                              </Badge>
                            ))
                          : null
                      }
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-gray-500 text-sm">
                    {contact.addedDate 
                      ? new Date(contact.addedDate).toLocaleDateString() 
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-800"
                        onClick={() => handleViewContact(contact)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-800"
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredContacts.length)} of {filteredContacts.length} contacts
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 border-gray-200"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 p-0 ${
                        currentPage === pageNum 
                          ? "bg-teal-600 hover:bg-teal-700" 
                          : "border-gray-200"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 border-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedContacts.map((contact) => (
              <Card 
                key={contact.id} 
                className="overflow-hidden hover:shadow-md transition-shadow group"
              >
                <CardHeader className="pb-2 relative">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Checkbox 
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleContactSelection(contact.id)}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-gray-200">
                      <AvatarImage src={contact.avatarUrl} />
                      <AvatarFallback className="bg-teal-100 text-teal-800 text-lg">
                        {contact.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold">{contact.name}</CardTitle>
                      <CardDescription className="text-sm">{contact.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${getStatusBadgeColor(contact.status)} border text-xs font-medium px-2.5 py-0.5`}
                      >
                        {contact.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      {(contact.engagement || 'Low') === 'High' ? (
                        <>
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        </>
                      ) : (contact.engagement || 'Low') === 'Medium' ? (
                        <>
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <Star className="h-3.5 w-3.5 text-gray-300" />
                        </>
                      ) : (
                        <>
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <Star className="h-3.5 w-3.5 text-gray-300" />
                          <Star className="h-3.5 w-3.5 text-gray-300" />
                        </>
                      )}
                      <span className={`text-xs ${getEngagementColor(contact.engagement || 'Low')}`}>
                        {contact.engagement || 'Low'}
                      </span>
                    </div>
                    
                    {contact.company && (
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs col-span-2 mt-1">
                        <Building className="h-3 w-3" />
                        <span>{contact.company}</span>
                      </div>
                    )}
                    
                    {contact.phone && (
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs col-span-2">
                        <Phone className="h-3 w-3" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    
                    {contact.addedDate && (
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs col-span-2">
                        <Calendar className="h-3 w-3" />
                        <span>Added {new Date(contact.addedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {contact.tags && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {typeof contact.tags === 'string' 
                        ? contact.tags.split(',').map((tag: string, i: number) => (
                            <Badge 
                              key={i}
                              variant="outline" 
                              className="text-xs bg-gray-50 border-gray-200 text-gray-700 font-normal"
                            >
                              {tag.trim()}
                            </Badge>
                          ))
                        : Array.isArray(contact.tags) 
                          ? contact.tags.map((tag: string, i: number) => (
                              <Badge 
                                key={i}
                                variant="outline" 
                                className="text-xs bg-gray-50 border-gray-200 text-gray-700 font-normal"
                              >
                                {tag}
                              </Badge>
                            ))
                          : null
                      }
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-0 pb-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-700 h-8 px-2 gap-1"
                    onClick={() => handleViewContact(contact)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Card View Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-4 py-2 border border-gray-200 rounded-lg bg-white">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredContacts.length)} of {filteredContacts.length} contacts
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 border-gray-200"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 p-0 ${
                        currentPage === pageNum 
                          ? "bg-teal-600 hover:bg-teal-700" 
                          : "border-gray-200"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 border-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Add Contact Dialog */}
      <Dialog open={showAddContactDialog} onOpenChange={setShowAddContactDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Create a new contact record for your email marketing campaigns.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
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
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
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
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
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
                      <FormLabel>Company (optional)</FormLabel>
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
                      <FormLabel>Job Title (optional)</FormLabel>
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
                      <FormLabel>Tags (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Separate tags with commas (e.g. VIP, Newsletter, Product Updates)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional information about this contact" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="pt-4">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={createContactMutation.isPending}>
                  {createContactMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add Contact"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Contact Details Dialog */}
      <Dialog open={showContactDetailsDialog} onOpenChange={setShowContactDetailsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
          {currentContact && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-gray-200">
                    <AvatarImage src={currentContact.avatarUrl} />
                    <AvatarFallback className="bg-teal-100 text-teal-800 text-lg">
                      {currentContact.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{currentContact.name}</DialogTitle>
                    <div className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                      <AtSign className="h-3.5 w-3.5" />
                      {currentContact.email}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Badge className={`${getStatusBadgeColor(currentContact.status)} border text-xs font-medium px-2.5 py-1`}>
                    {currentContact.status}
                  </Badge>
                  
                  {currentContact.source && (
                    <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700 text-xs px-2.5 py-1">
                      Source: {currentContact.source}
                    </Badge>
                  )}
                </div>
              </DialogHeader>
              
              <div className="py-2">
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
                  {currentContact.company && (
                    <div className="col-span-2 md:col-span-1">
                      <div className="text-xs font-medium text-gray-500 mb-1">Company</div>
                      <div className="flex items-center gap-1.5">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{currentContact.company}</span>
                      </div>
                    </div>
                  )}
                  
                  {currentContact.jobTitle && (
                    <div className="col-span-2 md:col-span-1">
                      <div className="text-xs font-medium text-gray-500 mb-1">Job Title</div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{currentContact.jobTitle}</span>
                      </div>
                    </div>
                  )}
                  
                  {currentContact.phone && (
                    <div className="col-span-2 md:col-span-1">
                      <div className="text-xs font-medium text-gray-500 mb-1">Phone</div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{currentContact.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  {currentContact.addedDate && (
                    <div className="col-span-2 md:col-span-1">
                      <div className="text-xs font-medium text-gray-500 mb-1">Added</div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(currentContact.addedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {currentContact.tags && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {typeof currentContact.tags === 'string' 
                        ? currentContact.tags.split(',').map((tag: string, i: number) => (
                            <Badge 
                              key={i}
                              variant="outline" 
                              className="text-xs bg-gray-50 border-gray-200 text-gray-700 font-normal"
                            >
                              {tag.trim()}
                            </Badge>
                          ))
                        : Array.isArray(currentContact.tags) 
                          ? currentContact.tags.map((tag: string, i: number) => (
                              <Badge 
                                key={i}
                                variant="outline" 
                                className="text-xs bg-gray-50 border-gray-200 text-gray-700 font-normal"
                              >
                                {tag}
                              </Badge>
                            ))
                          : null
                      }
                    </div>
                  </div>
                )}
                
                {currentContact.notes && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                      {currentContact.notes}
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Engagement Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {currentContact.emailsSent || 0}
                        </div>
                        <div className="text-xs text-gray-500">Emails Sent</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {currentContact.emailsOpened || 0}
                        </div>
                        <div className="text-xs text-gray-500">Emails Opened</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {currentContact.emailsClicked || 0}
                        </div>
                        <div className="text-xs text-gray-500">Link Clicks</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {currentContact.lastActive 
                            ? new Date(currentContact.lastActive).toLocaleDateString() 
                            : '—'}
                        </div>
                        <div className="text-xs text-gray-500">Last Activity</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" className="gap-1" onClick={() => {}}>
                  <Edit className="h-4 w-4" />
                  Edit Contact
                </Button>
                <Button 
                  variant="destructive" 
                  className="gap-1"
                  onClick={() => {
                    setContactToDelete(currentContact.id);
                    setShowContactDetailsDialog(false);
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Warning: This is a permanent action</p>
                <p className="mt-1 text-red-600">Deleting this contact will remove all related data including campaign tracking, engagement metrics, and list memberships.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteContact}
              disabled={deleteContactMutation.isPending}
            >
              {deleteContactMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Contact"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsV7;