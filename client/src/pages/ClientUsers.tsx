import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PlusCircle, Edit, Trash2, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Client selection component
interface ClientSelectorProps {
  onSelect: (clientId: number) => void;
  selectedClientId: number | null;
}

function ClientSelector({ onSelect, selectedClientId }: ClientSelectorProps) {
  const { data: clients, isLoading, isError } = useQuery<any[]>({
    queryKey: ['/api/clients'],
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (isError) {
    return <div className="text-red-500">Failed to load clients</div>;
  }

  return (
    <div className="mb-6">
      <div className="mb-2 block font-medium">Select Client</div>
      <Select 
        value={selectedClientId?.toString() || ''} 
        onValueChange={(value) => onSelect(parseInt(value))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients && clients.map((client) => (
            <SelectItem key={client.id} value={client.id.toString()}>
              {client.name} ({client.company})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

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

type ClientUserFormValues = z.infer<typeof clientUserSchema>;

export default function ClientUsers() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query client users for the selected client
  const { 
    data: clientUsers, 
    isLoading, 
    isError,
    refetch 
  } = useQuery<any[]>({
    queryKey: ['/api/clients', selectedClientId, 'users'],
    queryFn: async () => {
      if (!selectedClientId) return [];
      const res = await fetch(`/api/clients/${selectedClientId}/users`);
      return res.json();
    },
    enabled: !!selectedClientId,
  });

  // Form setup for new client user
  const newUserForm = useForm<ClientUserFormValues>({
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
      },
      metadata: {}
    }
  });

  // Form setup for edit client user
  const editUserForm = useForm<ClientUserFormValues>({
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
      },
      metadata: {}
    }
  });

  // Add client user mutation
  const addClientUserMutation = useMutation({
    mutationFn: async (userData: ClientUserFormValues) => {
      if (!selectedClientId) {
        throw new Error("No client selected");
      }
      
      const clientUserData = {
        ...userData,
        clientId: selectedClientId
      };
      
      const response = await fetch('/api/client-users', {
        method: 'POST',
        body: JSON.stringify(clientUserData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientId, 'users'] });
      toast({
        title: "User added",
        description: "The client user has been successfully added."
      });
      setIsNewUserOpen(false);
      newUserForm.reset();
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: `Failed to add client user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Update client user mutation
  const updateClientUserMutation = useMutation({
    mutationFn: async (userData: ClientUserFormValues & { id: number }) => {
      const { id, ...userDataWithoutId } = userData;
      
      const response = await fetch(`/api/client-users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(userDataWithoutId),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update client user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientId, 'users'] });
      toast({
        title: "User updated",
        description: "The client user has been successfully updated."
      });
      setIsEditUserOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update client user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Delete client user mutation
  const deleteClientUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/client-users/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete client user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', selectedClientId, 'users'] });
      toast({
        title: "User deleted",
        description: "The client user has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete client user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Handle client selection
  const handleClientSelect = (clientId: number) => {
    setSelectedClientId(clientId);
  };

  // Handle new client user submission
  function onSubmitNewUser(data: ClientUserFormValues) {
    addClientUserMutation.mutate(data);
  }

  // Handle edit client user submission
  function onSubmitEditUser(data: ClientUserFormValues) {
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
    setIsEditUserOpen(true);
  }

  // Handle delete user
  function handleDeleteUser(id: number) {
    deleteClientUserMutation.mutate(id);
  }

  // Reset form when dialog closes
  function handleCloseNewUser() {
    newUserForm.reset();
    setIsNewUserOpen(false);
  }

  function handleCloseEditUser() {
    editUserForm.reset();
    setIsEditUserOpen(false);
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Client Users</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Client Users</CardTitle>
          <CardDescription>Add, edit, or remove client portal users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client selector */}
          <ClientSelector onSelect={handleClientSelect} selectedClientId={selectedClientId} />

          {selectedClientId && (
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Users</h2>
              <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <PlusCircle size={16} />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Client User</DialogTitle>
                    <DialogDescription>
                      Create a new user for this client.
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
                              <Input placeholder="client_user" {...field} />
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
                              <Input type="password" placeholder="••••••••" {...field} />
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
                      
                      <div className="border p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Feature Access</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormField
                            control={newUserForm.control}
                            name="permissions.emailValidation"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Email Validation</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={newUserForm.control}
                            name="permissions.campaigns"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Campaigns</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={newUserForm.control}
                            name="permissions.contacts"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Contacts</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={newUserForm.control}
                            name="permissions.templates"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Templates</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={newUserForm.control}
                            name="permissions.reporting"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Reporting</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={newUserForm.control}
                            name="permissions.domains"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Domains</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={newUserForm.control}
                            name="permissions.abTesting"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">A/B Testing</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCloseNewUser}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addClientUserMutation.isPending}>
                          {addClientUserMutation.isPending ? "Creating..." : "Create User"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {!selectedClientId ? (
            <div className="text-center p-10 border border-dashed rounded-lg">
              <Shield className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">Select a Client</h3>
              <p className="text-muted-foreground mb-4">Please select a client from the dropdown above to manage their users.</p>
            </div>
          ) : isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center p-4">
                <p className="text-red-500 mb-2">Failed to load client users</p>
                <Button onClick={() => refetch()}>Retry</Button>
              </div>
            ) : clientUsers && clientUsers.length === 0 ? (
              <div className="text-center p-10 border border-dashed rounded-lg">
                <User className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">No users found</h3>
                <p className="text-muted-foreground mb-4">This client doesn't have any portal users yet.</p>
                <Button onClick={() => setIsNewUserOpen(true)}>Add First User</Button>
              </div>
            ) : (
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
                  {clientUsers && clientUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
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
                                  This will permanently delete the user "{user.username}" and cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteUser(user.id)}
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
                  ))}
                </TableBody>
              </Table>
            )}

          {/* Edit User Dialog */}
          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Edit Client User</DialogTitle>
                <DialogDescription>
                  Update this client user's details.
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
                          <Input placeholder="client_user" {...field} />
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
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank to keep the current password
                        </FormDescription>
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
                  
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Feature Access</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={editUserForm.control}
                        name="permissions.emailValidation"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Email Validation</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editUserForm.control}
                        name="permissions.campaigns"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Campaigns</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editUserForm.control}
                        name="permissions.contacts"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Contacts</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editUserForm.control}
                        name="permissions.templates"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Templates</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editUserForm.control}
                        name="permissions.reporting"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Reporting</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editUserForm.control}
                        name="permissions.domains"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Domains</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editUserForm.control}
                        name="permissions.abTesting"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">A/B Testing</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseEditUser}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateClientUserMutation.isPending}>
                      {updateClientUserMutation.isPending ? "Updating..." : "Update User"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}