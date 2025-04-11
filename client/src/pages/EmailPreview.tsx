import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, ChevronLeft, Info, Bar, BarChart, Eye, MousePointer, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import HeatMapVisualization from '@/components/HeatMapVisualization';
import EmailInteractionTracker from '@/components/EmailInteractionTracker';

type EmailPreviewParams = {
  id: string;
};

const EmailPreview = () => {
  const { id } = useParams<EmailPreviewParams>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const emailId = parseInt(id, 10);

  // Fetch email data
  const {
    data: email,
    isLoading: emailLoading,
    error: emailError
  } = useQuery({
    queryKey: [`/api/emails/${emailId}`],
    enabled: !!emailId && !isNaN(emailId),
  });

  // Fetch heat map data
  const {
    data: heatMapData,
    isLoading: heatMapLoading,
    error: heatMapError,
    refetch: refetchHeatMap
  } = useQuery({
    queryKey: [`/api/heat-maps/emails/${emailId}/heat-map-visualization`],
    enabled: !!emailId && !isNaN(emailId),
  });

  // Get campaign data if available
  const {
    data: campaign,
    isLoading: campaignLoading,
    error: campaignError
  } = useQuery({
    queryKey: [`/api/campaigns/${email?.campaignId}`],
    enabled: !!email?.campaignId,
  });

  // Go back to previous page
  const handleBack = () => {
    navigate('/emails');
  };

  // Toggle between real and demo mode
  const toggleDemoMode = () => {
    setDemoMode(!demoMode);
    
    if (!demoMode) {
      toast({
        title: 'Demo Mode Activated',
        description: 'You are now viewing simulated interaction data.',
        variant: 'default',
      });
    } else {
      toast({
        title: 'Real Data Mode',
        description: 'You are now viewing actual interaction data.',
        variant: 'default',
      });
    }
  };

  if (emailLoading || campaignLoading || heatMapLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (emailError) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load email data. Please try again later.
        </AlertDescription>
        <Button onClick={handleBack} variant="outline" size="sm" className="mt-2">
          <ChevronLeft className="h-4 w-4 mr-1" /> Go Back
        </Button>
      </Alert>
    );
  }

  // Set defaults for content if not available
  const getStatusColor = (status: string) => {
    if (status === 'sent') return 'success';
    if (status === 'draft') return 'secondary';
    if (status === 'scheduled') return 'warning';
    if (status === 'active') return 'primary';
    return 'secondary';
  };

  const renderEmailSummary = () => {
    return (
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl">{email?.name || 'Email Preview'}</CardTitle>
            <CardDescription className="text-md">
              {email?.subject || 'No subject provided'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`bg-${getStatusColor(email?.status || 'draft')}-50 text-${getStatusColor(email?.status || 'draft')}-600 border-${getStatusColor(email?.status || 'draft')}-200`}>
              {email?.status?.charAt(0).toUpperCase() + email?.status?.slice(1) || 'Draft'}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">From</p>
              <p className="text-sm font-medium">{email?.senderName || 'Unknown'} &lt;{email?.replyToEmail || 'no-reply@example.com'}&gt;</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Preview Text</p>
              <p className="text-sm font-medium">{email?.previewText ? 
                (email.previewText.length > 50 ? `${email.previewText.substring(0, 50)}...` : email.previewText) : 
                'No preview text provided'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Campaign</p>
              <p className="text-sm font-medium">{campaign?.name || email?.campaignName || 'Not associated with a campaign'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{email?.createdAt ? new Date(email.createdAt).toLocaleDateString() : 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDemoStats = () => {
    if (!demoMode) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-md flex items-center">
            <Info className="h-4 w-4 text-blue-500 mr-2" />
            Demo Mode Statistics
          </CardTitle>
          <CardDescription>
            These metrics are simulated for demonstration purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Views</p>
              </div>
              <p className="text-2xl font-bold">128</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Clicks</p>
              </div>
              <p className="text-2xl font-bold">43</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Engagement</p>
              </div>
              <p className="text-2xl font-bold">33.6%</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Avg. Time</p>
              </div>
              <p className="text-2xl font-bold">48s</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEmailContent = () => {
    if (!email?.content) {
      return (
        <Alert className="max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Content</AlertTitle>
          <AlertDescription>
            This email does not have any HTML content to display.
          </AlertDescription>
        </Alert>
      );
    }

    // Sanitized content rendering
    return (
      <div 
        className="border rounded-md p-0 overflow-hidden" 
        style={{ maxWidth: '100%' }}
      >
        {activeTab === 'preview' && !demoMode && (
          <iframe 
            srcDoc={email.content}
            title="Email preview"
            className="w-full h-[800px] bg-white"
            style={{ border: 'none' }}
          />
        )}
        
        {activeTab === 'preview' && demoMode && (
          <EmailInteractionTracker 
            emailId={emailId}
            campaignId={email.campaignId || 0}
            className="w-full h-[800px] bg-white overflow-auto"
          >
            <div dangerouslySetInnerHTML={{ __html: email.content }} />
          </EmailInteractionTracker>
        )}
        
        {activeTab === 'heatmap' && (
          <div className="p-4 bg-white">
            <HeatMapVisualization 
              data={{
                dataPoints: heatMapData?.dataPoints || [],
                maxIntensity: heatMapData?.maxIntensity || 0
              }}
              emailContent={email.content}
              width="100%"
              height={800}
            />
            
            <div className="mt-6 p-4 border-t">
              <h3 className="font-medium mb-2">Heat Map Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Interactions</p>
                    <p className="text-3xl font-bold">{heatMapData?.totalInteractions || 0}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Interaction Types</p>
                    <div className="mt-2">
                      {(heatMapData?.dataPoints || []).reduce((acc, d) => {
                        acc[d.type] = (acc[d.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {heatMapData?.totalInteractions === 0 && (
              <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertTitle>No interaction data yet</AlertTitle>
                <AlertDescription>
                  Enable demo mode to see how the heat map would look with interaction data.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {activeTab === 'code' && (
          <pre className="p-4 bg-slate-50 overflow-auto text-sm font-mono h-[800px]">
            {email.content}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      {renderEmailSummary()}
      
      <div className="flex justify-between items-center mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
            <TabsTrigger value="code">HTML Code</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={demoMode ? "secondary" : "outline"} 
                size="sm" 
                onClick={toggleDemoMode}
                className="ml-4"
              >
                {demoMode ? "Exit Demo Mode" : "Demo Mode"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Demo mode lets you interact with the email to generate heat map data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {demoMode && renderDemoStats()}
      
      {renderEmailContent()}
    </div>
  );
};

export default EmailPreview;