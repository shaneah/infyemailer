import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertCircle, 
  CheckCircle, 
  Users, 
  Server, 
  CreditCard, 
  Mail, 
  Activity, 
  ShieldAlert, 
  Settings, 
  Database, 
  Globe, 
  PlusCircle, 
  MinusCircle, 
  Share2, 
  Clock, 
  TrendingUp,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("security");
  const [creditAmount, setCreditAmount] = useState<number>(1000);
  const [creditReason, setCreditReason] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [allocateAmount, setAllocateAmount] = useState<number>(100);
  const [allocateReason, setAllocateReason] = useState<string>("");
  const { toast } = useToast();
  
  // System Credits data
  const { data: systemCredits, isLoading: isLoadingSystemCredits, refetch: refetchSystemCredits } = useQuery({
    queryKey: ['/api/system-credits'],
    queryFn: async () => {
      const response = await fetch('/api/system-credits');
      if (!response.ok) {
        throw new Error('Failed to fetch system credits');
      }
      return response.json();
    }
  });
  
  // System Credits History
  const { data: systemCreditsHistory, isLoading: isLoadingSystemCreditsHistory, refetch: refetchSystemCreditsHistory } = useQuery({
    queryKey: ['/api/system-credits/history'],
    queryFn: async () => {
      const response = await fetch('/api/system-credits/history?limit=10');
      if (!response.ok) {
        throw new Error('Failed to fetch system credits history');
      }
      return response.json();
    }
  });
  
  // Clients data for allocation dropdown
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      return response.json();
    }
  });
  
  // Add System Credits
  const addSystemCreditsMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount: number, reason: string }) => {
      return apiRequest('POST', '/api/system-credits/add', { amount, reason });
    },
    onSuccess: () => {
      toast({
        title: "Credits added successfully",
        description: `${creditAmount} credits have been added to the system pool.`,
        variant: "default",
      });
      refetchSystemCredits();
      refetchSystemCreditsHistory();
      setCreditAmount(1000);
      setCreditReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add credits",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Deduct System Credits
  const deductSystemCreditsMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount: number, reason: string }) => {
      return apiRequest('POST', '/api/system-credits/deduct', { amount, reason });
    },
    onSuccess: () => {
      toast({
        title: "Credits deducted successfully",
        description: `${creditAmount} credits have been deducted from the system pool.`,
        variant: "default",
      });
      refetchSystemCredits();
      refetchSystemCreditsHistory();
      setCreditAmount(1000);
      setCreditReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to deduct credits",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Allocate Credits to Client
  const allocateClientCreditsMutation = useMutation({
    mutationFn: async ({ clientId, amount, reason }: { clientId: number, amount: number, reason: string }) => {
      return apiRequest('POST', `/api/system-credits/allocate-to-client/${clientId}`, { amount, reason });
    },
    onSuccess: () => {
      const clientName = clients?.find(c => c.id === selectedClientId)?.name || "Selected client";
      toast({
        title: "Credits allocated successfully",
        description: `${allocateAmount} credits have been allocated to ${clientName}.`,
        variant: "default",
      });
      refetchSystemCredits();
      refetchSystemCreditsHistory();
      setAllocateAmount(100);
      setAllocateReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to allocate credits",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Placeholder stats data - would be fetched from API in production
  const { data: systemStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      // In a real app, we'd fetch from backend
      return [
        { id: 1, title: "Total Clients", value: "187", change: "+12%", icon: <Users className="h-4 w-4" /> },
        { id: 2, title: "Active Campaigns", value: "356", change: "+8%", icon: <Mail className="h-4 w-4" /> },
        { id: 3, title: "Server Uptime", value: "99.99%", change: "+0.01%", icon: <Server className="h-4 w-4" /> },
        { id: 4, title: "Total Revenue", value: "$42,589", change: "+22%", icon: <CreditCard className="h-4 w-4" /> }
      ];
    }
  });

  // Dummy alerts data
  const { data: systemAlerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['/api/admin/alerts'],
    queryFn: async () => {
      return [
        { 
          id: 1, 
          severity: "critical", 
          title: "Database CPU Usage High", 
          description: "Database server CPU usage exceeded 85% for 15 minutes",
          timestamp: "2025-04-02T10:23:45Z",
          status: "active"
        },
        { 
          id: 2, 
          severity: "warning", 
          title: "Email Queue Backup",
          description: "Email sending queue has 10,000+ emails pending",
          timestamp: "2025-04-02T09:15:22Z",
          status: "active"
        },
        { 
          id: 3, 
          severity: "info", 
          title: "System Update Available",
          description: "New security patches are available for installation",
          timestamp: "2025-04-01T22:45:12Z",
          status: "resolved"
        }
      ];
    }
  });

  const renderSystemStats = () => {
    if (isLoadingStats) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats?.map(stat => (
          <Card key={stat.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <div className="text-gray-400">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className={`ml-2 text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderAlerts = () => {
    if (isLoadingAlerts) {
      return (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'critical': return 'bg-red-100 text-red-800';
        case 'warning': return 'bg-amber-100 text-amber-800';
        case 'info': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getSeverityIcon = (severity: string) => {
      switch (severity) {
        case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
        case 'warning': return <AlertCircle className="h-4 w-4 text-amber-600" />;
        case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
        default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
      }
    };

    return (
      <div className="space-y-2">
        {systemAlerts?.map(alert => (
          <Card key={alert.id} className={alert.status === 'active' ? 'border-l-4 border-l-red-500' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-gray-500">{alert.description}</p>
                  </div>
                </div>
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                </Badge>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
                {alert.status === 'active' && (
                  <Button variant="outline" size="sm">Resolve</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-500">System management and monitoring</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full lg:w-auto">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6">
            <div>
              <h2 className="text-lg font-medium mb-4">System Status</h2>
              {renderSystemStats()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Active Alerts</h2>
                {renderAlerts()}
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">System Resources</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">CPU Usage</span>
                          <span className="text-sm font-medium">62%</span>
                        </div>
                        <Progress value={62} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Memory Usage</span>
                          <span className="text-sm font-medium">48%</span>
                        </div>
                        <Progress value={48} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Storage Usage</span>
                          <span className="text-sm font-medium">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Network Bandwidth</span>
                          <span className="text-sm font-medium">33%</span>
                        </div>
                        <Progress value={33} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h2 className="text-lg font-medium mb-4 mt-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                    <Mail className="h-5 w-5" />
                    <span>Pause Email Queue</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                    <Activity className="h-5 w-5" />
                    <span>Run Diagnostics</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                    <Database className="h-5 w-5" />
                    <span>Backup Database</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                    <Settings className="h-5 w-5" />
                    <span>System Updates</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Client Management</CardTitle>
                  <CardDescription>Manage and monitor all client accounts</CardDescription>
                </div>
                <Button>Add New Client</Button>
              </div>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Acme Corporation</TableCell>
                      <TableCell>Enterprise</TableCell>
                      <TableCell><Badge className="bg-green-100 text-green-800">Active</Badge></TableCell>
                      <TableCell>24</TableCell>
                      <TableCell>45,890</TableCell>
                      <TableCell>2 hours ago</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Globex Industries</TableCell>
                      <TableCell>Professional</TableCell>
                      <TableCell><Badge className="bg-green-100 text-green-800">Active</Badge></TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>15,432</TableCell>
                      <TableCell>5 hours ago</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Stark Enterprises</TableCell>
                      <TableCell>Business</TableCell>
                      <TableCell><Badge className="bg-yellow-100 text-yellow-800">Overdue</Badge></TableCell>
                      <TableCell>8</TableCell>
                      <TableCell>9,754</TableCell>
                      <TableCell>1 day ago</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Wayne Industries</TableCell>
                      <TableCell>Enterprise</TableCell>
                      <TableCell><Badge className="bg-green-100 text-green-800">Active</Badge></TableCell>
                      <TableCell>31</TableCell>
                      <TableCell>78,325</TableCell>
                      <TableCell>Just now</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Umbrella Corp</TableCell>
                      <TableCell>Professional</TableCell>
                      <TableCell><Badge className="bg-red-100 text-red-800">Suspended</Badge></TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>12,765</TableCell>
                      <TableCell>5 days ago</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>
                  Monitor security status and manage platform-wide security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center p-4 border rounded-md bg-green-50">
                    <ShieldAlert className="h-8 w-8 text-green-600 mr-4" />
                    <div>
                      <h3 className="font-medium">Security Status: Secure</h3>
                      <p className="text-sm text-gray-500">All security systems are operational. Last scan completed 2 hours ago.</p>
                    </div>
                  </div>
                  
                  <h3 className="font-medium mt-4">Recent Security Events</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Multiple failed login attempts</TableCell>
                          <TableCell>IP: 203.0.113.42</TableCell>
                          <TableCell><Badge className="bg-amber-100 text-amber-800">Medium</Badge></TableCell>
                          <TableCell>10:23 AM</TableCell>
                          <TableCell>Blocked</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>API rate limit exceeded</TableCell>
                          <TableCell>Client ID: 8723</TableCell>
                          <TableCell><Badge className="bg-blue-100 text-blue-800">Low</Badge></TableCell>
                          <TableCell>09:45 AM</TableCell>
                          <TableCell>Throttled</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Admin password changed</TableCell>
                          <TableCell>User: admin@example.com</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Info</Badge></TableCell>
                          <TableCell>Yesterday</TableCell>
                          <TableCell>Authorized</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Unusual API usage pattern</TableCell>
                          <TableCell>Client ID: 5437</TableCell>
                          <TableCell><Badge className="bg-red-100 text-red-800">High</Badge></TableCell>
                          <TableCell>Yesterday</TableCell>
                          <TableCell>Investigating</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Authentication Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Two-Factor Authentication</h4>
                              <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Password Policy</h4>
                              <p className="text-sm text-gray-500">Minimum requirements and expiry</p>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Single Sign-On</h4>
                              <p className="text-sm text-gray-500">Configure SAML & OAuth providers</p>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">API Security</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">API Rate Limiting</h4>
                              <p className="text-sm text-gray-500">Prevent abuse by limiting requests</p>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">IP Whitelisting</h4>
                              <p className="text-sm text-gray-500">Restrict API access by IP address</p>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">API Key Management</h4>
                              <p className="text-sm text-gray-500">Rotate and revoke API credentials</p>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="grid gap-6">
            {/* Revenue Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Monitor billing metrics and financial performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-sm font-medium text-gray-500">Monthly Recurring Revenue</h3>
                      <div className="mt-2">
                        <p className="text-2xl font-semibold">AED 177,092.00</p>
                        <p className="text-sm text-green-600">+12.5% from last month</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-sm font-medium text-gray-500">Average Revenue Per Client</h3>
                      <div className="mt-2">
                        <p className="text-2xl font-semibold">AED 947.01</p>
                        <p className="text-sm text-green-600">+5.3% from last month</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-sm font-medium text-gray-500">Churn Rate</h3>
                      <div className="mt-2">
                        <p className="text-2xl font-semibold">2.4%</p>
                        <p className="text-sm text-green-600">-0.6% from last month</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-sm font-medium text-gray-500">Overdue Accounts</h3>
                      <div className="mt-2">
                        <p className="text-2xl font-semibold">14</p>
                        <p className="text-sm text-red-600">+3 from last month</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <h3 className="font-medium mb-4">Recent Transactions</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Acme Corporation</TableCell>
                        <TableCell>AED 2,198.33</TableCell>
                        <TableCell>Enterprise</TableCell>
                        <TableCell>Apr 1, 2025</TableCell>
                        <TableCell><Badge className="bg-green-100 text-green-800">Paid</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Globex Industries</TableCell>
                        <TableCell>AED 730.33</TableCell>
                        <TableCell>Professional</TableCell>
                        <TableCell>Apr 1, 2025</TableCell>
                        <TableCell><Badge className="bg-green-100 text-green-800">Paid</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Stark Enterprises</TableCell>
                        <TableCell>AED 363.33</TableCell>
                        <TableCell>Business</TableCell>
                        <TableCell>Mar 31, 2025</TableCell>
                        <TableCell><Badge className="bg-red-100 text-red-800">Failed</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Wayne Industries</TableCell>
                        <TableCell>AED 2,198.33</TableCell>
                        <TableCell>Enterprise</TableCell>
                        <TableCell>Mar 30, 2025</TableCell>
                        <TableCell><Badge className="bg-green-100 text-green-800">Paid</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </CardContent>
            </Card>
            
            {/* System Credits Management */}
            <Card>
              <CardHeader>
                <CardTitle>System Credits Management</CardTitle>
                <CardDescription>
                  Manage the system-wide email credit pool and allocate credits to clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="p-4">
                      {isLoadingSystemCredits ? (
                        <>
                          <Skeleton className="h-4 w-36 mb-2 mt-2" />
                          <Skeleton className="h-8 w-24 mb-2" />
                          <Skeleton className="h-4 w-20" />
                        </>
                      ) : (
                        <>
                          <h3 className="text-sm font-medium text-gray-500">Total System Credits</h3>
                          <div className="mt-2">
                            <p className="text-2xl font-semibold">{systemCredits?.totalCredits.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Available for allocation</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      {isLoadingSystemCredits ? (
                        <>
                          <Skeleton className="h-4 w-36 mb-2 mt-2" />
                          <Skeleton className="h-8 w-24 mb-2" />
                          <Skeleton className="h-4 w-20" />
                        </>
                      ) : (
                        <>
                          <h3 className="text-sm font-medium text-gray-500">Allocated Credits</h3>
                          <div className="mt-2">
                            <p className="text-2xl font-semibold">{systemCredits?.allocatedCredits.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Distributed to clients</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      {isLoadingSystemCredits ? (
                        <>
                          <Skeleton className="h-4 w-36 mb-2 mt-2" />
                          <Skeleton className="h-8 w-24 mb-2" />
                          <Skeleton className="h-4 w-20" />
                        </>
                      ) : (
                        <>
                          <h3 className="text-sm font-medium text-gray-500">Available System Credits</h3>
                          <div className="mt-2">
                            <p className="text-2xl font-semibold">{systemCredits?.availableCredits.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Ready for allocation</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* System Credits Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Add or Deduct System Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="creditAmount">Amount</Label>
                          <Input 
                            id="creditAmount" 
                            type="number" 
                            min="1"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                            placeholder="Enter credit amount" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="creditReason">Reason</Label>
                          <Input 
                            id="creditReason" 
                            value={creditReason}
                            onChange={(e) => setCreditReason(e.target.value)}
                            placeholder="Enter reason for adjustment" 
                          />
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            onClick={() => addSystemCreditsMutation.mutate({
                              amount: creditAmount,
                              reason: creditReason || "Manual system credit addition"
                            })}
                            disabled={addSystemCreditsMutation.isPending || !creditAmount}
                            className="flex-1"
                          >
                            {addSystemCreditsMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <PlusCircle className="mr-2 h-4 w-4" />
                            )}
                            Add Credits
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => deductSystemCreditsMutation.mutate({
                              amount: creditAmount,
                              reason: creditReason || "Manual system credit deduction"
                            })}
                            disabled={deductSystemCreditsMutation.isPending || !creditAmount}
                            className="flex-1"
                          >
                            {deductSystemCreditsMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <MinusCircle className="mr-2 h-4 w-4" />
                            )}
                            Deduct Credits
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Allocate Credits to Client</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientSelect">Select Client</Label>
                          <Select
                            value={selectedClientId?.toString() || ""}
                            onValueChange={(value) => setSelectedClientId(parseInt(value) || null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingClients ? (
                                <div className="p-2 text-center">
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                </div>
                              ) : (
                                clients?.map((client) => (
                                  <SelectItem key={client.id} value={client.id.toString()}>
                                    {client.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="allocateAmount">Credit Amount</Label>
                          <Input 
                            id="allocateAmount" 
                            type="number" 
                            min="1"
                            value={allocateAmount}
                            onChange={(e) => setAllocateAmount(parseInt(e.target.value) || 0)}
                            placeholder="Enter amount to allocate" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="allocateReason">Reason</Label>
                          <Input 
                            id="allocateReason" 
                            value={allocateReason}
                            onChange={(e) => setAllocateReason(e.target.value)}
                            placeholder="Enter reason for allocation" 
                          />
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => allocateClientCreditsMutation.mutate({
                            clientId: selectedClientId!,
                            amount: allocateAmount,
                            reason: allocateReason || "Manual credit allocation"
                          })}
                          disabled={allocateClientCreditsMutation.isPending || !selectedClientId || !allocateAmount}
                        >
                          {allocateClientCreditsMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Share2 className="mr-2 h-4 w-4" />
                          )}
                          Allocate Credits
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* System Credits History */}
                <h3 className="font-medium mb-4">System Credits History</h3>
                <div className="rounded-md border">
                  {isLoadingSystemCreditsHistory ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Loading transaction history...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Balance After</TableHead>
                          <TableHead>Performed By</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemCreditsHistory?.length ? (
                          systemCreditsHistory.map((history) => (
                            <TableRow key={history.id}>
                              <TableCell>
                                {new Date(history.createdAt).toLocaleDateString()} {new Date(history.createdAt).toLocaleTimeString()}
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  history.type === 'add' ? 'bg-green-100 text-green-800' : 
                                  history.type === 'deduct' ? 'bg-red-100 text-red-800' : 
                                  'bg-blue-100 text-blue-800'
                                }>
                                  {history.type === 'add' ? 'Addition' : 
                                   history.type === 'deduct' ? 'Deduction' : 
                                   'Allocation'}
                                </Badge>
                              </TableCell>
                              <TableCell className={
                                history.type === 'add' ? 'text-green-600' : 
                                history.type === 'deduct' || history.type === 'allocate' ? 'text-red-600' : ''
                              }>
                                {history.type === 'add' ? '+' : '-'}{history.amount.toLocaleString()}
                              </TableCell>
                              <TableCell>{history.newBalance.toLocaleString()}</TableCell>
                              <TableCell>{history.performedBy ? `User #${history.performedBy}` : 'System'}</TableCell>
                              <TableCell className="max-w-[200px] truncate" title={history.reason || ''}>
                                {history.reason || 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                              No transaction history found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Servers Tab */}
        <TabsContent value="servers">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Server Infrastructure</CardTitle>
                <CardDescription>
                  Monitor and manage email and application servers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="border-green-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Email Service 1</h3>
                          <Badge className="bg-green-100 text-green-800">Online</Badge>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>CPU</span>
                              <span>32%</span>
                            </div>
                            <Progress value={32} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Memory</span>
                              <span>48%</span>
                            </div>
                            <Progress value={48} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Disk</span>
                              <span>27%</span>
                            </div>
                            <Progress value={27} className="h-1" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Region: US-East</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Email Service 2</h3>
                          <Badge className="bg-green-100 text-green-800">Online</Badge>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>CPU</span>
                              <span>45%</span>
                            </div>
                            <Progress value={45} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Memory</span>
                              <span>52%</span>
                            </div>
                            <Progress value={52} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Disk</span>
                              <span>38%</span>
                            </div>
                            <Progress value={38} className="h-1" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Region: EU-West</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-yellow-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Database Cluster</h3>
                          <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>CPU</span>
                              <span>87%</span>
                            </div>
                            <Progress value={87} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Memory</span>
                              <span>64%</span>
                            </div>
                            <Progress value={64} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Disk</span>
                              <span>72%</span>
                            </div>
                            <Progress value={72} className="h-1" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Region: US-East</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <h3 className="font-medium">Email Delivery Metrics</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Last Hour</TableHead>
                          <TableHead>Today</TableHead>
                          <TableHead>This Week</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Emails Sent</TableCell>
                          <TableCell>2,547</TableCell>
                          <TableCell>32,190</TableCell>
                          <TableCell>128,543</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Normal</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Delivery Rate</TableCell>
                          <TableCell>99.2%</TableCell>
                          <TableCell>98.7%</TableCell>
                          <TableCell>98.9%</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Normal</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Bounce Rate</TableCell>
                          <TableCell>0.8%</TableCell>
                          <TableCell>1.3%</TableCell>
                          <TableCell>1.1%</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Normal</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Spam Complaints</TableCell>
                          <TableCell>0.02%</TableCell>
                          <TableCell>0.05%</TableCell>
                          <TableCell>0.03%</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Normal</Badge></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button>Add New Server</Button>
                    <Button variant="outline">View Detailed Logs</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>
                  Schedule and manage system updates and maintenance tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-md bg-blue-50">
                    <div className="flex items-start">
                      <Globe className="h-6 w-6 text-blue-700 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-blue-900">Scheduled Maintenance</h3>
                        <p className="text-sm text-blue-800 mt-1">
                          A system update is scheduled for April 10, 2025 at 2:00 AM UTC. 
                          Estimated downtime: 30 minutes. This update includes security patches
                          and performance improvements.
                        </p>
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline">Reschedule</Button>
                          <Button size="sm" variant="outline">Cancel</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-medium">Available Updates</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Update</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Components</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Security Patch</TableCell>
                          <TableCell><Badge className="bg-red-100 text-red-800">Critical</Badge></TableCell>
                          <TableCell>v2.4.7</TableCell>
                          <TableCell>API Server, Database</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">Schedule</Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Performance Update</TableCell>
                          <TableCell><Badge className="bg-amber-100 text-amber-800">Recommended</Badge></TableCell>
                          <TableCell>v2.4.6</TableCell>
                          <TableCell>Email Service, Frontend</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">Schedule</Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Feature Update</TableCell>
                          <TableCell><Badge className="bg-blue-100 text-blue-800">Optional</Badge></TableCell>
                          <TableCell>v2.5.0-beta</TableCell>
                          <TableCell>All Components</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">Schedule</Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <h3 className="font-medium">Maintenance History</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Mar 15, 2025</TableCell>
                          <TableCell>Security Update</TableCell>
                          <TableCell>Applied critical security patches</TableCell>
                          <TableCell>23 minutes</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Completed</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Mar 1, 2025</TableCell>
                          <TableCell>Database Maintenance</TableCell>
                          <TableCell>Optimized database indexes and queries</TableCell>
                          <TableCell>45 minutes</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Completed</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Feb 22, 2025</TableCell>
                          <TableCell>Feature Update</TableCell>
                          <TableCell>Deployed new campaign analytics engine</TableCell>
                          <TableCell>37 minutes</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Completed</Badge></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">System Backups</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm">Last backup: <span className="font-medium">Apr 2, 2025 (03:00 UTC)</span></p>
                              <p className="text-sm">Status: <span className="text-green-600 font-medium">Successful</span></p>
                            </div>
                            <Button variant="outline" size="sm">Restore</Button>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div>
                              <p className="text-sm">Next scheduled backup: <span className="font-medium">Apr 3, 2025 (03:00 UTC)</span></p>
                            </div>
                            <Button size="sm">Run Now</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Maintenance Window</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm">Current maintenance window:</p>
                          <div className="p-2 bg-gray-50 rounded border text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-gray-500">Days:</p>
                                <p className="font-medium">Tuesdays, Thursdays</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Time:</p>
                                <p className="font-medium">02:00 - 04:00 UTC</p>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Change Window</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="John Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" defaultValue="MailFlow Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc-7">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-12">UTC-12:00</SelectItem>
                      <SelectItem value="utc-11">UTC-11:00</SelectItem>
                      <SelectItem value="utc-10">UTC-10:00</SelectItem>
                      <SelectItem value="utc-9">UTC-09:00</SelectItem>
                      <SelectItem value="utc-8">UTC-08:00</SelectItem>
                      <SelectItem value="utc-7">UTC-07:00 (PDT)</SelectItem>
                      <SelectItem value="utc-6">UTC-06:00 (CST)</SelectItem>
                      <SelectItem value="utc-5">UTC-05:00 (EST)</SelectItem>
                      <SelectItem value="utc-4">UTC-04:00</SelectItem>
                      <SelectItem value="utc-3">UTC-03:00</SelectItem>
                      <SelectItem value="utc-2">UTC-02:00</SelectItem>
                      <SelectItem value="utc-1">UTC-01:00</SelectItem>
                      <SelectItem value="utc">UTC+00:00</SelectItem>
                      <SelectItem value="utc+1">UTC+01:00</SelectItem>
                      <SelectItem value="utc+2">UTC+02:00</SelectItem>
                      <SelectItem value="utc+3">UTC+03:00</SelectItem>
                      <SelectItem value="utc+4">UTC+04:00</SelectItem>
                      <SelectItem value="utc+5">UTC+05:00</SelectItem>
                      <SelectItem value="utc+6">UTC+06:00</SelectItem>
                      <SelectItem value="utc+7">UTC+07:00</SelectItem>
                      <SelectItem value="utc+8">UTC+08:00</SelectItem>
                      <SelectItem value="utc+9">UTC+09:00</SelectItem>
                      <SelectItem value="utc+10">UTC+10:00</SelectItem>
                      <SelectItem value="utc+11">UTC+11:00</SelectItem>
                      <SelectItem value="utc+12">UTC+12:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="marketing" defaultChecked={true} />
                  <Label htmlFor="marketing">Receive marketing emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" defaultChecked={true} />
                  <Label htmlFor="notifications">Receive campaign report notifications</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input id="current_password" type="password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input id="new_password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input id="confirm_password" type="password" />
                  </div>
                </div>
                <div className="pt-2 flex items-center space-x-2">
                  <Switch id="two_factor" />
                  <div>
                    <Label htmlFor="two_factor">Two-factor authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage access and permissions for your team
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    Invite Team Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-full bg-blue-100 p-2 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">JS</span>
                        </div>
                        <div>
                          <p className="font-medium">John Smith</p>
                          <p className="text-sm text-gray-500">john@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-100 text-blue-600 border-none">Owner</Badge>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </div>
                    </div>

                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-full bg-gray-100 p-2 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">JD</span>
                        </div>
                        <div>
                          <p className="font-medium">Jane Doe</p>
                          <p className="text-sm text-gray-500">jane@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-purple-100 text-purple-600 border-none">Admin</Badge>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-full bg-gray-100 p-2 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">RJ</span>
                        </div>
                        <div>
                          <p className="font-medium">Robert Johnson</p>
                          <p className="text-sm text-gray-500">robert@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-600 border-none">Editor</Badge>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Role Permissions</h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">Owner</p>
                          <p className="text-sm text-gray-500">Full access to all settings and billing</p>
                        </div>
                        <Button variant="outline" size="sm">Edit Permissions</Button>
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">Admin</p>
                          <p className="text-sm text-gray-500">Access to all features except billing</p>
                        </div>
                        <Button variant="outline" size="sm">Edit Permissions</Button>
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">Editor</p>
                          <p className="text-sm text-gray-500">Can create and edit campaigns, but cannot access settings</p>
                        </div>
                        <Button variant="outline" size="sm">Edit Permissions</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
              
            <div className="flex justify-end mt-4">
              <Button>Save Changes</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}