import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  Globe, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Star, 
  Clock, 
  Trash2, 
  RefreshCw, 
  RotateCw,
  Edit,
  CheckCircle, 
  Plus, 
  ArrowRight, 
  Check,
  ServerCog,
  AlertCircle,
  Terminal,
  BookOpen,
  Settings,
  Mail,
  BarChart3,
  AlertTriangle,
  ExternalLink,
  Server,
  Zap,
  Copy,
  HelpCircle,
  ChevronRight,
  InfoIcon,
  X,
  Loader2
} from "lucide-react";

// Type definition for Domain
interface Domain {
  id: number;
  name: string;
  status: string;
  verified: boolean;
  defaultDomain: boolean;
  dkimVerified: boolean;
  spfVerified: boolean;
  dmarcVerified: boolean;
  dkimSelector: string;
  dkimValue: string | null;
  spfValue: string | null;
  dmarcValue: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  metadata: {
    type?: string;
    [key: string]: any;
  };
}

// Type definition for Campaign
interface Campaign {
  id: number;
  name: string;
  subject: string;
  status: string;
  metadata: {
    [key: string]: any;
  };
}

// Type definition for Email Provider
interface EmailProvider {
  id: number;
  name: string;
  provider: string;
  isDefault: boolean;
}

// Stats Card Component
function StatsCard({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: string | number; 
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
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

// Domain Card Component
function DomainCard({
  domain,
  onEdit,
  onDelete,
  onSetDefault,
  onVerify
}: {
  domain: Domain;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  onVerify: () => void;
}) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "inactive":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "failed":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <ShieldCheck className="h-3.5 w-3.5" />;
      case "inactive":
        return <Shield className="h-3.5 w-3.5" />;
      case "pending":
        return <Clock className="h-3.5 w-3.5" />;
      case "failed":
        return <ShieldAlert className="h-3.5 w-3.5" />;
      default:
        return <InfoIcon className="h-3.5 w-3.5" />;
    }
  };

  const getVerificationPercent = () => {
    let count = 0;
    if (domain.verified) count += 1;
    if (domain.dkimVerified) count += 1;
    if (domain.spfVerified) count += 1;
    if (domain.dmarcVerified) count += 1;
    
    return (count / 4) * 100;
  };

  const verificationPercent = getVerificationPercent();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border h-full flex flex-col">
        {/* Status Bar */}
        <div 
          className="h-1.5 w-full" 
          style={{
            background: domain.status === "active" ? 
              "linear-gradient(to right, #10b981, #059669)" : 
              domain.status === "pending" ? 
                "linear-gradient(to right, #f59e0b, #d97706)" : 
                domain.status === "failed" ? 
                  "linear-gradient(to right, #ef4444, #dc2626)" : 
                  "linear-gradient(to right, #6b7280, #4b5563)"
          }}
        />
        
        <CardHeader className="pb-2 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className={`p-2 rounded-md mr-3 ${
                domain.status === "active" ? "bg-emerald-50" : 
                domain.status === "pending" ? "bg-amber-50" : 
                domain.status === "failed" ? "bg-red-50" : "bg-gray-50"
              }`}>
                <Globe className={`h-5 w-5 ${
                  domain.status === "active" ? "text-emerald-600" : 
                  domain.status === "pending" ? "text-amber-600" : 
                  domain.status === "failed" ? "text-red-600" : "text-gray-600"
                }`} />
              </div>
              <div>
                <div className="flex items-center">
                  <CardTitle className="text-base font-semibold mr-2">
                    {domain.name}
                  </CardTitle>
                  {domain.defaultDomain && (
                    <Badge variant="secondary" className="bg-amber-100 border-amber-300 text-amber-800">
                      <Star className="mr-1 h-3 w-3" />
                      Default
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Created {formatDate(domain.createdAt)}
                </CardDescription>
              </div>
            </div>
            
            <Badge variant="outline" className={`${getStatusColor(domain.status)}`}>
              {getStatusIcon(domain.status)}
              <span className="ml-1 font-medium">{domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}</span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-3 pb-3 flex-grow">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">Verification Status</span>
            <span className="text-sm font-semibold text-gray-700">
              {verificationPercent.toFixed(0)}%
            </span>
          </div>
          
          <Progress value={verificationPercent} className="h-2 mb-4" />
          
          <div className="grid grid-cols-2 gap-2">
            <div className={`px-3 py-2 rounded text-xs font-medium flex items-center ${domain.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
              {domain.verified ? (
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <X className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span>Domain</span>
            </div>
            
            <div className={`px-3 py-2 rounded text-xs font-medium flex items-center ${domain.dkimVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
              {domain.dkimVerified ? (
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <X className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span>DKIM</span>
            </div>
            
            <div className={`px-3 py-2 rounded text-xs font-medium flex items-center ${domain.spfVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
              {domain.spfVerified ? (
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <X className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span>SPF</span>
            </div>
            
            <div className={`px-3 py-2 rounded text-xs font-medium flex items-center ${domain.dmarcVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
              {domain.dmarcVerified ? (
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <X className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span>DMARC</span>
            </div>
          </div>

          {domain.lastUsedAt && (
            <div className="text-xs text-gray-500 mt-4">
              Last used: {formatDate(domain.lastUsedAt)}
            </div>
          )}
        </CardContent>
        
        <Separator />
        
        <CardFooter className="pt-3 pb-3 gap-2 justify-between bg-gray-50">
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onEdit} className="rounded-full h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Domain</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onVerify} className="rounded-full h-8 w-8 p-0">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verify Domain</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onDelete} className="rounded-full h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Domain</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {!domain.defaultDomain && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSetDefault}
              className="text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100"
            >
              <Star className="mr-1.5 h-3.5 w-3.5" />
              Set as Default
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Empty State Component
function EmptyDomainsState({
  tab,
  onCreateClick
}: {
  tab: string;
  onCreateClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-dashed border-2 text-center p-8">
        <CardContent className="pt-6 pb-4 flex flex-col items-center">
          <div className="p-4 rounded-full bg-gray-100 mb-4">
            <Globe className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No domains found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {tab === "all" 
              ? "You haven't added any domains yet. Add a domain to start sending emails with your own domain." 
              : `No domains with '${tab}' status. Switch tabs or add a new domain.`}
          </p>
          {tab === "all" && (
            <Button onClick={onCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Domain
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// DNS Records Card Component
function DnsRecordsCard({
  domain,
  onCopyRecord
}: {
  domain: Domain;
  onCopyRecord: (type: string, value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <ServerCog className="h-5 w-5 mr-2 text-indigo-600" />
          DNS Records
        </CardTitle>
        <CardDescription>
          Configure these records in your DNS provider
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {domain.dkimValue && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">DKIM</Badge>
                <span className="ml-2 text-sm font-medium">
                  {domain.dkimSelector}._domainkey.{domain.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => onCopyRecord('DKIM', domain.dkimValue || '')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-gray-50 p-3 rounded-md text-xs font-mono overflow-x-auto">
              {domain.dkimValue}
            </div>
          </div>
        )}
        
        {domain.spfValue && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">SPF</Badge>
                <span className="ml-2 text-sm font-medium">
                  {domain.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => onCopyRecord('SPF', domain.spfValue || '')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-gray-50 p-3 rounded-md text-xs font-mono overflow-x-auto">
              {domain.spfValue}
            </div>
          </div>
        )}
        
        {domain.dmarcValue && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">DMARC</Badge>
                <span className="ml-2 text-sm font-medium">
                  _dmarc.{domain.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => onCopyRecord('DMARC', domain.dmarcValue || '')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-gray-50 p-3 rounded-md text-xs font-mono overflow-x-auto">
              {domain.dmarcValue}
            </div>
          </div>
        )}
        
        {!domain.dkimValue && !domain.spfValue && !domain.dmarcValue && (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              No DNS records available for this domain.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DomainsV2() {
  const { toast } = useToast();
  const [tab, setTab] = useState("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [newDomain, setNewDomain] = useState({
    name: "",
    status: "active",
    verified: false,
    defaultDomain: false,
    dkimVerified: false,
    spfVerified: false,
    dmarcVerified: false,
    dkimSelector: "infy",
    dkimValue: null,
    spfValue: null,
    dmarcValue: null,
  });
  
  // Fetch email providers
  const { 
    data: emailProviders = [],
    isLoading: isLoadingProviders
  } = useQuery({
    queryKey: ['/api/email-providers'],
    queryFn: async () => {
      const response = await fetch('/api/email-providers');
      if (!response.ok) {
        throw new Error('Failed to fetch email providers');
      }
      return response.json();
    }
  });

  // Fetch domains
  const { 
    data: domains = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['/api/domains'],
    queryFn: async () => {
      const response = await fetch('/api/domains');
      if (!response.ok) {
        throw new Error('Failed to fetch domains');
      }
      return response.json();
    }
  });

  // Create a new domain
  const createMutation = useMutation({
    mutationFn: async (domain: Omit<Domain, 'id' | 'createdAt' | 'lastUsedAt'>) => {
      return apiRequest('POST', '/api/domains', domain);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      setCreateDialogOpen(false);
      setNewDomain({
        name: "",
        status: "active",
        verified: false,
        defaultDomain: false,
        dkimVerified: false,
        spfVerified: false,
        dmarcVerified: false,
        dkimSelector: "infy",
        dkimValue: null,
        spfValue: null,
        dmarcValue: null,
      });
      toast({
        title: "Domain Created",
        description: "Your domain has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Creating Domain",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update a domain
  const updateMutation = useMutation({
    mutationFn: async (domain: Partial<Domain> & { id: number }) => {
      return apiRequest('PATCH', `/api/domains/${domain.id}`, domain);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      setEditDialogOpen(false);
      setSelectedDomain(null);
      toast({
        title: "Domain Updated",
        description: "Your domain settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete a domain
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/domains/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      setDeleteDialogOpen(false);
      setSelectedDomain(null);
      toast({
        title: "Domain Deleted",
        description: "The domain has been successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Set a domain as default
  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', `/api/domains/${id}/set-default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      toast({
        title: "Default Domain Updated",
        description: "Your default domain has been set successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Verify a domain using an email provider
  const verifyDomainMutation = useMutation({
    mutationFn: async ({ domainId, providerId }: { domainId: number, providerId: string }) => {
      return apiRequest('POST', `/api/domains/${domainId}/verify`, { providerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      setVerifyDialogOpen(false);
      setSelectedProvider("");
      toast({
        title: "Verification Started",
        description: "Domain verification has been initiated. Please check your DNS settings.",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Fetch campaigns for a domain
  const { 
    data: domainCampaigns = [],
    isLoading: isLoadingCampaigns
  } = useQuery({
    queryKey: ['/api/domains', selectedDomain?.id, 'campaigns'],
    queryFn: async () => {
      if (!selectedDomain) return [];
      
      const response = await fetch(`/api/domains/${selectedDomain.id}/campaigns`);
      if (!response.ok) {
        throw new Error('Failed to fetch domain campaigns');
      }
      return response.json();
    },
    enabled: !!selectedDomain
  });

  const handleCreateDomain = () => {
    const metadata = {
      type: "custom",
    };
    
    createMutation.mutate({ 
      ...newDomain, 
      metadata 
    });
  };

  const handleUpdateDomain = () => {
    if (!selectedDomain) return;
    
    updateMutation.mutate(selectedDomain);
  };

  const handleDeleteDomain = () => {
    if (!selectedDomain) return;
    deleteMutation.mutate(selectedDomain.id);
  };

  const handleSetDefaultDomain = (id: number) => {
    setDefaultMutation.mutate(id);
  };
  
  const handleVerifyDomain = () => {
    if (!selectedDomain || !selectedProvider) return;
    
    verifyDomainMutation.mutate({
      domainId: selectedDomain.id,
      providerId: selectedProvider
    });
  };

  const handleCopyRecord = (type: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: `${type} Record Copied`,
      description: "The DNS record has been copied to your clipboard.",
    });
  };

  const filteredDomains = domains.filter((domain: Domain) => {
    if (tab === "active") return domain.status === "active";
    if (tab === "inactive") return domain.status === "inactive";
    if (tab === "pending") return domain.status === "pending";
    if (tab === "failed") return domain.status === "failed";
    return true;
  });

  // Count domains by status
  const domainCounts = domains.reduce((acc: Record<string, number>, domain: Domain) => {
    acc[domain.status] = (acc[domain.status] || 0) + 1;
    return acc;
  }, {});
  
  // Count verified domains
  const verifiedCount = domains.filter((domain: Domain) => domain.verified).length;
  
  // Total domains count
  const totalDomains = domains.length;
  
  // Calculate verification percentage
  const verificationPercentage = totalDomains > 0 
    ? Math.round((verifiedCount / totalDomains) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-xl p-6 md:p-8 mb-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Domain Management
            </h1>
            <p className="text-indigo-100 md:text-lg max-w-3xl">
              Configure and manage sending domains for improved email deliverability
            </p>
          </div>
          
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="lg"
            className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 self-start"
          >
            <Plus className="mr-2 h-4 w-4" /> 
            <span>Add Domain</span>
          </Button>
        </div>
      </motion.div>
      
      {/* Metrics Section */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Domains" 
          value={totalDomains} 
          icon={<Globe className="h-5 w-5 text-indigo-600" />}
          description="Registered domains" 
        />
        <StatsCard 
          title="Verified Domains" 
          value={verifiedCount} 
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          description={`${verificationPercentage}% verification rate`} 
        />
        <StatsCard 
          title="Active Domains" 
          value={domainCounts.active || 0} 
          icon={<Zap className="h-5 w-5 text-amber-600" />}
          description="Ready for sending" 
        />
        <StatsCard 
          title="Default Domain" 
          value={domains.find((d: Domain) => d.defaultDomain)?.name || "None"} 
          icon={<Star className="h-5 w-5 text-orange-500" />}
          description="Used for all campaigns" 
        />
      </div>
      
      {/* Tabs Navigation */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="bg-background border">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              All Domains
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Active
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger 
              value="inactive" 
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Inactive
            </TabsTrigger>
            <TabsTrigger 
              value="failed" 
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Failed
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Domain Cards Grid */}
        <TabsContent value={tab} className="mt-6">
          <AnimatePresence mode="wait">
            {filteredDomains.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredDomains.map((domain: Domain) => (
                  <DomainCard 
                    key={domain.id}
                    domain={domain}
                    onEdit={() => {
                      setSelectedDomain(domain);
                      setEditDialogOpen(true);
                    }}
                    onDelete={() => {
                      setSelectedDomain(domain);
                      setDeleteDialogOpen(true);
                    }}
                    onSetDefault={() => handleSetDefaultDomain(domain.id)}
                    onVerify={() => {
                      setSelectedDomain(domain);
                      setVerifyDialogOpen(true);
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <EmptyDomainsState 
                tab={tab}
                onCreateClick={() => setCreateDialogOpen(true)}
              />
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Create Domain Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add a New Domain
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <div className="grid gap-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="domain-name">Domain Name</Label>
                  <Input 
                    id="domain-name" 
                    placeholder="example.com" 
                    value={newDomain.name}
                    onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your domain name without 'http://' or 'www.'
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="domain-status">Status</Label>
                  <Select 
                    value={newDomain.status}
                    onValueChange={(value) => setNewDomain({ ...newDomain, status: value })}
                  >
                    <SelectTrigger id="domain-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="make-default"
                    checked={newDomain.defaultDomain}
                    onCheckedChange={(checked) => setNewDomain({ ...newDomain, defaultDomain: checked })}
                  />
                  <Label htmlFor="make-default" className="cursor-pointer">Make default domain</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="authentication">
              <div className="grid gap-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dkim-selector">DKIM Selector</Label>
                  <Input 
                    id="dkim-selector" 
                    placeholder="infy" 
                    value={newDomain.dkimSelector}
                    onChange={(e) => setNewDomain({ ...newDomain, dkimSelector: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    The selector to use for DKIM (Default: infy)
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Authentication Note</p>
                      <p className="mt-1">
                        After adding your domain, you'll need to configure DNS records and verify ownership to ensure successful email delivery. This helps prevent spoofing and improves deliverability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDomain} 
              disabled={!newDomain.name || createMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Domain
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Domain Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Domain
            </DialogTitle>
          </DialogHeader>
          
          {selectedDomain && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="dns">DNS Records</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic">
                <div className="grid gap-5 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-domain-name">Domain Name</Label>
                    <Input 
                      id="edit-domain-name" 
                      value={selectedDomain.name}
                      onChange={(e) => setSelectedDomain({ ...selectedDomain, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-domain-status">Status</Label>
                    <Select 
                      value={selectedDomain.status}
                      onValueChange={(value) => setSelectedDomain({ ...selectedDomain, status: value })}
                    >
                      <SelectTrigger id="edit-domain-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="edit-make-default"
                      checked={selectedDomain.defaultDomain}
                      onCheckedChange={(checked) => setSelectedDomain({ ...selectedDomain, defaultDomain: checked })}
                    />
                    <Label htmlFor="edit-make-default" className="cursor-pointer">Default domain</Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="dns">
                <div className="py-4 space-y-4">
                  <DnsRecordsCard 
                    domain={selectedDomain}
                    onCopyRecord={handleCopyRecord}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="campaigns">
                <div className="py-4">
                  {isLoadingCampaigns ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                  ) : domainCampaigns.length > 0 ? (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {domainCampaigns.map((campaign: Campaign) => (
                          <div key={campaign.id} className="flex border rounded-md p-3 items-start">
                            <div className="p-2 rounded-md bg-indigo-50 mr-3">
                              <Mail className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="font-medium text-sm">{campaign.name}</p>
                              <p className="text-xs text-gray-500 truncate">{campaign.subject}</p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {campaign.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No campaigns associated with this domain.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateDomain}
              disabled={updateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Domain Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Verify Domain
            </DialogTitle>
          </DialogHeader>
          
          {selectedDomain && (
            <div className="py-4 space-y-6">
              <div className="flex items-center gap-3 p-4 border rounded-md bg-gray-50">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Globe className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedDomain.name}</p>
                  <p className="text-xs text-gray-500">Select an email provider to verify this domain</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="provider-selector">Email Provider</Label>
                <Select 
                  value={selectedProvider}
                  onValueChange={setSelectedProvider}
                >
                  <SelectTrigger id="provider-selector" className="w-full">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingProviders ? (
                      <div className="flex justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : emailProviders.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No email providers configured
                      </div>
                    ) : (
                      emailProviders.map((provider: EmailProvider) => (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          {provider.name} ({provider.provider})
                          {provider.isDefault && ' (Default)'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50 rounded-r-md">
                <h4 className="text-sm font-medium text-amber-800">Verification Process</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Domain verification will check your DNS records and may send test emails to verify proper configuration. This helps ensure your emails reach the inbox.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyDomain}
              disabled={!selectedProvider || verifyDomainMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {verifyDomainMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Start Verification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Domain Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Delete Domain
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this domain? This action cannot be undone.
              {selectedDomain?.defaultDomain && (
                <div className="mt-2 text-amber-600 font-medium">
                  Warning: You are deleting your default domain. You will need to select a new default domain.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedDomain && (
            <div className="bg-gray-50 p-4 rounded-md border flex items-center gap-3 my-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="font-medium">{selectedDomain.name}</p>
                <p className="text-sm text-gray-500">Status: {selectedDomain.status}</p>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteDomain();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Domain'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}