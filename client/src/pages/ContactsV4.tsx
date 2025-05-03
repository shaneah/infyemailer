import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Icons
import { 
  Search, 
  Filter, 
  UserPlus, 
  ChevronDown, 
  Download, 
  Eye,
  Edit,
  Trash2,
  Users,
  Table as TableIcon,
  Grid,
  Tag
} from "lucide-react";

export type Tag = {
  id: string;
  name: string;
  color?: string;
};

export type Contact = {
  id: number;
  name: string;
  email: string;
  status: string | { label: string; color: string; value?: string };
  company?: string;
  source?: { type: string; name: string };
  tags?: string[];
  lists?: any[];
  dateAdded?: string;
  engagement?: number;
};

const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  company: z.string().optional(),
  status: z.string().default("active"),
  tags: z.array(z.string()).optional(),
});

export default function ContactsV4() {
  // States
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { toast } = useToast();

  // Form
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      status: "active",
      tags: [],
    },
  });

  // Fetch contacts
  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
    error: contactsError,
  } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  // Fetch tags (in a real app, this would be a separate endpoint)
  const {
    data: availableTags = [],
  } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
    initialData: [
      { id: "customer", name: "Customer", color: "bg-green-100 text-green-800 border-green-200" },
      { id: "lead", name: "Lead", color: "bg-blue-100 text-blue-800 border-blue-200" },
      { id: "newsletter", name: "Newsletter", color: "bg-violet-100 text-violet-800 border-violet-200" },
      { id: "event", name: "Event", color: "bg-amber-100 text-amber-800 border-amber-200" },
      { id: "product-launch", name: "Product Launch", color: "bg-teal-100 text-teal-800 border-teal-200" },
      { id: "vip", name: "VIP", color: "bg-purple-100 text-purple-800 border-purple-200" },
      { id: "former-customer", name: "Former Customer", color: "bg-red-100 text-red-800 border-red-200" },
      { id: "webinar", name: "Webinar", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    ],
  });

  // Mutations
  const createContactMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contactFormSchema>) => {
      const res = await apiRequest("POST", "/api/contacts", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact created",
        description: "The contact has been successfully added to your database.",
      });
      setShowAddContactDialog(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/contacts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact updated",
        description: "Contact information has been updated successfully.",
      });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully removed.",
      });
      setShowDeleteDialog(false);
      setSelectedContact(null);
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter contacts based on search and filter criteria
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      searchQuery === "" ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const statusValue = typeof contact.status === 'object' ? contact.status.value || contact.status.label.toLowerCase() : contact.status;
    const matchesStatus = filterStatus === "all" || statusValue === filterStatus;
    
    const matchesTag = filterTag === "all" || (contact.tags && contact.tags.includes(filterTag));

    return matchesSearch && matchesStatus && matchesTag;
  });

  // Calculate status counts
  const statusCounts = {
    total: contacts.length,
    active: contacts.filter(c => 
      typeof c.status === 'object' 
        ? (c.status.label === 'Active' || c.status.value === 'active') 
        : c.status === 'active'
    ).length,
    inactive: contacts.filter(c => 
      typeof c.status === 'object' 
        ? (c.status.label === 'Inactive' || c.status.value === 'inactive') 
        : c.status === 'inactive'
    ).length,
    bounced: contacts.filter(c => 
      typeof c.status === 'object' 
        ? (c.status.label === 'Bounced' || c.status.value === 'bounced') 
        : c.status === 'bounced'
    ).length,
  };

  // Mock data for engagement distribution
  const engagementDistribution = {
    high: Math.floor(contacts.length * 0.45),
    medium: Math.floor(contacts.length * 0.35),
    low: contacts.length - Math.floor(contacts.length * 0.45) - Math.floor(contacts.length * 0.35),
  };

  const highPercent = contacts.length ? Math.round((engagementDistribution.high / contacts.length) * 100) : 0;
  const mediumPercent = contacts.length ? Math.round((engagementDistribution.medium / contacts.length) * 100) : 0;
  const lowPercent = contacts.length ? Math.round((engagementDistribution.low / contacts.length) * 100) : 0;

  // Generate mock top engaged contacts
  const topEngagedContacts = [...contacts]
    .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
    .slice(0, 3)
    .map(contact => ({ 
      ...contact, 
      engagement: contact.engagement || Math.floor(Math.random() * 100) 
    }));

  // Handlers
  const handleAddContact = (data: z.infer<typeof contactFormSchema>) => {
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

  const handleCheckboxChange = (contactId: number, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowViewDialog(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    form.reset({
      name: contact.name,
      email: contact.email,
      company: contact.company || "",
      status: typeof contact.status === 'object' ? contact.status.value || contact.status.label.toLowerCase() : contact.status,
      tags: contact.tags || [],
    });
    setShowEditDialog(true);
  };

  const handleDeleteContactDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDeleteDialog(true);
  };

  // Update selectAll state when filtered contacts change
  useEffect(() => {
    if (selectedContacts.length === filteredContacts.length && filteredContacts.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedContacts, filteredContacts]);

  const getTagColor = (tagId: string) => {
    const tag = availableTags.find(t => t.id === tagId);
    return tag?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Helper to get status badge color
  const getStatusColor = (status: string | { label: string; color: string }) => {
    if (typeof status === 'object') {
      return status.color === 'success' ? 'bg-green-100 text-green-800 border-green-200' :
             status.color === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200' :
             status.color === 'danger' ? 'bg-red-100 text-red-800 border-red-200' :
             'bg-blue-100 text-blue-800 border-blue-200';
    }
    
    return status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
           status === 'inactive' ? 'bg-gray-100 text-gray-800 border-gray-200' :
           status === 'unsubscribed' ? 'bg-amber-100 text-amber-800 border-amber-200' :
           status === 'bounced' ? 'bg-red-100 text-red-800 border-red-200' :
           'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Helper to get status display text
  const getStatusText = (status: string | { label: string; color: string }) => {
    if (typeof status === 'object') {
      return status.label;
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-100 text-violet-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground mt-1">Manage your audience and track engagement</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("table")}
              className={`rounded-r-none ${viewMode === "table" ? "bg-gray-100" : ""}`}
            >
              <TableIcon className="h-4 w-4 mr-1" />
              Table
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("cards")}
              className={`rounded-l-none ${viewMode === "cards" ? "bg-gray-100" : ""}`}
            >
              <Grid className="h-4 w-4 mr-1" />
              Cards
            </Button>
          </div>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Import
          </Button>
          
          <Button onClick={() => setShowAddContactDialog(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
            <UserPlus className="h-4 w-4 mr-1" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          {/* Contact analytics */}
          <Card>
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
              
              <div>
                <h3 className="text-sm font-medium mb-2">Engagement Distribution</h3>
                <p className="text-xs text-gray-500 mb-2">Based on open rates, clicks and activity</p>
                
                <div className="h-5 w-full rounded-full overflow-hidden flex">
                  <div className="bg-green-500 h-full" style={{ width: `${highPercent}%` }}></div>
                  <div className="bg-amber-400 h-full" style={{ width: `${mediumPercent}%` }}></div>
                  <div className="bg-red-400 h-full" style={{ width: `${lowPercent}%` }}></div>
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
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts by name, email or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
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
            
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="px-3 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Advanced Filters
            </Button>
          </div>

          {/* Contacts Table */}
          {viewMode === "table" ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectAll} 
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="w-24 text-right">Date Added</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No contacts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact) => {
                      const isSelected = selectedContacts.includes(contact.id);
                      // Generate random engagement % for display
                      const engagementPercent = contact.engagement || Math.floor(Math.random() * 100);
                      
                      return (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={(checked) => handleCheckboxChange(contact.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback className="bg-violet-100 text-violet-600">
                                  {contact.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{contact.name}</div>
                                {contact.company && (
                                  <div className="text-xs text-gray-500">{contact.company}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{contact.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(contact.status)}>
                              {getStatusText(contact.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Progress 
                                value={engagementPercent} 
                                className={`h-2 w-20 mr-2 ${
                                  engagementPercent >= 70 ? "[&>div]:bg-green-500" :
                                  engagementPercent >= 30 ? "[&>div]:bg-amber-500" :
                                  "[&>div]:bg-gray-300"
                                }`}
                              />
                              <span className="text-xs text-gray-600">{engagementPercent}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {contact.tags?.slice(0, 2).map((tag, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className={getTagColor(tag)}
                                >
                                  {availableTags.find(t => t.id === tag)?.name || tag}
                                </Badge>
                              ))}
                              {(contact.tags?.length || 0) > 2 && (
                                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                  +{contact.tags!.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs text-gray-500">
                            {contact.dateAdded || "2/15/2025"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewContact(contact)}
                                className="h-8 w-8 text-gray-500 hover:text-gray-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditContact(contact)}
                                className="h-8 w-8 text-gray-500 hover:text-gray-800"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteContactDialog(contact)}
                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {filteredContacts.length} of {contacts.length} contacts
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
            </Card>
          ) : (
            // Cards view
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContacts.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-500 border rounded-lg">
                  No contacts found
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  // Generate random engagement % for display
                  const engagementPercent = contact.engagement || Math.floor(Math.random() * 100);
                  
                  return (
                    <Card key={contact.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4 flex justify-between items-start">
                          <div className="flex items-center">
                            <Checkbox 
                              checked={selectedContacts.includes(contact.id)}
                              onCheckedChange={(checked) => handleCheckboxChange(contact.id, !!checked)}
                              className="mr-3"
                            />
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback className="bg-violet-100 text-violet-600">
                                {contact.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-sm text-gray-600">{contact.email}</div>
                              {contact.company && (
                                <div className="text-xs text-gray-500">{contact.company}</div>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className={getStatusColor(contact.status)}>
                            {getStatusText(contact.status)}
                          </Badge>
                        </div>
                        
                        <Separator />
                        
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Engagement</span>
                            <span className="text-sm text-gray-600">{engagementPercent}%</span>
                          </div>
                          <Progress 
                            value={engagementPercent} 
                            className={`h-2 w-full ${
                              engagementPercent >= 70 ? "[&>div]:bg-green-500" :
                              engagementPercent >= 30 ? "[&>div]:bg-amber-500" :
                              "[&>div]:bg-gray-300"
                            }`}
                          />
                        </div>
                        
                        <div className="px-4 pb-4">
                          <div className="flex flex-wrap gap-1 mb-3">
                            {contact.tags?.map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={getTagColor(tag)}
                              >
                                {availableTags.find(t => t.id === tag)?.name || tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              Added on {contact.dateAdded || "2/15/2025"}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewContact(contact)}
                                className="h-8 w-8 text-gray-500 hover:text-gray-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditContact(contact)}
                                className="h-8 w-8 text-gray-500 hover:text-gray-800"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteContactDialog(contact)}
                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>
        
        <div className="md:col-span-4 space-y-6">
          {/* Tag Overview */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Tag Overview</h2>
              <div className="grid grid-cols-2 gap-2">
                {availableTags.map(tag => (
                  <div key={tag.id} className="border rounded-md p-2 flex items-center justify-between">
                    <Badge variant="outline" className={tag.color}>
                      {tag.name}
                    </Badge>
                    <span className="text-gray-500 text-sm">
                      ({contacts.filter(c => c.tags?.includes(tag.id)).length})
                    </span>
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
                {topEngagedContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-violet-100 text-violet-600">
                          {contact.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.email}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-24">
                      <Progress 
                        value={contact.engagement} 
                        className="h-2 mb-1 [&>div]:bg-green-500"
                      />
                      <p className="text-xs text-right text-gray-500">{contact.engagement}% engagement</p>
                    </div>
                  </div>
                ))}
                
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
                  onClick={() => setShowAddContactDialog(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Contact
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Import Contacts
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Create New Tag
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Segment Contacts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={showAddContactDialog} onOpenChange={setShowAddContactDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Enter the contact details below to add them to your database.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddContact)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
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
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
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
                          <SelectValue placeholder="Select a status" />
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
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
                      {availableTags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(tag.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), tag.id]);
                              } else {
                                field.onChange(field.value?.filter((value) => value !== tag.id));
                              }
                            }}
                            id={`tag-${tag.id}`}
                          />
                          <Label
                            htmlFor={`tag-${tag.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {tag.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddContactDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContactMutation.isPending}>
                  {createContactMutation.isPending ? "Creating..." : "Add Contact"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateContact)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
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
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
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
                          <SelectValue placeholder="Select a status" />
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
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
                      {availableTags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(tag.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), tag.id]);
                              } else {
                                field.onChange(field.value?.filter((value) => value !== tag.id));
                              }
                            }}
                            id={`edit-tag-${tag.id}`}
                          />
                          <Label
                            htmlFor={`edit-tag-${tag.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {tag.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
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
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center mb-3">
                <Avatar className="h-20 w-20 mb-3">
                  <AvatarFallback className="bg-violet-100 text-violet-600 text-lg">
                    {selectedContact.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{selectedContact.name}</h2>
                <p className="text-gray-500">{selectedContact.email}</p>
                <div className="mt-2">
                  <Badge variant="outline" className={getStatusColor(selectedContact.status)}>
                    {getStatusText(selectedContact.status)}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Company</h3>
                  <p className="font-medium">{selectedContact.company || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Added</h3>
                  <p className="font-medium">{selectedContact.dateAdded || "2/15/2025"}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedContact.tags?.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className={getTagColor(tag)}
                    >
                      {availableTags.find(t => t.id === tag)?.name || tag}
                    </Badge>
                  ))}
                  {(!selectedContact.tags || selectedContact.tags.length === 0) && (
                    <span className="text-gray-500">No tags</span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Engagement</h3>
                <Progress 
                  value={selectedContact.engagement || 0} 
                  className="h-2 mb-1 [&>div]:bg-green-500"
                />
                <p className="text-xs text-gray-500">{selectedContact.engagement || 0}% engagement rate</p>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEditContact(selectedContact);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setShowViewDialog(false);
                    handleDeleteContactDialog(selectedContact);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedContact && (
            <div className="flex items-center p-4 bg-red-50 rounded-md border border-red-100 mb-4">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback className="bg-violet-100 text-violet-600">
                  {selectedContact.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedContact.name}</p>
                <p className="text-sm text-gray-600">{selectedContact.email}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
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
    </div>
  );
}