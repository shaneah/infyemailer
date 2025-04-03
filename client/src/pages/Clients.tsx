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
import { Building, PlusCircle, User, Mail, DollarSign, Briefcase, Trash2, Edit } from 'lucide-react';
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
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Fetch clients
  const { 
    data: clients, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 1000 * 60, // 1 minute
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
      
      try {
        const response = await fetch('/api/clients', {
          method: 'POST',
          body: JSON.stringify(clientData),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create client');
        }
        
        const responseData = await response.json();
        console.log('Server response:', responseData);
        return responseData;
      } catch (error) {
        console.error('Error in API request:', error);
        throw error;
      }
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
      apiRequest(`/api/clients/${client.id}`, {
        method: 'PATCH',
        body: JSON.stringify(client),
        headers: { 'Content-Type': 'application/json' }
      }),
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
      apiRequest(`/api/clients/${id}`, {
        method: 'DELETE'
      }),
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
      status: client.status.label.toLowerCase(),
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
                          <Input placeholder="E.g. Technology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={newClientForm.control}
                  name="totalSpend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Spend</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newClientForm.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/avatar.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional: URL to the client's avatar image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseNewClient}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addClientMutation.isPending}>
                    {addClientMutation.isPending ? "Creating..." : "Create Client"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>Manage your clients and their campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Spend</TableHead>
                <TableHead>Last Campaign</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No clients found. Create a new client to get started.
                  </TableCell>
                </TableRow>
              ) : (
                clients?.map((client: any) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {client.avatar ? (
                            <AvatarImage src={client.avatar} alt={client.name} />
                          ) : null}
                          <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{client.name}</span>
                          <span className="text-sm text-muted-foreground">{client.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>
                      <Badge variant={client.status.color === 'success' ? 'default' : 'secondary'}>
                        {client.status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.industry}</TableCell>
                    <TableCell>${client.totalSpend.toLocaleString()}</TableCell>
                    <TableCell>{client.lastCampaign}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the client "{client.name}" and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteClient(client.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
                        <Input placeholder="E.g. Technology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editClientForm.control}
                name="totalSpend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Spend</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editClientForm.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional: URL to the client's avatar image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseEditClient}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateClientMutation.isPending}>
                  {updateClientMutation.isPending ? "Saving..." : "Save Changes"}
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