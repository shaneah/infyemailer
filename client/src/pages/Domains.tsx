import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { 
  Globe, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Star, 
  Clock, 
  Trash, 
  RefreshCw, 
  RotateCw,
  Edit,
  CheckCircle, 
  Plus, 
  ArrowRight, 
  Check,
  ServerCog,
  AlertCircle
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

export default function Domains() {
  const { toast } = useToast();
  const [tab, setTab] = useState("active");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
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
  const { data: emailProviders = [] } = useQuery({
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
  const { data: domains = [], isLoading, refetch } = useQuery({
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
        title: "Domain created",
        description: "The domain was successfully created",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating domain",
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
        title: "Domain updated",
        description: "The domain was successfully updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating domain",
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
      toast({
        title: "Domain deleted",
        description: "The domain was successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting domain",
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
        title: "Default domain updated",
        description: "The default domain was successfully updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error setting default domain",
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
        title: "Domain verification initiated",
        description: "The domain verification process has been started. Please check your DNS settings.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error verifying domain",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Fetch campaigns for a domain (used in the domain details view)
  const { data: domainCampaigns = [] } = useQuery({
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

  const handleDeleteDomain = (id: number) => {
    if (window.confirm("Are you sure you want to delete this domain?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetDefaultDomain = (id: number) => {
    setDefaultMutation.mutate(id);
  };

  const filteredDomains = domains.filter((domain: Domain) => {
    if (tab === "active") return domain.status === "active";
    if (tab === "inactive") return domain.status === "inactive";
    if (tab === "pending") return domain.status === "pending";
    if (tab === "failed") return domain.status === "failed";
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success";
      case "inactive":
        return "bg-secondary";
      case "pending":
        return "bg-warning";
      case "failed":
        return "bg-destructive";
      default:
        return "bg-primary";
    }
  };

  const renderStatusBadge = (status: string) => {
    const Icon = status === "active" ? ShieldCheck : 
               status === "inactive" ? Shield :
               status === "pending" ? Clock : ShieldAlert;
    
    return (
      <Badge variant="outline" className={`${getStatusColor(status)} text-white`}>
        <Icon className="mr-1 h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Domains</h1>
          <p className="text-muted-foreground">Manage sending domains for your campaigns</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Domains</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDomains.map((domain: Domain) => (
          <Card key={domain.id} className="overflow-hidden">
            <CardHeader className="pb-2 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-primary" />
                  <CardTitle className="text-base font-semibold">
                    {domain.name}
                    {domain.defaultDomain && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Star className="ml-2 h-4 w-4 text-warning inline" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Default Domain</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </CardTitle>
                </div>
                {renderStatusBadge(domain.status)}
              </div>
              <div className="mt-1 space-y-1">
                <div className="text-xs text-muted-foreground">
                  Created: {formatDate(domain.createdAt)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last used: {formatDate(domain.lastUsedAt)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm pb-2">
              <div className="flex flex-wrap gap-2 my-2">
                {domain.verified ? (
                  <Badge variant="outline" className="bg-success text-white">
                    <Check className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-warning text-white">
                    <Clock className="mr-1 h-3 w-3" />
                    Verification Pending
                  </Badge>
                )}
                
                {domain.dkimVerified && (
                  <Badge variant="outline" className="bg-success text-white">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    DKIM
                  </Badge>
                )}
                
                {domain.spfVerified && (
                  <Badge variant="outline" className="bg-success text-white">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    SPF
                  </Badge>
                )}
                
                {domain.dmarcVerified && (
                  <Badge variant="outline" className="bg-success text-white">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    DMARC
                  </Badge>
                )}
                
                {domain.metadata?.type && (
                  <Badge variant="outline">
                    {domain.metadata.type}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
              <div className="flex space-x-1">
                <Button variant="outline" size="icon" onClick={() => {
                  setSelectedDomain(domain);
                  setEditDialogOpen(true);
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDeleteDomain(domain.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              {!domain.defaultDomain && (
                <Button variant="default" onClick={() => handleSetDefaultDomain(domain.id)}>
                  Set as Default
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredDomains.length === 0 && (
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No domains found</h3>
            <p className="text-muted-foreground mb-4">
              {tab === "all" ? "You haven't added any domains yet." : `No domains with '${tab}' status.`}
            </p>
            {tab === "all" && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add your first domain
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Domain Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add a New Domain</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="domain-name">Domain Name</Label>
                  <Input
                    id="domain-name"
                    placeholder="yourdomain.com"
                    value={newDomain.name}
                    onChange={(e) => setNewDomain({...newDomain, name: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the domain name you want to use for sending emails
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="domain-status">Status</Label>
                  <select
                    id="domain-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newDomain.status}
                    onChange={(e) => setNewDomain({...newDomain, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="verified"
                    checked={newDomain.verified}
                    onCheckedChange={(checked) => setNewDomain({...newDomain, verified: checked})}
                  />
                  <Label htmlFor="verified">Verified</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="default-domain"
                    checked={newDomain.defaultDomain}
                    onCheckedChange={(checked) => setNewDomain({...newDomain, defaultDomain: checked})}
                  />
                  <Label htmlFor="default-domain">Set as Default Domain</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="authentication">
              <div className="space-y-4">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="dkim-selector" className="font-medium">DKIM Settings</Label>
                    <Switch
                      id="dkim-verified"
                      checked={newDomain.dkimVerified}
                      onCheckedChange={(checked) => setNewDomain({...newDomain, dkimVerified: checked})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dkim-selector" className="text-xs">DKIM Selector</Label>
                    <Input
                      id="dkim-selector"
                      placeholder="infy"
                      value={newDomain.dkimSelector}
                      onChange={(e) => setNewDomain({...newDomain, dkimSelector: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">This selector will be used in DNS setup</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="spf-verified" className="font-medium">SPF Verification</Label>
                    <Switch
                      id="spf-verified"
                      checked={newDomain.spfVerified}
                      onCheckedChange={(checked) => setNewDomain({...newDomain, spfVerified: checked})}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">SPF records help prevent email spoofing</p>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="dmarc-verified" className="font-medium">DMARC Verification</Label>
                    <Switch
                      id="dmarc-verified"
                      checked={newDomain.dmarcVerified}
                      onCheckedChange={(checked) => setNewDomain({...newDomain, dmarcVerified: checked})}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">DMARC lets you control what happens to emails that fail SPF and DKIM checks</p>
                </div>
              </div>
              
              <div className="mt-4 rounded-md bg-muted p-3">
                <p className="text-xs">You can set up these authentication methods after creating the domain</p>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateDomain} disabled={!newDomain.name}>Create Domain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Domain Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Domain</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage domain settings, authentication records, and campaign associations
            </p>
          </DialogHeader>
          
          {selectedDomain && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="details">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>Details</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="authentication">
                  <div className="flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    <span>Authentication</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="campaigns">
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>Campaigns</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <Label htmlFor="edit-domain-name">Domain Name</Label>
                    <Input
                      id="edit-domain-name"
                      value={selectedDomain.name}
                      onChange={(e) => setSelectedDomain({...selectedDomain, name: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for sending emails to your subscribers
                    </p>
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="edit-domain-status">Domain Status</Label>
                    <select
                      id="edit-domain-status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedDomain.status}
                      onChange={(e) => setSelectedDomain({...selectedDomain, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">Domain Verification</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use an email provider to verify this domain
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setVerifyDialogOpen(true)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify Domain
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 py-2">
                    <Switch
                      id="edit-default-domain"
                      checked={selectedDomain.defaultDomain}
                      onCheckedChange={(checked) => setSelectedDomain({...selectedDomain, defaultDomain: checked})}
                    />
                    <div>
                      <Label htmlFor="edit-default-domain">Set as Default Domain</Label>
                      <p className="text-xs text-muted-foreground">
                        Used automatically for new campaigns if no domain is selected
                      </p>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateDomain}>Update Domain</Button>
                </DialogFooter>
              </TabsContent>
              
              <TabsContent value="authentication">
                <div className="space-y-2 mb-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="text-sm font-medium">Authentication Records</h3>
                    </div>
                    <Badge variant="outline" className="text-xs">DNS Configuration</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    These DNS records help verify your domain ownership and improve email deliverability.
                  </p>
                </div>
                
                <ScrollArea className="h-[380px] pr-4">
                  <div className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                          <h3 className="text-sm font-medium">DKIM Authentication</h3>
                        </div>
                        <Badge variant={selectedDomain.dkimVerified ? "success" : "outline"} className="ml-auto">
                          {selectedDomain.dkimVerified ? 
                            <><Check className="mr-1 h-3 w-3" /> Verified</> : 
                            <><Clock className="mr-1 h-3 w-3" /> Pending</>
                          }
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <Label htmlFor="dkim-selector" className="text-xs font-medium">DKIM Selector</Label>
                          <Input 
                            id="dkim-selector" 
                            value={selectedDomain.dkimSelector || 'infy'}
                            onChange={(e) => setSelectedDomain({...selectedDomain, dkimSelector: e.target.value})}
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            A unique name for this DKIM record
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 py-1">
                          <div>
                            <Label className="text-xs font-medium">Record Type</Label>
                            <div className="bg-background p-2 rounded border mt-1 text-center">TXT</div>
                          </div>
                          
                          <div className="col-span-2">
                            <Label className="text-xs font-medium">Host Name</Label>
                            <div className="bg-background p-2 rounded border mt-1 truncate">
                              {selectedDomain.dkimSelector}._domainkey.{selectedDomain.name}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium">Record Value</Label>
                          <div className="bg-background p-2 rounded border mt-1 break-all text-xs">
                            {selectedDomain.dkimValue || 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Vg9dQN8RLhZX5k2J...'}
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-2 pt-1 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              toast({
                                title: "DNS Check Started",
                                description: "The system is checking your DNS records. This may take a few minutes.",
                              });
                            }}
                          >
                            <RotateCw className="mr-1 h-3.5 w-3.5" />
                            Check DNS Record
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                          <h3 className="text-sm font-medium">SPF Authentication</h3>
                        </div>
                        <Badge variant={selectedDomain.spfVerified ? "success" : "outline"} className="ml-auto">
                          {selectedDomain.spfVerified ? 
                            <><Check className="mr-1 h-3 w-3" /> Verified</> : 
                            <><Clock className="mr-1 h-3 w-3" /> Pending</>
                          }
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-3 gap-3 py-1">
                          <div>
                            <Label className="text-xs font-medium">Record Type</Label>
                            <div className="bg-background p-2 rounded border mt-1 text-center">TXT</div>
                          </div>
                          
                          <div className="col-span-2">
                            <Label className="text-xs font-medium">Host Name</Label>
                            <div className="bg-background p-2 rounded border mt-1">
                              {selectedDomain.name}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium">Record Value</Label>
                          <div className="bg-background p-2 rounded border mt-1 break-all text-xs">
                            {selectedDomain.spfValue || 'v=spf1 include:_spf.infymailer.com ~all'}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Authorizes InfyMailer to send email on your behalf
                          </p>
                        </div>
                        
                        <div className="flex items-center mt-2 pt-1 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              toast({
                                title: "SPF Check Started",
                                description: "The system is checking your SPF record. This may take a few minutes.",
                              });
                            }}
                          >
                            <RotateCw className="mr-1 h-3.5 w-3.5" />
                            Check DNS Record
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <ShieldAlert className="h-4 w-4 mr-2 text-primary" />
                          <h3 className="text-sm font-medium">DMARC Authentication</h3>
                        </div>
                        <Badge variant={selectedDomain.dmarcVerified ? "success" : "outline"} className="ml-auto">
                          {selectedDomain.dmarcVerified ? 
                            <><Check className="mr-1 h-3 w-3" /> Verified</> : 
                            <><Clock className="mr-1 h-3 w-3" /> Pending</>
                          }
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-3 gap-3 py-1">
                          <div>
                            <Label className="text-xs font-medium">Record Type</Label>
                            <div className="bg-background p-2 rounded border mt-1 text-center">TXT</div>
                          </div>
                          
                          <div className="col-span-2">
                            <Label className="text-xs font-medium">Host Name</Label>
                            <div className="bg-background p-2 rounded border mt-1">
                              _dmarc.{selectedDomain.name}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium">Record Value</Label>
                          <div className="bg-background p-2 rounded border mt-1 break-all text-xs">
                            {selectedDomain.dmarcValue || 'v=DMARC1; p=none; pct=100; rua=mailto:dmarc@infymailer.com'}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Controls what happens to emails that fail SPF and DKIM
                          </p>
                        </div>
                        
                        <div className="flex items-center mt-2 pt-1 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              toast({
                                title: "DMARC Check Started",
                                description: "The system is checking your DMARC record. This may take a few minutes.",
                              });
                            }}
                          >
                            <RotateCw className="mr-1 h-3.5 w-3.5" />
                            Check DNS Record
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                
                <DialogFooter className="mt-6 border-t pt-4">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateDomain}>Update Authentication</Button>
                </DialogFooter>
              </TabsContent>
              
              <TabsContent value="campaigns">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Campaigns using this domain</h3>
                    {domainCampaigns.length > 0 && (
                      <Badge variant="outline">{domainCampaigns.length} campaign(s)</Badge>
                    )}
                  </div>
                  
                  {domainCampaigns.length > 0 ? (
                    <div className="border rounded-md">
                      <ScrollArea className="h-[240px]">
                        <div className="divide-y">
                          {domainCampaigns.map((campaign: Campaign) => (
                            <div key={campaign.id} className="p-3 hover:bg-accent">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="text-sm font-medium">{campaign.name}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">{campaign.subject}</p>
                                </div>
                                <Badge variant="outline" className={getStatusColor(campaign.status) + " text-white"}>
                                  {campaign.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4 border rounded-lg">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h4 className="text-sm font-medium mb-1">No campaigns found</h4>
                      <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
                        This domain is not being used by any campaigns at the moment.
                      </p>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Close</Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Verify Domain Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verify Domain with Email Provider</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Select an email provider to verify your domain and set up authentication records.
            </p>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email-provider">Email Provider</Label>
              <Select 
                value={selectedProvider} 
                onValueChange={setSelectedProvider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {emailProviders.map((provider: EmailProvider) => (
                    <SelectItem key={provider.id} value={provider.id.toString()}>
                      {provider.name} ({provider.provider})
                      {provider.isDefault && <span className="ml-2 text-primary">(Default)</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="flex items-center gap-2">
                <ServerCog className="h-4 w-4 text-muted-foreground" />
                <p>The provider will verify DNS records for DKIM, SPF, and DMARC.</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (selectedDomain && selectedProvider) {
                  verifyDomainMutation.mutate({ 
                    domainId: selectedDomain.id, 
                    providerId: selectedProvider 
                  });
                }
              }}
              disabled={!selectedProvider || verifyDomainMutation.isPending}
            >
              {verifyDomainMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Start Verification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}