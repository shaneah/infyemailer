import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, CreditCard, BarChart4, User, Mail, Building2, Check, X, Loader2, Info as InfoIcon, PlusCircle, Shield } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Form validation schemas
const clientFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  company: z.string().min(1, { message: 'Company is required.' }),
  industry: z.string().optional(),
  emailCredits: z.coerce.number().nonnegative({ message: 'Credits must be zero or positive.' }).optional(),
  status: z.string().optional(),
});

const creditFormSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  operation: z.enum(['add', 'deduct', 'set']),
});

// Client user form schema
const clientUserSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  status: z.enum(["active", "inactive"]),
  permissions: z.object({
    emailValidation: z.boolean().default(false),
    campaigns: z.boolean().default(false),
    contacts: z.boolean().default(false),
    templates: z.boolean().default(false),
    reporting: z.boolean().default(false),
    domains: z.boolean().default(false),
    abTesting: z.boolean().default(false)
  }).default({
    emailValidation: false,
    campaigns: false,
    contacts: false,
    templates: false,
    reporting: false,
    domains: false,
    abTesting: false
  }),
  metadata: z.record(z.any()).optional()
});

type Client = {
  id: number;
  name: string;
  email: string;
  company: string;
  industry: string | null;
  status: string;
  emailCredits: number | null;
  emailCreditsPurchased: number | null;
  emailCreditsUsed: number | null;
  totalSpend: number | null;
  createdAt: string | null;
  lastCampaignAt: string | null;
};

type ClientUser = {
  id: number;
  username: string;
  clientId: number;
  status: string;
  lastLoginAt: string | null;
  createdAt: string | null;
};

type CreditHistory = {
  id: number;
  clientId: number;
  amount: number;
  operation: string;
  reason: string | null;
  createdAt: string;
  performedBy: string | null;
};

type EmailProvider = {
  id: number;
  name: string;
  provider: string; // sendgrid, mailgun, amazonses, sendclean, smtp
  isDefault: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  config?: any;
};

type ClientProvider = {
  id: number;
  clientId: number;
  providerId: number;
  createdAt: string | null;
  provider?: EmailProvider;
};

const ClientManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all-clients');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Effect to check sessionStorage for client ID (for navigation from Collaboration Portal)
  useEffect(() => {
    const storedClientId = sessionStorage.getItem('selectedClientId');
    if (storedClientId) {
      const clientId = parseInt(storedClientId, 10);
      if (!isNaN(clientId)) {
        setSelectedClientId(clientId);
        // We'll set the selectedClient in another effect once the clients data is loaded
        setActiveTab('client-details');
      }
      // Remove from session storage to avoid persistence between visits
      sessionStorage.removeItem('selectedClientId');
    }
  }, []);

  // Fetch clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Effect to set the selected client when clients data is loaded
  useEffect(() => {
    if (selectedClientId && clients.length > 0) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [selectedClientId, clients]);

  // Selected client's users
  const { data: clientUsers = [], isLoading: isLoadingUsers } = useQuery<ClientUser[]>({
    queryKey: ['/api/clients', selectedClientId, 'users'],
    queryFn: async () => {
      if (!selectedClientId) return [];
      const response = await fetch(`/api/clients/${selectedClientId}/users`);
      return response.json();
    },
    enabled: !!selectedClientId,
  });

  // Selected client's credit history
  const { data: creditHistory = [], isLoading: isLoadingHistory } = useQuery<CreditHistory[]>({
    queryKey: ['/api/clients', selectedClientId, 'credit-history'],
    queryFn: async () => {
      if (!selectedClientId) return [];
      const response = await fetch(`/api/clients/${selectedClientId}/email-credits/history`);
      return response.json();
    },
    enabled: !!selectedClientId,
  });
  
  // Selected client's providers
  const { data: clientProviders = [], isLoading: isLoadingProviders } = useQuery<ClientProvider[]>({
    queryKey: ['/api/clients', selectedClientId, 'providers'],
    queryFn: async () => {
      if (!selectedClientId) return [];
      const response = await fetch(`/api/clients/${selectedClientId}/providers`);
      return response.json();
    },
    enabled: !!selectedClientId,
  });
  
  // Available email providers
  const { data: availableProviders = [], isLoading: isLoadingAvailableProviders } = useQuery<EmailProvider[]>({
    queryKey: ['/api/email-providers'],
    queryFn: async () => {
      const response = await fetch('/api/email-providers');
      return response.json();
    },
  });

  // Form for adding/editing client
  const clientForm = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      industry: '',
      emailCredits: 0,
      status: 'active',
    },
  });

  // Form for managing credits
  const creditForm = useForm<z.infer<typeof creditFormSchema>>({
    resolver: zodResolver(creditFormSchema),
    defaultValues: {
      amount: 100,
      operation: 'add',
    },
  });
  
  // Form for adding new client user
  const newUserForm = useForm<z.infer<typeof clientUserSchema>>({
    resolver: zodResolver(clientUserSchema),
    defaultValues: {
      username: "",
      password: "",
      status: "active",
      permissions: {
        emailValidation: false,
        campaigns: false,
        contacts: false,
        templates: false,
        reporting: false,
        domains: false,
        abTesting: false
      },
      metadata: {}
    }
  });

  // Form for editing client user
  const editUserForm = useForm<z.infer<typeof clientUserSchema>>({
    resolver: zodResolver(clientUserSchema),
    defaultValues: {
      username: "",
      password: "",
      status: "active",
      permissions: {
        emailValidation: false,
        campaigns: false,
        contacts: false,
        templates: false,
        reporting: false,
        domains: false,
        abTesting: false
      },
      metadata: {}
    }
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: z.infer<typeof clientFormSchema>) => {
      const res = await apiRequest('POST', '/api/clients', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Client created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsAddDialogOpen(false);
      clientForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create client: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async (data: z.infer<typeof clientFormSchema> & { id: number }) => {
      const { id, ...clientData } = data;
      const res = await apiRequest('PATCH', `/api/clients/${id}`, clientData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Client updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update client: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/clients/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Client deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete client: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Credit management mutation
  const manageCreditsMutation = useMutation({
    mutationFn: async ({ 
      clientId, 
      operation, 
      amount 
    }: { 
      clientId: number; 
      operation: string; 
      amount: number;
    }) => {
      const res = await apiRequest(
        'POST', 
        `/api/clients/${clientId}/email-credits/${operation}`, 
        { amount }
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Credits updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientId, 'credit-history'] });
      setIsCreditDialogOpen(false);
      creditForm.reset({
        amount: 100,
        operation: 'add',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update credits: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Add provider to client mutation
  const addProviderMutation = useMutation({
    mutationFn: async ({ 
      clientId, 
      providerId 
    }: { 
      clientId: number; 
      providerId: number;
    }) => {
      const res = await apiRequest(
        'POST', 
        `/api/clients/${clientId}/providers`, 
        { providerId }
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Email provider assigned successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientId, 'providers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to assign provider: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Remove provider from client mutation
  const removeProviderMutation = useMutation({
    mutationFn: async ({ 
      clientId, 
      providerId 
    }: { 
      clientId: number; 
      providerId: number;
    }) => {
      await apiRequest(
        'DELETE', 
        `/api/clients/${clientId}/providers/${providerId}`
      );
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Email provider removed successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientId, 'providers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to remove provider: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Add client user mutation
  const addClientUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof clientUserSchema>) => {
      if (!selectedClientId) {
        throw new Error("No client selected");
      }
      
      const clientUserData = {
        ...userData,
        clientId: selectedClientId
      };
      
      const response = await apiRequest('POST', '/api/client-users', clientUserData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientId, 'users'] });
      toast({
        title: "User added",
        description: "The client user has been successfully added."
      });
      setIsNewUserDialogOpen(false);
      newUserForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add client user: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update client user mutation
  const updateClientUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof clientUserSchema> & { id: number }) => {
      const { id, ...userDataWithoutId } = userData;
      const response = await apiRequest('PATCH', `/api/client-users/${id}`, userDataWithoutId);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientId, 'users'] });
      toast({
        title: "User updated",
        description: "The client user has been successfully updated."
      });
      setIsEditUserDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update client user: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete client user mutation
  const deleteClientUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/client-users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientId, 'users'] });
      toast({
        title: "User deleted",
        description: "The client user has been successfully deleted."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete client user: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onAddClient = (data: z.infer<typeof clientFormSchema>) => {
    createClientMutation.mutate(data);
  };

  const onEditClient = (data: z.infer<typeof clientFormSchema>) => {
    if (selectedClient) {
      updateClientMutation.mutate({ ...data, id: selectedClient.id });
    }
  };

  const onManageCredits = (data: z.infer<typeof creditFormSchema>) => {
    if (selectedClient) {
      manageCreditsMutation.mutate({
        clientId: selectedClient.id,
        operation: data.operation,
        amount: data.amount,
      });
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    clientForm.reset({
      name: client.name,
      email: client.email,
      company: client.company,
      industry: client.industry || '',
      emailCredits: client.emailCredits || 0,
      status: client.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClient = (id: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClientMutation.mutate(id);
    }
  };

  const handleManageCredits = (client: Client) => {
    setSelectedClient(client);
    setIsCreditDialogOpen(true);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setSelectedClientId(client.id);
    setActiveTab('client-details');
  };
  
  // Handle new client user submission
  function onSubmitNewUser(data: z.infer<typeof clientUserSchema>) {
    addClientUserMutation.mutate(data);
  }

  // Handle edit client user submission
  function onSubmitEditUser(data: z.infer<typeof clientUserSchema>) {
    if (selectedUser) {
      updateClientUserMutation.mutate({
        id: selectedUser.id,
        ...data
      });
    }
  }

  // Open edit dialog with user data
  function handleEditUser(user: any) {
    setSelectedUser(user);
    editUserForm.reset({
      username: user.username,
      password: "", // Don't populate password for security reasons
      status: user.status,
      permissions: user.permissions || {
        emailValidation: false,
        campaigns: false,
        contacts: false,
        templates: false,
        reporting: false,
        domains: false,
        abTesting: false
      },
      metadata: user.metadata || {}
    });
    setIsEditUserDialogOpen(true);
  }

  // Handle delete user
  function handleDeleteUser(id: number) {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteClientUserMutation.mutate(id);
    }
  }

  // Reset form when dialog closes
  function handleCloseNewUser() {
    newUserForm.reset();
    setIsNewUserDialogOpen(false);
  }

  function handleCloseEditUser() {
    editUserForm.reset();
    setIsEditUserDialogOpen(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string | undefined | null) => {
    // Make sure we have a string and not an object or null/undefined
    const statusStr = typeof status === 'string' ? status : 'unknown';
    
    switch (statusStr.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{typeof statusStr === 'string' ? statusStr : 'Unknown'}</Badge>;
    }
  };

  const getOperationBadge = (operation: string | undefined | null) => {
    // Make sure we have a string and not an object or null/undefined
    const operationStr = typeof operation === 'string' ? operation : 'unknown';
    
    switch (operationStr.toLowerCase()) {
      case 'add':
        return <Badge className="bg-green-500 text-white">Added</Badge>;
      case 'deduct':
        return <Badge variant="destructive">Deducted</Badge>;
      case 'set':
        return <Badge variant="secondary">Set</Badge>;
      default:
        return <Badge>{typeof operationStr === 'string' ? operationStr : 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Management</h1>
        {activeTab === 'all-clients' && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
        )}
        {activeTab === 'client-details' && (
          <Button variant="outline" onClick={() => setActiveTab('all-clients')}>
            Back to All Clients
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all-clients">All Clients</TabsTrigger>
          {selectedClient && (
            <TabsTrigger value="client-details">{selectedClient.name}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all-clients">
          {clients.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-xl font-semibold">No Clients Found</h3>
                  <p className="mt-1 text-gray-500">Get started by adding your first client.</p>
                  <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Card key={client.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl truncate hover:text-clip">{client.name}</CardTitle>
                        <CardDescription className="truncate">{client.email}</CardDescription>
                      </div>
                      <div>{getStatusBadge(client.status)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Company:</span>
                        <span className="text-sm font-semibold">{client.company}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Industry:</span>
                        <span className="text-sm">{client.industry || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Email Credits:</span>
                        <span className="text-sm font-semibold">
                          {client.emailCredits !== null && client.emailCredits !== undefined ? client.emailCredits.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Created:</span>
                        <span className="text-sm">{formatDate(client.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-3 border-t">
                    <Button size="sm" variant="outline" onClick={() => handleViewClient(client)}>
                      View Details
                    </Button>
                    <div className="flex space-x-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleManageCredits(client)}
                        title="Manage Credits"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleEditClient(client)}
                        title="Edit Client"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDeleteClient(client.id)}
                        title="Delete Client"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="client-details">
          {selectedClient && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl">{selectedClient.name}</CardTitle>
                      <CardDescription>{selectedClient.email}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(selectedClient.status)}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditClient(selectedClient)}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleManageCredits(selectedClient)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> Manage Credits
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-gray-500">COMPANY DETAILS</h3>
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="font-medium">{selectedClient.company}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Industry</p>
                        <p className="font-medium">{selectedClient.industry || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created On</p>
                        <p className="font-medium">{formatDate(selectedClient.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Campaign</p>
                        <p className="font-medium">{formatDate(selectedClient.lastCampaignAt)}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-gray-500">EMAIL CREDITS</h3>
                      <div>
                        <p className="text-sm text-gray-500">Available Credits</p>
                        <p className="font-medium text-xl text-green-600">
                          {selectedClient.emailCredits !== null && selectedClient.emailCredits !== undefined ? selectedClient.emailCredits.toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Purchased</p>
                        <p className="font-medium">
                          {selectedClient.emailCreditsPurchased !== null && selectedClient.emailCreditsPurchased !== undefined ? selectedClient.emailCreditsPurchased.toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Used</p>
                        <p className="font-medium">
                          {selectedClient.emailCreditsUsed !== null && selectedClient.emailCreditsUsed !== undefined ? selectedClient.emailCreditsUsed.toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Spend</p>
                        <p className="font-medium">
                          {selectedClient.totalSpend !== null && selectedClient.totalSpend !== undefined ? `$${selectedClient.totalSpend.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-gray-500">QUICK ACTIONS</h3>
                      <div className="space-y-2">
                        <Button className="w-full justify-start" variant="outline">
                          <BarChart4 className="mr-2 h-4 w-4" /> View Campaign Analytics
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Mail className="mr-2 h-4 w-4" /> Send Test Email
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => {
                          setSelectedClient(selectedClient);
                          setSelectedClientId(selectedClient.id);
                          setActiveTab('client-details');
                          setTimeout(() => {
                            const usersTab = document.querySelector('[role="tab"][data-state][value="users"]');
                            if (usersTab) (usersTab as HTMLElement).click();
                          }, 0);
                        }}>
                          <User className="mr-2 h-4 w-4" /> Manage Users
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="users" className="w-full">
                <TabsList>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="credit-history">Credit History</TabsTrigger>
                  <TabsTrigger value="email-providers">Email Providers</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle>Client Users</CardTitle>
                        <CardDescription>Users who can access client's account</CardDescription>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => setIsNewUserDialogOpen(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add User
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {isLoadingUsers ? (
                        <div className="flex justify-center items-center h-52">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : clientUsers.length === 0 ? (
                        <div className="text-center py-12">
                          <User className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-4 text-xl font-semibold">No Users Found</h3>
                          <p className="mt-2 text-gray-500 max-w-md mx-auto">
                            This client doesn't have any users yet. Create users to allow them to access this client's account.
                          </p>
                          <Button 
                            className="mt-6" 
                            onClick={() => setIsNewUserDialogOpen(true)}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add First User
                          </Button>
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clientUsers.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell className="font-medium">{user.username}</TableCell>
                                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                                  <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                                  <TableCell className="text-right">
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => handleEditUser(user)}
                                      title="Edit User"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => handleDeleteUser(user.id)}
                                      title="Delete User"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="credit-history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Credit History</CardTitle>
                      <CardDescription>History of email credit transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingHistory ? (
                        <div className="text-center py-4">Loading credit history...</div>
                      ) : creditHistory.length === 0 ? (
                        <div className="text-center py-6">
                          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-xl font-semibold">No Credit History</h3>
                          <p className="mt-1 text-gray-500">No credit transactions have been made yet.</p>
                          <Button className="mt-4" onClick={() => handleManageCredits(selectedClient)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Credits
                          </Button>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Operation</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Performed By</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {creditHistory.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{formatDate(record.createdAt)}</TableCell>
                                <TableCell>{getOperationBadge(record.operation)}</TableCell>
                                <TableCell className="font-semibold">
                                  {record.operation === 'deduct' ? '-' : ''}{record.amount !== null && record.amount !== undefined ? record.amount.toLocaleString() : '0'}
                                </TableCell>
                                <TableCell>{record.reason || 'N/A'}</TableCell>
                                <TableCell>{record.performedBy || 'System'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="email-providers">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Providers</CardTitle>
                      <CardDescription>Manage email providers assigned to this client</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingProviders || isLoadingAvailableProviders ? (
                        <div className="text-center py-4">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                          <p className="mt-2 text-sm text-gray-500">Loading providers...</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-medium">Assigned Providers</h3>
                              <p className="text-sm text-gray-500">Email providers this client can use for sending campaigns</p>
                            </div>
                            {availableProviders.length > 0 && clientProviders.length < availableProviders.length && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Assign Provider
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Assign Email Provider</DialogTitle>
                                    <DialogDescription>
                                      Select a provider to assign to this client.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <div className="space-y-4">
                                      {availableProviders
                                        .filter(provider => !clientProviders.some(cp => Number(cp.providerId) === provider.id))
                                        .map((provider) => (
                                          <div key={provider.id} className="flex items-center justify-between p-3 border rounded-md">
                                            <div>
                                              <h4 className="font-medium">{provider.name}</h4>
                                              <p className="text-sm text-gray-500 capitalize">{provider.provider}</p>
                                            </div>
                                            <Button 
                                              size="sm"
                                              onClick={() => {
                                                if (selectedClient) {
                                                  addProviderMutation.mutate({
                                                    clientId: selectedClient.id,
                                                    providerId: provider.id
                                                  });
                                                }
                                              }}
                                            >
                                              Assign
                                            </Button>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                          
                          {/* Provider List */}
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Provider</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Assigned On</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {clientProviders.length === 0 ? (
                                  <TableRow>
                                    <TableCell className="font-medium">No providers assigned</TableCell>
                                    <TableCell colSpan={4} className="text-center">
                                      <p className="text-sm text-gray-500">Assign email providers to allow this client to send campaigns</p>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  clientProviders.map((clientProvider) => {
                                    const provider = availableProviders.find(
                                      (p) => p.id === Number(clientProvider.providerId)
                                    );
                                    
                                    return (
                                      <TableRow key={clientProvider.id}>
                                        <TableCell className="font-medium">
                                          {provider?.name || `Provider ${clientProvider.providerId}`}
                                        </TableCell>
                                        <TableCell>
                                          {provider?.provider ? (
                                            <Badge variant="outline" className="capitalize">
                                              {provider.provider}
                                            </Badge>
                                          ) : (
                                            'Unknown'
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <Badge className="bg-green-500 text-white">Active</Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(clientProvider.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                          <Button 
                                            size="sm" 
                                            variant="ghost"
                                            onClick={() => {
                                              if (selectedClient && window.confirm('Are you sure you want to remove this provider?')) {
                                                removeProviderMutation.mutate({
                                                  clientId: selectedClient.id,
                                                  providerId: Number(clientProvider.providerId)
                                                });
                                              }
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })
                                )}
                              </TableBody>
                            </Table>
                          </div>
                          
                          <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-900">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <InfoIcon className="h-5 w-5 text-blue-400" />
                              </div>
                              <div className="ml-3 flex-1 md:flex md:justify-between">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  Clients can only use the email providers assigned to them. If no providers are assigned, they won't be able to send emails.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client account with basic information.
            </DialogDescription>
          </DialogHeader>
          <Form {...clientForm}>
            <form onSubmit={clientForm.handleSubmit(onAddClient)} className="space-y-4">
              <FormField
                control={clientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name or company name" {...field} />
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
                      <Input placeholder="client@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={clientForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
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
                      <Input placeholder="Industry (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={clientForm.control}
                name="emailCredits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Email Credits</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createClientMutation.isPending}
                >
                  {createClientMutation.isPending ? 'Creating...' : 'Create Client'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information.
            </DialogDescription>
          </DialogHeader>
          <Form {...clientForm}>
            <form onSubmit={clientForm.handleSubmit(onEditClient)} className="space-y-4">
              <FormField
                control={clientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name or company name" {...field} />
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
                      <Input placeholder="client@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={clientForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
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
                      <Input placeholder="Industry (optional)" {...field} />
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
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateClientMutation.isPending}
                >
                  {updateClientMutation.isPending ? 'Updating...' : 'Update Client'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Manage Credits Dialog */}
      <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Manage Email Credits</DialogTitle>
            <DialogDescription>
              {selectedClient && `Update email credits for ${selectedClient.name}`}
            </DialogDescription>
          </DialogHeader>
          <Form {...creditForm}>
            <form onSubmit={creditForm.handleSubmit(onManageCredits)} className="space-y-4">
              <Alert>
                <AlertTitle>Current Balance</AlertTitle>
                <AlertDescription className="font-bold text-xl">
                  {selectedClient?.emailCredits?.toLocaleString() || '0'} credits
                </AlertDescription>
              </Alert>
              <FormField
                control={creditForm.control}
                name="operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operation</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="add">Add Credits</SelectItem>
                        <SelectItem value="deduct">Deduct Credits</SelectItem>
                        <SelectItem value="set">Set Credits</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={creditForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={manageCreditsMutation.isPending}
                >
                  {manageCreditsMutation.isPending ? 'Updating...' : 'Update Credits'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Add Client User Dialog */}
      <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Client User</DialogTitle>
            <DialogDescription>
              Create a new user account for this client.
            </DialogDescription>
          </DialogHeader>
          <Form {...newUserForm}>
            <form onSubmit={newUserForm.handleSubmit(onSubmitNewUser)} className="space-y-4">
              <FormField
                control={newUserForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newUserForm.control}
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                  Permissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={newUserForm.control}
                    name="permissions.emailValidation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Email Validation</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newUserForm.control}
                    name="permissions.campaigns"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Campaigns</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newUserForm.control}
                    name="permissions.contacts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Contacts</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newUserForm.control}
                    name="permissions.templates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Templates</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newUserForm.control}
                    name="permissions.reporting"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Reporting</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newUserForm.control}
                    name="permissions.domains"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Domains</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newUserForm.control}
                    name="permissions.abTesting"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">A/B Testing</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseNewUser}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addClientUserMutation.isPending}
                >
                  {addClientUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Client User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Client User</DialogTitle>
            <DialogDescription>
              Update user account details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit(onSubmitEditUser)} className="space-y-4">
              <FormField
                control={editUserForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Leave empty to keep current password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                  Permissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={editUserForm.control}
                    name="permissions.emailValidation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Email Validation</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editUserForm.control}
                    name="permissions.campaigns"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Campaigns</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editUserForm.control}
                    name="permissions.contacts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Contacts</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editUserForm.control}
                    name="permissions.templates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Templates</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editUserForm.control}
                    name="permissions.reporting"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Reporting</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editUserForm.control}
                    name="permissions.domains"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Domains</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editUserForm.control}
                    name="permissions.abTesting"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">A/B Testing</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseEditUser}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateClientUserMutation.isPending}
                >
                  {updateClientUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagement;