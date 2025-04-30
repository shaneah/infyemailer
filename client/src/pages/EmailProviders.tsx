import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { safeJsonParse } from "@/lib/safeJsonParse";
import { Check, X, Edit, Trash, AlertTriangle, Loader2, Plus, Send, Key, Info, CheckCircle, Settings, Save } from 'lucide-react';
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
  const [isCheckConfigOpen, setIsCheckConfigOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for new provider
  const [newProviderType, setNewProviderType] = useState<string>("");
  const [newProviderName, setNewProviderName] = useState<string>("");
  const [newProviderConfig, setNewProviderConfig] = useState<Record<string, string>>({});
  const [isDefault, setIsDefault] = useState<boolean>(false);
  
  // Default settings state
  const [defaultSettings, setDefaultSettings] = useState<{
    fromEmail: string;
    fromName: string;
    replyTo: string;
    signature: string;
  }>({
    fromEmail: '',
    fromName: '',
    replyTo: '',
    signature: ''
  });
  
  // Query to fetch default email settings
  const {
    data: fetchedDefaultSettings,
    isLoading: isLoadingDefaultSettings
  } = useQuery<{
    fromEmail: string;
    fromName: string;
    replyTo: string;
    signature: string;
  }>({
    queryKey: ['/api/email-settings/default'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/email-settings/default');
      return response.json();
    }
  });
  
  // Update state when default settings are fetched
  useEffect(() => {
    if (fetchedDefaultSettings) {
      setDefaultSettings({
        fromEmail: fetchedDefaultSettings.fromEmail || '',
        fromName: fetchedDefaultSettings.fromName || '',
        replyTo: fetchedDefaultSettings.replyTo || '',
        signature: fetchedDefaultSettings.signature || ''
      });
    }
  }, [fetchedDefaultSettings]);
  
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
      try {
        const response = await apiRequest('GET', '/api/email-providers');
        return await safeJsonParse<EmailProvider[]>(response, 'email providers');
      } catch (error) {
        console.error('Error fetching email providers:', error);
        throw error;
      }
    }
  });

  // Query to fetch available provider types
  const {
    data: availableProviders = [],
    isLoading: isLoadingAvailable
  } = useQuery<AvailableProvider[]>({
    queryKey: ['/api/email-providers/available'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/email-providers/available');
        return await safeJsonParse<AvailableProvider[]>(response, 'available providers');
      } catch (error) {
        console.error('Error fetching available providers:', error);
        throw error;
      }
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
      
      try {
        const response = await apiRequest('GET', `/api/email-providers/requirements/${newProviderType}`);
        return await safeJsonParse<AuthRequirement[]>(response, 'auth requirements'); 
      } catch (error) {
        console.error('Error fetching auth requirements:', error);
        throw error;
      }
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
      try {
        const response = await apiRequest('POST', `/api/email-providers/${id}/test-email`, data);
        
        // If the response is not OK, try to get error details
        if (!response.ok) {
          // Clone the response before reading it to avoid the "body already read" error
          const clonedResponse = response.clone();
          
          try {
            const errorData = await clonedResponse.json();
            if (errorData && errorData.error) {
              throw new Error(errorData.error);
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            // If we can't parse the response as JSON, use the status text
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
          }
          
          // Fallback error message
          throw new Error(`Failed to send email (Status: ${response.status})`);
        }
        
        // Clone the response before reading it to avoid the "body already read" error
        const clonedResponse = response.clone();
        return clonedResponse.json();
      } catch (error: any) {
        // Better handle network and other errors
        console.error('Test email error:', error);
        
        // Extract meaningful messages from errors
        if (error.message.includes('ETIMEDOUT')) {
          throw new Error('Connection to SMTP server timed out. Please check your server address and port.');
        } else if (error.message.includes('ECONNREFUSED')) {
          throw new Error('Connection refused. Please check your SMTP server address, port, and ensure the server is running.');
        } else if (error.message.includes('EAUTH')) {
          throw new Error('Authentication failed. Please check your username and password.');
        } else if (error.message.includes('Greeting never received')) {
          throw new Error('SMTP server not responding. Please check your server address, port, and firewall settings.');
        } else {
          throw error;
        }
      }
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
        description: error.message || "An error occurred while sending the test email. Check console for details.",
        variant: "destructive"
      });
    }
  });
  
  // State for configuration check results
  const [configCheckResult, setConfigCheckResult] = useState<{
    success: boolean;
    apiConnected?: boolean;
    senderIdentitiesVerified?: boolean;
    errors?: string[];
    warnings?: string[];
    troubleshootingTips?: string[];
    details?: {
      verifiedSenders?: string[];
      [key: string]: any;
    };
  } | null>(null);

  // Mutation to check provider configuration
  const checkConfigurationMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Checking configuration for provider ID: ${id}`);
      
      try {
        const response = await apiRequest('POST', `/api/email-providers/${id}/check-configuration`);
        console.log('Check configuration API response:', response);
        
        if (!response.ok) {
          // Clone the response before reading it to avoid the "body already read" error
          const clonedResponse = response.clone();
          
          try {
            const errorText = await clonedResponse.text();
            console.error('Check configuration error response:', errorText);
            
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch (e) {
              throw new Error(`API error: ${response.status} - ${errorText.substring(0, 100)}`);
            }
            
            throw new Error(errorData.error || errorData.details || `API error: ${response.status}`);
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            throw new Error(`Configuration check failed (Status: ${response.status})`);
          }
        }
        
        // Clone the response before reading it to avoid the "body already read" error
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        console.log('Configuration check result data:', data);
        return data;
      } catch (error) {
        console.error('Error in configuration check:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Configuration check success:', data);
      setConfigCheckResult(data);
      
      if (data.success) {
        toast({
          title: "Configuration check passed",
          description: "Provider configuration is valid and working properly.",
        });
      } else {
        toast({
          title: "Configuration issues detected",
          description: "Provider configuration has some issues that need attention.",
          variant: "destructive"
        });
      }
      // Not closing dialog here so we can show the results
    },
    onError: (error: any) => {
      console.error('Configuration check error:', error);
      toast({
        title: "Configuration check failed",
        description: error.message || "An error occurred while checking the provider configuration.",
        variant: "destructive"
      });
      // Don't close the dialog on error so user can see the error and try again
      // setIsCheckConfigOpen(false);
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
    // Validate the SendGrid API key format if the provider type is sendgrid
    if (newProviderType === 'sendgrid' && newProviderConfig['API Key']) {
      const apiKey = newProviderConfig['API Key'];
      
      if (!apiKey.startsWith('SG.')) {
        toast({
          title: "Invalid SendGrid API Key",
          description: "SendGrid API keys must start with 'SG.' prefix. Please check your API key and try again.",
          variant: "destructive"
        });
        return;
      }
    }
    
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
  
  const openCheckConfigurationDialog = (provider: EmailProvider) => {
    setSelectedProviderId(provider.id);
    setConfigCheckResult(null); // Reset any previous results
    setIsCheckConfigOpen(true);
  };

  const handleCheckConfiguration = () => {
    if (selectedProviderId === null) return;
    // Add logs to debug the process
    console.log("Checking configuration for provider ID:", selectedProviderId);
    checkConfigurationMutation.mutate(selectedProviderId);
  };
  
  // Mutation for saving default settings
  const saveDefaultSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest('POST', '/api/email-settings/default', settings);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/email-settings/default'] });
      
      toast({
        title: "Default settings saved",
        description: "Email default settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save default settings",
        description: error.message || "An error occurred while saving default settings.",
        variant: "destructive"
      });
    }
  });
  
  const handleSaveDefaultSettings = () => {
    saveDefaultSettingsMutation.mutate(defaultSettings);
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
    console.error("Provider error details:", providersError);
    
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-bold">Failed to load email providers</h3>
        <p className="text-muted-foreground">
          An error occurred while loading the email providers.
        </p>
        <div className="bg-red-50 text-red-800 p-4 rounded-md max-w-lg mb-2 text-sm">
          <p className="font-medium">Error details:</p>
          <p>{providersError instanceof Error 
            ? providersError.message 
            : "Unknown error. Please check the server logs."}</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/email-providers'] })}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="relative overflow-hidden rounded-xl p-6 md:p-8 mb-8 shadow-xl bg-[#1a3a5f]">
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "30px 30px"
        }}></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f5f0e1] via-[#d4af37] to-[#f5f0e1]">
              Email Providers
            </span>
          </h1>
          <p className="text-[#f5f0e1]/90 text-base md:text-lg max-w-3xl mb-4">
            Configure and manage your email service providers for sending campaigns
          </p>
          <Button 
            onClick={() => setIsNewProviderOpen(true)}
            className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#1a3a5f] font-medium">
            <Plus className="mr-2 h-4 w-4" /> Add Provider
          </Button>
        </div>
      </div>

      <Tabs defaultValue="providers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#f5f0e1] rounded-lg p-1">
          <TabsTrigger 
            value="providers" 
            className="data-[state=active]:bg-[#1a3a5f] data-[state=active]:text-white rounded-md"
          >
            Email Providers
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-[#1a3a5f] data-[state=active]:text-white rounded-md"
          >
            Default Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {providers.length === 0 ? (
            <Card className="border overflow-hidden">
              <div className="h-1 w-full bg-[#d4af37]"></div>
              <CardContent className="flex flex-col items-center justify-center h-80 gap-5 bg-gradient-to-b from-[#f5f0e1]/20 to-white">
                <div className="rounded-full bg-[#1a3a5f]/10 p-5">
                  <AlertTriangle className="h-10 w-10 text-[#1a3a5f]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#1a3a5f]">No Email Providers Configured</h3>
                <p className="text-[#1a3a5f]/70 text-center max-w-md">
                  You haven't added any email providers yet. Configure an email provider to start sending professional emails through your campaigns.
                </p>
                <Button 
                  onClick={() => setIsNewProviderOpen(true)}
                  className="bg-[#1a3a5f] hover:bg-[#1a3a5f]/90 text-white mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Email Provider
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <Card key={provider.id} className="border hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className={`h-1 w-full ${provider.isDefault ? 'bg-[#d4af37]' : 'bg-[#1a3a5f]'}`}></div>
                  <CardHeader className="pb-2 relative">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-[#1a3a5f] font-semibold">
                        {provider.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        {provider.isDefault && (
                          <Badge 
                            className="bg-[#d4af37]/90 hover:bg-[#d4af37] text-[#1a3a5f] font-medium"
                          >
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-[#1a3a5f]/70">
                      {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 bg-[#f5f0e1]/30">
                    <div className="text-sm text-[#1a3a5f]">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="font-medium text-[#1a3a5f]">Created</p>
                          <p>{new Date(provider.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-medium text-[#1a3a5f]">Last Updated</p>
                          <p>{new Date(provider.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4 bg-white">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        className="border-[#1a3a5f] text-[#1a3a5f] hover:bg-[#1a3a5f] hover:text-white"
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(provider)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        className="border-[#1a3a5f] text-[#1a3a5f] hover:bg-[#1a3a5f] hover:text-white"
                        variant="outline"
                        size="sm"
                        onClick={() => openTestDialog(provider)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button
                        className="border-[#1a3a5f] text-[#1a3a5f] hover:bg-[#1a3a5f] hover:text-white"
                        variant="outline"
                        size="sm"
                        onClick={() => openCheckConfigurationDialog(provider)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Check
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
          <Card className="border overflow-hidden">
            <div className="h-1 w-full bg-[#d4af37]"></div>
            <CardHeader className="bg-[#1a3a5f] text-white">
              <CardTitle className="text-xl font-semibold flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Default Email Settings
              </CardTitle>
              <CardDescription className="text-[#f5f0e1]/80 mt-1">
                Configure default settings for all email providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6 bg-gradient-to-b from-[#f5f0e1]/30 to-white">
              <div className="space-y-2">
                <Label htmlFor="defaultFromEmail" className="text-[#1a3a5f] font-medium">Default From Email</Label>
                <Input
                  id="defaultFromEmail"
                  className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                  placeholder="noreply@yourdomain.com"
                  value={defaultSettings.fromEmail || ''}
                  onChange={(e) => setDefaultSettings({
                    ...defaultSettings,
                    fromEmail: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultFromName" className="text-[#1a3a5f] font-medium">Default From Name</Label>
                <Input
                  id="defaultFromName"
                  className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                  placeholder="Your Company Name"
                  value={defaultSettings.fromName || ''}
                  onChange={(e) => setDefaultSettings({
                    ...defaultSettings,
                    fromName: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultReplyTo" className="text-[#1a3a5f] font-medium">Default Reply-To Email</Label>
                <Input
                  id="defaultReplyTo"
                  className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                  placeholder="support@yourdomain.com"
                  value={defaultSettings.replyTo || ''}
                  onChange={(e) => setDefaultSettings({
                    ...defaultSettings,
                    replyTo: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultSignature" className="text-[#1a3a5f] font-medium">Default Email Signature</Label>
                <textarea 
                  id="defaultSignature" 
                  className="w-full min-h-[100px] p-3 border border-[#1a3a5f]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a3a5f]/10 focus:border-[#1a3a5f]"
                  placeholder="Your email signature..." 
                  value={defaultSettings.signature || ''}
                  onChange={(e) => setDefaultSettings({
                    ...defaultSettings,
                    signature: e.target.value
                  })}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-white border-t py-4">
              <Button 
                onClick={handleSaveDefaultSettings}
                className="bg-[#1a3a5f] hover:bg-[#1a3a5f]/90 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add New Provider Dialog */}
      <Dialog open={isNewProviderOpen} onOpenChange={setIsNewProviderOpen}>
        <DialogContent className="sm:max-w-[550px] border-[#1a3a5f]/20 overflow-hidden">
          <div className="h-1 w-full bg-[#d4af37] -mt-6"></div>
          <DialogHeader className="bg-gradient-to-b from-[#f5f0e1]/30 to-white pt-6">
            <DialogTitle className="text-[#1a3a5f] text-xl font-semibold">Add Email Provider</DialogTitle>
            <DialogDescription className="text-[#1a3a5f]/70">
              Configure a new email provider to send emails through your marketing campaigns.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="providerType" className="text-[#1a3a5f] font-medium">Provider Type</Label>
              <Select value={newProviderType} onValueChange={handleProviderTypeChange}>
                <SelectTrigger 
                  id="providerType" 
                  className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                >
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingAvailable ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#1a3a5f]" />
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
                  <Label htmlFor="providerName" className="text-[#1a3a5f] font-medium">Provider Name</Label>
                  <Input
                    id="providerName"
                    placeholder="My SendGrid Account"
                    value={newProviderName}
                    onChange={(e) => setNewProviderName(e.target.value)}
                    className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                  />
                </div>

                <Separator className="bg-[#1a3a5f]/10" />

                <div className="space-y-4">
                  <h3 className="text-[#1a3a5f] font-medium">Authentication Details</h3>
                  
                  {/* Show helper message for SendGrid API Keys */}
                  {newProviderType === 'sendgrid' && (
                    <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Info className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-blue-800">SendGrid API Key Format</h3>
                          <p className="mt-1">
                            SendGrid API keys must start with the "SG." prefix. You can find your API keys in your SendGrid dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {newProviderType === 'smtp' && (
                    <>
                      <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium text-blue-800">SMTP Configuration Tips</h3>
                            <ul className="mt-1 list-disc list-inside space-y-1">
                              <li>For port 465, secure will be automatically set to true</li>
                              <li>For port 587, secure should be set to false</li>
                              <li>Use your full email address as the username</li>
                              <li>For GoDaddy, use host smtpout.secureserver.net with port 465</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {isLoadingRequirements ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : newProviderType === 'smtp' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="host" className="text-[#1a3a5f] font-medium">Host</Label>
                            <Badge variant="outline" className="text-xs text-[#1a3a5f] border-[#d4af37]/50">Required</Badge>
                          </div>
                          <Input
                            id="host"
                            placeholder="e.g., smtpout.secureserver.net"
                            value={newProviderConfig['host'] || ''}
                            onChange={(e) => handleConfigChange('host', e.target.value)}
                            className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="port" className="text-[#1a3a5f] font-medium">Port</Label>
                            <Badge variant="outline" className="text-xs text-[#1a3a5f] border-[#d4af37]/50">Required</Badge>
                          </div>
                          <Input
                            id="port"
                            placeholder="e.g., 465 or 587"
                            value={newProviderConfig['port'] || ''}
                            onChange={(e) => handleConfigChange('port', e.target.value)}
                            className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="username" className="text-[#1a3a5f] font-medium">Username</Label>
                            <Badge variant="outline" className="text-xs text-[#1a3a5f] border-[#d4af37]/50">Required</Badge>
                          </div>
                          <Input
                            id="username"
                            placeholder="Your full email address"
                            value={newProviderConfig['username'] || ''}
                            onChange={(e) => handleConfigChange('username', e.target.value)}
                            className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="password" className="text-[#1a3a5f] font-medium">Password</Label>
                            <Badge variant="outline" className="text-xs text-[#1a3a5f] border-[#d4af37]/50">Required</Badge>
                          </div>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Your email password"
                            value={newProviderConfig['password'] || ''}
                            onChange={(e) => handleConfigChange('password', e.target.value)}
                            className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="fromEmail" className="text-[#1a3a5f] font-medium">From Email</Label>
                          <Input
                            id="fromEmail"
                            placeholder="noreply@yourdomain.com"
                            value={newProviderConfig['fromEmail'] || ''}
                            onChange={(e) => handleConfigChange('fromEmail', e.target.value)}
                            className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="fromName" className="text-[#1a3a5f] font-medium">From Name</Label>
                          <Input
                            id="fromName"
                            placeholder="Your Company Name"
                            value={newProviderConfig['fromName'] || ''}
                            onChange={(e) => handleConfigChange('fromName', e.target.value)}
                            className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                          />
                        </div>
                      </div>
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
        <DialogContent className="w-[95vw] max-w-[95vw] h-auto max-h-[90vh] overflow-y-auto sm:max-w-[600px] md:max-w-[700px]">
          <DialogHeader className="pb-2 border-b border-[#d4af37]/30">
            <DialogTitle className="text-[#1a3a5f] font-semibold">Edit Email Provider</DialogTitle>
            <DialogDescription>
              Update your email provider settings.
            </DialogDescription>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editProviderName" className="text-[#1a3a5f] font-medium">Provider Name</Label>
                <Input
                  id="editProviderName"
                  value={selectedProvider.name}
                  onChange={(e) => setSelectedProvider({ ...selectedProvider, name: e.target.value })}
                  className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                />
              </div>
              
              <Separator className="bg-[#1a3a5f]/10" />
              
              <div className="space-y-4">
                <h3 className="text-[#1a3a5f] font-medium">Authentication Details</h3>
                
                {selectedProvider.provider === 'sendgrid' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    </div>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Your SendGrid API Key"
                      value={selectedProvider.config['API Key'] || ''}
                      onChange={(e) => {
                        const updatedConfig = { ...selectedProvider.config, 'API Key': e.target.value };
                        setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      SendGrid API keys must start with 'SG.' prefix.
                    </p>
                  </div>
                )}
                
                {selectedProvider.provider === 'mailgun' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </div>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Your Mailgun API Key"
                        value={selectedProvider.config['API Key'] || ''}
                        onChange={(e) => {
                          const updatedConfig = { ...selectedProvider.config, 'API Key': e.target.value };
                          setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </div>
                      <Input
                        id="domain"
                        placeholder="Your Mailgun Domain"
                        value={selectedProvider.config['Domain'] || ''}
                        onChange={(e) => {
                          const updatedConfig = { ...selectedProvider.config, 'Domain': e.target.value };
                          setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                        }}
                      />
                    </div>
                  </>
                )}
                
                {selectedProvider.provider === 'amazon-ses' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="accessKeyId">Access Key ID</Label>
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </div>
                      <Input
                        id="accessKeyId"
                        placeholder="AWS Access Key ID"
                        value={selectedProvider.config['Access Key ID'] || ''}
                        onChange={(e) => {
                          const updatedConfig = { ...selectedProvider.config, 'Access Key ID': e.target.value };
                          setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </div>
                      <Input
                        id="secretAccessKey"
                        type="password"
                        placeholder="AWS Secret Access Key"
                        value={selectedProvider.config['Secret Access Key'] || ''}
                        onChange={(e) => {
                          const updatedConfig = { ...selectedProvider.config, 'Secret Access Key': e.target.value };
                          setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="region">Region</Label>
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </div>
                      <Input
                        id="region"
                        placeholder="AWS Region (e.g., us-east-1)"
                        value={selectedProvider.config['Region'] || ''}
                        onChange={(e) => {
                          const updatedConfig = { ...selectedProvider.config, 'Region': e.target.value };
                          setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                        }}
                      />
                    </div>
                  </>
                )}
                
                {selectedProvider.provider === 'sendclean' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    </div>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Your SendClean API Key"
                      value={selectedProvider.config['API Key'] || ''}
                      onChange={(e) => {
                        const updatedConfig = { ...selectedProvider.config, 'API Key': e.target.value };
                        setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                      }}
                    />
                  </div>
                )}
                
                {selectedProvider.provider === 'smtp' && (
                  <>
                    <div className="rounded-md bg-gradient-to-r from-[#f5f0e1] to-[#f5f0e1]/50 border border-[#d4af37]/30 p-4 text-sm text-[#1a3a5f] mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Info className="h-5 w-5 text-[#d4af37]" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-[#1a3a5f]">SMTP Configuration Tips</h3>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            <li>For port 465, secure will be automatically set to true</li>
                            <li>For port 587, secure should be set to false</li>
                            <li>Use your full email address as the username</li>
                            <li>For GoDaddy, use host smtpout.secureserver.net with port 465</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="editHost" className="text-[#1a3a5f] font-medium">Host</Label>
                        <Badge variant="outline" className="text-xs text-[#1a3a5f] border-[#d4af37]/50">Required</Badge>
                      </div>
                      <Input
                        id="editHost"
                        placeholder="e.g., smtpout.secureserver.net"
                        value={selectedProvider.config.host || ''}
                        onChange={(e) => {
                          const updatedConfig = { ...selectedProvider.config, host: e.target.value };
                          setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                        }}
                        className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="editPort" className="text-[#1a3a5f] font-medium">Port</Label>
                        <Badge variant="outline" className="text-xs text-[#1a3a5f] border-[#d4af37]/50">Required</Badge>
                      </div>
                      <Input
                        id="editPort"
                        placeholder="e.g., 465 or 587"
                        value={selectedProvider.config.port || ''}
                        onChange={(e) => {
                          const updatedConfig = { ...selectedProvider.config, port: e.target.value };
                          setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                        }}
                        className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="editUsername" className="text-[#1a3a5f] font-medium">Username</Label>
                        <Badge variant="outline" className="text-xs text-[#1a3a5f] border-[#d4af37]/50">Required</Badge>
                      </div>
                      <Input
                        id="editUsername"
                        placeholder="Your full email address"
                        value={selectedProvider.config.username || ''}
                        onChange={(e) => {
                          const updatedConfig = { ...selectedProvider.config, username: e.target.value };
                          setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                        }}
                        className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="editPassword" className="text-[#1a3a5f] font-medium">Password</Label>
                        <Badge variant="outline" className="text-xs text-[#1a3a5f] border-[#d4af37]/50">Required</Badge>
                      </div>
                      <Input
                        id="editPassword"
                        type="password"
                        placeholder="Your email password"
                        value={selectedProvider.config.password || ''}
                        onChange={(e) => {
                          const updatedConfig = { ...selectedProvider.config, password: e.target.value };
                          setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                        }}
                        className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="editFromEmail" className="text-[#1a3a5f] font-medium">From Email</Label>
                      </div>
                      <Input
                        id="editFromEmail"
                        placeholder="e.g., noreply@yourdomain.com"
                        value={selectedProvider.config.fromEmail || ''}
                        onChange={(e) => {
                          const updatedConfig = { ...selectedProvider.config, fromEmail: e.target.value };
                          setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                        }}
                        className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="editFromName" className="text-[#1a3a5f] font-medium">From Name</Label>
                      </div>
                      <Input
                        id="editFromName"
                        placeholder="e.g., Your Company Name"
                        value={selectedProvider.config.fromName || ''}
                        onChange={(e) => {
                          const updatedConfig = { ...selectedProvider.config, fromName: e.target.value };
                          setSelectedProvider({ ...selectedProvider, config: updatedConfig });
                        }}
                        className="border-[#1a3a5f]/20 focus:border-[#1a3a5f] focus:ring-[#1a3a5f]/10"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2 mt-4 border border-[#d4af37]/30 rounded-md p-3 bg-gradient-to-r from-[#f5f0e1]/40 to-transparent">
                <input
                  type="checkbox"
                  id="editIsDefault"
                  checked={selectedProvider.isDefault}
                  onChange={(e) => setSelectedProvider({ ...selectedProvider, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-[#1a3a5f]/30 text-[#d4af37] focus:ring-[#d4af37]/20"
                />
                <Label htmlFor="editIsDefault" className="text-sm font-medium text-[#1a3a5f]">
                  Set as default email provider
                </Label>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEditOpen(false)}
              className="border-[#1a3a5f]/30 text-[#1a3a5f] hover:bg-[#1a3a5f]/5 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProvider}
              disabled={!selectedProvider || updateProviderMutation.isPending}
              className="bg-gradient-to-r from-[#1a3a5f] to-[#1a3a5f]/90 text-white hover:from-[#1a3a5f]/95 hover:to-[#1a3a5f]/85 w-full sm:w-auto"
            >
              {updateProviderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Provider Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Delete Email Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this email provider? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteOpen(false)}
              className="border-[#1a3a5f]/30 text-[#1a3a5f] hover:bg-[#1a3a5f]/5 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProvider}
              disabled={deleteProviderMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              {deleteProviderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Test Email Dialog */}
      <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[600px]">
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
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={() => setIsTestOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendTestEmail}
              disabled={!testEmail.from || !testEmail.to || sendTestEmailMutation.isPending}
              className="w-full sm:w-auto"
            >
              {sendTestEmailMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Test Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Check Configuration Dialog */}
      <Dialog open={isCheckConfigOpen} onOpenChange={setIsCheckConfigOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Check Provider Configuration</DialogTitle>
            <DialogDescription>
              Verify your email provider configuration to ensure it's properly set up.
            </DialogDescription>
          </DialogHeader>
          
          {!configCheckResult && !checkConfigurationMutation.isPending && (
            <div className="space-y-4 py-2">
              <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="mt-1">
                      This will check your provider configuration by verifying the API credentials, testing the connection, and validating sender identities if applicable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {checkConfigurationMutation.isPending && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking configuration...</p>
            </div>
          )}
          
          {configCheckResult && !checkConfigurationMutation.isPending && (
            <div className="space-y-6 py-4">
              <div className={`rounded-md p-4 text-sm ${configCheckResult.success ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {configCheckResult.success ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`font-medium ${configCheckResult.success ? 'text-green-800' : 'text-amber-800'}`}>
                      {configCheckResult.success ? 'Configuration check passed' : 'Configuration issues detected'}
                    </h3>
                    <p className="mt-1">
                      {configCheckResult.success 
                        ? 'Your email provider is configured correctly and ready to send emails.'
                        : 'There are some issues with your email provider configuration that need attention.'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">API Connection</p>
                    <div className="flex items-center gap-1.5">
                      {configCheckResult.apiConnected ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <p className="text-sm">{configCheckResult.apiConnected ? 'Connected' : 'Failed'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Sender Identities</p>
                    <div className="flex items-center gap-1.5">
                      {configCheckResult.senderIdentitiesVerified ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <p className="text-sm">{configCheckResult.senderIdentitiesVerified ? 'Verified' : 'Not verified'}</p>
                    </div>
                  </div>
                </div>
                
                {configCheckResult.details?.verifiedSenders && configCheckResult.details.verifiedSenders.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Verified Sender Emails</p>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      {configCheckResult.details.verifiedSenders.map((email, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                          <p>{email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {configCheckResult.warnings && configCheckResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Warnings</p>
                    <div className="bg-amber-50 p-3 rounded-md text-sm text-amber-800">
                      {configCheckResult.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start gap-2 mb-1 last:mb-0">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5" />
                          <p>{warning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {configCheckResult.errors && configCheckResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Errors</p>
                    <div className="bg-red-50 p-3 rounded-md text-sm text-red-800">
                      {configCheckResult.errors.map((error, index) => (
                        <div key={index} className="flex items-start gap-2 mb-1 last:mb-0">
                          <X className="h-3.5 w-3.5 text-red-600 mt-0.5" />
                          <p>{error}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Display troubleshooting tips if available */}
                {configCheckResult.troubleshootingTips && configCheckResult.troubleshootingTips.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium">Troubleshooting Tips</p>
                    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                      <ul className="list-disc pl-4 space-y-1">
                        {configCheckResult.troubleshootingTips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {!configCheckResult && !checkConfigurationMutation.isPending ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCheckConfigOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckConfiguration}
                  disabled={checkConfigurationMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {checkConfigurationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Check Configuration
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => {
                  if (!checkConfigurationMutation.isPending) {
                    setConfigCheckResult(null);
                    setIsCheckConfigOpen(false);
                  }
                }}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EmailProviders;