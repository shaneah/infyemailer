import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Upload,
  Search,
  Eye,
  Pencil,
  Trash2,
  Table as TableIcon,
  Grid,
  CheckCircle,
  XCircle,
  AlertCircle,
  BadgeInfo,
  Tags,
  Calendar,
  Phone,
  Building,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define types
interface Contact {
  id: number;
  name: string;
  email: string;
  status: string | { label: string; color: string };
  source?: string;
  engagement?: number;
  tags?: string[];
  createdAt?: string;
  addedOn?: string;
  metadata?: any;
  lists?: Array<{
    id: number;
    name: string;
  }>;
}

// Form schema
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  status: z.string().default("active"),
  lists: z.array(z.string()).default([]),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
});

// Add this helper function after the interface
const getStatusDisplay = (status: string | { label: string; color: string }) => {
  if (typeof status === 'object' && status !== null) {
    return {
      text: status.label,
      className: `bg-${status.color}-100 text-${status.color}-800`
    };
  }
  
  // Handle string status values
  const statusMap: Record<string, { text: string; className: string }> = {
    active: { text: 'Active', className: 'bg-green-100 text-green-800' },
    inactive: { text: 'Inactive', className: 'bg-gray-100 text-gray-800' },
    bounced: { text: 'Bounced', className: 'bg-red-100 text-red-800' },
    unsubscribed: { text: 'Unsubscribed', className: 'bg-red-100 text-red-800' },
    unknown: { text: 'Unknown', className: 'bg-yellow-100 text-yellow-800' }
  };

  const normalizedStatus = String(status).toLowerCase().trim();
  return statusMap[normalizedStatus] || statusMap.unknown;
};

// Add a helper function for date formatting
const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Add a helper function to get the display date
const getDisplayDate = (contact: Contact) => {
  return contact.addedOn || (contact.createdAt ? formatDate(contact.createdAt) : 'N/A');
};

const ContactsV7 = () => {
  console.log('Rendering ContactsV7 component');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewEditDialogOpen, setViewEditDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form setup
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      status: "active",
      lists: [],
      phone: "",
      company: "",
      notes: "",
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
  
  // Fetch contact lists
  const {
    data: contactLists = [],
    isLoading: isLoadingLists,
  } = useQuery<{ id: number; name: string; description?: string }[]>({
    queryKey: ["/api/lists"],
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contact');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setViewEditDialogOpen(false);
      form.reset();
      toast({
        title: "Contact created",
        description: "The contact has been created successfully.",
      });
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
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest("PATCH", `/api/contacts/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update contact');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setViewEditDialogOpen(false);
      setIsEditMode(false);
      setSelectedContact(null);
      form.reset();
      toast({
        title: "Contact updated",
        description: "The contact has been updated successfully.",
      });
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
    mutationFn: async (contactId: number) => {
      await apiRequest('DELETE', `/api/contacts/${contactId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contact",
        variant: "destructive",
      });
    },
  });

  // Import contacts mutation
  const importContactsMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiRequest('POST', '/api/contacts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.json();
    },
    onMutate: () => {
      setIsUploading(true);
      setUploadProgress(0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setImportDialogOpen(false);
      setSelectedFile(null);
      setUploadProgress(0);
      setIsUploading(false);
      toast({
        title: "Success",
        description: "Contacts imported successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to import contacts",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle file import
  const handleImport = async () => {
    if (selectedFile) {
      await importContactsMutation.mutateAsync(selectedFile);
    }
  };

  // Handle contact creation
  const handleCreateContact = async (data: z.infer<typeof contactFormSchema>) => {
    const { phone, company, notes, createdAt, ...contactData } = data;
    
    const formattedData = {
      ...contactData,
      status: data.status.toLowerCase(),
      metadata: {
        phone: phone || '',
        company: company || '',
        notes: notes || '',
      },
      lists: data.lists.map(id => parseInt(id)),
      createdAt: new Date().toISOString(),
    };

    createContactMutation.mutate(formattedData);
  };

  // Handle contact update
  const handleUpdateContact = async (data: z.infer<typeof contactFormSchema>) => {
    if (!selectedContact) return;

    const { phone, company, notes, createdAt, ...contactData } = data;
    
    const formattedData = {
      ...contactData,
      status: data.status.toLowerCase(),
      metadata: {
        phone: phone || '',
        company: company || '',
        notes: notes || '',
      },
      lists: data.lists.map(id => parseInt(id)),
      createdAt: selectedContact.createdAt, // Preserve the original createdAt
    };

    updateContactMutation.mutate({
      id: selectedContact.id,
      data: formattedData,
    });
  };

  // Handle contact deletion
  const handleDeleteContact = async (contactId: number) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      await deleteContactMutation.mutateAsync(contactId);
    }
  };

  // Filter and sort contacts
  const filteredAndSortedContacts = React.useMemo(() => {
    let filtered = contacts.filter(contact => {
      const matchesSearch = 
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        selectedStatus === "all" || 
        (typeof contact.status === 'object' ? contact.status.label.toLowerCase() : contact.status.toLowerCase()) === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField as keyof Contact];
      const bValue = b[sortField as keyof Contact];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [contacts, searchQuery, selectedStatus, sortField, sortDirection]);

  // Handle view/edit contact
  const handleViewEditContact = (contact: Contact) => {
    console.log('Contact metadata (handleViewEditContact):', contact.metadata);
    setSelectedContact(contact);
    setViewEditDialogOpen(true);
    setIsEditMode(false);
    
    // Reset form with contact data
    form.reset({
      name: contact.name,
      email: contact.email,
      status: typeof contact.status === 'object' ? contact.status.label.toLowerCase() : contact.status.toLowerCase(),
      lists: contact.lists?.map(list => list.id.toString()) || [],
      phone: contact.metadata?.phone || '',
      company: contact.metadata?.company || '',
      notes: contact.metadata?.notes || '',
      createdAt: contact.createdAt,
    });
  };

  // Handle edit button click
  const handleEditClick = () => {
    if (!selectedContact) return;
    
    setIsEditMode(true);
    form.reset({
      name: selectedContact.name,
      email: selectedContact.email,
      status: typeof selectedContact.status === 'object' ? selectedContact.status.label.toLowerCase() : selectedContact.status.toLowerCase(),
      lists: selectedContact.lists?.map(list => list.id.toString()) || [],
      phone: selectedContact.metadata?.phone || '',
      company: selectedContact.metadata?.company || '',
      notes: selectedContact.metadata?.notes || '',
      createdAt: selectedContact.createdAt,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
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
          <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="whitespace-nowrap">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button onClick={() => setShowAddContactDialog(true)} className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap">
            <span className="mr-1">+</span> Add Contact
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contacts by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px]">
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
            value={sortField} 
            onValueChange={(value) => {
              setSortField(value);
              setSortDirection(sortDirection === "asc" ? "desc" : "asc");
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="email">Sort by Email</SelectItem>
              <SelectItem value="dateAdded">Sort by Date Added</SelectItem>
              <SelectItem value="engagement">Sort by Engagement</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-full px-3"
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="h-4 w-4" />
              <span className="ml-2">Table</span>
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-full px-3"
              onClick={() => setViewMode("cards")}
            >
              <Grid className="h-4 w-4" />
              <span className="ml-2">Cards</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Contacts count */}
      <div className="text-sm text-gray-500">
        Showing {filteredAndSortedContacts.length} of {contacts.length} contacts
      </div>
      
      {/* Contacts Table */}
      {viewMode === "table" && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={(checked) => {
                      setSelectAll(checked as boolean);
                      if (checked) {
                        setSelectedContacts(filteredAndSortedContacts.map(c => c.id));
                      } else {
                        setSelectedContacts([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lists</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedContacts([...selectedContacts, contact.id]);
                        } else {
                          setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusDisplay(contact.status).className}`}>
                      {getStatusDisplay(contact.status).text}
                    </span>
                  </TableCell>
                  <TableCell>
                    {contact.lists?.map(list => list.name).join(", ") || "-"}
                  </TableCell>
                  <TableCell>{getDisplayDate(contact)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewEditContact(contact)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
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
        </div>
      )}

      {/* Contacts Cards View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedContacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{contact.name}</h3>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewEditContact(contact)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BadgeInfo className="h-4 w-4 text-gray-400" />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusDisplay(contact.status).className}`}>
                      {getStatusDisplay(contact.status).text}
                    </span>
                  </div>
                  
                  {contact.lists && contact.lists.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tags className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {contact.lists.map(list => list.name).join(", ")}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    Added: {getDisplayDate(contact)}
                  </div>
                  
                  {contact.metadata?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{contact.metadata.phone}</span>
                    </div>
                  )}
                  
                  {contact.metadata?.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{contact.metadata.company}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={showAddContactDialog} onOpenChange={setShowAddContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your list. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreateContact)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter contact name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter email address"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Lists</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {contactLists.map((list) => (
                  <div key={list.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`list-${list.id}`}
                      checked={form.watch("lists").includes(list.id.toString())}
                      onCheckedChange={(checked) => {
                        const currentLists = form.watch("lists");
                        if (checked) {
                          form.setValue("lists", [...currentLists, list.id.toString()]);
                        } else {
                          form.setValue(
                            "lists",
                            currentLists.filter((id) => id !== list.id.toString())
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`list-${list.id}`}>{list.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Add Contact</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
            <DialogDescription>
              Import contacts from a CSV or Excel file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select File</Label>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
              />
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <Label>Uploading...</Label>
                <Progress value={uploadProgress} />
              </div>
            )}
            
            <DialogFooter>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* View/Edit Dialog */}
      <Dialog open={viewEditDialogOpen} onOpenChange={setViewEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Contact' : 'View Contact'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Edit contact information' : 'View contact details'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-6">
              {isEditMode ? (
                <form onSubmit={form.handleSubmit(handleUpdateContact)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="Enter contact name"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder="Enter email address"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={form.watch("status")}
                        onValueChange={(value) => form.setValue("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="bounced">Bounced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...form.register("phone")}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        {...form.register("company")}
                        placeholder="Enter company name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Lists</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {contactLists.map((list) => (
                          <div key={list.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`list-${list.id}`}
                              checked={form.watch("lists").includes(list.id.toString())}
                              onCheckedChange={(checked) => {
                                const currentLists = form.watch("lists");
                                if (checked) {
                                  form.setValue("lists", [...currentLists, list.id.toString()]);
                                } else {
                                  form.setValue(
                                    "lists",
                                    currentLists.filter((id) => id !== list.id.toString())
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`list-${list.id}`}>{list.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      {...form.register("notes")}
                      className="w-full min-h-[100px] p-2 border rounded-md"
                      placeholder="Enter notes about the contact"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsEditMode(false);
                      form.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm text-gray-600">{selectedContact.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-gray-600">{selectedContact.email}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <p className="text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusDisplay(selectedContact.status).className}`}>
                          {getStatusDisplay(selectedContact.status).text}
                        </span>
                      </p>
                    </div>
                    <div>
                      <Label>Lists</Label>
                      <p className="text-sm text-gray-600">
                        {selectedContact.lists?.map(list => list.name).join(", ") || "-"}
                      </p>
                    </div>
                    {selectedContact.metadata?.phone && (
                      <div>
                        <Label>Phone</Label>
                        <p className="text-sm text-gray-600">{selectedContact.metadata.phone}</p>
                      </div>
                    )}
                    {selectedContact.metadata?.company && (
                      <div>
                        <Label>Company</Label>
                        <p className="text-sm text-gray-600">{selectedContact.metadata.company}</p>
                      </div>
                    )}
                  </div>

                  {selectedContact.metadata?.notes && (
                    <div>
                      <Label>Notes</Label>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedContact.metadata.notes}</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Added: {getDisplayDate(selectedContact)}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setViewEditDialogOpen(false);
                      setSelectedContact(null);
                    }}>
                      Close
                    </Button>
                    <Button onClick={handleEditClick}>
                      Edit Contact
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsV7;