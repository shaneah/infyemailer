import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  CreditCard, 
  BarChart4, 
  User, 
  Mail, 
  Building2, 
  Check, 
  X, 
  Loader2, 
  Info as InfoIcon, 
  PlusCircle, 
  Shield, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Clock, 
  ClipboardCheck,
  Search,
  Filter,
  RefreshCw,
  Settings,
  HelpCircle,
  BarChart,
  CalendarClock,
  LayoutGrid,
  List,
  UserPlus
} from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Define schema for client form
const clientFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  industry: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  status: z.string().default("active"),
  metadata: z.record(z.any()).optional()
});

// Define schema for client user form
const clientUserFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  clientId: z.number(),
  role: z.string().default("client_user"),
  status: z.string().default("active"),
  metadata: z.record(z.any()).optional()
});

// Stats card component
const StatsCard = ({ title, value, icon, description, trend, color = "blue" }: any) => {
  const colors: any = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
    green: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
    amber: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
  };
  
  const iconColors: any = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    amber: "text-amber-600 bg-amber-100",
  };

  return (
    <Card className={`${colors[color]} border shadow-sm hover:shadow-md transition-all`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-md font-semibold text-gray-900">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className={`p-2 rounded-full ${iconColors[color]}`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-3">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.direction === 'up' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {trend.direction === 'up' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />} 
              {trend.value}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Client Card Component
const ClientCard = ({ client, onEdit, onDelete, onManageUsers }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="px-5 py-5">
        <div className="flex justify-between items-start">
          <Avatar className="h-14 w-14 mb-3">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              {client.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(client)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Client
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageUsers(client)}>
                <Users className="mr-2 h-4 w-4" /> Manage Users
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(client.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h3 className="text-lg font-semibold">{client.name}</h3>
        <p className="text-sm text-blue-600 mb-3">{client.email}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Building2 className="h-4 w-4 mr-1" /> 
          <span>{client.industry || "N/A"}</span>
        </div>

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          <Badge variant={client.status === 'active' ? 'success' : 'default'} className="text-xs">
            {client.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
          <div className="text-xs flex items-center text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>Added {new Date(client.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-200">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={() => onManageUsers(client)}
        >
          <Users className="h-3 w-3 mr-1" />
          Users
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs"
          onClick={() => onEdit(client)}
        >
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>
    </motion.div>
  );
};

// Main component
const ClientManagementV2 = () => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('clients');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [selectedClientForUsers, setSelectedClientForUsers] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, type: 'client' | 'user' } | null>(null);

  const { toast } = useToast();

  // Client form
  const clientForm = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      email: '',
      industry: '',
      website: '',
      phone: '',
      address: '',
      contactPerson: '',
      status: 'active',
      metadata: {}
    }
  });

  // Client user form
  const clientUserForm = useForm<z.infer<typeof clientUserFormSchema>>({
    resolver: zodResolver(clientUserFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      clientId: 0,
      role: 'client_user',
      status: 'active',
      metadata: { permissions: ['read', 'write'] }
    }
  });

  // Fetch clients
  const { 
    data: clients = [], 
    isLoading: isClientsLoading,
    refetch: refetchClients
  } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      return await response.json();
    },
    initialData: []
  });

  // Fetch client users
  const fetchClientUsers = async (clientId: number) => {
    const response = await apiRequest('GET', `/api/clients/${clientId}/users`);
    return await response.json();
  };

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (client: z.infer<typeof clientFormSchema>) => {
      const response = await apiRequest('POST', '/api/clients', client);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsClientDialogOpen(false);
      clientForm.reset();
      toast({
        title: "Success",
        description: "Client created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client.",
        variant: "destructive",
      });
    }
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof clientFormSchema> }) => {
      const response = await apiRequest('PUT', `/api/clients/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsClientDialogOpen(false);
      setSelectedClient(null);
      clientForm.reset();
      toast({
        title: "Success",
        description: "Client updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update client.",
        variant: "destructive",
      });
    }
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/clients/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({
        title: "Success",
        description: "Client deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client.",
        variant: "destructive",
      });
    }
  });

  // Create client user mutation
  const createClientUserMutation = useMutation({
    mutationFn: async (user: z.infer<typeof clientUserFormSchema>) => {
      const response = await apiRequest('POST', '/api/client-users', user);
      return await response.json();
    },
    onSuccess: () => {
      if (selectedClientForUsers) {
        queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientForUsers.id, 'users'] });
      }
      setIsUserDialogOpen(false);
      clientUserForm.reset();
      toast({
        title: "Success",
        description: "User created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    }
  });

  // Update client user mutation
  const updateClientUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<z.infer<typeof clientUserFormSchema>> }) => {
      const response = await apiRequest('PUT', `/api/client-users/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      if (selectedClientForUsers) {
        queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientForUsers.id, 'users'] });
      }
      setIsUserDialogOpen(false);
      setSelectedUser(null);
      clientUserForm.reset();
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    }
  });

  // Delete client user mutation
  const deleteClientUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/client-users/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      if (selectedClientForUsers) {
        queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientForUsers.id, 'users'] });
      }
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  });

  // Query for client users when a client is selected
  const { 
    data: clientUsers = [], 
    isLoading: isClientUsersLoading,
    refetch: refetchClientUsers
  } = useQuery({
    queryKey: ['/api/clients', selectedClientForUsers?.id, 'users'],
    queryFn: () => selectedClientForUsers ? fetchClientUsers(selectedClientForUsers.id) : [],
    enabled: !!selectedClientForUsers,
    initialData: []
  });

  // Handle client form submission
  const onClientSubmit = (data: z.infer<typeof clientFormSchema>) => {
    if (selectedClient) {
      // Update existing client
      updateClientMutation.mutate({ id: selectedClient.id, data });
    } else {
      // Create new client
      createClientMutation.mutate(data);
    }
  };

  // Handle client user form submission
  const onClientUserSubmit = (data: z.infer<typeof clientUserFormSchema>) => {
    if (selectedUser) {
      // For update, we don't want to send the password if it's empty
      const { password, ...restData } = data;
      const updateData = password ? { ...restData, password } : restData;
      updateClientUserMutation.mutate({ id: selectedUser.id, data: updateData });
    } else {
      // Create new user
      createClientUserMutation.mutate(data);
    }
  };

  // Handle edit client
  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    clientForm.reset({
      name: client.name || '',
      email: client.email || '',
      industry: client.industry || '',
      website: client.website || '',
      phone: client.phone || '',
      address: client.address || '',
      contactPerson: client.contactPerson || '',
      status: client.status || 'active',
      metadata: client.metadata || {}
    });
    setIsClientDialogOpen(true);
  };

  // Handle manage users for a client
  const handleManageUsers = (client: any) => {
    setSelectedClientForUsers(client);
    setActiveTab('users');
  };

  // Handle edit user
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    clientUserForm.reset({
      username: user.username || '',
      email: user.email || '',
      password: '', // Don't set password for edit
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      clientId: user.clientId || selectedClientForUsers?.id || 0,
      role: user.role || 'client_user',
      status: user.status || 'active',
      metadata: user.metadata || { permissions: ['read', 'write'] }
    });
    setIsUserDialogOpen(true);
  };

  // Handle delete client/user
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'client') {
      deleteClientMutation.mutate(itemToDelete.id);
    } else {
      deleteClientUserMutation.mutate(itemToDelete.id);
    }
  };

  // Filter clients based on search query
  const filteredClients = clients.filter((client: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      client.name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.industry?.toLowerCase().includes(query)
    );
  });

  // Get client statistics
  const clientStats = [
    { 
      id: 1, 
      title: 'Total Clients', 
      value: clients.length, 
      icon: <Building2 className="h-5 w-5" />, 
      description: 'Active clients in your system',
      color: 'blue'
    },
    { 
      id: 2, 
      title: 'Active Clients', 
      value: clients.filter((c: any) => c.status === 'active').length, 
      icon: <Check className="h-5 w-5" />, 
      description: 'Currently active clients',
      trend: { direction: 'up', value: '+3%' },
      color: 'green'
    },
    { 
      id: 3, 
      title: 'Total Users', 
      value: clients.reduce((acc: number, client: any) => acc + (client.userCount || 0), 0), 
      icon: <Users className="h-5 w-5" />, 
      description: 'Users across all clients',
      color: 'purple'
    },
    { 
      id: 4, 
      title: 'Inactive Clients', 
      value: clients.filter((c: any) => c.status !== 'active').length, 
      icon: <X className="h-5 w-5" />, 
      description: 'Currently inactive clients',
      color: 'amber'
    }
  ];

  // Reset forms when dialogs are closed
  useEffect(() => {
    if (!isClientDialogOpen) {
      setSelectedClient(null);
      clientForm.reset();
    }
  }, [isClientDialogOpen]);

  useEffect(() => {
    if (!isUserDialogOpen) {
      setSelectedUser(null);
      clientUserForm.reset({
        ...clientUserForm.getValues(),
        clientId: selectedClientForUsers?.id || 0
      });
    }
  }, [isUserDialogOpen]);

  // Set clientId in user form when client for users changes
  useEffect(() => {
    if (selectedClientForUsers) {
      clientUserForm.setValue('clientId', selectedClientForUsers.id);
    }
  }, [selectedClientForUsers]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1600px]">
      {/* Header with gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 mb-8 shadow-lg"
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-bold mb-2 text-white">Client Management</h1>
            <p className="text-white/90 max-w-xl">
              Manage your clients and their users. Create new clients, assign users, and track engagement.
            </p>
            <div className="mt-6 flex space-x-3">
              <Button 
                onClick={() => {
                  setSelectedClient(null);
                  clientForm.reset();
                  setIsClientDialogOpen(true);
                }}
                className="bg-white text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 border-0 shadow-md flex items-center gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Client</span>
              </Button>
              {selectedClientForUsers && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 flex items-center gap-2"
                  onClick={() => {
                    setSelectedUser(null);
                    clientUserForm.reset({
                      ...clientUserForm.getValues(),
                      clientId: selectedClientForUsers.id
                    });
                    setIsUserDialogOpen(true);
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add User</span>
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20 shadow-inner">
              <div className="text-xs text-white/70 mb-1">Client Overview</div>
              <div className="flex gap-4">
                <div>
                  <div className="text-3xl font-bold text-white">{clients.length}</div>
                  <div className="text-xs text-white/70">Total Clients</div>
                </div>
                <div className="border-l border-white/20"></div>
                <div>
                  <div className="text-3xl font-bold text-white">{
                    clients.reduce((acc: number, client: any) => acc + (client.userCount || 0), 0)
                  }</div>
                  <div className="text-xs text-white/70">Total Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {clientStats.map((stat) => (
          <StatsCard 
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </motion.div>

      {/* Tabs and controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-4 md:space-y-0">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="clients">
                <Building2 className="w-4 h-4 mr-2" />
                Clients
              </TabsTrigger>
              {selectedClientForUsers && (
                <TabsTrigger value="users">
                  <Users className="w-4 h-4 mr-2" />
                  {selectedClientForUsers.name} - Users
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type="search"
                  placeholder={activeTab === 'clients' ? "Search clients..." : "Search users..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white w-full sm:w-[200px] md:w-[300px]"
                />
              </div>

              {activeTab === 'clients' && (
                <div className="flex space-x-2">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button 
                      variant={viewMode === "grid" ? "default" : "ghost"} 
                      size="sm"
                      className={viewMode === "grid" ? "bg-white shadow-sm" : "bg-transparent text-gray-500"}
                      onClick={() => setViewMode("grid")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === "table" ? "default" : "ghost"} 
                      size="sm"
                      className={viewMode === "table" ? "bg-white shadow-sm" : "bg-transparent text-gray-500"}
                      onClick={() => setViewMode("table")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => refetchClients()}
                    className="flex items-center"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <TabsContent value="clients" className="mt-0">
            {isClientsLoading ? (
              <div className="flex justify-center py-10">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-gray-500">Loading clients...</p>
                </div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                <div className="flex flex-col items-center max-w-md mx-auto">
                  <div className="rounded-full bg-gray-100 p-4 mb-4">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No clients found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery 
                      ? "No clients match your search criteria. Try adjusting your search."
                      : "You haven't added any clients yet. Add your first client to get started."}
                  </p>
                  <Button 
                    onClick={() => {
                      setSelectedClient(null);
                      clientForm.reset();
                      setIsClientDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredClients.map((client: any) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onEdit={handleEditClient}
                    onDelete={(id: number) => {
                      setItemToDelete({ id, type: 'client' });
                      setIsDeleteDialogOpen(true);
                    }}
                    onManageUsers={handleManageUsers}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client: any) => (
                      <TableRow key={client.id} className="group">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                                {client.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {client.name}
                          </div>
                        </TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.industry || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={client.status === 'active' ? 'success' : 'default'}>
                            {client.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{client.userCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                            <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => handleManageUsers(client)}>
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => handleEditClient(client)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 text-red-500" 
                              onClick={() => {
                                setItemToDelete({ id: client.id, type: 'client' });
                                setIsDeleteDialogOpen(true);
                              }}
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
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            {!selectedClientForUsers ? (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                <div className="flex flex-col items-center max-w-md mx-auto">
                  <div className="rounded-full bg-gray-100 p-4 mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No client selected</h3>
                  <p className="text-gray-500 mb-6">
                    Please select a client to manage their users.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('clients')}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    View Clients
                  </Button>
                </div>
              </div>
            ) : isClientUsersLoading ? (
              <div className="flex justify-center py-10">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {selectedClientForUsers.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedClientForUsers.name}</h3>
                        <p className="text-sm text-gray-500">{selectedClientForUsers.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedUser(null);
                          clientUserForm.reset({
                            ...clientUserForm.getValues(),
                            clientId: selectedClientForUsers.id
                          });
                          setIsUserDialogOpen(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('clients')}
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Back to Clients
                      </Button>
                    </div>
                  </div>
                </div>

                {clientUsers.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                    <div className="flex flex-col items-center max-w-md mx-auto">
                      <div className="rounded-full bg-gray-100 p-4 mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No users found</h3>
                      <p className="text-gray-500 mb-6">
                        This client doesn't have any users yet. Add the first user to get started.
                      </p>
                      <Button 
                        onClick={() => {
                          setSelectedUser(null);
                          clientUserForm.reset({
                            ...clientUserForm.getValues(),
                            clientId: selectedClientForUsers.id
                          });
                          setIsUserDialogOpen(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientUsers
                          .filter((user: any) => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase();
                            return (
                              user.username?.toLowerCase().includes(query) ||
                              user.email?.toLowerCase().includes(query) ||
                              user.firstName?.toLowerCase().includes(query) ||
                              user.lastName?.toLowerCase().includes(query)
                            );
                          })
                          .map((user: any) => (
                            <TableRow key={user.id} className="group">
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xs">
                                      {user.firstName && user.lastName 
                                        ? `${user.firstName[0]}${user.lastName[0]}`
                                        : user.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div>{user.username}</div>
                                    {(user.firstName || user.lastName) && (
                                      <div className="text-xs text-gray-500">
                                        {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {user.role === 'client_user' ? 'Client User' : user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                                  {user.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {user.metadata?.permissions?.map((perm: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-800 capitalize">
                                      {perm}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                                  <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => handleEditUser(user)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 text-red-500" 
                                    onClick={() => {
                                      setItemToDelete({ id: user.id, type: 'user' });
                                      setIsDeleteDialogOpen(true);
                                    }}
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
              </>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Client Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription>
              {selectedClient 
                ? 'Update client information and settings.' 
                : 'Enter the details to create a new client.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...clientForm}>
            <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={clientForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Client name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="client@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="Technology, Healthcare, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientForm.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="Primary contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientForm.control}
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
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={clientForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Client's address" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsClientDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createClientMutation.isPending || updateClientMutation.isPending}
                >
                  {(createClientMutation.isPending || updateClientMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {selectedClient ? 'Update Client' : 'Create Client'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? 'Update user information and permissions.' 
                : 'Enter the details to create a new client user.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...clientUserForm}>
            <form onSubmit={clientUserForm.handleSubmit(onClientUserSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={clientUserForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientUserForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientUserForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{selectedUser ? 'New Password (leave blank to keep current)' : 'Password'}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={selectedUser ? '••••••••' : 'Create password'} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientUserForm.control}
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
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientUserForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientUserForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Permissions</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => {
                      const currentMetadata = clientUserForm.getValues().metadata || {};
                      clientUserForm.setValue('metadata', {
                        ...currentMetadata,
                        permissions: ['read', 'write', 'edit', 'delete', 'invite']
                      });
                    }}
                  >
                    Select All
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {['read', 'write', 'edit', 'delete', 'invite'].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={`permission-${permission}`}
                          checked={clientUserForm.getValues().metadata?.permissions?.includes(permission)}
                          onCheckedChange={(checked) => {
                            const currentMetadata = clientUserForm.getValues().metadata || {};
                            const currentPermissions = currentMetadata.permissions || [];
                            
                            const newPermissions = checked
                              ? [...currentPermissions, permission]
                              : currentPermissions.filter((p: string) => p !== permission);
                            
                            clientUserForm.setValue('metadata', {
                              ...currentMetadata,
                              permissions: newPermissions
                            });
                          }}
                        />
                        <label
                          htmlFor={`permission-${permission}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                        >
                          {permission}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createClientUserMutation.isPending || updateClientUserMutation.isPending}
                >
                  {(createClientUserMutation.isPending || updateClientUserMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {selectedUser ? 'Update User' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {itemToDelete?.type === 'client'
                ? 'Are you sure you want to delete this client? This action cannot be undone and will also delete all associated users.'
                : 'Are you sure you want to delete this user? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteClientMutation.isPending || deleteClientUserMutation.isPending}
            >
              {(deleteClientMutation.isPending || deleteClientUserMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagementV2;