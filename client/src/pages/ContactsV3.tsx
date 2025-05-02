import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Icons
import { 
  FileUp, 
  FileDown, 
  Download, 
  Upload, 
  UserPlus, 
  Users, 
  Tag, 
  Search, 
  Filter,
  ChevronDown,
  ChevronLeft, 
  ChevronRight,
  ListFilter,
  Grid3X3,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  UploadCloud,
  MoreVertical,
  Building,
  Calendar,
  Phone,
  CircleAlert,
  Mail,
  UserCheck,
  BarChart,
  PieChart,
  CircleEllipsis,
  ArrowUpRight,
  Inbox,
  MegaphoneIcon,
  ShieldCheck
} from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  company: z.string().optional(),
  phone: z.string().optional(),
  industry: z.string().optional(),
  status: z.string().default("active"),
  lists: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type FileList = { 
  0?: File;
  length: number;
  item(index: number): File | null;
  [index: number]: File;
};

const importFormSchema = z.object({
  file: z.custom<FileList>()
    .refine(files => files?.length === 1, { message: "Please select a file" })
    .refine(files => {
      if (!files?.length) return false;
      const file = files[0];
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv"
      ];
      return validTypes.includes(file.type);
    }, { message: "Only CSV or Excel files are allowed" }),
  skipDuplicates: z.boolean().default(true),
  assignList: z.string().optional(),
});

export default function ContactsV3() {
  // State for contacts view
  const [viewType, setViewType] = useState<"table" | "cards">("table");
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListFilter, setSelectedListFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create form
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      industry: "",
      status: "active",
      lists: [],
      notes: "",
    },
  });

  // Import form
  const importForm = useForm<z.infer<typeof importFormSchema>>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      skipDuplicates: true,
      assignList: "",
    },
  });

  const { toast } = useToast();

  // Fetch contacts
  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
    error: contactsError,
  } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
    enabled: true,
  });

  // Fetch lists
  const {
    data: lists = [],
    isLoading: isLoadingLists,
    error: listsError,
  } = useQuery<any[]>({
    queryKey: ["/api/lists"],
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/contacts", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setOpenDialog(null);
      form.reset();
      toast({
        title: "Contact created",
        description: "The contact has been successfully added to your database.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PUT", `/api/contacts/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setOpenDialog(null);
      form.reset();
      toast({
        title: "Contact updated",
        description: "The contact has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/contacts/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setOpenDialog(null);
      setSelectedContact(null);
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk delete contacts mutation
  const bulkDeleteContactsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await apiRequest("DELETE", "/api/contacts/bulk", { ids });
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setOpenDialog(null);
      setSelectedContacts([]);
      toast({
        title: "Contacts deleted",
        description: `${selectedContacts.length} contacts have been successfully deleted.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete contacts",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add to list mutation
  const addToListMutation = useMutation({
    mutationFn: async ({ contactIds, listId }: { contactIds: string[], listId: string }) => {
      const res = await apiRequest("POST", "/api/contacts/add-to-list", { contactIds, listId });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      toast({
        title: "Contacts added to list",
        description: `${data.count} contacts have been added to the list.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add contacts to list",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Import contacts mutation
  const importContactsMutation = useMutation({
    mutationFn: async ({ contacts, skipDuplicates, listId }: any) => {
      const res = await apiRequest("POST", "/api/contacts/import", { 
        contacts, 
        skipDuplicates,
        listId: listId || undefined
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      setOpenDialog(null);
      importForm.reset();
      fileInputRef.current!.value = "";
      toast({
        title: "Contacts imported",
        description: `${data.imported} contacts have been successfully imported.${data.duplicates ? ` ${data.duplicates} duplicates were skipped.` : ''}`,
      });
      setIsImporting(false);
      setImportProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to import contacts",
        description: error.message,
        variant: "destructive",
      });
      setIsImporting(false);
      setImportProgress(0);
    },
  });

  // Form submission handlers
  const handleCreateContact = (data: z.infer<typeof contactFormSchema>) => {
    createContactMutation.mutate(data);
  };

  const handleUpdateContact = (data: z.infer<typeof contactFormSchema>) => {
    if (!selectedContact) return;
    updateContactMutation.mutate({ id: selectedContact.id, data });
  };

  const handleDeleteContact = () => {
    if (!selectedContact) return;
    deleteContactMutation.mutate(selectedContact.id);
  };

  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) return;
    bulkDeleteContactsMutation.mutate(selectedContacts);
  };

  const handleSelectContact = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, id]);
    } else {
      setSelectedContacts(prev => prev.filter(contactId => contactId !== id));
    }
  };

  const handleSelectAllContacts = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(paginatedContacts.map(contact => contact.id.toString()));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleViewContact = (contact: any) => {
    setSelectedContact(contact);
    setOpenDialog("view");
  };

  const handleEditContact = (contact: any) => {
    setSelectedContact(contact);
    form.reset({
      name: contact.name || "",
      email: contact.email || "",
      company: contact.company || "",
      phone: contact.phone || "",
      industry: contact.industry || "",
      status: typeof contact.status === 'string' ? contact.status : (contact.status?.value || "active"),
      lists: contact.lists?.map((list: any) => list.id.toString()) || [],
      notes: contact.notes || "",
    });
    setOpenDialog("edit");
  };

  const handleFileImport = async (data: z.infer<typeof importFormSchema>) => {
    try {
      setIsImporting(true);
      setImportProgress(10);
      
      const file = data.file[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        setImportProgress(30);
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rows = XLSX.utils.sheet_to_json(worksheet);
        setImportProgress(60);
        
        // Normalize field names
        const contacts = rows.map((row: any) => ({
          name: row.name || row.Name || row.FULL_NAME || row.full_name || row['Full Name'] || row['Full name'] || row['Contact Name'] || row['Contact name'] || row.contact_name || "",
          email: row.email || row.Email || row.EMAIL || row['Email Address'] || row['Email address'] || row.email_address || "",
          company: row.company || row.Company || row.COMPANY || row.organization || row.Organization || row.ORGANIZATION || "",
          phone: row.phone || row.Phone || row.PHONE || row['Phone Number'] || row['Phone number'] || row.phone_number || row.mobile || row.Mobile || "",
          industry: row.industry || row.Industry || row.INDUSTRY || "",
          status: "active",
        })).filter((contact: any) => contact.email);
        
        setImportProgress(80);
        
        // Get form values safely
        const formValues = importForm.getValues();
        
        await importContactsMutation.mutateAsync({
          contacts,
          skipDuplicates: formValues.skipDuplicates,
          listId: formValues.assignList
        });
        
        setImportProgress(100);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      setImportProgress(0);
      setIsImporting(false);
      toast({
        title: "Import failed",
        description: "There was an error importing your contacts. Please check your file format.",
        variant: "destructive",
      });
    }
  };

  const handleExportContacts = () => {
    let dataToExport = [];
    
    if (selectedContacts.length > 0) {
      dataToExport = contacts.filter(contact => selectedContacts.includes(contact.id.toString()));
    } else {
      dataToExport = filteredContacts;
    }
    
    const exportData = dataToExport.map(contact => ({
      Name: contact.name,
      Email: contact.email,
      Company: contact.company || "",
      Phone: contact.phone || "",
      Industry: contact.industry || "",
      Status: typeof contact.status === 'object' ? contact.status.label : contact.status,
      Lists: contact.lists?.map((list: any) => list.name).join(", ") || "",
      CreatedAt: contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : ""
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    
    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `contacts_export_${dateStr}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
    
    toast({
      title: "Contacts exported",
      description: `${exportData.length} contacts have been exported to ${filename}`,
    });
  };

  // Reset form when dialog changes
  useEffect(() => {
    if (!openDialog) {
      if (openDialog !== "edit") {
        form.reset();
      }
      if (openDialog !== "view") {
        setSelectedContact(null);
      }
      if (openDialog !== "import") {
        importForm.reset();
        setImportProgress(0);
        setIsImporting(false);
      }
    }
  }, [openDialog, form, importForm]);

  // Reset the selected contacts when filters change
  useEffect(() => {
    setSelectedContacts([]);
  }, [searchQuery, selectedListFilter, selectedStatusFilter]);

  // Filter contacts based on search query, list filter, and status filter
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesList = 
      selectedListFilter === "all" || 
      contact.lists?.some((list: any) => list.id.toString() === selectedListFilter);
    
    const matchesStatus = 
      selectedStatusFilter === "all" || 
      (contact.status?.value 
        ? contact.status?.value === selectedStatusFilter
        : contact.status === selectedStatusFilter);
    
    return matchesSearch && matchesList && matchesStatus;
  });

  // Calculate status counts
  const statusCounts = {
    total: contacts.length,
    active: contacts.filter(c => c.status?.label === 'Active' || c.status === 'active').length,
    inactive: contacts.filter(c => c.status?.label === 'Inactive' || c.status === 'inactive').length,
    unsubscribed: contacts.filter(c => c.status?.label === 'Unsubscribed' || c.status === 'unsubscribed').length,
    bounced: contacts.filter(c => c.status?.label === 'Bounced' || c.status === 'bounced').length,
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / itemsPerPage));
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get random gradient for avatar
  const getAvatarGradient = (id: number) => {
    const gradients = [
      "from-violet-500 to-purple-500",
      "from-blue-500 to-cyan-500",
      "from-pink-500 to-rose-500",
      "from-amber-500 to-orange-500",
      "from-emerald-500 to-green-500",
      "from-fuchsia-500 to-pink-500",
      "from-indigo-500 to-blue-500",
      "from-sky-500 to-blue-500",
      "from-rose-500 to-red-500",
      "from-green-500 to-teal-500"
    ];
    return gradients[id % gradients.length];
  };

  // Calculate mock engagement metrics for visualization
  const getEngagementLevel = (contact: any) => {
    if (!contact.emailsSent || contact.emailsSent === 0) return 0;
    const emailsOpened = contact.emailsOpened || 0;
    const emailsClicked = contact.emailsClicked || 0;
    
    const openRate = emailsOpened / contact.emailsSent;
    const clickRate = emailsClicked / contact.emailsSent;
    
    return Math.min(Math.round((openRate * 0.4 + clickRate * 0.6) * 100), 100);
  };
  
  const topEngagedContacts = [...contacts]
    .sort((a, b) => getEngagementLevel(b) - getEngagementLevel(a))
    .slice(0, 3);

  // Calculate engagement distribution for the progress bar
  const engagementDistribution = {
    high: contacts.filter(c => getEngagementLevel(c) >= 70).length,
    medium: contacts.filter(c => getEngagementLevel(c) >= 30 && getEngagementLevel(c) < 70).length,
    low: contacts.filter(c => getEngagementLevel(c) < 30).length,
  };
  
  const totalEngagement = engagementDistribution.high + engagementDistribution.medium + engagementDistribution.low;
  const highPercent = totalEngagement ? Math.round((engagementDistribution.high / totalEngagement) * 100) : 0;
  const mediumPercent = totalEngagement ? Math.round((engagementDistribution.medium / totalEngagement) * 100) : 0;
  const lowPercent = totalEngagement ? Math.round((engagementDistribution.low / totalEngagement) * 100) : 0;

  // Group contacts by tags
  const tagGroups = [
    { id: 'customer', name: 'Customer', count: 4 },
    { id: 'newsletter', name: 'Newsletter', count: 2 },
    { id: 'lead', name: 'Lead', count: 3 },
    { id: 'event', name: 'Event', count: 1 },
    { id: 'product', name: 'Product Launch', count: 1 },
    { id: 'vip', name: 'VIP', count: 1 },
    { id: 'former', name: 'Former Customer', count: 1 },
    { id: 'webinar', name: 'Webinar', count: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-100 text-violet-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Contacts
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your audience and track engagement
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewType("table")}
              className={`rounded-r-none h-9 px-3 ${viewType === "table" ? "bg-gray-100" : ""}`}
            >
              <ListFilter className="h-4 w-4 mr-1" />
              Table
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewType("cards")}
              className={`rounded-l-none h-9 px-3 ${viewType === "cards" ? "bg-gray-100" : ""}`}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Cards
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportContacts}
            className="h-9"
          >
            <Download className="h-4 w-4 mr-1" />
            Import
          </Button>

          <Button 
            onClick={() => setOpenDialog("create")}
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white h-9"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          {/* Contact analytics */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Contact Analytics</h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                  <h3 className="text-xs font-medium text-gray-500 mb-2">TOTAL CONTACTS</h3>
                  <p className="text-2xl font-bold">{statusCounts.total}</p>
                  <p className="text-xs text-gray-500 mt-1">contacts</p>
                </div>

                <div className="p-4 rounded-lg border border-green-100 bg-green-50">
                  <h3 className="text-xs font-medium text-gray-500 mb-2">ACTIVE</h3>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
                  <p className="text-xs text-gray-500 mt-1">{Math.round((statusCounts.active / statusCounts.total) * 100) || 0}%</p>
                </div>

                <div className="p-4 rounded-lg border border-amber-100 bg-amber-50">
                  <h3 className="text-xs font-medium text-gray-500 mb-2">INACTIVE</h3>
                  <p className="text-2xl font-bold text-amber-600">{statusCounts.inactive}</p>
                  <p className="text-xs text-gray-500 mt-1">{Math.round((statusCounts.inactive / statusCounts.total) * 100) || 0}%</p>
                </div>

                <div className="p-4 rounded-lg border border-red-100 bg-red-50">
                  <h3 className="text-xs font-medium text-gray-500 mb-2">BOUNCED</h3>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.bounced}</p>
                  <p className="text-xs text-gray-500 mt-1">{Math.round((statusCounts.bounced / statusCounts.total) * 100) || 0}%</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Engagement Distribution</h3>
                <p className="text-xs text-gray-500 mb-2">Based on open rates, clicks and activity</p>
                
                <div className="h-5 w-full rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ width: `${highPercent}%` }}
                  ></div>
                  <div 
                    className="bg-amber-400 h-full" 
                    style={{ width: `${mediumPercent}%` }}
                  ></div>
                  <div 
                    className="bg-red-400 h-full" 
                    style={{ width: `${lowPercent}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-1"></span>
                    High ({highPercent}%)
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block mr-1"></span>
                    Medium ({mediumPercent}%)
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block mr-1"></span>
                    Low ({lowPercent}%)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts by name, email or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-9"
              />
            </div>
            
            <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedListFilter} onValueChange={setSelectedListFilter}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="All Lists" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lists</SelectItem>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id.toString()}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-3 flex items-center"
            >
              <Filter className="h-4 w-4 mr-1" />
              Advanced Filters
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => {
                setSearchQuery("");
                setSelectedListFilter("all");
                setSelectedStatusFilter("all");
              }}
              className="h-9 w-9"
              title="Reset filters"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Contacts List */}
          {isLoadingContacts ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : contactsError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load contacts. Please try again later.
              </AlertDescription>
            </Alert>
          ) : contacts.length === 0 ? (
            <Card className="border border-dashed text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center justify-center">
                  <div className="p-3 bg-gray-100 rounded-full mb-3">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No contacts found</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    You don't have any contacts yet. Start by adding a new contact or importing contacts from a file.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setOpenDialog("create")}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setOpenDialog("import")}
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      Import Contacts
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={paginatedContacts.length > 0 && selectedContacts.length === paginatedContacts.length}
                        onCheckedChange={handleSelectAllContacts}
                      />
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="w-14 text-right">Date Added</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No contacts match your filter criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedContacts.map((contact) => {
                      const engagementLevel = getEngagementLevel(contact);
                      return (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedContacts.includes(contact.id.toString())}
                              onCheckedChange={(checked) => handleSelectContact(!!checked, contact.id.toString())}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(contact.id)} text-white text-xs`}>
                                  {contact.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{contact.name}</div>
                                <div className="text-xs text-gray-500">{contact.company || ""}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{contact.email}</TableCell>
                          <TableCell>
                            {contact.status?.label ? (
                              <Badge 
                                variant="outline" 
                                className={`${
                                  contact.status.color === 'success' ? 'border-green-200 bg-green-100 text-green-700' :
                                  contact.status.color === 'warning' ? 'border-yellow-200 bg-yellow-100 text-yellow-700' :
                                  contact.status.color === 'danger' ? 'border-red-200 bg-red-100 text-red-700' :
                                  'border-blue-200 bg-blue-100 text-blue-700'
                                }`}
                              >
                                {contact.status.label}
                              </Badge>
                            ) : (
                              <Badge 
                                variant="outline" 
                                className={`${
                                  contact.status === 'active' ? 'border-green-200 bg-green-100 text-green-700' :
                                  contact.status === 'inactive' ? 'border-gray-200 bg-gray-100 text-gray-700' :
                                  contact.status === 'unsubscribed' ? 'border-yellow-200 bg-yellow-100 text-yellow-700' :
                                  contact.status === 'bounced' ? 'border-red-200 bg-red-100 text-red-700' :
                                  'border-gray-200 bg-gray-100 text-gray-700'
                                }`}
                              >
                                {typeof contact.status === 'string' ? 
                                  contact.status.charAt(0).toUpperCase() + contact.status.slice(1) : 
                                  "Unknown"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Progress 
                                value={engagementLevel} 
                                className={`h-2 w-20 mr-2 ${
                                  engagementLevel >= 70 ? "[&>div]:bg-green-500" :
                                  engagementLevel >= 30 ? "[&>div]:bg-amber-500" :
                                  "[&>div]:bg-gray-300"
                                }`}
                              />
                              <span className="text-xs text-gray-600">{engagementLevel}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {contact.tags?.slice(0, 2).map((tag: any, i: number) => (
                                <Badge 
                                  key={i} 
                                  variant="outline"
                                  className={
                                    tag === 'Lead' ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                    tag === 'Customer' ? 'bg-green-100 border-green-200 text-green-800' :
                                    tag === 'VIP' ? 'bg-purple-100 border-purple-200 text-purple-800' :
                                    'bg-gray-100 border-gray-200 text-gray-800'
                                  }
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {contact.lists?.slice(0, 2).map((list: any, i: number) => (
                                <Badge 
                                  key={i} 
                                  variant="outline"
                                  className="bg-violet-100 border-violet-200 text-violet-800"
                                >
                                  {list.name}
                                </Badge>
                              ))}
                              {(contact.tags?.length > 2 || contact.lists?.length > 2) && (
                                <Badge variant="outline" className="bg-gray-100 border-gray-200 text-gray-600">
                                  +{(contact.tags?.length || 0) + (contact.lists?.length || 0) - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs text-gray-500">
                            {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewContact(contact)}
                                className="h-8 w-8"
                              >
                                <Eye className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditContact(contact)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4 text-gray-500" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewContact(contact)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>View Details</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit Contact</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Add to List</DropdownMenuLabel>
                                  {lists.map((list) => (
                                    <DropdownMenuItem 
                                      key={list.id}
                                      onClick={() => addToListMutation.mutate({ 
                                        contactIds: [contact.id.toString()], 
                                        listId: list.id.toString() 
                                      })}
                                    >
                                      <Tag className="mr-2 h-4 w-4" />
                                      <span>{list.name}</span>
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedContact(contact);
                                      setOpenDialog("delete");
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Showing {filteredContacts.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length} contacts
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {Math.max(1, totalPages)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-4 space-y-6">
          {/* Tag Overview */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Tag Overview</h2>
              <div className="grid grid-cols-2 gap-2">
                {tagGroups.map(tag => (
                  <div 
                    key={tag.id}
                    className="border rounded-md p-2 flex items-center justify-between"
                  >
                    <Badge 
                      variant="outline"
                      className={
                        tag.id === 'lead' ? 'bg-blue-100 border-blue-200 text-blue-800' :
                        tag.id === 'customer' ? 'bg-green-100 border-green-200 text-green-800' :
                        tag.id === 'vip' ? 'bg-purple-100 border-purple-200 text-purple-800' :
                        tag.id === 'newsletter' ? 'bg-violet-100 border-violet-200 text-violet-800' :
                        tag.id === 'webinar' ? 'bg-indigo-100 border-indigo-200 text-indigo-800' :
                        tag.id === 'event' ? 'bg-amber-100 border-amber-200 text-amber-800' :
                        tag.id === 'former' ? 'bg-red-100 border-red-200 text-red-800' :
                        tag.id === 'product' ? 'bg-teal-100 border-teal-200 text-teal-800' :
                        'bg-gray-100 border-gray-200 text-gray-800'
                      }
                    >
                      {tag.name}
                    </Badge>
                    <span className="text-gray-500 text-sm">({tag.count})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Engaged Contacts */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Top Engaged Contacts</h2>
              <div className="space-y-4">
                {topEngagedContacts.map((contact, index) => {
                  const engagementLevel = getEngagementLevel(contact);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(contact.id)} text-white text-sm`}>
                            {contact.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.email}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-24">
                        <Progress 
                          value={engagementLevel} 
                          className="h-2 mb-1 [&>div]:bg-green-500"
                        />
                        <p className="text-xs text-right text-gray-500">{engagementLevel}% engagement</p>
                      </div>
                    </div>
                  );
                })}
                
                {topEngagedContacts.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No engagement data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setOpenDialog("create")}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Contact
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setOpenDialog("import")}
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Import Contacts
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleExportContacts}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Contacts
                </Button>
                <Separator className="my-2" />
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Inbox className="h-4 w-4 mr-2" />
                  Create New List
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <MegaphoneIcon className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Verify Email Addresses
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Contact Dialog */}
      <Dialog open={openDialog === "create"} onOpenChange={(open) => setOpenDialog(open ? "create" : null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your database. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateContact)} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
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
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
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
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="Technology" {...field} />
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                          <SelectItem value="bounced">Bounced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="lists"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Lists</FormLabel>
                    <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                      {isLoadingLists ? (
                        <Skeleton className="h-[24px] w-full" />
                      ) : lists.length === 0 ? (
                        <p className="text-sm text-gray-500 col-span-2 py-1">
                          No lists available. Create lists first.
                        </p>
                      ) : (
                        lists.map((list) => (
                          <div key={list.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`list-${list.id}`}
                              checked={field.value?.includes(list.id.toString())}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...(field.value || []), list.id.toString()]);
                                } else {
                                  field.onChange(field.value?.filter((id) => id !== list.id.toString()));
                                }
                              }}
                            />
                            <Label htmlFor={`list-${list.id}`} className="text-sm cursor-pointer">
                              {list.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional notes about this contact" 
                        {...field} 
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContactMutation.isPending}>
                  {createContactMutation.isPending ? "Creating..." : "Create Contact"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={openDialog === "edit"} onOpenChange={(open) => setOpenDialog(open ? "edit" : null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateContact)} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
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
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
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
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="Technology" {...field} />
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                          <SelectItem value="bounced">Bounced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="lists"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Lists</FormLabel>
                    <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                      {isLoadingLists ? (
                        <Skeleton className="h-[24px] w-full" />
                      ) : lists.length === 0 ? (
                        <p className="text-sm text-gray-500 col-span-2 py-1">
                          No lists available.
                        </p>
                      ) : (
                        lists.map((list) => (
                          <div key={list.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-list-${list.id}`}
                              checked={field.value?.includes(list.id.toString())}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...(field.value || []), list.id.toString()]);
                                } else {
                                  field.onChange(field.value?.filter((id) => id !== list.id.toString()));
                                }
                              }}
                            />
                            <Label htmlFor={`edit-list-${list.id}`} className="text-sm cursor-pointer">
                              {list.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional notes about this contact" 
                        {...field} 
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateContactMutation.isPending}>
                  {updateContactMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Contact Dialog */}
      <Dialog open={openDialog === "view"} onOpenChange={(open) => setOpenDialog(open ? "view" : null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center mb-3">
                <Avatar className="h-20 w-20 mb-3">
                  <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(selectedContact.id)} text-white text-lg`}>
                    {selectedContact.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{selectedContact.name}</h2>
                <p className="text-gray-500">{selectedContact.email}</p>
                <div className="mt-2">
                  {selectedContact.status?.label ? (
                    <Badge 
                      variant="outline" 
                      className={`${
                        selectedContact.status.color === 'success' ? 'border-green-200 bg-green-100 text-green-700' :
                        selectedContact.status.color === 'warning' ? 'border-yellow-200 bg-yellow-100 text-yellow-700' :
                        selectedContact.status.color === 'danger' ? 'border-red-200 bg-red-100 text-red-700' :
                        'border-blue-200 bg-blue-100 text-blue-700'
                      }`}
                    >
                      {selectedContact.status.label}
                    </Badge>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className="border-gray-200 bg-gray-100 text-gray-700"
                    >
                      {typeof selectedContact.status === 'string' ? selectedContact.status : "Unknown"}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Separator className="bg-gray-200" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Company</p>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="font-medium">{selectedContact.company || "-"}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Phone</p>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="font-medium">{selectedContact.phone || "-"}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Industry</p>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="font-medium">{selectedContact.industry || "-"}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Added</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="font-medium">
                      {selectedContact.createdAt 
                        ? new Date(selectedContact.createdAt).toLocaleDateString() 
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500 mb-1">Lists</p>
                <div className="flex flex-wrap gap-1">
                  {selectedContact.lists?.length > 0 ? (
                    selectedContact.lists.map((list: any) => (
                      <Badge 
                        key={list.id} 
                        variant="outline"
                        className="bg-violet-100 text-violet-800 border-violet-200"
                      >
                        {list.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">Not in any lists</span>
                  )}
                </div>
              </div>
              
              {selectedContact.notes && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-100 text-gray-700">
                    {selectedContact.notes}
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Separator className="bg-gray-200 mb-4" />
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3 flex flex-col items-center">
                    <Mail className="h-5 w-5 text-blue-500 mb-1" />
                    <p className="text-sm font-medium">Email Sent</p>
                    <p className="text-xl font-bold text-blue-600">
                      {selectedContact.emailsSent || "0"}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-100 rounded-md p-3 flex flex-col items-center">
                    <UserCheck className="h-5 w-5 text-green-500 mb-1" />
                    <p className="text-sm font-medium">Response Rate</p>
                    <p className="text-xl font-bold text-green-600">
                      {selectedContact.responseRate ? `${selectedContact.responseRate}%` : "0%"}
                    </p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleEditContact(selectedContact)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setOpenDialog("delete");
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Contact Dialog */}
      <Dialog open={openDialog === "delete"} onOpenChange={(open) => setOpenDialog(open ? "delete" : null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2 mb-4">
            {selectedContact && (
              <div className="p-4 bg-red-50 rounded-md border border-red-100">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(selectedContact.id)} text-white text-xs`}>
                      {selectedContact.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedContact.name}</p>
                    <p className="text-gray-500 text-sm">{selectedContact.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteContact}
              disabled={deleteContactMutation.isPending}
            >
              {deleteContactMutation.isPending ? "Deleting..." : "Delete Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Delete Dialog */}
      <Dialog open={openDialog === "bulkDelete"} onOpenChange={(open) => setOpenDialog(open ? "bulkDelete" : null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Contacts</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedContacts.length} contacts? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 mb-4">
            <Alert variant="destructive">
              <AlertTitle className="flex items-center">
                <CircleAlert className="h-4 w-4 mr-2" />
                Warning
              </AlertTitle>
              <AlertDescription>
                This will permanently delete {selectedContacts.length} contacts from your database.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete}
              disabled={bulkDeleteContactsMutation.isPending}
            >
              {bulkDeleteContactsMutation.isPending ? "Deleting..." : "Delete Contacts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={openDialog === "import"} onOpenChange={(open) => !isImporting && setOpenDialog(open ? "import" : null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file containing your contacts. The file should have headers for at least name and email.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...importForm}>
            <form onSubmit={importForm.handleSubmit(handleFileImport)} className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".csv,.xlsx,.xls" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    importForm.setValue("file", e.target.files);
                    importForm.trigger("file");
                  }}
                  disabled={isImporting}
                />
                
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer block"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 rounded-full bg-gray-100">
                      <UploadCloud className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="text-gray-700 font-medium">
                      {fileInputRef.current?.files?.[0]?.name || "Click to upload or drag and drop"}
                    </div>
                    <div className="text-xs text-gray-500">
                      CSV, Excel files up to 5MB
                    </div>
                  </div>
                </label>
                {importForm.formState.errors.file && (
                  <p className="text-sm text-red-600 mt-2">
                    {importForm.formState.errors.file.message as string}
                  </p>
                )}
              </div>
              
              {isImporting && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Importing contacts...</p>
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-xs text-gray-500">{importProgress}% complete</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipDuplicates"
                    checked={importForm.watch("skipDuplicates")}
                    onCheckedChange={(checked) => {
                      importForm.setValue("skipDuplicates", checked as boolean);
                    }}
                    disabled={isImporting}
                  />
                  <Label htmlFor="skipDuplicates">Skip duplicate email addresses</Label>
                </div>
                
                <FormField
                  control={importForm.control}
                  name="assignList"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign contacts to a list (optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={isImporting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a list (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {lists.map((list) => (
                            <SelectItem key={list.id} value={list.id.toString()}>
                              {list.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenDialog(null)}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isImporting || !importForm.watch("file")}
                >
                  {isImporting ? "Importing..." : "Import Contacts"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}