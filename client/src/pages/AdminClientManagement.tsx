import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import {
  CircleUser, Building2, Mail, Phone, Calendar, ChevronRight, Edit2, Trash2, 
  Shield, DatabaseZap, BarChart3, ArrowUpRight, PlusCircle, UsersRound
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Type definitions for our data
interface Client {
  id: number;
  name: string;
  email: string;
  company: string;
  industry: string | null;
  status: string;
  emailCredits: number | null;
  totalSpend: number | null;
  createdAt: string;
  lastCampaignAt: string | null;
  avatar: string | null;
}

interface ClientUser {
  id: number;
  clientId: number;
  username: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  permissions: any;
}

const AdminClientManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    industry: '',
    status: 'active',
    emailCredits: 0
  });

  // Fetch clients data
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['/api/admin/clients'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/clients');
        if (!response.ok) throw new Error('Failed to fetch clients');
        return await response.json();
      } catch (error) {
        console.error('Error fetching clients:', error);
        return [];
      }
    }
  });

  // Fetch client users when a client is selected
  const { data: clientUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/client-users', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      try {
        const response = await fetch(`/api/admin/client-users?clientId=${selectedClient.id}`);
        if (!response.ok) throw new Error('Failed to fetch client users');
        return await response.json();
      } catch (error) {
        console.error('Error fetching client users:', error);
        return [];
      }
    },
    enabled: !!selectedClient
  });

  // Add client mutation
  const addClientMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create client');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      setNewClientModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Client has been created successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/admin/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update client');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      setEditModalOpen(false);
      toast({
        title: 'Success',
        description: 'Client has been updated successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete client');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      setDeleteModalOpen(false);
      setSelectedClient(null);
      toast({
        title: 'Success',
        description: 'Client has been deleted successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Filter clients based on search term
  const filteredClients = clients.filter((client: Client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.company.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.industry && client.industry.toLowerCase().includes(searchLower))
    );
  });

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'emailCredits' ? parseInt(value, 10) || 0 : value
    }));
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      industry: '',
      status: 'active',
      emailCredits: 0
    });
  };

  // Handle edit button click
  const handleEditClient = (client: Client) => {
    setFormData({
      name: client.name,
      email: client.email,
      company: client.company,
      industry: client.industry || '',
      status: client.status,
      emailCredits: client.emailCredits || 0
    });
    setSelectedClient(client);
    setEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setDeleteModalOpen(true);
  };

  // Handle submit for editing a client
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    updateClientMutation.mutate({
      id: selectedClient.id,
      ...formData
    });
  };

  // Handle submit for creating a new client
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClientMutation.mutate(formData);
  };

  // Handle client selection
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Impersonate a client
  const impersonateClient = (clientId: number) => {
    // In a real implementation, this would make an API call to get temporary credentials
    // For now, we'll simulate this by directly setting session storage
    const clientToImpersonate = clients.find((c: Client) => c.id === clientId);
    if (clientToImpersonate) {
      sessionStorage.setItem('clientUser', JSON.stringify(clientToImpersonate));
      window.location.href = '/client-dashboard';
    }
  };
  
  // Handle user management for a client
  const manageClientUsers = (clientId: number) => {
    console.log(`Manage users for client ID: ${clientId}`);
    // Navigate to a dedicated user management page or open a modal
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-gray-500 mt-1">Manage all your client accounts and users</p>
        </div>
        <Button onClick={() => setNewClientModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Client
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column - Client List */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Clients</CardTitle>
                <Badge variant="outline">{clients.length}</Badge>
              </div>
              <CardDescription>All registered client accounts</CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-0 overflow-auto" style={{ maxHeight: 'calc(100vh - 270px)' }}>
              {clientsLoading ? (
                <div className="p-4 text-center text-gray-500">Loading clients...</div>
              ) : filteredClients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No clients found</div>
              ) : (
                <div className="divide-y">
                  {filteredClients.map((client: Client) => (
                    <div 
                      key={client.id} 
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between ${
                        selectedClient?.id === client.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
                          {client.avatar ? (
                            <img 
                              src={client.avatar} 
                              alt={client.name} 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <Building2 size={20} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 line-clamp-1">{client.company}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Badge 
                              variant={client.status === 'active' ? 'success' : 'secondary'} 
                              className="h-5 text-xs px-1.5"
                            >
                              {client.status}
                            </Badge>
                            <span>{client.emailCredits || 0} credits</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Client Details */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8">
          {selectedClient ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{selectedClient.company}</CardTitle>
                      <CardDescription className="mt-1">{selectedClient.industry || 'No industry specified'}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => impersonateClient(selectedClient.id)}
                            >
                              <ArrowUpRight size={16} className="mr-1" />
                              Login As
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Log in as this client</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClient(selectedClient)}>
                            <Edit2 size={14} className="mr-2" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => manageClientUsers(selectedClient.id)}>
                            <UsersRound size={14} className="mr-2" />
                            Manage Users
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleDeleteClient(selectedClient)}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-gray-400" />
                      <span>{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CircleUser size={16} className="text-gray-400" />
                      <span>{selectedClient.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-400" />
                      <span>Created: {formatDate(selectedClient.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 size={16} className="text-gray-400" />
                      <span>Last Campaign: {formatDate(selectedClient.lastCampaignAt)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Email Credits</div>
                      <div className="text-2xl font-semibold">{selectedClient.emailCredits || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Total Spend</div>
                      <div className="text-2xl font-semibold">
                        ${selectedClient.totalSpend?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Status</div>
                      <Badge 
                        variant={selectedClient.status === 'active' ? 'success' : 'secondary'}
                        className="mt-1"
                      >
                        {selectedClient.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            
              <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                  <TabsTrigger value="domains">Domains</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="mt-4">
                  <Card>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Client Users</CardTitle>
                        <Button size="sm" variant="outline">
                          <PlusCircle size={14} className="mr-2" />
                          Add User
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {usersLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading users...</div>
                      ) : clientUsers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No users found for this client</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Last Login</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {clientUsers.map((user: ClientUser) => (
                              <TableRow key={user.id}>
                                <TableCell>
                                  <div className="font-medium">{user.username}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={user.status === 'active' ? 'success' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {user.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">
                                    <Edit2 size={14} />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600">
                                    <Trash2 size={14} />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="campaigns" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Campaigns</CardTitle>
                      <CardDescription>Campaigns sent by this client</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 size={40} className="mx-auto mb-2 text-gray-300" />
                        <p>Campaign data will be available here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="domains" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Configured Domains</CardTitle>
                      <CardDescription>DNS and email sending domains</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Globe size={40} className="mx-auto mb-2 text-gray-300" />
                        <p>Domain configuration will be available here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Building2 size={60} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Client Selected</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Select a client from the list on the left to view and manage their details, users, and other information.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setNewClientModalOpen(true)}
                >
                  <PlusCircle size={16} className="mr-2" />
                  Create New Client
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Client Modal */}
      <Dialog open={newClientModalOpen} onOpenChange={setNewClientModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client account in the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Contact Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="industry" className="text-right">
                  Industry
                </Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="emailCredits" className="text-right">
                  Email Credits
                </Label>
                <Input
                  id="emailCredits"
                  name="emailCredits"
                  type="number"
                  min="0"
                  value={formData.emailCredits}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Status
                </Label>
                <div className="flex items-center gap-2 col-span-3">
                  <Switch
                    id="status"
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        status: checked ? 'active' : 'inactive'
                      }))
                    }
                  />
                  <Label htmlFor="status" className="cursor-pointer">
                    {formData.status === 'active' ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setNewClientModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addClientMutation.isPending}>
                {addClientMutation.isPending ? 'Creating...' : 'Create Client'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Contact Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="industry" className="text-right">
                  Industry
                </Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="emailCredits" className="text-right">
                  Email Credits
                </Label>
                <Input
                  id="emailCredits"
                  name="emailCredits"
                  type="number"
                  min="0"
                  value={formData.emailCredits}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Status
                </Label>
                <div className="flex items-center gap-2 col-span-3">
                  <Switch
                    id="status"
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        status: checked ? 'active' : 'inactive'
                      }))
                    }
                  />
                  <Label htmlFor="status" className="cursor-pointer">
                    {formData.status === 'active' ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateClientMutation.isPending}>
                {updateClientMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedClient && (
              <div className="bg-red-50 border border-red-100 rounded-md p-4">
                <p className="font-medium text-red-800">You are about to delete:</p>
                <p className="mt-1 text-red-700">{selectedClient.company}</p>
                <p className="mt-0.5 text-sm text-red-600">{selectedClient.email}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedClient && deleteClientMutation.mutate(selectedClient.id)}
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending ? 'Deleting...' : 'Delete Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClientManagement;