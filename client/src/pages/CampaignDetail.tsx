import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Calendar, Users, Activity, Mail, Clock, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface Campaign {
  id: number;
  name: string;
  subtitle: string;
  subject?: string;
  status: {
    label: string;
    color: string;
  };
  recipients: number;
  openRate: number;
  clickRate: number;
  date: string;
  icon: {
    name: string;
    color: string;
  };
  content?: string;
  sendTime?: string;
  segmentName?: string;
  bounceRate?: number;
  unsubscribeRate?: number;
}

const CampaignDetail = () => {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const campaignId = parseInt(params?.id || '0', 10);
  
  // First try to get the specific campaign
  const { data: campaign, isLoading: isLoadingCampaign, error: campaignError } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
    enabled: !!campaignId,
    retry: 1,  // Only retry once
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  
  // Fallback: If the specific endpoint doesn't exist, fetch all campaigns and find the one we need
  const { data: allCampaigns, isLoading: isLoadingAll, error: allError } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
    enabled: !!campaignId && (campaignError ? true : false),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  
  // Combined loading and error states
  const isLoading = isLoadingCampaign || isLoadingAll;
  const error = campaignError && allError ? campaignError : null;
  
  // Find the campaign data from either source
  const campaignData = campaign || (allCampaigns ? allCampaigns.find((c: Campaign) => c.id === campaignId) : undefined);
  
  // Effect to refresh campaign data on component mount
  useEffect(() => {
    if (campaignId) {
      // Refresh both specific campaign data and all campaigns list
      queryClient.refetchQueries({ queryKey: [`/api/campaigns/${campaignId}`] });
      queryClient.refetchQueries({ queryKey: ['/api/campaigns'] });
    }
  }, [campaignId]);

  const handleBackClick = () => {
    setLocation('/campaigns');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="outline" onClick={handleBackClick} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
        
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaignData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="outline" onClick={handleBackClick} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
        
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ? `Failed to load campaign: ${error.message}` : 'Campaign not found'}. 
            Please try again or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Helper function to get badge variant based on status
  const getBadgeVariant = (status: string | undefined) => {
    if (!status) return 'outline';
    
    switch (status.toLowerCase()) {
      case 'sent':
      case 'active':
        return 'success';
      case 'scheduled':
      case 'draft':
        return 'warning';
      case 'paused':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="outline" onClick={handleBackClick} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Campaigns
      </Button>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{campaignData.name}</h1>
          <p className="text-muted-foreground">{campaignData.subtitle}</p>
        </div>
        <Badge 
          className="mt-2 sm:mt-0" 
          variant={getBadgeVariant(campaignData.status?.label)}
        >
          {campaignData.status?.label || 'Unknown'}
        </Badge>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-sm text-muted-foreground">Campaign Name:</div>
                  <div className="col-span-2 text-sm font-medium">{campaignData.name}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-sm text-muted-foreground">Subject:</div>
                  <div className="col-span-2 text-sm font-medium">{campaignData.subject || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-sm text-muted-foreground">Date:</div>
                  <div className="col-span-2 text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {campaignData.date}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-sm text-muted-foreground">Recipients:</div>
                  <div className="col-span-2 text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    {campaignData.recipients ? campaignData.recipients.toLocaleString() : '0'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-sm text-muted-foreground">Send Time:</div>
                  <div className="col-span-2 text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    {campaignData.sendTime || 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-sm text-muted-foreground">Segment:</div>
                  <div className="col-span-2 text-sm font-medium">
                    {campaignData.segmentName || 'All Contacts'}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Performance overview for this campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Open Rate</span>
                    <span className="text-sm font-medium">{campaignData.openRate ?? 0}%</span>
                  </div>
                  <Progress value={campaignData.openRate ?? 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Click Rate</span>
                    <span className="text-sm font-medium">{campaignData.clickRate ?? 0}%</span>
                  </div>
                  <Progress value={campaignData.clickRate ?? 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="text-sm font-medium">{campaignData.bounceRate || 0}%</span>
                  </div>
                  <Progress value={campaignData.bounceRate || 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unsubscribe Rate</span>
                    <span className="text-sm font-medium">{campaignData.unsubscribeRate || 0}%</span>
                  </div>
                  <Progress value={campaignData.unsubscribeRate || 0} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setLocation('/email-performance')}>
                  <Activity className="mr-2 h-4 w-4" />
                  View Detailed Analytics
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Campaign Timeline</CardTitle>
              <CardDescription>History and progression of this campaign</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="relative border-l border-border pl-6 pb-2">
                <div className="mb-10 relative">
                  <div className="absolute -left-10 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                    <Mail className="h-3 w-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Campaign Created</p>
                    <p className="text-xs text-muted-foreground">Campaign was set up and configured</p>
                    <p className="text-xs text-muted-foreground">4 days ago</p>
                  </div>
                </div>
                
                <div className="mb-10 relative">
                  <div className="absolute -left-10 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                    <Send className="h-3 w-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Campaign Sent</p>
                    <p className="text-xs text-muted-foreground">Delivered to {campaignData.recipients ? campaignData.recipients.toLocaleString() : '0'} recipients</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-10 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                    <Activity className="h-3 w-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Campaign Completed</p>
                    <p className="text-xs text-muted-foreground">Final results available</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>Comprehensive analytics for this campaign</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Detailed performance metrics will be available in the next version.
                </p>
                <Button variant="outline" onClick={() => setLocation('/email-performance')}>
                  View in Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
              <CardDescription>Preview the content sent in this campaign</CardDescription>
            </CardHeader>
            <CardContent className="border-t pt-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 relative">
                <div className="text-center max-w-3xl mx-auto">
                  {campaignData.content ? (
                    <div dangerouslySetInnerHTML={{ __html: campaignData.content }} />
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold mb-4">{campaignData.name}</h2>
                      <p className="mb-4">
                        Hello subscriber,
                      </p>
                      <p className="mb-4">
                        This is a preview of the email content for the campaign "{campaignData.name}". The actual email content isn't available for display in this preview.
                      </p>
                      <div className="bg-blue-100 text-blue-800 p-4 rounded-lg">
                        <p className="font-medium">To view the actual email content:</p>
                        <p>Please use the email preview tool to see the exact layout and content as received by subscribers.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" className="w-full" onClick={() => setLocation('/email-preview')}>
                View in Email Preview
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignDetail;