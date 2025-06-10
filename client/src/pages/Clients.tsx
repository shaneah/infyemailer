import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Building, PlusCircle, User, Mail, DollarSign, Briefcase, Trash2, Edit, CreditCard, FileText, Users2 } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Client form schema 
const clientSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  company: z.string().min(1, { message: "Company name is required." }),
  status: z.enum(["active", "inactive"]),
  industry: z.string().optional(),
  totalSpend: z.number().optional(),
  avatar: z.string().optional()
});

type ClientFormValues = z.infer<typeof clientSchema>;

const ClientsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // All state hooks
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [totalSystemCredits, setTotalSystemCredits] = useState(1000000); // Example value, could be fetched from the API
  const [availableCredits, setAvailableCredits] = useState(750000); // Example value
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
  const [selectedClientForCredits, setSelectedClientForCredits] = useState<any>(null);

  // Fetch clients
  const { 
    data: clients, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Custom hook to fetch email credits for a client
  const useClientEmailCredits = (clientId: number) => {
    return useQuery({
      queryKey: [`/api/clients/${clientId}/email-credits/remaining`],
      staleTime: 1000 * 60, // 1 minute
      enabled: !!clientId, // Only run the query if clientId is provided
    });
  };
  
  // Form setup for new client
  const newClientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      status: "active",
      industry: "",
      totalSpend: 0,
      avatar: ""
    }
  });

  // Form setup for edit client
  const editClientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      status: "active",
      industry: "",
      totalSpend: 0,
      avatar: ""
    }
  });
  
  // Form setup for adding credits
  const addCreditsForm = useForm({
    resolver: zodResolver(
      z.object({
        credits: z.number().min(1, "Credits must be at least 1")
      })
    ),
    defaultValues: {
      credits: 1000
    }
  });
  
  // Add client mutation
  const addClientMutation = useMutation({
    mutationFn: async (newClient: ClientFormValues) => {
      console.log('Sending client data:', newClient);
      
      // Convert form fields to match API expectations
      const clientData = {
        ...newClient,
        // Add any missing fields required by the API but not in the form
        metadata: {}
      };
      
      const response = await apiRequest('POST', '/api/clients', clientData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client added",
        description: "The client has been successfully added."
      });
      setIsNewClientOpen(false);
      newClientForm.reset();
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: `Failed to add client: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: (client: ClientFormValues & { id: number }) => 
      apiRequest('PATCH', `/api/clients/${client.id}`, client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client updated",
        description: "The client has been successfully updated."
      });
      setIsEditClientOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update client: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client deleted",
        description: "The client has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete client: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Add credits mutation
  const addCreditsToClientMutation = useMutation({
    mutationFn: async ({ clientId, credits }: { clientId: number; credits: number }) => {
      const response = await apiRequest('POST', `/api/clients/${clientId}/email-credits/add`, { amount: credits });
      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${variables.clientId}/email-credits/remaining`] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Credits Added",
        description: `${variables.credits} credits have been added to the client's account.`
      });
      setIsAddCreditsOpen(false);
    },
    onError: (error) => {
      console.error('Error adding credits:', error);
      toast({
        title: "Error",
        description: `Failed to add credits: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Email Credits Display Component
  const EmailCreditsDisplay = ({ clientId }: { clientId: number }) => {
    const { data, isLoading, isError } = useClientEmailCredits(clientId);
    console.log('[EmailCreditsDisplay] Data:', data, 'Loading:', isLoading, 'Error:', isError);
    
    if (isLoading) {
      return <Skeleton className="h-4 w-24" />;
    }
    
    if (isError) {
      return <span className="text-red-500">Failed to load</span>;
    }
    
    // Calculate the percentage used for the progress bar
    const total = data?.totalCredits || 0;
    const used = data?.usedCredits || 0;
    const remaining = data?.remainingCredits || 0;
    const percentage = total > 0 ? (used / total) * 100 : 0;
    
    return (
      <div className="flex flex-col gap-1 w-full max-w-[150px]">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{remaining.toLocaleString()}</span>
          <span>of {total.toLocaleString()}</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    );
  };

  // Handle new client submission
  function onSubmitNewClient(data: ClientFormValues) {
    addClientMutation.mutate(data);
  }

  // Handle edit client submission
  function onSubmitEditClient(data: ClientFormValues) {
    if (selectedClient) {
      updateClientMutation.mutate({
        id: selectedClient.id,
        ...data
      });
    }
  }

  // Open edit dialog with client data
  function handleEditClient(client: any) {
    setSelectedClient(client);
    
    editClientForm.reset({
      name: client.name,
      email: client.email,
      company: client.company,
      status: client.status.label ? client.status.label.toLowerCase() : client.status,
      industry: client.industry === 'N/A' ? '' : client.industry,
      totalSpend: client.totalSpend,
      avatar: client.avatar || ''
    });
    
    setIsEditClientOpen(true);
  }

  // Handle delete client
  function handleDeleteClient(id: number) {
    deleteClientMutation.mutate(id);
  }

  // Reset form when dialog closes
  function handleCloseNewClient() {
    newClientForm.reset();
    setIsNewClientOpen(false);
  }

  function handleCloseEditClient() {
    editClientForm.reset();
    setIsEditClientOpen(false);
  }

  // Creates avatar fallback text from name (e.g., "John Doe" => "JD")
  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Handle add credits submission
  function onSubmitAddCredits(data: { credits: number }) {
    if (selectedClientForCredits) {
      addCreditsToClientMutation.mutate({ 
        clientId: selectedClientForCredits.id, 
        credits: data.credits 
      });
    }
  }
  
  // Open add credits dialog
  function handleAddCredits(client: any) {
    setSelectedClientForCredits(client);
    addCreditsForm.reset({ credits: 1000 });
    setIsAddCreditsOpen(true);
  }

  // Conditional rendering for loading and error states
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Clients</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
            <CardDescription>Manage your clients and their campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-red-500">Error Loading Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error loading the client data. Please try again later.</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/clients'] })}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle size={16} />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Add a new client to your account.
              </DialogDescription>
            </DialogHeader>
            <Form {...newClientForm}>
              <form onSubmit={newClientForm.handleSubmit(onSubmitNewClient)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={newClientForm.control}
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
                    control={newClientForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={newClientForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={newClientForm.control}
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
                              <SelectValue placeholder="Select a status" />
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
                    control={newClientForm.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input placeholder="Industry" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseNewClient}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addClientMutation.isPending}
                  >
                    {addClientMutation.isPending ? "Creating..." : "Create Client"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* System Credits Summary */}
      <div className="flex space-x-4 bg-card rounded-md border p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-primary/10 p-2">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Available Credits</p>
            <p className="text-2xl font-bold">{availableCredits.toLocaleString()}</p>
          </div>
        </div>
        <div className="border-l pl-4">
          <p className="text-sm text-muted-foreground">Total System Credits: {totalSystemCredits.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Allocated: {(totalSystemCredits - availableCredits).toLocaleString()} ({((totalSystemCredits - availableCredits) / totalSystemCredits * 100).toFixed(1)}%)</p>
        </div>
      </div>
      
      {/* Client Management Section */}
      
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>
            Manage your marketing clients and their allocations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Campaigns</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Email Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients?.map((client: any) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Avatar className="h-9 w-9 mr-3">
                          {client.avatar ? (
                            <AvatarImage src={client.avatar} alt={client.name} />
                          ) : (
                            <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-semibold">{client.name}</div>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
                        {client.metadata?.plan || 'Standard'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{client.metadata?.campaignsCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users2 className="h-4 w-4 text-muted-foreground" />
                        <span>{client.metadata?.contactsCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {client.lastCampaignAt 
                          ? format(new Date(client.lastCampaignAt), 'MMM d, yyyy')
                          : '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{client.emailCredits?.toLocaleString() || 0}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.emailCreditsUsed ? `${client.emailCreditsUsed.toLocaleString()} used` : '0 used'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddCredits(client)}
                        >
                          <CreditCard className="h-4 w-4 mr-1" /> Add Credits
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the client and all associated data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteClient(client.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Client Dialog */}
      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editClientForm}>
            <form onSubmit={editClientForm.handleSubmit(onSubmitEditClient)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editClientForm.control}
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
                  control={editClientForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editClientForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editClientForm.control}
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
                            <SelectValue placeholder="Select a status" />
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
                  control={editClientForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="Industry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseEditClient}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateClientMutation.isPending}
                >
                  {updateClientMutation.isPending ? "Updating..." : "Update Client"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Credits Dialog */}
      <Dialog open={isAddCreditsOpen} onOpenChange={setIsAddCreditsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Email Credits</DialogTitle>
            <DialogDescription>
              Add credits to {selectedClientForCredits?.name}'s account.
            </DialogDescription>
          </DialogHeader>
          <Form {...addCreditsForm}>
            <form onSubmit={addCreditsForm.handleSubmit(onSubmitAddCredits)} className="space-y-4">
              {selectedClientForCredits && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Current Credits</div>
                    <div className="text-2xl font-bold">
                      {selectedClientForCredits.emailCredits?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Total Purchased</div>
                    <div className="text-2xl font-bold">
                      {selectedClientForCredits.emailCreditsPurchased?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>
              )}
              <FormField
                control={addCreditsForm.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits to Add</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the number of email credits to add to this client's account.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={addCreditsToClientMutation.isPending}>
                  {addCreditsToClientMutation.isPending ? 'Adding...' : 'Add Credits'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;