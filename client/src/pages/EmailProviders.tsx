import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { Check, X, Edit, Trash, AlertTriangle, Loader2, Plus, Send, Key } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface EmailProvider {
  id: number;
  name: string;
  provider: string;
  config: Record<string, any>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AvailableProvider {
  id: string;
  name: string;
}

interface AuthRequirement {
  name: string;
  description: string;
  required: boolean;
}

function EmailProviders() {
  const [activeTab, setActiveTab] = useState("providers");
  const [isNewProviderOpen, setIsNewProviderOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for new provider
  const [newProviderType, setNewProviderType] = useState<string>("");
  const [newProviderName, setNewProviderName] = useState<string>("");
  const [newProviderConfig, setNewProviderConfig] = useState<Record<string, string>>({});
  const [isDefault, setIsDefault] = useState<boolean>(false);
  
  // Test email state
  const [testEmail, setTestEmail] = useState({
    from: '',
    to: '',
    subject: 'Test Email from InfyMailer',
    text: 'This is a test email from your InfyMailer email provider integration.'
  });

  // Query to fetch email providers
  const {
    data: providers = [],
    isLoading: isLoadingProviders,
    error: providersError
  } = useQuery<EmailProvider[]>({
    queryKey: ['/api/email-providers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/email-providers');
      return response.json();
    }
  });

  // Query to fetch available provider types
  const {
    data: availableProviders = [],
    isLoading: isLoadingAvailable
  } = useQuery<AvailableProvider[]>({
    queryKey: ['/api/email-providers/available'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/email-providers/available');
      return response.json();
    }
  });
  
  // Query to fetch auth requirements for selected provider type
  const {
    data: authRequirements = [],
    isLoading: isLoadingRequirements,
  } = useQuery<AuthRequirement[]>({
    queryKey: ['/api/email-providers/requirements', newProviderType],
    queryFn: async () => {
      if (!newProviderType) return [];
      const response = await apiRequest('GET', `/api/email-providers/requirements/${newProviderType}`);
      return response.json();
    },
    enabled: !!newProviderType
  });

  // Mutation to create new provider
  const createProviderMutation = useMutation({
    mutationFn: async (providerData: any) => {
      const response = await apiRequest('POST', '/api/email-providers', providerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-providers'] });
      toast({
        title: "Provider created",
        description: "Email provider has been added successfully.",
      });
      setIsNewProviderOpen(false);
      resetNewProviderForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create provider",
        description: error.message || "An error occurred while creating the provider.",
        variant: "destructive"
      });
    }
  });

  // Mutation to update provider
  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest('PATCH', `/api/email-providers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-providers'] });
      toast({
        title: "Provider updated",
        description: "Email provider has been updated successfully.",
      });
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update provider",
        description: error.message || "An error occurred while updating the provider.",
        variant: "destructive"
      });
    }
  });

  // Mutation to delete provider
  const deleteProviderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/email-providers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-providers'] });
      toast({
        title: "Provider deleted",
        description: "Email provider has been removed successfully.",
      });
      setIsDeleteOpen(false);
      setSelectedProviderId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete provider",
        description: error.message || "An error occurred while deleting the provider.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation to send test email
  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest('POST', `/api/email-providers/${id}/test-email`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test email sent",
        description: "A test email has been sent successfully.",
      });
      setIsTestOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send test email",
        description: error.message || "An error occurred while sending the test email.",
        variant: "destructive"
      });
    }
  });

  const handleProviderTypeChange = (type: string) => {
    setNewProviderType(type);
    setNewProviderConfig({});
  };

  const handleConfigChange = (key: string, value: string) => {
    setNewProviderConfig({
      ...newProviderConfig,
      [key]: value
    });
  };

  const handleCreateProvider = () => {
    createProviderMutation.mutate({
      name: newProviderName,
      provider: newProviderType,
      config: newProviderConfig,
      isDefault
    });
  };

  const handleUpdateProvider = () => {
    if (!selectedProvider) return;
    
    updateProviderMutation.mutate({
      id: selectedProvider.id,
      data: {
        name: selectedProvider.name,
        isDefault: selectedProvider.isDefault,
        config: selectedProvider.config
      }
    });
  };

  const handleDeleteProvider = () => {
    if (selectedProviderId === null) return;
    deleteProviderMutation.mutate(selectedProviderId);
  };
  
  const handleSendTestEmail = () => {
    if (selectedProviderId === null) return;
    sendTestEmailMutation.mutate({
      id: selectedProviderId,
      data: testEmail
    });
  };

  const openEditDialog = (provider: EmailProvider) => {
    setSelectedProvider({ ...provider });
    setIsEditOpen(true);
  };
  
  const openTestDialog = (provider: EmailProvider) => {
    setSelectedProviderId(provider.id);
    setTestEmail({
      ...testEmail,
      from: `noreply@${window.location.hostname}`
    });
    setIsTestOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setSelectedProviderId(id);
    setIsDeleteOpen(true);
  };

  const resetNewProviderForm = () => {
    setNewProviderType("");
    setNewProviderName("");
    setNewProviderConfig({});
    setIsDefault(false);
  };

  if (isLoadingProviders) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (providersError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-bold">Failed to load email providers</h3>
        <p className="text-muted-foreground">
          An error occurred while loading the email providers.
        </p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/email-providers'] })}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Providers</h1>
          <p className="text-muted-foreground">Manage your email service providers for sending emails</p>
        </div>
        <Button onClick={() => setIsNewProviderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Provider
        </Button>
      </div>

      <Tabs defaultValue="providers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="providers">Email Providers</TabsTrigger>
          <TabsTrigger value="settings">Default Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {providers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-60 gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <AlertTriangle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium">No email providers configured</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  You haven't added any email providers yet. Add an email provider to start sending emails.
                </p>
                <Button onClick={() => setIsNewProviderOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Provider
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <Card key={provider.id} className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{provider.name}</CardTitle>
                      <div className="flex gap-1">
                        {provider.isDefault && (
                          <Badge variant="default" className="ml-2">Default</Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-sm text-muted-foreground">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="font-medium">Created</p>
                          <p>{new Date(provider.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-medium">Last Updated</p>
                          <p>{new Date(provider.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(provider)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTestDialog(provider)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => openDeleteDialog(provider.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Default Email Settings</CardTitle>
              <CardDescription>
                Configure default settings for all email providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultFromEmail">Default From Email</Label>
                <Input
                  id="defaultFromEmail"
                  placeholder="noreply@yourdomain.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultFromName">Default From Name</Label>
                <Input
                  id="defaultFromName"
                  placeholder="Your Company Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultReplyTo">Default Reply-To Email</Label>
                <Input
                  id="defaultReplyTo"
                  placeholder="support@yourdomain.com"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add New Provider Dialog */}
      <Dialog open={isNewProviderOpen} onOpenChange={setIsNewProviderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Email Provider</DialogTitle>
            <DialogDescription>
              Add a new email provider to send emails through your application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="providerType">Provider Type</Label>
              <Select value={newProviderType} onValueChange={handleProviderTypeChange}>
                <SelectTrigger id="providerType">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingAvailable ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    availableProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {newProviderType && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="providerName">Provider Name</Label>
                  <Input
                    id="providerName"
                    placeholder="My SendGrid Account"
                    value={newProviderName}
                    onChange={(e) => setNewProviderName(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Authentication Details</h3>
                  
                  {isLoadingRequirements ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    authRequirements.map((req) => (
                      <div key={req.name} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={req.name}>{req.name}</Label>
                          {req.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                        </div>
                        <Input
                          id={req.name}
                          placeholder={req.description}
                          type={req.name.toLowerCase().includes('key') || req.name.toLowerCase().includes('password') ? 'password' : 'text'}
                          value={newProviderConfig[req.name] || ''}
                          onChange={(e) => handleConfigChange(req.name, e.target.value)}
                        />
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isDefault" className="text-sm font-normal">
                    Set as default email provider
                  </Label>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewProviderOpen(false);
                resetNewProviderForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProvider}
              disabled={!newProviderType || !newProviderName || createProviderMutation.isPending}
            >
              {createProviderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Email Provider</DialogTitle>
            <DialogDescription>
              Update your email provider settings.
            </DialogDescription>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editProviderName">Provider Name</Label>
                <Input
                  id="editProviderName"
                  value={selectedProvider.name}
                  onChange={(e) => setSelectedProvider({ ...selectedProvider, name: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsDefault"
                  checked={selectedProvider.isDefault}
                  onChange={(e) => setSelectedProvider({ ...selectedProvider, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="editIsDefault" className="text-sm font-normal">
                  Set as default email provider
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProvider}
              disabled={!selectedProvider || updateProviderMutation.isPending}
            >
              {updateProviderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Provider Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Email Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this email provider? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProvider}
              disabled={deleteProviderMutation.isPending}
            >
              {deleteProviderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Test Email Dialog */}
      <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify your email provider setup.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                placeholder="noreply@yourdomain.com"
                value={testEmail.from}
                onChange={(e) => setTestEmail({ ...testEmail, from: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toEmail">To Email</Label>
              <Input
                id="toEmail"
                placeholder="your@email.com"
                value={testEmail.to}
                onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={testEmail.subject}
                onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                rows={4}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                value={testEmail.text}
                onChange={(e) => setTestEmail({ ...testEmail, text: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendTestEmail}
              disabled={!testEmail.from || !testEmail.to || sendTestEmailMutation.isPending}
            >
              {sendTestEmailMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Test Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EmailProviders;