import React, { useState, useEffect } from 'react';
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
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Table as TableIcon,
  Grid,
  ListFilter,
  CheckCircle,
  XCircle,
  AlertCircle,
  BadgeInfo,
  Tags,
  Calendar,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";

// Define types
interface Contact {
  id: number;
  name: string;
  email: string;
  status: string;
  source?: string;
  engagement?: number;
  tags?: string[];
  dateAdded?: string;
  metadata?: any;
}

interface Tag {
  id: string;
  name: string;
  count: number;
}

const ContactsV7 = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", status: "active" });
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Fetch contacts
  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
    error: contactsError,
  } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  // Mutations
  const addContactMutation = useMutation({
    mutationFn: async (newContact: { name: string; email: string; status: string }) => {
      const response = await apiRequest("POST", "/api/contacts", newContact);
      return response.json();
    },
    onSuccess: () => {
      setShowAddContactDialog(false);
      setNewContact({ name: "", email: "", status: "active" });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact added",
        description: "The contact has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding contact",
        description: error.message || "There was an error adding the contact.",
        variant: "destructive",
      });
    },
  });

  // Computed values
  const activeContacts = contacts.filter(contact => contact.status === "active").length;
  const inactiveContacts = contacts.filter(contact => contact.status === "inactive").length;
  const bouncedContacts = contacts.filter(contact => contact.status === "bounced").length;

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query)
    );
  });

  // Handle adding a new contact
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    addContactMutation.mutate(newContact);
  };

  // Select/deselect all contacts
  useEffect(() => {
    if (selectAll) {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  }, [selectAll, filteredContacts]);

  // Tags data
  const tagGroups: Tag[] = [
    { id: 'customer', name: 'Customer', count: 4 },
    { id: 'newsletter', name: 'Newsletter', count: 2 },
    { id: 'lead', name: 'Lead', count: 3 },
    { id: 'event', name: 'Event', count: 1 },
    { id: 'product', name: 'Product Launch', count: 1 },
    { id: 'vip', name: 'VIP', count: 1 },
    { id: 'former', name: 'Former Customer', count: 1 },
    { id: 'webinar', name: 'Webinar', count: 1 }
  ];

  // Top engaged contacts
  const topEngagedContacts = [...contacts]
    .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
    .slice(0, 3);

  // Calculate engagement distribution
  const highEngagement = Math.round((contacts.filter(c => (c.engagement || 0) > 70).length / contacts.length) * 100) || 45;
  const mediumEngagement = Math.round((contacts.filter(c => (c.engagement || 0) >= 30 && (c.engagement || 0) <= 70).length / contacts.length) * 100) || 35;
  const lowEngagement = Math.round((contacts.filter(c => (c.engagement || 0) < 30).length / contacts.length) * 100) || 20;

  // We'll use avatar initials for contacts without images
  const getInitials = (name: string) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Function to get avatar background color based on name
  const getAvatarColor = (name: string) => {
    if (!name) return "bg-gray-300";
    
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-red-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-cyan-500",
    ];
    
    // Simple hash to pick a consistent color for a name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Function to render engagement bar
  const renderEngagementBar = (engagement?: number) => {
    if (engagement === undefined) return null;
    
    let color = "bg-gray-300";
    if (engagement > 70) color = "bg-emerald-500";
    else if (engagement > 40) color = "bg-amber-500";
    else if (engagement > 0) color = "bg-red-500";
    
    return (
      <div className="w-full bg-gray-100 rounded-full h-1.5 mr-2">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${engagement}%` }}></div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start gap-3">
        <div className="bg-purple-100 p-3 rounded-xl">
          <User className="h-6 w-6 text-purple-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground text-sm">Manage your audience and track engagement</p>
        </div>
      </div>

      {/* Contact Analytics */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Analytics */}
          <Card className="border shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Contact Analytics</h2>
              
              {/* Contact Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 border rounded-lg p-3">
                  <h3 className="text-xs font-medium uppercase text-gray-500 mb-1">TOTAL CONTACTS</h3>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                  <p className="text-xs text-gray-500">contacts</p>
                </div>
                
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                  <h3 className="text-xs font-medium uppercase text-emerald-600 mb-1">ACTIVE</h3>
                  <p className="text-2xl font-bold text-emerald-700">{activeContacts}</p>
                  <div className="mt-1">
                    <span className="text-xs text-emerald-700">{Math.round((activeContacts / contacts.length) * 100) || 0}%</span>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <h3 className="text-xs font-medium uppercase text-amber-600 mb-1">INACTIVE</h3>
                  <p className="text-2xl font-bold text-amber-700">{inactiveContacts}</p>
                  <div className="mt-1">
                    <span className="text-xs text-amber-700">{Math.round((inactiveContacts / contacts.length) * 100) || 0}%</span>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <h3 className="text-xs font-medium uppercase text-red-600 mb-1">BOUNCED</h3>
                  <p className="text-2xl font-bold text-red-700">{bouncedContacts}</p>
                  <div className="mt-1">
                    <span className="text-xs text-red-700">{Math.round((bouncedContacts / contacts.length) * 100) || 0}%</span>
                  </div>
                </div>
              </div>
              
              {/* Engagement Distribution */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Engagement Distribution</h3>
                  <p className="text-xs text-gray-500">Based on open rates, clicks and activity</p>
                </div>
                
                <div className="flex h-2">
                  <div className="bg-emerald-500 h-2 rounded-l-full" style={{ width: `${highEngagement}%` }}></div>
                  <div className="bg-amber-500 h-2" style={{ width: `${mediumEngagement}%` }}></div>
                  <div className="bg-red-500 h-2 rounded-r-full" style={{ width: `${lowEngagement}%` }}></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 pt-1">
                  <div>High ({highEngagement}%)</div>
                  <div>Medium ({mediumEngagement}%)</div>
                  <div>Low ({lowEngagement}%)</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Right column - Tag Overview & Top Engaged */}
          <Card className="border shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Tag Overview</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {tagGroups.map(tag => (
                  <div key={tag.id} className="bg-gray-50 px-3 py-2 rounded-lg border flex items-center justify-between">
                    <div className="text-sm font-medium">{tag.name}</div>
                    <div className="bg-gray-200 text-gray-700 px-2 rounded-full text-xs">{tag.count}</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Top Engaged Contacts</h3>
                
                <div className="space-y-3">
                  {topEngagedContacts.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAvatarColor(contact.name)}`}>
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{contact.name}</div>
                          <div className="text-xs text-gray-500">{contact.email}</div>
                        </div>
                      </div>
                      
                      <div className="w-24">
                        {renderEngagementBar(contact.engagement)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contacts by name, email or notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Select defaultValue="all">
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
          
          <Select defaultValue="name">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="email">Sort by Email</SelectItem>
              <SelectItem value="date">Sort by Date Added</SelectItem>
              <SelectItem value="engagement">Sort by Engagement</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Advanced Filters</span>
          </Button>
          
          <div className="flex items-center border rounded-md overflow-hidden h-10">
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
          
          <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="whitespace-nowrap">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button onClick={() => setShowAddContactDialog(true)} className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap">
            <span className="mr-1">+</span> Add Contact
          </Button>
        </div>
      </div>
      
      {/* Contacts count */}
      <div className="text-sm text-gray-500">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>
      
      {/* Contacts Table */}
      {viewMode === "table" && (
        <div className="border rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[40px]">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={() => setSelectAll(!selectAll)}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => {
                        if (selectedContacts.includes(contact.id)) {
                          setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                        } else {
                          setSelectedContacts([...selectedContacts, contact.id]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAvatarColor(contact.name)}`}>
                        {getInitials(contact.name)}
                      </div>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-xs text-gray-500">Source: {contact.source || "Website"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>
                    {contact.status === "active" && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </div>
                    )}
                    {contact.status === "inactive" && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </div>
                    )}
                    {contact.status === "unsubscribed" && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Unsubscribed
                      </div>
                    )}
                    {contact.status === "bounced" && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Bounced
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12">
                        <Progress value={contact.engagement || 0} className="h-1" />
                      </div>
                      <span className="text-sm">{contact.engagement || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags && contact.tags.map((tag, i) => (
                        <div key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{contact.dateAdded || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Cards view */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="overflow-hidden border">
              <div className="p-4 flex justify-between border-b">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getAvatarColor(contact.name)}`}>
                    {getInitials(contact.name)}
                  </div>
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.email}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => {
                    if (selectedContacts.includes(contact.id)) {
                      setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                    } else {
                      setSelectedContacts([...selectedContacts, contact.id]);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="text-sm">Status</div>
                  <div>
                    {contact.status === "active" && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </div>
                    )}
                    {contact.status === "inactive" && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </div>
                    )}
                    {contact.status === "unsubscribed" && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Unsubscribed
                      </div>
                    )}
                    {contact.status === "bounced" && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Bounced
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">Engagement</div>
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <Progress value={contact.engagement || 0} className="h-1" />
                    </div>
                    <span className="text-sm">{contact.engagement || 0}%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">Added</div>
                  <div className="text-sm">{contact.dateAdded || "N/A"}</div>
                </div>
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags && contact.tags.map((tag, i) => (
                      <div key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <div className="border-t p-3 flex justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Eye className="h-4 w-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Pencil className="h-4 w-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
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
              Add a new contact to your database. All fields with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddContact}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newContact.status}
                  onValueChange={(value) => setNewContact({ ...newContact, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddContactDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addContactMutation.isPending}>
                {addContactMutation.isPending ? "Adding..." : "Add Contact"}
              </Button>
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
              Import contacts from a CSV, Excel, or JSON file. Make sure your file contains at minimum the name and email columns.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-10 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <h3 className="text-lg font-medium">Drag and drop your file here</h3>
                <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
                <Button variant="outline">Select File</Button>
              </div>
            </div>
            
            <div className="bg-muted rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">Supported formats</h4>
              <div className="flex flex-wrap gap-2">
                <div className="bg-background rounded px-2 py-1 text-xs">.csv</div>
                <div className="bg-background rounded px-2 py-1 text-xs">.xlsx</div>
                <div className="bg-background rounded px-2 py-1 text-xs">.json</div>
                <div className="bg-background rounded px-2 py-1 text-xs">.txt</div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={true}>
              Import Contacts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsV7;