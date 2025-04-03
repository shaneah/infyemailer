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
import { 
  Globe, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Star, 
  Clock, 
  Trash, 
  RefreshCw, 
  Edit, 
  Plus, 
  ArrowRight, 
  Check
} from "lucide-react";

// Type definition for Domain
interface Domain {
  id: number;
  name: string;
  status: string;
  verified: boolean;
  defaultDomain: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  metadata: {
    type?: string;
    dkimVerified?: boolean;
    spfVerified?: boolean;
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

export default function Domains() {
  const { toast } = useToast();
  const [tab, setTab] = useState("active");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [newDomain, setNewDomain] = useState({
    name: "",
    status: "active",
    verified: false,
    defaultDomain: false,
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
                
                {domain.metadata?.dkimVerified && (
                  <Badge variant="outline" className="bg-primary">
                    DKIM
                  </Badge>
                )}
                
                {domain.metadata?.spfVerified && (
                  <Badge variant="outline" className="bg-primary">
                    SPF
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add a New Domain</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          <DialogFooter>
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
          </DialogHeader>
          
          {selectedDomain && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Domain Details</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-domain-name">Domain Name</Label>
                    <Input
                      id="edit-domain-name"
                      value={selectedDomain.name}
                      onChange={(e) => setSelectedDomain({...selectedDomain, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-domain-status">Status</Label>
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
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-verified"
                      checked={selectedDomain.verified}
                      onCheckedChange={(checked) => setSelectedDomain({...selectedDomain, verified: checked})}
                    />
                    <Label htmlFor="edit-verified">Verified</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-default-domain"
                      checked={selectedDomain.defaultDomain}
                      onCheckedChange={(checked) => setSelectedDomain({...selectedDomain, defaultDomain: checked})}
                    />
                    <Label htmlFor="edit-default-domain">Set as Default Domain</Label>
                  </div>
                </div>
                
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateDomain}>Update Domain</Button>
                </DialogFooter>
              </TabsContent>
              
              <TabsContent value="campaigns" className="mt-4">
                <h3 className="text-sm font-medium mb-2">Campaigns using this domain</h3>
                
                {domainCampaigns.length > 0 ? (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {domainCampaigns.map((campaign: Campaign) => (
                        <Card key={campaign.id} className="p-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-medium">{campaign.name}</h4>
                              <p className="text-xs text-muted-foreground">{campaign.subject}</p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(campaign.status) + " text-white"}>
                              {campaign.status}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No campaigns are using this domain</p>
                  </div>
                )}
                
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Close</Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}