import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Mail, 
  BarChart3, 
  Users, 
  Settings, 
  Zap, 
  ExternalLink,
  Info
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

const ClientPortal = () => {
  const [activeTab, setActiveTab] = useState('campaigns');

  // Mock data for the client portal
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({ 
    queryKey: ['/api/campaigns'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: emailCredits, isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/client/credits'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/client/templates'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/contacts'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/email'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: devicesData, isLoading: devicesLoading } = useQuery({
    queryKey: ['/api/analytics/devices'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: geographyData, isLoading: geographyLoading } = useQuery({
    queryKey: ['/api/analytics/geography'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: topCampaignsData, isLoading: topCampaignsLoading } = useQuery({
    queryKey: ['/api/analytics/top-campaigns'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Client Portal</h1>
        <p className="text-gray-600">
          Manage your email campaigns, templates, contacts, and account settings
        </p>
      </div>

      {/* Email Credits Card */}
      <Card className="mb-8 border-[#d4af37]/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 to-transparent pb-2">
          <CardTitle className="text-xl flex items-center">
            <Zap className="mr-2 h-5 w-5 text-[#d4af37]" />
            Email Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {creditsLoading ? (
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <>
              <div className="mb-1 flex justify-between text-sm">
                <span>
                  <span className="font-semibold">{emailCredits?.used.toLocaleString()}</span> used of{" "}
                  <span className="font-semibold">{emailCredits?.total.toLocaleString()}</span>
                </span>
                <span className="font-semibold">{Math.round((emailCredits?.used / emailCredits?.total) * 100)}%</span>
              </div>
              <Progress 
                value={(emailCredits?.used / emailCredits?.total) * 100} 
                className="h-2 bg-gray-200"
              />
              <div className="mt-4 flex justify-between">
                <span className="text-sm text-gray-600">
                  Last updated: {formatDate(emailCredits?.lastUpdated)}
                </span>
                <Button variant="outline" size="sm" className="border-[#d4af37]/50 text-blue-600 hover:bg-blue-50">
                  Purchase More
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="campaigns" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl mb-6">
          <TabsTrigger value="campaigns" className="flex gap-2 items-center">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Campaigns</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex gap-2 items-center">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex gap-2 items-center">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Contacts</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex gap-2 items-center">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex gap-2 items-center">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Campaigns</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">Create Campaign</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {campaignsLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Recipients</TableHead>
                      <TableHead className="hidden md:table-cell">Open Rate</TableHead>
                      <TableHead className="hidden md:table-cell">Click Rate</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns?.map((campaign: any) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          {campaign.name}
                          {campaign.subtitle && (
                            <div className="text-sm text-gray-500">{campaign.subtitle}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {campaign.status && typeof campaign.status === 'object' ? (
                            <Badge
                              className={`${
                                campaign.status.color === 'success'
                                  ? 'bg-green-100 text-green-700'
                                  : campaign.status.color === 'warning'
                                  ? 'bg-amber-100 text-amber-700'
                                  : campaign.status.color === 'primary'
                                  ? 'bg-blue-100 text-blue-700'
                                  : campaign.status.color === 'danger'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {campaign.status.label}
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700">
                              {typeof campaign.status === 'string' ? campaign.status : 'Unknown'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {campaign.recipients.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {campaign.openRate ? (
                            <span 
                              className={`${campaign.openRate > 30 
                                ? 'text-green-600' 
                                : campaign.openRate > 15 
                                  ? 'text-yellow-600' 
                                  : 'text-red-600'}`}
                            >
                              {campaign.openRate}%
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {campaign.clickRate ? (
                            <span 
                              className={`${campaign.clickRate > 20 
                                ? 'text-green-600' 
                                : campaign.clickRate > 10 
                                  ? 'text-yellow-600' 
                                  : 'text-red-600'}`}
                            >
                              {campaign.clickRate}%
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{campaign.date}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Report</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Email Templates</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">Create Template</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {templatesLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead className="hidden sm:table-cell">Last Used</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates?.map((template: any) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{template.category}</TableCell>
                        <TableCell className="hidden sm:table-cell">{formatDate(template.lastUsed)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge className="bg-green-100 text-green-700">
                            {template.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Template</DropdownMenuItem>
                              <DropdownMenuItem>Preview</DropdownMenuItem>
                              <DropdownMenuItem>Use in Campaign</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Contact List</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="border-[#d4af37]/50">Import Contacts</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Add Contact</Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              {contactsLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden md:table-cell">Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts?.map((contact: any) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{contact.email}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            className={`${
                              contact.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : contact.status === 'unsubscribed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(contact.lastOpened)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                              <DropdownMenuItem>Send Email</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Campaign Analytics</h2>
            <Button variant="outline" className="border-[#d4af37]/50">Export Reports</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="border-[#d4af37]/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Email Performance</CardTitle>
                <CardDescription>Average metrics across all campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsLoading ? (
                    <>
                      <Skeleton className="h-12 w-full mb-4" />
                      <Skeleton className="h-12 w-full mb-4" />
                      <Skeleton className="h-12 w-full mb-4" />
                      <Skeleton className="h-12 w-full" />
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <div className="flex items-center">
                            <span>Open Rate</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-60">Percentage of recipients who opened your emails</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="font-semibold">{analyticsData?.overview?.openRate || 0}%</span>
                        </div>
                        <Progress value={analyticsData?.overview?.openRate || 0} className="h-2 bg-gray-200" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <div className="flex items-center">
                            <span>Click Rate</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-60">Percentage of recipients who clicked at least one link</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="font-semibold">{analyticsData?.overview?.clickRate || 0}%</span>
                        </div>
                        <Progress value={analyticsData?.overview?.clickRate || 0} className="h-2 bg-gray-200" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <div className="flex items-center">
                            <span>Bounce Rate</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-60">Percentage of emails that couldn't be delivered</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="font-semibold">{analyticsData?.overview?.bounceRate || 0}%</span>
                        </div>
                        <Progress value={analyticsData?.overview?.bounceRate || 0} className="h-2 bg-gray-200" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <div className="flex items-center">
                            <span>Unsubscribe Rate</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-60">Percentage of recipients who unsubscribed</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="font-semibold">{analyticsData?.overview?.unsubscribeRate || 0}%</span>
                        </div>
                        <Progress value={analyticsData?.overview?.unsubscribeRate || 0} className="h-2 bg-gray-200" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-[#d4af37]/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Audience Engagement</CardTitle>
                <CardDescription>How your audience is interacting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Most Active Time</p>
                      <p className="text-xl font-semibold text-blue-700">10-11 AM</p>
                      <p className="text-xs text-gray-500 mt-1">Tuesday & Thursday</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Top Device</p>
                      {devicesLoading ? (
                        <>
                          <Skeleton className="h-6 w-24 mx-auto mb-1" />
                          <Skeleton className="h-4 w-32 mx-auto" />
                        </>
                      ) : (
                        <>
                          <p className="text-xl font-semibold text-amber-700">
                            {devicesData && devicesData.length > 0 ? devicesData[0].name : "Mobile"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {devicesData && devicesData.length > 0 ? `${devicesData[0].percentage}% of opens` : "No data"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Most Clicked Links</h4>
                    <div className="space-y-2.5">
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-blue-600 truncate pr-4">Product Features</span>
                          <span className="font-medium">24.5%</span>
                        </div>
                        <Progress value={24.5} className="h-1.5 bg-gray-200" />
                      </div>
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-blue-600 truncate pr-4">Special Offer</span>
                          <span className="font-medium">18.2%</span>
                        </div>
                        <Progress value={18.2} className="h-1.5 bg-gray-200" />
                      </div>
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-blue-600 truncate pr-4">Contact Us</span>
                          <span className="font-medium">12.7%</span>
                        </div>
                        <Progress value={12.7} className="h-1.5 bg-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-[#d4af37]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Campaign Performance</CardTitle>
              <CardDescription>Last 5 campaigns performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {topCampaignsLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-right">Sent</TableHead>
                      <TableHead className="hidden sm:table-cell text-right">Opens</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="hidden sm:table-cell text-right">Conversions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCampaignsData && topCampaignsData.map((campaign: any) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{campaign.date || "Recent"}</TableCell>
                        <TableCell className="text-right">{campaign.sent || "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-right">
                          <span className={`${campaign.opens > 50 
                            ? 'text-green-600' 
                            : campaign.opens > 30 
                              ? 'text-yellow-600' 
                              : 'text-red-600'}`}
                          >
                            {campaign.opens}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`${campaign.clicks > 30 
                            ? 'text-green-600' 
                            : campaign.clicks > 15 
                              ? 'text-yellow-600' 
                              : 'text-red-600'}`}
                          >
                            {campaign.clicks}%
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right">
                          {campaign.conversions}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Account Settings</h2>
            <Button variant="outline" className="border-[#d4af37]/50">Save Changes</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="border-[#d4af37]/20">
                <CardHeader>
                  <CardTitle className="text-xl">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Company Name</label>
                      <input
                        type="text"
                        value="Infinity Tech Solutions"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Industry</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option>Technology</option>
                        <option>Retail</option>
                        <option>Finance</option>
                        <option>Healthcare</option>
                        <option>Education</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Company Address</label>
                    <input
                      type="text"
                      value="123 Tech Plaza, Suite 400"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">City</label>
                      <input
                        type="text"
                        value="San Francisco"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">State</label>
                      <input
                        type="text"
                        value="California"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Zip Code</label>
                      <input
                        type="text"
                        value="94103"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-[#d4af37]/20">
                <CardHeader>
                  <CardTitle className="text-xl">Email Sending Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">From Name</label>
                      <input
                        type="text"
                        value="Infinity Tech Team"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Reply-To Email</label>
                      <input
                        type="email"
                        value="team@infinitytech.example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Email Signature</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      defaultValue="Best regards,
Infinity Tech Solutions
www.infinitytech.example.com
(555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="trackOpens"
                        checked
                        className="rounded border-gray-300 text-blue-600 mr-2"
                      />
                      <label htmlFor="trackOpens" className="text-sm">Track email opens</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="trackClicks"
                        checked
                        className="rounded border-gray-300 text-blue-600 mr-2"
                      />
                      <label htmlFor="trackClicks" className="text-sm">Track link clicks</label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-[#d4af37]/20">
                <CardHeader>
                  <CardTitle className="text-xl">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Account Owner</label>
                    <input
                      type="text"
                      value="Alex Rodriguez"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      readOnly
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value="alex@infinitytech.example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      readOnly
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Account Plan</label>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Business Pro</span>
                      <Button variant="outline" size="sm" className="text-blue-600 border-[#d4af37]/50">
                        Upgrade
                      </Button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full text-blue-600 border-[#d4af37]/50">
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#d4af37]/20">
                <CardHeader>
                  <CardTitle className="text-xl">Connected Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">G</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Google Analytics</h4>
                        <p className="text-sm text-gray-500">Connected</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-500 font-bold">S</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Salesforce</h4>
                        <p className="text-sm text-gray-500">Not connected</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      Connect
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">W</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Website Tracking</h4>
                        <p className="text-sm text-gray-500">Connected</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientPortal;