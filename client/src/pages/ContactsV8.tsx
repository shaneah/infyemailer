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
  CheckCircle2,
  Sparkles,
  Heart,
  Zap,
  Gem,
  Crown,
  Trophy,
  Award,
  BadgeCheck,
  Smile,
  ThumbsUp,
  Target,
  Send,
  Share2,
  Info,
  HelpCircle,
  Shield,
  BookOpen,
  Coffee,
  Palette
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
    'Active': 'bg-gradient-to-r from-emerald-500 to-green-400 text-white',
    'Inactive': 'bg-gradient-to-r from-slate-500 to-gray-400 text-white',
    'Pending': 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white',
    'Unsubscribed': 'bg-gradient-to-r from-red-500 to-rose-400 text-white',
    'Unknown': 'bg-gradient-to-r from-purple-500 to-violet-400 text-white',
    'Bounced': 'bg-gradient-to-r from-rose-500 to-pink-400 text-white'
  };
  return colors[status] || 'bg-gradient-to-r from-slate-500 to-gray-400 text-white';
};

const getStatusBadgeColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'Active': 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200',
    'Inactive': 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200',
    'Pending': 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200',
    'Unsubscribed': 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200',
    'Unknown': 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border-purple-200',
    'Bounced': 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200'
  };
  return colors[status] || 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200';
};

const getSourceBadgeColor = (source: string) => {
  if (!source) return 'bg-gray-100 text-gray-700 border-gray-200';
  
  const colors: { [key: string]: string } = {
    'Import': 'bg-blue-100 text-blue-700 border-blue-200',
    'Website': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Manual': 'bg-purple-100 text-purple-700 border-purple-200',
    'API': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Form': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Social': 'bg-pink-100 text-pink-700 border-pink-200',
    'Referral': 'bg-amber-100 text-amber-700 border-amber-200'
  };
  
  // Check for partial matches if no exact match
  const lowerSource = source.toLowerCase();
  for (const [key, value] of Object.entries(colors)) {
    if (lowerSource.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Generate a consistent color based on the first letter
  const letterMap: { [key: string]: string } = {
    'a': 'bg-red-100 text-red-700 border-red-200',
    'b': 'bg-pink-100 text-pink-700 border-pink-200',
    'c': 'bg-purple-100 text-purple-700 border-purple-200',
    'd': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'e': 'bg-blue-100 text-blue-700 border-blue-200',
    'f': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'g': 'bg-teal-100 text-teal-700 border-teal-200',
    'h': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'i': 'bg-green-100 text-green-700 border-green-200',
    'j': 'bg-lime-100 text-lime-700 border-lime-200',
    'k': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'l': 'bg-amber-100 text-amber-700 border-amber-200',
    'm': 'bg-orange-100 text-orange-700 border-orange-200',
    'n': 'bg-red-100 text-red-700 border-red-200',
    'o': 'bg-rose-100 text-rose-700 border-rose-200',
    'p': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    'q': 'bg-violet-100 text-violet-700 border-violet-200',
    'r': 'bg-purple-100 text-purple-700 border-purple-200',
    's': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    't': 'bg-sky-100 text-sky-700 border-sky-200',
    'u': 'bg-blue-100 text-blue-700 border-blue-200',
    'v': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'w': 'bg-teal-100 text-teal-700 border-teal-200',
    'x': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'y': 'bg-lime-100 text-lime-700 border-lime-200',
    'z': 'bg-amber-100 text-amber-700 border-amber-200'
  };
  
  const firstLetter = lowerSource.charAt(0);
  return letterMap[firstLetter] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getTagColor = (tag: string) => {
  if (!tag) return 'bg-gray-100 text-gray-700 border-gray-200';
  
  const colors: { [key: string]: string } = {
    'VIP': 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200',
    'Lead': 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border-blue-200',
    'Customer': 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200',
    'Prospect': 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 border-violet-200',
    'Newsletter': 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-indigo-200',
    'Marketing': 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 border-rose-200',
    'Product': 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border-teal-200',
    'Tech': 'bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 border-sky-200',
    'HR': 'bg-gradient-to-r from-fuchsia-100 to-purple-100 text-fuchsia-800 border-fuchsia-200',
    'Finance': 'bg-gradient-to-r from-lime-100 to-green-100 text-lime-800 border-lime-200',
    'Sales': 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200',
    'Support': 'bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border-cyan-200'
  };
  
  // Check for partial matches if no exact match
  const lowerTag = tag.toLowerCase();
  for (const [key, value] of Object.entries(colors)) {
    if (lowerTag.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Generate a consistent color based on the first letter
  const letterMap: { [key: string]: string } = {
    'a': 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200',
    'b': 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-200',
    'c': 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200',
    'd': 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-indigo-200',
    'e': 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border-blue-200',
    'f': 'bg-gradient-to-r from-cyan-100 to-sky-100 text-cyan-800 border-cyan-200',
    'g': 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border-teal-200',
    'h': 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200',
    'i': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
    'j': 'bg-gradient-to-r from-lime-100 to-green-100 text-lime-800 border-lime-200',
    'k': 'bg-gradient-to-r from-yellow-100 to-lime-100 text-yellow-800 border-yellow-200',
    'l': 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200',
    'm': 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200',
    'n': 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border-red-200',
    'o': 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-800 border-rose-200',
    'p': 'bg-gradient-to-r from-fuchsia-100 to-rose-100 text-fuchsia-800 border-fuchsia-200',
    'q': 'bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-800 border-violet-200',
    'r': 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200',
    's': 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-indigo-200',
    't': 'bg-gradient-to-r from-sky-100 to-indigo-100 text-sky-800 border-sky-200',
    'u': 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border-blue-200',
    'v': 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 border-cyan-200',
    'w': 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border-teal-200',
    'x': 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200',
    'y': 'bg-gradient-to-r from-lime-100 to-emerald-100 text-lime-800 border-lime-200',
    'z': 'bg-gradient-to-r from-amber-100 to-lime-100 text-amber-800 border-amber-200'
  };
  
  const firstLetter = lowerTag.charAt(0);
  return letterMap[firstLetter] || 'bg-gray-100 text-gray-700 border-gray-200';
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

const getRandomAvatarGradient = (name: string) => {
  if (!name) return 'bg-gradient-to-br from-purple-500 to-indigo-600';
  
  const gradients = [
    'bg-gradient-to-br from-purple-500 to-indigo-600', // Purple to Indigo
    'bg-gradient-to-br from-blue-500 to-teal-500', // Blue to Teal
    'bg-gradient-to-br from-emerald-500 to-lime-500', // Emerald to Lime
    'bg-gradient-to-br from-amber-500 to-orange-500', // Amber to Orange
    'bg-gradient-to-br from-red-500 to-rose-500', // Red to Rose
    'bg-gradient-to-br from-pink-500 to-rose-500', // Pink to Rose
    'bg-gradient-to-br from-fuchsia-500 to-pink-500', // Fuchsia to Pink
    'bg-gradient-to-br from-violet-500 to-purple-500', // Violet to Purple
    'bg-gradient-to-br from-indigo-500 to-blue-500', // Indigo to Blue
    'bg-gradient-to-br from-sky-500 to-cyan-500', // Sky to Cyan
    'bg-gradient-to-br from-cyan-500 to-teal-500', // Cyan to Teal
    'bg-gradient-to-br from-teal-500 to-emerald-500', // Teal to Emerald
  ];
  
  // Use the first letter as a consistent index
  const firstChar = name.charAt(0).toLowerCase();
  const charCode = firstChar.charCodeAt(0);
  const index = charCode % gradients.length;
  
  return gradients[index];
};

const ContactsV8 = () => {
  // State management
  const [viewMode, setViewMode] = useState<"table" | "cards" | "grid">("table");
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
  const [activeTab, setActiveTab] = useState("all");
  const [gridColumns, setGridColumns] = useState(4);
  const itemsPerPage = viewMode === "grid" ? 12 : 10;
  
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

  // Filter contacts based on search, status, tag, and active tab
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
      
    // Filter by active tab
    const matchesTab = activeTab === "all" || 
      (activeTab === "active" && contact.status === "Active") ||
      (activeTab === "inactive" && contact.status === "Inactive") ||
      (activeTab === "unsubscribed" && contact.status === "Unsubscribed") ||
      (activeTab === "bounced" && contact.status === "Bounced");

    return matchesSearch && matchesStatus && matchesTag && matchesTab;
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

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Stats for the contacts
  const contactStats = {
    total: contacts.length,
    active: contacts.filter(c => c.status === 'Active').length,
    inactive: contacts.filter(c => c.status === 'Inactive').length,
    unsubscribed: contacts.filter(c => c.status === 'Unsubscribed').length,
    bounced: contacts.filter(c => c.status === 'Bounced').length,
  };

  // Handle window resize for grid columns
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setGridColumns(1);
      } else if (window.innerWidth < 768) {
        setGridColumns(2);
      } else if (window.innerWidth < 1024) {
        setGridColumns(3);
      } else {
        setGridColumns(4);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Animated Header with Vibrant Gradient */}
      <div className="rounded-xl overflow-hidden shadow-lg relative">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 opacity-90"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-300/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-400/20 rounded-full blur-lg"></div>
          <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-blue-300/20 rounded-full blur-xl"></div>
        </div>
        
        <div className="relative z-10 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Contact Management</h1>
                <p className="text-blue-100 text-sm max-w-2xl mt-1">
                  Manage your audience, track engagement, and organize contacts for targeted email campaigns
                </p>
              </div>
            </div>
            
            {/* Fancy Tab Navigation */}
            <div className="mt-8">
              <div className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-xl">
                <button 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'all' 
                      ? 'bg-white text-indigo-700 shadow-sm' 
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => handleTabChange('all')}
                >
                  All Contacts
                  <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-100 text-indigo-700">
                    {contactStats.total}
                  </span>
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'active' 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => handleTabChange('active')}
                >
                  Active
                  <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-700">
                    {contactStats.active}
                  </span>
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'inactive' 
                      ? 'bg-white text-slate-600 shadow-sm' 
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => handleTabChange('inactive')}
                >
                  Inactive
                  <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                    {contactStats.inactive}
                  </span>
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'unsubscribed' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => handleTabChange('unsubscribed')}
                >
                  Unsubscribed
                  <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-md bg-red-100 text-red-700">
                    {contactStats.unsubscribed}
                  </span>
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'bounced' 
                      ? 'bg-white text-amber-600 shadow-sm' 
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => handleTabChange('bounced')}
                >
                  Bounced
                  <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-700">
                    {contactStats.bounced}
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Stat Cards in a grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-100">Total Contacts</p>
                  <div className="flex items-end gap-1">
                    <p className="text-2xl font-bold text-white">{contactStats.total}</p>
                    <div className="text-xs text-blue-200 pb-1">contacts</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 backdrop-blur-md rounded-xl p-4 border border-emerald-400/30 transform transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/30 rounded-full p-2 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-5 w-5 text-emerald-100" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-100">Active</p>
                  <div className="flex items-end gap-1">
                    <p className="text-2xl font-bold text-white">{contactStats.active}</p>
                    <div className="text-xs text-blue-200 pb-1">contacts</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-500/30 to-slate-600/20 backdrop-blur-md rounded-xl p-4 border border-slate-400/30 transform transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <div className="flex items-center gap-3">
                <div className="bg-slate-500/30 rounded-full p-2 group-hover:scale-110 transition-transform">
                  <AlertCircle className="h-5 w-5 text-slate-100" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-100">Inactive</p>
                  <div className="flex items-end gap-1">
                    <p className="text-2xl font-bold text-white">{contactStats.inactive}</p>
                    <div className="text-xs text-blue-200 pb-1">contacts</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-rose-500/30 to-rose-600/20 backdrop-blur-md rounded-xl p-4 border border-rose-400/30 transform transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <div className="flex items-center gap-3">
                <div className="bg-rose-500/30 rounded-full p-2 group-hover:scale-110 transition-transform">
                  <XCircle className="h-5 w-5 text-rose-100" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-100">Unsubscribed</p>
                  <div className="flex items-end gap-1">
                    <p className="text-2xl font-bold text-white">{contactStats.unsubscribed}</p>
                    <div className="text-xs text-blue-200 pb-1">contacts</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500/30 to-amber-600/20 backdrop-blur-md rounded-xl p-4 border border-amber-400/30 transform transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/30 rounded-full p-2 group-hover:scale-110 transition-transform">
                  <Mail className="h-5 w-5 text-amber-100" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-100">Bounced</p>
                  <div className="flex items-end gap-1">
                    <p className="text-2xl font-bold text-white">{contactStats.bounced}</p>
                    <div className="text-xs text-blue-200 pb-1">contacts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Actions */}
      <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
          <div className="relative lg:col-span-5">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <Input 
              type="text"
              placeholder="Search contacts..."
              className="pl-9 bg-gray-50 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="lg:col-span-2">
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
              <SelectTrigger className="bg-gray-50 border-gray-200">
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
              <SelectTrigger className="bg-gray-50 border-gray-200">
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
            <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
              <Button 
                variant={viewMode === "table" ? "default" : "ghost"} 
                size="sm"
                className={`gap-1 rounded-md ${
                  viewMode === "table" 
                    ? "bg-white shadow-sm text-indigo-700 border border-gray-200" 
                    : "text-gray-600"
                }`}
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "cards" ? "default" : "ghost"} 
                size="sm" 
                className={`gap-1 rounded-md ${
                  viewMode === "cards" 
                    ? "bg-white shadow-sm text-indigo-700 border border-gray-200" 
                    : "text-gray-600"
                }`}
                onClick={() => setViewMode("cards")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "grid" ? "default" : "ghost"} 
                size="sm" 
                className={`gap-1 rounded-md ${
                  viewMode === "grid" 
                    ? "bg-white shadow-sm text-indigo-700 border border-gray-200" 
                    : "text-gray-600"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md gap-1.5 transition-all duration-200 hover:shadow-lg"
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
            className="rounded-xl border border-indigo-200 p-3 bg-indigo-50 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm text-indigo-700">
              <div className="p-1.5 bg-indigo-100 rounded-md">
                <Checkbox 
                  checked={selectAll} 
                  onCheckedChange={handleSelectAllContacts} 
                  className="text-indigo-600 border-indigo-300"
                />
              </div>
              <span>
                <span className="font-medium">{selectedContacts.length}</span> {selectedContacts.length === 1 ? 'contact' : 'contacts'} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
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
                className="bg-red-600 hover:bg-red-700"
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
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-t-2 border-l-2 border-blue-500 animate-spin-slow"></div>
            </div>
            <span className="text-gray-500 mt-2">Loading contacts...</span>
          </div>
        </div>
      ) : contacts.length === 0 ? (
        <Card className="border-gray-200 shadow-md">
          <CardContent className="p-8 flex flex-col items-center justify-center h-64">
            <div className="mb-4 p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="font-medium text-lg mb-1 text-gray-800">No Contacts Found</h3>
            <p className="text-gray-500 text-sm text-center mb-4 max-w-md">
              You don't have any contacts yet. Add your first contact to get started with your email campaigns.
            </p>
            <Button 
              onClick={() => setShowAddContactDialog(true)}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Contact
            </Button>
          </CardContent>
        </Card>
      ) : filteredContacts.length === 0 ? (
        <Card className="border-gray-200 shadow-md">
          <CardContent className="p-8 flex flex-col items-center justify-center h-64">
            <div className="mb-4 p-3 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl">
              <Search className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="font-medium text-lg mb-1 text-gray-800">No Matching Contacts</h3>
            <p className="text-gray-500 text-sm text-center mb-4 max-w-md">
              No contacts match your current filters. Try adjusting your search criteria or clear filters to see all contacts.
            </p>
            <Button 
              variant="outline"
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
                setSelectedTag("all");
                setActiveTab("all");
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="border-gray-200 shadow-md overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={paginatedContacts.length > 0 && selectedContacts.length === paginatedContacts.length}
                    onCheckedChange={handleSelectAllContacts}
                    className="text-indigo-600"
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-indigo-100/50 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Contact
                    {sortField === 'name' && (
                      <ArrowDownUp className={`h-3.5 w-3.5 ml-1 text-indigo-500 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-indigo-100/50 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortField === 'email' && (
                      <ArrowDownUp className={`h-3.5 w-3.5 ml-1 text-indigo-500 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-indigo-100/50 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      <ArrowDownUp className={`h-3.5 w-3.5 ml-1 text-indigo-500 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">Engagement</TableHead>
                <TableHead className="hidden lg:table-cell">Tags</TableHead>
                <TableHead 
                  className="hidden md:table-cell cursor-pointer hover:bg-indigo-100/50 transition-colors"
                  onClick={() => handleSort('addedDate')}
                >
                  <div className="flex items-center">
                    Date Added
                    {sortField === 'addedDate' && (
                      <ArrowDownUp className={`h-3.5 w-3.5 ml-1 text-indigo-500 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
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
                  className="group hover:bg-indigo-50/40 transition-colors"
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleContactSelection(contact.id)}
                      className="text-indigo-600"
                    />
                  </TableCell>
                  <TableCell 
                    className="font-medium cursor-pointer"
                    onClick={() => handleViewContact(contact)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-gray-200">
                        <AvatarImage src={contact.avatarUrl} />
                        <AvatarFallback className={`text-white ${getRandomAvatarGradient(contact.name)}`}>
                          {contact.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center">
                          {contact.name}
                          <div className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">
                            <ChevronRight className="h-4 w-4" />
                          </div>
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
                      className={`${getStatusBadgeColor(contact.status)} border text-xs font-medium px-2.5 py-0.5 rounded-full`}
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
                              className={`text-xs ${getTagColor(tag.trim())} rounded-full px-2`}
                            >
                              {tag.trim()}
                            </Badge>
                          ))
                        : Array.isArray(contact.tags) 
                          ? contact.tags.map((tag: string, i: number) => (
                              <Badge 
                                key={i}
                                variant="outline" 
                                className={`text-xs ${getTagColor(tag)} rounded-full px-2`}
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-indigo-700 hover:bg-indigo-100"
                              onClick={() => handleViewContact(contact)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-700 hover:bg-red-100"
                              onClick={() => handleDeleteContact(contact.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Contact</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to <span className="font-medium text-gray-700">{Math.min(startIndex + itemsPerPage, filteredContacts.length)}</span> of <span className="font-medium text-gray-700">{filteredContacts.length}</span> contacts
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
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white" 
                          : "border-gray-200 text-gray-700"
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
      ) : viewMode === "cards" ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedContacts.map((contact) => (
              <Card 
                key={contact.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 group"
              >
                <CardHeader className="pb-3 relative bg-gradient-to-r from-indigo-50 to-blue-50">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Checkbox 
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleContactSelection(contact.id)}
                      className="h-5 w-5 text-indigo-600"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={contact.avatarUrl} />
                      <AvatarFallback className={`text-white ${getRandomAvatarGradient(contact.name)}`}>
                        {contact.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold group-hover:text-indigo-700 transition-colors">{contact.name}</CardTitle>
                      <CardDescription className="text-sm">{contact.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 pt-3">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${getStatusBadgeColor(contact.status)} border text-xs font-medium px-2.5 py-0.5 rounded-full`}
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
                              className={`text-xs ${getTagColor(tag.trim())} rounded-full px-2`}
                            >
                              {tag.trim()}
                            </Badge>
                          ))
                        : Array.isArray(contact.tags) 
                          ? contact.tags.map((tag: string, i: number) => (
                              <Badge 
                                key={i}
                                variant="outline" 
                                className={`text-xs ${getTagColor(tag)} rounded-full px-2`}
                              >
                                {tag}
                              </Badge>
                            ))
                          : null
                      }
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-0 pb-2 px-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 h-8 px-2 gap-1 rounded-lg"
                    onClick={() => handleViewContact(contact)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2 rounded-lg"
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
            <div className="flex items-center justify-between mt-4 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to <span className="font-medium text-gray-700">{Math.min(startIndex + itemsPerPage, filteredContacts.length)}</span> of <span className="font-medium text-gray-700">{filteredContacts.length}</span> contacts
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
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white" 
                          : "border-gray-200 text-gray-700"
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
      ) : (
        // Grid view - Compact cards in a multi-column grid
        <div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${gridColumns} gap-3`}>
            {paginatedContacts.map((contact) => (
              <div 
                key={contact.id} 
                className="group bg-white border border-gray-200 hover:border-indigo-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-3 flex gap-3 items-center">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage src={contact.avatarUrl} />
                      <AvatarFallback className={`text-white ${getRandomAvatarGradient(contact.name)}`}>
                        {contact.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1">
                      <Checkbox 
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => handleContactSelection(contact.id)}
                        className="h-4 w-4 text-indigo-600 border-gray-300"
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-700">
                        {contact.name}
                      </h3>
                      <Badge 
                        className={`${getStatusBadgeColor(contact.status)} border text-[10px] font-medium px-1.5 py-0.5 rounded-full ml-1 truncate`}
                      >
                        {contact.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                    {contact.company && (
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {contact.company}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-3 pb-2 pt-1 flex justify-between items-center border-t border-gray-100">
                  {contact.tags ? (
                    <div className="flex gap-1 flex-wrap max-w-[70%]">
                      {typeof contact.tags === 'string' 
                        ? contact.tags.split(',').slice(0, 2).map((tag: string, i: number) => (
                            <Badge 
                              key={i}
                              variant="outline" 
                              className={`text-[10px] h-5 ${getTagColor(tag.trim())} rounded-full px-1.5 truncate`}
                            >
                              {tag.trim()}
                            </Badge>
                          ))
                        : Array.isArray(contact.tags) 
                          ? contact.tags.slice(0, 2).map((tag: string, i: number) => (
                              <Badge 
                                key={i}
                                variant="outline" 
                                className={`text-[10px] h-5 ${getTagColor(tag)} rounded-full px-1.5 truncate`}
                              >
                                {tag}
                              </Badge>
                            ))
                          : null
                      }
                      {typeof contact.tags === 'string' && contact.tags.split(',').length > 2 && (
                        <Badge variant="outline" className="text-[10px] h-5 bg-gray-50 px-1.5 text-gray-500 rounded-full truncate">
                          +{contact.tags.split(',').length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-indigo-600 hover:text-indigo-800 rounded-lg p-0"
                      onClick={() => handleViewContact(contact)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700 rounded-lg p-0"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Grid View Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-4 py-3 border border-gray-200 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium text-indigo-700">{startIndex + 1}</span> to <span className="font-medium text-indigo-700">{Math.min(startIndex + itemsPerPage, filteredContacts.length)}</span> of <span className="font-medium text-indigo-700">{filteredContacts.length}</span> contacts
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 border-indigo-200 bg-white"
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
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md" 
                          : "border-indigo-200 text-indigo-700 bg-white"
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
                  className="h-8 w-8 p-0 border-indigo-200 bg-white"
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
          <DialogHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 -mt-6 px-6 py-4 rounded-t-lg border-b border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg text-white">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl text-indigo-950">Add New Contact</DialogTitle>
                <DialogDescription className="text-indigo-700">
                  Create a new contact record for your email marketing campaigns.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Phone (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300">
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
                      <FormLabel className="text-gray-700">Company (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Job Title (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Job title" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Tags (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Separate tags with commas (e.g. VIP, Newsletter, Product Updates)" 
                          {...field} 
                          className="border-gray-300"
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
                      <FormLabel className="text-gray-700">Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional information about this contact" 
                          {...field} 
                          rows={3}
                          className="border-gray-300 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddContactDialog(false)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md"
                  disabled={createContactMutation.isPending}
                >
                  {createContactMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Contact
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Contact Details Dialog */}
      <Dialog open={showContactDetailsDialog} onOpenChange={setShowContactDetailsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
          {currentContact && (
            <>
              <DialogHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 -mt-6 px-6 py-4 rounded-t-lg border-b border-indigo-100">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                    <AvatarImage src={currentContact.avatarUrl} />
                    <AvatarFallback className={`text-white text-lg ${getRandomAvatarGradient(currentContact.name)}`}>
                      {currentContact.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl text-indigo-950">{currentContact.name}</DialogTitle>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center gap-1.5 text-indigo-700 text-sm">
                        <AtSign className="h-3.5 w-3.5" />
                        {currentContact.email}
                      </div>
                      {currentContact.phone && (
                        <>
                          <span className="mx-1.5 text-gray-400">•</span>
                          <div className="flex items-center gap-1.5 text-indigo-700 text-sm">
                            <Phone className="h-3.5 w-3.5" />
                            {currentContact.phone}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className={`${getStatusBadgeColor(currentContact.status)} border text-xs font-medium px-2.5 py-1 rounded-full`}>
                    {currentContact.status}
                  </Badge>
                  
                  {currentContact.source && (
                    <Badge 
                      variant="outline" 
                      className={`${getSourceBadgeColor(currentContact.source)} text-xs px-2.5 py-1 rounded-full`}
                    >
                      Source: {currentContact.source}
                    </Badge>
                  )}
                </div>
              </DialogHeader>
              
              <div className="py-2">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="col-span-2 md:col-span-1 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-indigo-600" />
                      Contact Information
                    </h3>
                    <div className="grid gap-3">
                      {currentContact.company && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Company</div>
                          <div className="flex items-center gap-1.5">
                            <Building className="h-4 w-4 text-indigo-400" />
                            <span className="text-sm text-gray-900">{currentContact.company}</span>
                          </div>
                        </div>
                      )}
                      
                      {currentContact.jobTitle && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Job Title</div>
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4 text-indigo-400" />
                            <span className="text-sm text-gray-900">{currentContact.jobTitle}</span>
                          </div>
                        </div>
                      )}
                      
                      {currentContact.addedDate && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Added</div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-indigo-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(currentContact.addedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {currentContact.lastModified && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Last Modified</div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-indigo-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(currentContact.lastModified).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2 md:col-span-1 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                      <BarChart4 className="h-4 w-4 text-emerald-600" />
                      Engagement Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-white/80 rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">
                          {currentContact.emailsSent || 0}
                        </div>
                        <div className="text-xs text-gray-500">Emails Sent</div>
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">
                          {currentContact.emailsOpened || 0}
                        </div>
                        <div className="text-xs text-gray-500">Emails Opened</div>
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">
                          {currentContact.emailsClicked || 0}
                        </div>
                        <div className="text-xs text-gray-500">Link Clicks</div>
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 shadow-sm">
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
                
                {currentContact.tags && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-indigo-600" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {typeof currentContact.tags === 'string' 
                        ? currentContact.tags.split(',').map((tag: string, i: number) => (
                            <Badge 
                              key={i}
                              variant="outline" 
                              className={`text-xs ${getTagColor(tag.trim())} rounded-full px-2.5 py-1`}
                            >
                              {tag.trim()}
                            </Badge>
                          ))
                        : Array.isArray(currentContact.tags) 
                          ? currentContact.tags.map((tag: string, i: number) => (
                              <Badge 
                                key={i}
                                variant="outline" 
                                className={`text-xs ${getTagColor(tag)} rounded-full px-2.5 py-1`}
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
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-indigo-600" />
                      Notes
                    </h3>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 text-sm text-gray-700">
                      {currentContact.notes}
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <List className="h-4 w-4 text-indigo-600" />
                    List Memberships
                  </h3>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    {currentContact.lists && currentContact.lists.length > 0 ? (
                      <div className="grid gap-2">
                        {currentContact.lists.map((list: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                              <span className="text-sm text-gray-800">{list.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs text-indigo-700 bg-indigo-50 border-indigo-200">
                              {list.totalSubscribers} contacts
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="inline-block p-3 bg-gray-100 rounded-full mb-2">
                          <List className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">This contact is not a member of any lists.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter className="border-t border-gray-200 pt-4">
                <Button 
                  variant="outline" 
                  className="gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50" 
                  onClick={() => {}}
                >
                  <Edit className="h-4 w-4" />
                  Edit Contact
                </Button>
                <Button 
                  variant="destructive" 
                  className="gap-1 bg-red-600 hover:bg-red-700"
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
          <DialogHeader className="bg-red-50 -mx-6 -mt-6 px-6 py-4 rounded-t-lg border-b border-red-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xl text-red-900">Delete Contact</DialogTitle>
                <DialogDescription className="text-red-700">
                  Are you sure you want to delete this contact? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 text-red-800 p-4 rounded-lg text-sm flex items-start gap-2 border border-red-200">
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
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteContact}
              disabled={deleteContactMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
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

export default ContactsV8;