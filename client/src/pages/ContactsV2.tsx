import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  DialogTrigger,
  DialogClose 
} from "@/components/ui/dialog";
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
import { 
  FileUp, 
  FileDown, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  MoreVertical, 
  Filter, 
  Eye,
  Edit, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Users,
  UserPlus,
  FileText,
  Inbox,
  Tag,
  Mail,
  Phone,
  Building,
  Clock,
  Calendar,
  RefreshCw,
  ListFilter,
  ArrowUpDown,
  UploadCloud,
  SlidersHorizontal,
  ChevronDown,
  PieChart,
  UserCheck,
  Grid3X3,
  CircleAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

// Contact schema
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().default("active"),
  lists: z.array(z.string()).optional(),
});

// File import schema
const importSchema = z.object({
  file: z.any().refine((file) => file?.length === 1, "A file is required"),
  headerRow: z.boolean().default(true),
  skipDuplicates: z.boolean().default(true),
  addToList: z.string().optional(),
});

const ContactsV2 = () => {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListFilter, setSelectedListFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "table">("table");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 10;

  // Form setup
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      industry: "",
      notes: "",
      status: "active",
      lists: [],
    },
  });

  const importForm = useForm<z.infer<typeof importSchema>>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      headerRow: true,
      skipDuplicates: true,
    },
  });

  // Fetch contacts
  const { 
    data: contacts = [], 
    isLoading: isLoadingContacts,
    isError: isContactsError,
    refetch: refetchContacts 
  } = useQuery<any[]>({ 
    queryKey: ['/api/contacts'],
    onError: (error: any) => {
      toast({
        title: "Error loading contacts",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch contact lists
  const { 
    data: lists = [], 
    isLoading: isLoadingLists 
  } = useQuery<any[]>({ 
    queryKey: ['/api/lists'],
    onError: (error: any) => {
      toast({
        title: "Error loading lists",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contactSchema>) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact created",
        description: "The contact has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setOpenDialog(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string | number, data: z.infer<typeof contactSchema> }) => {
      const response = await apiRequest("PATCH", `/api/contacts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact updated",
        description: "The contact has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setOpenDialog(null);
      setSelectedContact(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiRequest("DELETE", `/api/contacts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact deleted",
        description: "The contact has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setSelectedContact(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk delete contacts mutation
  const bulkDeleteContactsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiRequest("POST", "/api/contacts/bulk-delete", { ids });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contacts deleted",
        description: `${selectedContacts.length} contacts have been deleted successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setSelectedContacts([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting contacts",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Import contacts mutation
  const importContactsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/contacts/import", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Contacts imported",
        description: `${data.imported} contacts have been imported successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setOpenDialog(null);
      importForm.reset();
      setImportProgress(0);
      setIsImporting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error importing contacts",
        description: error.message,
        variant: "destructive",
      });
      setImportProgress(0);
      setIsImporting(false);
    },
  });

  // Add to list mutation
  const addToListMutation = useMutation({
    mutationFn: async ({ contactIds, listId }: { contactIds: string[], listId: string }) => {
      const response = await apiRequest("POST", "/api/contacts/add-to-list", { contactIds, listId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contacts added to list",
        description: `${selectedContacts.length} contacts have been added to the list.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setSelectedContacts([]);
      setOpenDialog(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding contacts to list",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove from list mutation
  const removeFromListMutation = useMutation({
    mutationFn: async ({ contactIds, listId }: { contactIds: string[], listId: string }) => {
      const response = await apiRequest("POST", "/api/contacts/remove-from-list", { contactIds, listId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contacts removed from list",
        description: `${selectedContacts.length} contacts have been removed from the list.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setSelectedContacts([]);
      setOpenDialog(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing contacts from list",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle create contact
  const handleCreateContact = (data: z.infer<typeof contactSchema>) => {
    createContactMutation.mutate(data);
  };

  // Handle update contact
  const handleUpdateContact = (data: z.infer<typeof contactSchema>) => {
    if (!selectedContact) return;
    updateContactMutation.mutate({ id: selectedContact.id, data });
  };

  // Handle delete contact
  const handleDeleteContact = () => {
    if (!selectedContact) return;
    deleteContactMutation.mutate(selectedContact.id);
    setOpenDialog(null);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) return;
    bulkDeleteContactsMutation.mutate(selectedContacts);
    setOpenDialog(null);
  };

  // Handle file import
  const handleFileImport = async (data: z.infer<typeof importSchema>) => {
    if (!fileInputRef.current?.files?.[0]) return;
    
    setIsImporting(true);
    setImportProgress(10);
    
    const file = fileInputRef.current.files[0];
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        setImportProgress(30);
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        setImportProgress(50);
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        
        setImportProgress(70);
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        setImportProgress(90);
        
        const importData = {
          contacts: json,
          headerRow: importForm.getValues("headerRow"),
          skipDuplicates: importForm.getValues("skipDuplicates"),
          addToList: importForm.getValues("addToList"),
        };
        
        importContactsMutation.mutate(importData);
      } catch (error) {
        setIsImporting(false);
        setImportProgress(0);
        toast({
          title: "Error processing file",
          description: "There was an error processing the uploaded file.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Handle adding contacts to list
  const handleAddToList = (listId: string) => {
    if (selectedContacts.length === 0) return;
    addToListMutation.mutate({ contactIds: selectedContacts, listId });
  };

  // Handle removing contacts from list
  const handleRemoveFromList = (listId: string) => {
    if (selectedContacts.length === 0) return;
    removeFromListMutation.mutate({ contactIds: selectedContacts, listId });
  };

  // Handle edit contact dialog
  const handleEditContact = (contact: any) => {
    setSelectedContact(contact);
    form.reset({
      name: contact.name,
      email: contact.email,
      company: contact.company || "",
      phone: contact.phone || "",
      industry: contact.industry || "",
      notes: contact.notes || "",
      status: contact.status || "active",
      lists: contact.lists?.map((list: any) => list.id.toString()) || [],
    });
    setOpenDialog("edit");
  };

  // Handle view contact details
  const handleViewContact = (contact: any) => {
    setSelectedContact(contact);
    setOpenDialog("view");
  };

  // Handle select all contacts
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContacts(filteredContacts.map(contact => contact.id.toString()));
    } else {
      setSelectedContacts([]);
    }
  };

  // Handle select individual contact
  const handleSelectContact = (e: React.ChangeEvent<HTMLInputElement>, contactId: string) => {
    if (e.target.checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    }
  };

  // Handle export contacts
  const handleExportContacts = () => {
    const contactsToExport = selectedContacts.length > 0 
      ? contacts.filter(contact => selectedContacts.includes(contact.id.toString()))
      : contacts;
    
    const exportData = contactsToExport.map(contact => ({
      Name: contact.name,
      Email: contact.email,
      Company: contact.company || "",
      Phone: contact.phone || "",
      Industry: contact.industry || "",
      Status: contact.status || "active",
      Lists: contact.lists?.map((list: any) => list.name).join(", ") || "",
      Notes: contact.notes || "",
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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
      contact.status === selectedStatusFilter;
    
    return matchesSearch && matchesList && matchesStatus;
  });

  // Sort contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle nested values or empty values
    if (aValue === undefined || aValue === null) aValue = '';
    if (bValue === undefined || bValue === null) bValue = '';
    
    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    // Handle number comparison
    return sortDirection === "asc" 
      ? (aValue - bValue) 
      : (bValue - aValue);
  });

  // Pagination
  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const paginatedContacts = sortedContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset form when dialog closes
  useEffect(() => {
    if (!openDialog) {
      form.reset();
      importForm.reset();
      setImportProgress(0);
      setIsImporting(false);
    }
  }, [openDialog, form, importForm]);

  // Reset the selected contacts when filters change
  useEffect(() => {
    setSelectedContacts([]);
  }, [searchQuery, selectedListFilter, selectedStatusFilter]);

  // Status color handling is now done inline with conditional rendering based on the status.color property

  // Get random gradient for avatar
  const getAvatarGradient = (id: number) => {
    const gradients = [
      "from-purple-500 to-indigo-500",
      "from-blue-500 to-cyan-500",
      "from-pink-500 to-rose-500",
      "from-amber-500 to-orange-500",
      "from-emerald-500 to-green-500",
      "from-fuchsia-500 to-pink-500",
      "from-violet-500 to-purple-500",
      "from-sky-500 to-blue-500",
      "from-rose-500 to-red-500",
      "from-indigo-500 to-blue-500"
    ];
    return gradients[id % gradients.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Contact Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your contacts, import data and organize your audience
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setOpenDialog("create")}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-purple-200">
                <UploadCloud className="mr-2 h-4 w-4" />
                Import / Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setOpenDialog("import")}>
                <Upload className="mr-2 h-4 w-4" />
                <span>Import Contacts</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportContacts}>
                <Download className="mr-2 h-4 w-4" />
                <span>{selectedContacts.length > 0 ? "Export Selected" : "Export All"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedContacts.length > 0 && (
            <Button variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
              <Tag className="mr-2 h-4 w-4" />
              {selectedContacts.length} Selected
            </Button>
          )}

          <Button 
            variant="outline" 
            className="px-2.5" 
            onClick={() => setViewType(viewType === "grid" ? "table" : "grid")}
          >
            {viewType === "grid" ? (
              <><Grid3X3 className="h-4 w-4" /></>
            ) : (
              <><ListFilter className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-purple-100">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Total Contacts</h3>
                <Users className="h-5 w-5 opacity-80" />
              </div>
              <p className="text-3xl font-bold mt-2">{contacts.length}</p>
            </div>
            <CardContent className="p-4 pt-4 bg-purple-50">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Active: {contacts.filter(c => c.status === 'active').length}</span>
                <span>Inactive: {contacts.filter(c => c.status !== 'active').length}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Lists</h3>
                <Tag className="h-5 w-5 opacity-80" />
              </div>
              <p className="text-3xl font-bold mt-2">{lists.length}</p>
            </div>
            <CardContent className="p-4 pt-4 bg-blue-50">
              <div className="flex justify-between text-xs text-muted-foreground">
                {lists.length > 0 ? (
                  <>
                    <span>Largest: {[...lists].sort((a, b) => b.count - a.count)[0]?.name || "N/A"}</span>
                    <span>{lists.reduce((sum, list) => sum + list.count, 0)} Total Members</span>
                  </>
                ) : (
                  <span>No lists available</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-pink-100">
            <div className="bg-gradient-to-r from-pink-600 to-rose-500 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">New Contacts</h3>
                <UserPlus className="h-5 w-5 opacity-80" />
              </div>
              <p className="text-3xl font-bold mt-2">
                {contacts.filter(c => {
                  const createdDate = c.createdAt ? new Date(c.createdAt) : null;
                  const now = new Date();
                  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
                  return createdDate && createdDate > thirtyDaysAgo;
                }).length}
              </p>
            </div>
            <CardContent className="p-4 pt-4 bg-pink-50">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Last 30 days</span>
                <span>+{Math.round((contacts.filter(c => {
                  const createdDate = c.createdAt ? new Date(c.createdAt) : null;
                  const now = new Date();
                  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
                  return createdDate && createdDate > thirtyDaysAgo;
                }).length / (contacts.length || 1)) * 100)}% growth</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="overflow-hidden border-amber-100">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Engagement</h3>
                <PieChart className="h-5 w-5 opacity-80" />
              </div>
              <p className="text-3xl font-bold mt-2">
                {Math.round((contacts.filter(c => c.status === 'active').length / (contacts.length || 1)) * 100)}%
              </p>
            </div>
            <CardContent className="p-4 pt-4 bg-amber-50">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Active rate</span>
                <span>Unsubscribed: {contacts.filter(c => c.status === 'unsubscribed').length}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card className="border-none shadow-md bg-gradient-to-r from-gray-50 to-white">
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-purple-200"
                />
              </div>
            </div>
            
            <div className="md:col-span-3">
              <Select value={selectedListFilter} onValueChange={setSelectedListFilter}>
                <SelectTrigger className="border-purple-200">
                  <SelectValue placeholder="Filter by list" />
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
            </div>
            
            <div className="md:col-span-3">
              <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                <SelectTrigger className="border-purple-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-1">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedListFilter("all");
                  setSelectedStatusFilter("all");
                  setSortField("name");
                  setSortDirection("asc");
                }}
                className="h-10 w-10 border-purple-200"
                title="Reset filters"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {selectedContacts.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {selectedContacts.length} contacts selected
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-purple-200 h-8">
                      <Tag className="mr-2 h-3 w-3" />
                      Add to List
                      <ChevronDown className="ml-2 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Select a list</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {lists.map((list) => (
                      <DropdownMenuItem key={list.id} onClick={() => handleAddToList(list.id.toString())}>
                        {list.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 border-red-200 h-8 hover:bg-red-50"
                onClick={() => setOpenDialog("bulkDelete")}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Delete Selected
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacts Display */}
      <AnimatePresence mode="wait">
        {isLoadingContacts ? (
          <Card className="border-none shadow-md overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 space-y-4"
            >
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
              <p className="text-center text-gray-500">Loading contacts...</p>
            </motion.div>
          </Card>
        ) : isContactsError ? (
          <Card className="border-none shadow-md overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <CircleAlert className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Error Loading Contacts</h3>
              <p className="mb-4 text-gray-500">
                There was a problem loading your contacts. Please try again.
              </p>
              <Button 
                variant="outline" 
                onClick={() => refetchContacts()} 
                className="border-purple-200"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </motion.div>
          </Card>
        ) : filteredContacts.length === 0 ? (
          <Card className="border-none shadow-md overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center"
            >
              {searchQuery || selectedListFilter !== "all" || selectedStatusFilter !== "all" ? (
                <>
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <Search className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">No matching contacts</h3>
                  <p className="mb-4 text-gray-500">
                    No contacts match your current filter criteria.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedListFilter("all");
                      setSelectedStatusFilter("all");
                    }}
                    className="border-purple-200"
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">No contacts yet</h3>
                  <p className="mb-4 text-gray-500">
                    Get started by creating a new contact or importing a list.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button 
                      onClick={() => setOpenDialog("create")}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Contact
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setOpenDialog("import")}
                      className="border-purple-200"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Import Contacts
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </Card>
        ) : viewType === "table" ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="table-view"
          >
            <Card className="border-none shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          id="select-all"
                          checked={paginatedContacts.length > 0 && selectedContacts.length === paginatedContacts.length}
                          onCheckedChange={(e: any) => handleSelectAll(e)}
                          className="border-purple-300"
                        />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Name</span>
                          {sortField === "name" && (
                            <ArrowUpDown className={`h-3 w-3 transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Email</span>
                          {sortField === "email" && (
                            <ArrowUpDown className={`h-3 w-3 transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("company")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Company</span>
                          {sortField === "company" && (
                            <ArrowUpDown className={`h-3 w-3 transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Lists</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedContacts.map((contact) => (
                      <TableRow key={contact.id} className="hover:bg-purple-50/50 transition-colors">
                        <TableCell>
                          <Checkbox 
                            id={`select-${contact.id}`}
                            checked={selectedContacts.includes(contact.id.toString())}
                            onCheckedChange={(e: any) => handleSelectContact(e, contact.id.toString())}
                            className="border-purple-300"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="mr-2 flex-shrink-0">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(contact.id)} text-white text-xs`}>
                                  {contact.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <span className="truncate">{contact.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="truncate max-w-[180px]">{contact.email}</TableCell>
                        <TableCell>{contact.company || "-"}</TableCell>
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
                              className="border-gray-200 bg-gray-100 text-gray-700"
                            >
                              {typeof contact.status === 'string' ? contact.status : "Unknown"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {contact.lists?.length > 0 ? (
                              contact.lists.slice(0, 2).map((list: any) => (
                                <Badge 
                                  key={list.id} 
                                  variant="outline"
                                  className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
                                >
                                  {list.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">None</span>
                            )}
                            {contact.lists?.length > 2 && (
                              <Badge variant="outline" className="bg-gray-100 border-gray-200">
                                +{contact.lists.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewContact(contact)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditContact(contact)}
                              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                >
                                  <MoreVertical className="h-4 w-4" />
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
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing {paginatedContacts.length} of {filteredContacts.length} contacts
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-8 border-purple-200"
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
                    className="h-8 border-purple-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="grid-view"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedContacts.map((contact) => (
                <motion.div 
                  key={contact.id} 
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`${
                      contact.status?.color === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      contact.status?.color === 'warning' ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                      contact.status?.color === 'danger' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                      typeof contact.status === 'string' && contact.status === 'active' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      'bg-gradient-to-r from-gray-400 to-gray-500'
                    } h-2`}></div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 flex-shrink-0">
                            <Avatar className="h-14 w-14">
                              <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(contact.id)} text-white text-lg`}>
                                {contact.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold truncate max-w-[180px]">{contact.name}</h3>
                            <p className="text-sm text-gray-500 truncate max-w-[180px]">{contact.email}</p>
                          </div>
                        </div>
                        <Checkbox 
                          checked={selectedContacts.includes(contact.id.toString())}
                          onCheckedChange={(e: any) => handleSelectContact(e, contact.id.toString())}
                          className="border-purple-300"
                        />
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center text-sm">
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
                              className="border-gray-200 bg-gray-100 text-gray-700"
                            >
                              {typeof contact.status === 'string' ? contact.status : "Unknown"}
                            </Badge>
                          )}
                        </div>
                        
                        {contact.company && (
                          <div className="flex items-center text-sm">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-700 truncate">{contact.company}</span>
                          </div>
                        )}
                        
                        {contact.lists?.length > 0 && (
                          <div className="flex items-start text-sm">
                            <Tag className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                              {contact.lists.slice(0, 2).map((list: any) => (
                                <Badge 
                                  key={list.id} 
                                  variant="outline"
                                  className="bg-purple-100 text-purple-800 border-purple-200"
                                >
                                  {list.name}
                                </Badge>
                              ))}
                              {contact.lists.length > 2 && (
                                <Badge variant="outline" className="bg-gray-100 border-gray-200">
                                  +{contact.lists.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {contact.createdAt && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-3 w-3 text-gray-400 mr-2" />
                            <span>Added {new Date(contact.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-5 flex justify-between pt-4 border-t border-gray-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewContact(contact)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditContact(contact)}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedContact(contact);
                            setOpenDialog("delete");
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {/* Grid Pagination */}
            <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500">
                Showing {paginatedContacts.length} of {filteredContacts.length} contacts
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 border-purple-200"
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
                  className="h-8 border-purple-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Contact Dialog */}
      <Dialog open={openDialog === "create"} onOpenChange={(open) => setOpenDialog(open ? "create" : null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Create New Contact
            </DialogTitle>
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
                        <Input placeholder="John Doe" {...field} className="border-purple-200" />
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
                        <Input placeholder="john@example.com" type="email" {...field} className="border-purple-200" />
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
                        <Input placeholder="Acme Inc." {...field} className="border-purple-200" />
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
                        <Input placeholder="+1 (555) 123-4567" {...field} className="border-purple-200" />
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
                        <Input placeholder="Technology" {...field} className="border-purple-200" />
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
                          <SelectTrigger className="border-purple-200">
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
                    <div className="grid grid-cols-2 gap-2 p-2 border rounded-md border-purple-200">
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
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, list.id.toString()]);
                                } else {
                                  field.onChange(
                                    currentValues.filter((value) => value !== list.id.toString())
                                  );
                                }
                              }}
                              className="border-purple-300"
                            />
                            <Label htmlFor={`list-${list.id}`} className="text-sm">
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
                        placeholder="Additional notes about this contact"
                        className="resize-none border-purple-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(null)} className="border-purple-200">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createContactMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
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
            <DialogTitle className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Edit Contact
            </DialogTitle>
            <DialogDescription>
              Update contact information. Click save when you're done.
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
                        <Input placeholder="John Doe" {...field} className="border-amber-200" />
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
                        <Input placeholder="john@example.com" type="email" {...field} className="border-amber-200" />
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
                        <Input placeholder="Acme Inc." {...field} className="border-amber-200" />
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
                        <Input placeholder="+1 (555) 123-4567" {...field} className="border-amber-200" />
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
                        <Input placeholder="Technology" {...field} className="border-amber-200" />
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-amber-200">
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
                    <div className="grid grid-cols-2 gap-2 p-2 border rounded-md border-amber-200">
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
                              id={`edit-list-${list.id}`}
                              checked={field.value?.includes(list.id.toString())}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, list.id.toString()]);
                                } else {
                                  field.onChange(
                                    currentValues.filter((value) => value !== list.id.toString())
                                  );
                                }
                              }}
                              className="border-amber-300"
                            />
                            <Label htmlFor={`edit-list-${list.id}`} className="text-sm">
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
                        placeholder="Additional notes about this contact"
                        className="resize-none border-amber-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(null)} className="border-amber-200">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateContactMutation.isPending}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
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
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Contact Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-4">
              <div className="flex flex-col items-center mt-2 mb-6">
                <Avatar className="h-24 w-24 mb-3 shadow-md">
                  <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(selectedContact.id)} text-white text-xl`}>
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
                        className="bg-purple-100 text-purple-800 border-purple-200"
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
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
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
            <Button type="button" variant="outline" onClick={() => setOpenDialog(null)} className="border-gray-200">
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
            <Button type="button" variant="outline" onClick={() => setOpenDialog(null)} className="border-gray-200">
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
            <DialogTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Import Contacts
            </DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file containing your contacts. The file should have headers for at least name and email.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...importForm}>
            <form onSubmit={importForm.handleSubmit(handleFileImport)} className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center">
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
                    <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100">
                      <UploadCloud className="h-6 w-6 text-purple-600" />
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
              
              <div className="p-4 border border-purple-100 rounded-md bg-purple-50 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="headerRow"
                    checked={importForm.watch("headerRow")}
                    onCheckedChange={(checked) => {
                      importForm.setValue("headerRow", checked as boolean);
                    }}
                    disabled={isImporting}
                    className="border-purple-300"
                  />
                  <Label htmlFor="headerRow">File has header row</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="skipDuplicates"
                    checked={importForm.watch("skipDuplicates")}
                    onCheckedChange={(checked) => {
                      importForm.setValue("skipDuplicates", checked as boolean);
                    }}
                    disabled={isImporting}
                    className="border-purple-300"
                  />
                  <Label htmlFor="skipDuplicates">Skip duplicates</Label>
                </div>
                
                <div>
                  <Label>Add to list (optional)</Label>
                  <Select 
                    onValueChange={(value) => importForm.setValue("addToList", value)}
                    disabled={isImporting || lists.length === 0}
                  >
                    <SelectTrigger className="mt-1 border-purple-200">
                      <SelectValue placeholder="Select a list" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {lists.map((list) => (
                        <SelectItem key={list.id} value={list.id.toString()}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenDialog(null)}
                  disabled={isImporting}
                  className="border-purple-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isImporting || !fileInputRef.current?.files?.[0]}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
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
};

export default ContactsV2;