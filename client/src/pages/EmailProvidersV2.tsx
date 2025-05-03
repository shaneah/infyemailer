import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
// Import useTheme if available in your project, or remove if not needed
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "@/components/ui/alert-dialog";

// Icons
import {
  Check,
  X,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  Plus,
  Send,
  Key,
  Info,
  CheckCircle,
  Settings,
  Save,
  MailCheck,
  RefreshCw,
  Server,
  Shield,
  Mail,
  BellRing,
  Share2,
  Activity,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  Zap,
  HelpCircle,
} from 'lucide-react';

// Provider logo components
const SendGridLogo = () => (
  <div className="bg-[#1A82E2] p-2 rounded-lg">
    <svg viewBox="0 0 24 24" height="24" width="24" fill="white">
      <path d="M19.1,11.7H14.8V3.4h-1.1v9.4h5.4V11.7z M14.3,8.5h-1.3V4.3l1.3-1.1V8.5z M20.5,4.9h-1.1v6.1h1.1V4.9z M9.7,8.5H4.5V4.9 h5.2V8.5z M9.7,9.6v2.2H8.6V9.6H9.7z M12,3.4h-1.1v9.4H12V3.4z M4.5,11.7v-1.1h3v1.1H4.5z M14.3,3.2L14.3,3.2L12.7,0h-0.9v2.2h-2.2V0 H8.7L1.8,7.9v0.9h2.6v2.6h0.5l6.9-6.9h2.4L14.3,3.2L14.3,3.2z M9.7,16.7c-1.2,0-2.2,1-2.2,2.2c0,1.2,1,2.2,2.2,2.2s2.2-1,2.2-2.2 C11.9,17.6,10.9,16.7,9.7,16.7z M3.2,14.6c-1.2,0-2.2,1-2.2,2.2s1,2.2,2.2,2.2s2.2-1,2.2-2.2S4.4,14.6,3.2,14.6z M9.7,12.4 c-1.2,0-2.2,1-2.2,2.2s1,2.2,2.2,2.2s2.2-1,2.2-2.2S10.9,12.4,9.7,12.4z M16.2,14.6c-1.2,0-2.2,1-2.2,2.2s1,2.2,2.2,2.2 s2.2-1,2.2-2.2S17.4,14.6,16.2,14.6z M22.7,14.6c-1.2,0-2.2,1-2.2,2.2s1,2.2,2.2,2.2s2.2-1,2.2-2.2S23.9,14.6,22.7,14.6z M16.2,16.7c1.2,0,2.2-1,2.2-2.2s-1-2.2-2.2-2.2s-2.2,1-2.2,2.2S15,16.7,16.2,16.7z"/>
    </svg>
  </div>
);

const SMTPLogo = () => (
  <div className="bg-gray-700 p-2 rounded-lg">
    <Server className="h-6 w-6 text-white" />
  </div>
);

const MailgunLogo = () => (
  <div className="bg-[#F0305B] p-2 rounded-lg">
    <svg viewBox="0 0 24 24" height="24" width="24" fill="white">
      <path d="M10.87,6.43v14.2H3V3h12.77L10.87,6.43z M11.42,7.65h7.46V21H21V7.65h2.13L11.42,1v6.65z"/>
    </svg>
  </div>
);

const AmazonSESLogo = () => (
  <div className="bg-[#FF9900] p-2 rounded-lg">
    <svg viewBox="0 0 24 24" height="24" width="24" fill="white">
      <path d="M18.75,11.07a4.93,4.93,0,0,0-1.37,1.74,1,1,0,0,1-1.06.6,1,1,0,0,1-.89-.83,1,1,0,0,1,.46-1.06,7,7,0,0,1,2.07-1A1,1,0,0,1,18.75,11.07ZM16.36,18.3a.53.53,0,0,1-.58-.31c-.27-.75,2.31-1.82,2.31-1.82S16.92,18.59,16.36,18.3ZM13,18c.21-.12.42-.26.63-.39A16.68,16.68,0,0,1,17,16.1c2.21-.56,3.16-1.53,3.16-1.53A22.22,22.22,0,0,1,13,18Zm-.5-6.6a.9.9,0,0,1,.29-1.88c1.58,0,2.37,1.37,2.41,1.44a.89.89,0,0,1-.33,1.22.92.92,0,0,1-1.23-.29c0-.05-.51-.82-1.13-.82S12.48,11.36,12.48,11.36ZM11.57,18c.21.17,3.16-1.36,5.57-2.5,0,0-1.66.34-2.56.57A19.38,19.38,0,0,0,11.57,18ZM12,4C5.41,4,0,8.47,0,14c0,5.23,4.39,9.5,10,9.95v-2c-4.5-.52-8-4.2-8-8.57C2,9.65,6.37,6,12,6s10,3.68,10,7.32c0,2.82-2,5.34-5,6.78A11.65,11.65,0,0,0,22,14C22,8.47,16.59,4,12,4Z"/>
    </svg>
  </div>
);

// Types
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

// Get provider logo component based on provider type
const getProviderLogo = (providerType: string) => {
  switch (providerType.toLowerCase()) {
    case 'sendgrid':
      return <SendGridLogo />;
    case 'smtp':
      return <SMTPLogo />;
    case 'mailgun':
      return <MailgunLogo />;
    case 'ses':
    case 'amazon_ses':
      return <AmazonSESLogo />;
    default:
      return <Mail className="h-6 w-6 text-white bg-violet-600 p-1 rounded" />;
  }
};

// Get metrics color based on value
const getMetricColor = (value: number) => {
  if (value >= 95) return "text-green-500";
  if (value >= 80) return "text-emerald-500";
  if (value >= 60) return "text-amber-500";
  return "text-red-500";
};

export default function EmailProvidersV2() {
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
  // Remove theme dependency since we don't have next-themes

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
  
  // Test email state
  const [testEmail, setTestEmail] = useState({
    from: '',
    to: '',
    subject: 'Test Email from InfyMailer',
    text: 'This is a test email from your InfyMailer email provider integration.'
  });

  // Configuration check state
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
        title: "Provider Added Successfully",
        description: "Your email provider has been configured and is ready to use.",
      });
      setIsNewProviderOpen(false);
      resetNewProviderForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Provider",
        description: error.message || "There was a problem adding your email provider.",
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
        title: "Provider Updated",
        description: "Your email provider settings have been updated successfully.",
      });
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "There was a problem updating your email provider.",
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
        title: "Provider Deleted",
        description: "The email provider has been removed from your account.",
      });
      setIsDeleteOpen(false);
      setSelectedProviderId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "There was a problem removing this email provider.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation to send test email
  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest('POST', `/api/email-providers/${id}/test-email`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Your test email has been sent successfully. Please check the recipient's inbox.",
      });
      setIsTestOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "There was a problem sending the test email.",
        variant: "destructive"
      });
    }
  });

  // Mutation to check provider configuration
  const checkConfigurationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/email-providers/${id}/check-configuration`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Configuration check failed: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      setConfigCheckResult(data);
      if (data.success) {
        toast({
          title: "Configuration Valid",
          description: "Your email provider configuration is working correctly.",
        });
      } else {
        toast({
          title: "Configuration Issues",
          description: "There are some issues with your provider configuration.",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Check Failed",
        description: error.message || "There was a problem checking your provider configuration.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for saving default settings
  const saveDefaultSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest('POST', '/api/email-settings/default', settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-settings/default'] });
      toast({
        title: "Settings Saved",
        description: "Your default email settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "There was a problem saving your default settings.",
        variant: "destructive"
      });
    }
  });

  // Handlers
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
    if (!newProviderName) {
      toast({
        title: "Provider Name Required",
        description: "Please enter a name for this email provider.",
        variant: "destructive"
      });
      return;
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
    if (!testEmail.to) {
      toast({
        title: "Recipient Required",
        description: "Please enter a recipient email address.",
        variant: "destructive"
      });
      return;
    }
    
    sendTestEmailMutation.mutate({
      id: selectedProviderId,
      data: testEmail
    });
  };

  const handleCheckConfiguration = () => {
    if (selectedProviderId === null) return;
    checkConfigurationMutation.mutate(selectedProviderId);
  };
  
  const handleSaveDefaultSettings = () => {
    saveDefaultSettingsMutation.mutate(defaultSettings);
  };

  // Dialog handlers
  const openEditDialog = (provider: EmailProvider) => {
    setSelectedProvider({ ...provider });
    setIsEditOpen(true);
  };
  
  const openTestDialog = (provider: EmailProvider) => {
    setSelectedProviderId(provider.id);
    // Pre-fill with the default from email if available
    setTestEmail({
      ...testEmail,
      from: defaultSettings.fromEmail || `noreply@${window.location.hostname}`
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

  // Reset form state when adding a new provider
  const resetNewProviderForm = () => {
    setNewProviderType("");
    setNewProviderName("");
    setNewProviderConfig({});
    setIsDefault(false);
  };

  // Constants for better visualization
  const MOCK_METRICS = [
    { id: 1, name: "Deliverability", value: 98 },
    { id: 2, name: "Uptime", value: 99.9 },
    { id: 3, name: "Send Rate", value: 92 },
    { id: 4, name: "Costs", value: 85 },
  ];

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  // Make itemVariants accessible to components
  const ProviderCard = ({ 
    provider, 
    onEdit, 
    onTest, 
    onCheck, 
    onDelete,
    metrics
  }: { 
    provider: EmailProvider; 
    onEdit: () => void; 
    onTest: () => void;
    onCheck: () => void;
    onDelete: () => void;
    metrics: { id: number; name: string; value: number }[];
  }) => {
    return (
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
          <div className={`h-1.5 w-full ${provider.isDefault ? 'bg-violet-600' : 'bg-gray-200'}`}></div>
          
          <CardHeader className="pb-2 relative flex flex-row items-start gap-4">
            <div className="flex-shrink-0">
              {getProviderLogo(provider.provider)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold truncate">
                  {provider.name}
                </CardTitle>
                {provider.isDefault && (
                  <Badge className="bg-violet-100 hover:bg-violet-100 text-violet-700 font-medium border-none">
                    Default
                  </Badge>
                )}
              </div>
              <CardDescription className="text-gray-500">
                {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
              </CardDescription>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-4 pb-3 flex-1">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {metrics.slice(0, 2).map(metric => (
                  <div key={metric.id} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">{metric.name}</span>
                      <span className={`font-semibold ${getMetricColor(metric.value)}`}>
                        {metric.value}%
                      </span>
                    </div>
                    <Progress
                      value={metric.value}
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 flex justify-between pt-2">
                <span>Added: {new Date(provider.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(provider.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
          
          <Separator />
          
          <CardFooter className="pt-3 pb-3 gap-2 flex-wrap justify-between bg-gray-50">
            <div className="flex gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onTest}
                      className="text-gray-600 hover:text-violet-600 hover:bg-violet-50 h-8 w-8 p-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send Test Email</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCheck}
                      className="text-gray-600 hover:text-violet-600 hover:bg-violet-50 h-8 w-8 p-0"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Check Configuration</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onEdit}
                      className="text-gray-600 hover:text-violet-600 hover:bg-violet-50 h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Provider</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Provider</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-xl p-6 md:p-8 mb-4 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Email Providers
            </h1>
            <p className="text-violet-100 md:text-lg max-w-3xl">
              Configure and manage your email service providers for reliable delivery of marketing campaigns
            </p>
          </div>
          
          <Button
            onClick={() => setIsNewProviderOpen(true)}
            size="lg"
            className="bg-white text-violet-600 hover:bg-violet-50 shadow-md hover:shadow-lg transition-all duration-200 self-start"
          >
            <Plus className="mr-2 h-4 w-4" /> 
            <span>Add Provider</span>
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs 
        defaultValue="providers" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <TabsList className="bg-background border">
            <TabsTrigger value="providers" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
              Email Providers
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
              Default Settings
            </TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
              Overview
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          {isLoadingProviders ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          ) : providers.length === 0 ? (
            <EmptyProvidersState setIsNewProviderOpen={setIsNewProviderOpen} />
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {providers.map((provider) => (
                <ProviderCard 
                  key={provider.id}
                  provider={provider}
                  onEdit={() => openEditDialog(provider)}
                  onTest={() => openTestDialog(provider)}
                  onCheck={() => openCheckConfigurationDialog(provider)}
                  onDelete={() => openDeleteDialog(provider.id)}
                  metrics={MOCK_METRICS}
                />
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <DefaultSettingsForm 
            defaultSettings={defaultSettings}
            setDefaultSettings={setDefaultSettings}
            handleSaveDefaultSettings={handleSaveDefaultSettings}
            isLoading={saveDefaultSettingsMutation.isPending}
          />
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <ProvidersOverview providers={providers} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <NewProviderDialog 
        isOpen={isNewProviderOpen}
        setIsOpen={setIsNewProviderOpen}
        availableProviders={availableProviders}
        isLoadingAvailable={isLoadingAvailable}
        newProviderType={newProviderType}
        handleProviderTypeChange={handleProviderTypeChange}
        newProviderName={newProviderName}
        setNewProviderName={setNewProviderName}
        authRequirements={authRequirements}
        isLoadingRequirements={isLoadingRequirements}
        newProviderConfig={newProviderConfig}
        handleConfigChange={handleConfigChange}
        isDefault={isDefault}
        setIsDefault={setIsDefault}
        handleCreateProvider={handleCreateProvider}
        isLoading={createProviderMutation.isPending}
      />

      <EditProviderDialog 
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        handleUpdateProvider={handleUpdateProvider}
        isLoading={updateProviderMutation.isPending}
      />

      <TestEmailDialog 
        isOpen={isTestOpen}
        setIsOpen={setIsTestOpen}
        testEmail={testEmail}
        setTestEmail={setTestEmail}
        handleSendTestEmail={handleSendTestEmail}
        isLoading={sendTestEmailMutation.isPending}
      />

      <CheckConfigurationDialog 
        isOpen={isCheckConfigOpen}
        setIsOpen={setIsCheckConfigOpen}
        configCheckResult={configCheckResult}
        handleCheckConfiguration={handleCheckConfiguration}
        isLoading={checkConfigurationMutation.isPending}
      />

      <DeleteProviderDialog 
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        handleDeleteProvider={handleDeleteProvider}
        isLoading={deleteProviderMutation.isPending}
        provider={providers.find(p => p.id === selectedProviderId)}
      />
    </div>
  );
}

// Component for empty state when no providers exist
function EmptyProvidersState({ setIsNewProviderOpen }: { setIsNewProviderOpen: (open: boolean) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-dashed border-2 overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center h-80 gap-5 p-6">
          <div className="rounded-full bg-violet-100 p-5">
            <Mail className="h-10 w-10 text-violet-600" />
          </div>
          <h3 className="text-2xl font-semibold text-center">No Email Providers Configured</h3>
          <p className="text-gray-500 text-center max-w-md">
            Configure an email provider to start sending professional emails through your campaigns.
          </p>
          <Button 
            onClick={() => setIsNewProviderOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white mt-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Email Provider
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Email Provider Card Component
// Provider card component is defined earlier

// Default Settings Form Component
function DefaultSettingsForm({ 
  defaultSettings,
  setDefaultSettings,
  handleSaveDefaultSettings,
  isLoading
}: {
  defaultSettings: {
    fromEmail: string;
    fromName: string;
    replyTo: string;
    signature: string;
  };
  setDefaultSettings: React.Dispatch<React.SetStateAction<{
    fromEmail: string;
    fromName: string;
    replyTo: string;
    signature: string;
  }>>;
  handleSaveDefaultSettings: () => void;
  isLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border">
        <CardHeader className="bg-violet-50 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-violet-600" />
            <CardTitle className="text-xl">Default Email Settings</CardTitle>
          </div>
          <CardDescription>
            Configure default settings that will be used across all email providers
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultFromEmail" className="font-medium">
                From Email Address
              </Label>
              <Input
                id="defaultFromEmail"
                placeholder="noreply@yourdomain.com"
                value={defaultSettings.fromEmail}
                onChange={(e) => setDefaultSettings({
                  ...defaultSettings,
                  fromEmail: e.target.value
                })}
                className="focus-visible:ring-violet-500"
              />
              <p className="text-xs text-gray-500">
                The email address that will appear in the From field
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultFromName" className="font-medium">
                From Name
              </Label>
              <Input
                id="defaultFromName"
                placeholder="Your Company Name"
                value={defaultSettings.fromName}
                onChange={(e) => setDefaultSettings({
                  ...defaultSettings,
                  fromName: e.target.value
                })}
                className="focus-visible:ring-violet-500"
              />
              <p className="text-xs text-gray-500">
                The name that will appear as the sender
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defaultReplyTo" className="font-medium">
              Reply-To Email Address
            </Label>
            <Input
              id="defaultReplyTo"
              placeholder="support@yourdomain.com"
              value={defaultSettings.replyTo}
              onChange={(e) => setDefaultSettings({
                ...defaultSettings,
                replyTo: e.target.value
              })}
              className="focus-visible:ring-violet-500"
            />
            <p className="text-xs text-gray-500">
              The email address where replies will be sent
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defaultSignature" className="font-medium">
              Default Email Signature
            </Label>
            <textarea 
              id="defaultSignature" 
              className="w-full min-h-[120px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-y"
              placeholder="Your email signature with contact information..." 
              value={defaultSettings.signature}
              onChange={(e) => setDefaultSettings({
                ...defaultSettings,
                signature: e.target.value
              })}
            />
            <p className="text-xs text-gray-500">
              This signature will be automatically added to the bottom of all emails
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="border-t py-4 bg-gray-50">
          <Button 
            onClick={handleSaveDefaultSettings}
            className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Providers Overview Component
function ProvidersOverview({ providers }: { providers: EmailProvider[] }) {
  // Calculate usage statistics
  const totalProviders = providers.length;
  const providerTypes = providers.reduce((acc: Record<string, number>, provider) => {
    const type = provider.provider;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Provider Overview</CardTitle>
          <CardDescription>
            Summary of your email delivery infrastructure
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="Total Providers"
              value={totalProviders.toString()}
              icon={<Server className="h-5 w-5 text-violet-600" />}
              description="Configured and ready"
            />
            
            <StatsCard 
              title="Default Provider"
              value={providers.find(p => p.isDefault)?.name || "None"}
              icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
              description="For all campaigns"
            />
            
            <StatsCard 
              title="Delivery Success"
              value="99.8%"
              icon={<MailCheck className="h-5 w-5 text-green-600" />}
              description="Average delivery rate"
            />
            
            <StatsCard 
              title="Email Quota"
              value="95,000"
              icon={<BellRing className="h-5 w-5 text-amber-600" />}
              description="Monthly limit across providers"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Provider Distribution</CardTitle>
            <CardDescription>
              Breakdown of your email providers by type
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {Object.entries(providerTypes).map(([type, count]) => (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2">
                        {getProviderLogo(type)}
                      </div>
                      <span className="font-medium">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {count} {count === 1 ? 'provider' : 'providers'}
                    </Badge>
                  </div>
                  <Progress value={(count / totalProviders) * 100} className="h-2" />
                </div>
              ))}
              
              {Object.keys(providerTypes).length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No providers configured yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest events from your email providers
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {providers.length > 0 ? (
                <div className="space-y-4">
                  {providers.map((provider, i) => (
                    <div key={provider.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="rounded-full bg-violet-100 p-1.5 mt-0.5">
                        <Activity className="h-4 w-4 text-violet-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {i === 0 ? 'Provider updated' : i === 1 ? 'Configuration verified' : 'Test email sent'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {provider.name} • {new Date(provider.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No activity to display
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// Stats Card Component
function StatsCard({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 rounded-md bg-gray-50">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold truncate">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

// Dialog Components
function NewProviderDialog({
  isOpen,
  setIsOpen,
  availableProviders,
  isLoadingAvailable,
  newProviderType,
  handleProviderTypeChange,
  newProviderName,
  setNewProviderName,
  authRequirements,
  isLoadingRequirements,
  newProviderConfig,
  handleConfigChange,
  isDefault,
  setIsDefault,
  handleCreateProvider,
  isLoading
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  availableProviders: AvailableProvider[];
  isLoadingAvailable: boolean;
  newProviderType: string;
  handleProviderTypeChange: (type: string) => void;
  newProviderName: string;
  setNewProviderName: (name: string) => void;
  authRequirements: AuthRequirement[];
  isLoadingRequirements: boolean;
  newProviderConfig: Record<string, string>;
  handleConfigChange: (key: string, value: string) => void;
  isDefault: boolean;
  setIsDefault: (isDefault: boolean) => void;
  handleCreateProvider: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Email Provider
          </DialogTitle>
          <DialogDescription>
            Configure a new email provider to send emails through your marketing campaigns
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          <div className="space-y-3">
            <Label htmlFor="providerType" className="font-medium">
              Provider Type <span className="text-red-500">*</span>
            </Label>
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
              <div className="space-y-3">
                <Label htmlFor="providerName" className="font-medium">
                  Provider Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="providerName"
                  placeholder="My SendGrid Account"
                  value={newProviderName}
                  onChange={(e) => setNewProviderName(e.target.value)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Authentication Details</h3>
                
                {isLoadingRequirements ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                  </div>
                ) : (
                  <>
                    {authRequirements.map((req) => (
                      <div key={req.name} className="space-y-2">
                        <Label htmlFor={req.name} className="flex items-center gap-1">
                          {req.name} {req.required && <span className="text-red-500">*</span>}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[300px]">
                                <p>{req.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id={req.name}
                          type={req.name.toLowerCase().includes('password') || req.name.toLowerCase().includes('secret') || req.name.toLowerCase().includes('key') ? 'password' : 'text'}
                          placeholder={req.name}
                          value={newProviderConfig[req.name] || ''}
                          onChange={(e) => handleConfigChange(req.name, e.target.value)}
                          required={req.required}
                        />
                      </div>
                    ))}
                    
                    {authRequirements.length === 0 && (
                      <div className="bg-amber-50 p-4 rounded-md">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-amber-700">
                              No authentication requirements found for this provider type.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="default-provider"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                />
                <Label
                  htmlFor="default-provider"
                  className="cursor-pointer font-medium"
                >
                  Set as default provider
                </Label>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateProvider}
            className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={!newProviderType || !newProviderName || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Provider
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditProviderDialog({
  isOpen,
  setIsOpen,
  selectedProvider,
  setSelectedProvider,
  handleUpdateProvider,
  isLoading
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedProvider: EmailProvider | null;
  setSelectedProvider: (provider: EmailProvider | null) => void;
  handleUpdateProvider: () => void;
  isLoading: boolean;
}) {
  if (!selectedProvider) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Email Provider
          </DialogTitle>
          <DialogDescription>
            Update the configuration for {selectedProvider.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          <div className="space-y-3">
            <Label htmlFor="editProviderName" className="font-medium">
              Provider Name
            </Label>
            <Input
              id="editProviderName"
              value={selectedProvider.name}
              onChange={(e) => setSelectedProvider({
                ...selectedProvider,
                name: e.target.value
              })}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-medium">Provider Configuration</h3>
            
            {Object.entries(selectedProvider.config).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`edit-${key}`} className="font-medium">
                  {key}
                </Label>
                <Input
                  id={`edit-${key}`}
                  type={key.toLowerCase().includes('password') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') ? 'password' : 'text'}
                  value={value as string}
                  onChange={(e) => {
                    setSelectedProvider({
                      ...selectedProvider,
                      config: {
                        ...selectedProvider.config,
                        [key]: e.target.value
                      }
                    });
                  }}
                />
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="edit-default-provider"
              checked={selectedProvider.isDefault}
              onCheckedChange={(checked) => {
                setSelectedProvider({
                  ...selectedProvider,
                  isDefault: checked
                });
              }}
            />
            <Label
              htmlFor="edit-default-provider"
              className="cursor-pointer font-medium"
            >
              Set as default provider
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateProvider}
            className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TestEmailDialog({
  isOpen,
  setIsOpen,
  testEmail,
  setTestEmail,
  handleSendTestEmail,
  isLoading
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  testEmail: any;
  setTestEmail: (email: any) => void;
  handleSendTestEmail: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Send Test Email
          </DialogTitle>
          <DialogDescription>
            Verify that your email provider is correctly configured
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="test-from" className="font-medium">
              From Address
            </Label>
            <Input
              id="test-from"
              placeholder="noreply@yourdomain.com"
              value={testEmail.from}
              onChange={(e) => setTestEmail({ ...testEmail, from: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="test-to" className="font-medium">
              To Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="test-to"
              placeholder="recipient@example.com"
              value={testEmail.to}
              onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Enter your email address to receive the test message
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="test-subject" className="font-medium">
              Subject
            </Label>
            <Input
              id="test-subject"
              value={testEmail.subject}
              onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="test-content" className="font-medium">
              Message
            </Label>
            <textarea
              id="test-content"
              className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="Test email content..."
              value={testEmail.text}
              onChange={(e) => setTestEmail({ ...testEmail, text: e.target.value })}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendTestEmail}
            className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={!testEmail.to || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckConfigurationDialog({
  isOpen,
  setIsOpen,
  configCheckResult,
  handleCheckConfiguration,
  isLoading
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  configCheckResult: any;
  handleCheckConfiguration: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Check Configuration
          </DialogTitle>
          <DialogDescription>
            Verify that your email provider is correctly configured
          </DialogDescription>
        </DialogHeader>
        
        {!configCheckResult ? (
          <div className="py-4">
            <div className="text-center mb-4">
              <div className="bg-violet-100 mx-auto rounded-full p-3 w-16 h-16 flex items-center justify-center mb-3">
                <CheckCircle className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-lg font-medium">Validate Provider Configuration</h3>
              <p className="text-gray-500 mt-1">
                This will check your email provider configuration for any issues
              </p>
            </div>
            
            <Button
              onClick={handleCheckConfiguration}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white my-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Configuration Check
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="py-4">
            <div className={`p-4 rounded-md ${configCheckResult.success ? 'bg-green-50' : 'bg-amber-50'} mb-4`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {configCheckResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${configCheckResult.success ? 'text-green-800' : 'text-amber-800'}`}>
                    {configCheckResult.success ? 'Configuration Valid' : 'Configuration Issues Detected'}
                  </h3>
                  <div className={`mt-2 text-sm ${configCheckResult.success ? 'text-green-700' : 'text-amber-700'}`}>
                    {configCheckResult.success ? (
                      <p>Your email provider is correctly configured and ready to send emails.</p>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1">
                        {configCheckResult.errors?.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {configCheckResult.warnings && configCheckResult.warnings.length > 0 && (
              <div className="p-4 rounded-md bg-blue-50 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Warnings</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {configCheckResult.warnings.map((warning: string, index: number) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {configCheckResult.troubleshootingTips && configCheckResult.troubleshootingTips.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Troubleshooting Tips</h3>
                <ul className="text-sm space-y-2">
                  {configCheckResult.troubleshootingTips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-violet-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {configCheckResult.details?.verifiedSenders && configCheckResult.details.verifiedSenders.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Verified Sender Addresses</h3>
                <div className="space-y-1 text-sm">
                  {configCheckResult.details.verifiedSenders.map((address: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>{address}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
          {configCheckResult && (
            <Button 
              onClick={handleCheckConfiguration}
              className="bg-violet-600 hover:bg-violet-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Again
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteProviderDialog({
  isOpen,
  setIsOpen,
  handleDeleteProvider,
  isLoading,
  provider
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleDeleteProvider: () => void;
  isLoading: boolean;
  provider?: EmailProvider;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            Delete Email Provider
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this email provider? This action cannot be undone.
            {provider?.isDefault && (
              <div className="mt-2 text-amber-600 font-medium">
                Warning: You are deleting your default provider. Campaign deliveries may be affected.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {provider && (
          <div className="bg-gray-50 p-4 rounded-md border flex items-center gap-3 my-2">
            {getProviderLogo(provider.provider)}
            <div>
              <p className="font-medium">{provider.name}</p>
              <p className="text-sm text-gray-500">
                {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
              </p>
            </div>
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDeleteProvider();
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Provider'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}