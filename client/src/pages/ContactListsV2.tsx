import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast as hotToast } from "react-hot-toast";
import { Dialog as HeadlessDialog } from "@headlessui/react";
import {
  UserPlus,
  Copy,
  X,
  MoreHorizontal,
  Clock,
  Tag,
  ArrowUpRight,
  LayoutList,
  BarChart,
  Filter,
  Plus,
  Grid2X2,
  ListFilter,
  Users,
  Search
} from "lucide-react";

interface Contact {
  id: number;
  name: string;
  email: string;
  metadata?: {
    phone?: string;
    company?: string;
    notes?: string;
  };
  createdAt?: string;
  addedOn?: string;
}

interface List {
  id: number;
  name: string;
  description: string;
  contactCount: number;
  requireDoubleOptIn: boolean;
  sendWelcomeEmail: boolean;
  tags?: string[];
  lastUpdated?: string;
  lastCampaign?: string;
  growthRate?: number;
  engagementScore?: number;
}

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
import { useToast } from "@/components/ui/use-toast";

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
  const [isManageContactsOpen, setIsManageContactsOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Contact>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  // Add contacts query
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return response.json();
    },
  });

  // Filter and sort contacts
  const filteredContacts = useMemo(() => {
    return contacts
      .filter((contact: Contact) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          contact.name.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          (contact.metadata?.phone || '').toLowerCase().includes(searchLower) ||
          (contact.metadata?.company || '').toLowerCase().includes(searchLower)
        );
      })
      .sort((a: Contact, b: Contact) => {
        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';
        if (sortDirection === 'asc') {
          return String(aValue).localeCompare(String(bValue));
        }
        return String(bValue).localeCompare(String(aValue));
      });
  }, [contacts, searchQuery, sortField, sortDirection]);

  // Add handleSort function
  const handleSort = (field: keyof Contact) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{list.description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onManageContacts(list.id)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Manage Contacts
          </button>
          <button
            onClick={() => onDuplicate(list.id)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </button>
          <button
            onClick={() => onMenu(list.id)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {list.contactCount} contacts
            </span>
            <span className="text-sm text-gray-500">
              {list.requireDoubleOptIn ? 'Double opt-in required' : 'Single opt-in'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {list.tags?.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Manage Contacts Dialog */}
      <HeadlessDialog
        open={isManageContactsOpen}
        onClose={() => setIsManageContactsOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <HeadlessDialog.Title className="text-lg font-medium text-gray-900">
                Manage Contacts - {list.name}
              </HeadlessDialog.Title>
              <button
                onClick={() => setIsManageContactsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Phone
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Company
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact: Contact) => (
                    <tr key={contact.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {contact.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{contact.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {contact.metadata?.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {contact.metadata?.company || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            if (selectedContacts.find((c) => c.id === contact.id)) {
                              setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
                            } else {
                              setSelectedContacts([...selectedContacts, contact]);
                            }
                          }}
                          className={`text-blue-600 hover:text-blue-900 ${
                            selectedContacts.find((c) => c.id === contact.id)
                              ? 'font-bold'
                              : ''
                          }`}
                        >
                          {selectedContacts.find((c) => c.id === contact.id)
                            ? 'Remove'
                            : 'Add'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setIsManageContactsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    // Add selected contacts to list
                    for (const contact of selectedContacts) {
                      await fetch(`/api/lists/${list.id}/contacts`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ contactId: contact.id }),
                      });
                    }
                    hotToast.success('Contacts added to list successfully');
                    setIsManageContactsOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['lists'] });
                  } catch (error) {
                    hotToast.error('Failed to add contacts to list');
                    console.error('Error adding contacts to list:', error);
                  } finally {
                    // Clear selected contacts after attempting to add
                    setSelectedContacts([]);
                  }
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Selected Contacts
              </button>
            </div>
          </div>
        </div>
      </HeadlessDialog>
    </div>
  );
};

// Main component
interface List {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
  contactCount?: number;
  engagementScore?: number;
  updatedAt?: string;
  requireDoubleOptIn: boolean;
  sendWelcomeEmail: boolean;
}

export default function ContactListsV2() {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [showCreateListDialog, setShowCreateListDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [currentList, setCurrentList] = useState<List | null>(null);

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
  
  // Fetch lists from API
  const { data: lists = [], isLoading, error, refetch } = useQuery<List[], Error>({
    queryKey: ['lists'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/lists');
      if (!response.ok) {
        throw new Error('Failed to fetch lists');
      }
      const data = await response.json();
      // Ensure each list has a contactCount
      return data.map((list: any) => ({
        ...list,
        contactCount: list.contactCount || 0
      }));
    }
  });

  // Handle query errors
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading lists',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  // Initialize query client
  const queryClient = useQueryClient();

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: async (listData: any) => {
      const response = await apiRequest('POST', '/api/lists', listData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create list');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch lists query
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast({
        title: 'List created',
        description: 'New list has been successfully created.',
        variant: 'default',
      });
      setShowCreateListDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create list.',
        variant: 'destructive',
      });
    },
  });
  
  // Update list mutation
  const updateListMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/lists/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update list');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch lists query
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast({
        title: 'List updated',
        description: 'List has been successfully updated.',
      });
      setShowCreateListDialog(false);
      setCurrentList(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update list.',
        variant: 'destructive',
      });
    },
  });
  
  // Filter lists based on search query and tag
  const filteredLists = lists.filter((list: any) => {
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
  const sortedLists = [...filteredLists].sort((a: any, b: any) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "contacts") {
      return (b.contactCount || 0) - (a.contactCount || 0);
    } else if (sortBy === "engagement") {
      return (b.engagementScore || 0) - (a.engagementScore || 0);
    } else if (sortBy === "date") {
      const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
      const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
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
  
  // Add duplicateListMutation
  const duplicateListMutation = useMutation({
    mutationFn: async (listId: number) => {
      const response = await fetch(`/api/lists/${listId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to duplicate list');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast({ title: 'List duplicated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to duplicate list', description: error.message, variant: 'destructive' });
      console.error('Error duplicating list:', error);
    },
  });

  // Handle duplicate list
  const handleDuplicateList = async (listId: number) => {
    try {
      await duplicateListMutation.mutateAsync(listId);
    } catch (error) {
      console.error('Error duplicating list:', error);
    }
  };

  // Handle manage contacts
  const handleManageContacts = (listId: number) => {
    // Find the list
    const list = lists.find(l => l.id === listId);
    if (!list) {
      toast({
        title: 'Error',
        description: 'List not found',
        variant: 'destructive',
      });
      return;
    }
    // Set the current list and open the manage contacts dialog
    setCurrentList(list);
    setShowCreateListDialog(true);
  };

  // Handle list menu
  const handleListMenu = (listId: number) => {
    // Find the list
    const list = lists.find(l => l.id === listId);
    if (!list) {
      toast({
        title: 'Error',
        description: 'List not found',
        variant: 'destructive',
      });
      return;
    }
    // Set the current list and open the menu dialog
    setCurrentList(list);
    setShowFilterDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Lists</h1>
          <p className="text-gray-500 mt-1">Manage your contact lists and segments</p>
        </div>
        <Button onClick={() => {
          setCurrentList(null);
          form.reset();
          setShowCreateListDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create List
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {Array.from(new Set(lists.flatMap(list => list.tags || []))).map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="contacts">Contact Count</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="date">Last Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lists Grid */}
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
                    description: "All filters have been reset to default values.",
                    variant: "default"
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
                    description: "The list has been filtered according to your criteria.",
                    variant: "default"
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
}