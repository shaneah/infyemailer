import React, { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Eye, BarChart, Maximize2, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import HeatMapVisualization from '@/components/HeatMapVisualization';
import EmailInteractionTracker from '@/components/EmailInteractionTracker';

// Get email details and interaction data
const EmailPreviewPage = () => {
  const [, params] = useRoute<{ id: string }>('/email-preview/:id');
  const emailId = params?.id ? parseInt(params.id) : 0;
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const [interactionMode, setInteractionMode] = useState<'view' | 'record'>('view');

  // Get email details
  const { data: email, isLoading: isLoadingEmail } = useQuery({
    queryKey: [`/api/emails/${emailId}`],
    enabled: !!emailId,
  });

  // Get heat map visualization data
  const { data: heatMapData, isLoading: isLoadingHeatMap } = useQuery({
    queryKey: [`/api/heat-maps/emails/${emailId}/heat-map-visualization`],
    enabled: !!emailId && activeTab === 'engagement',
  });

  // Get interaction data points
  const { data: interactionData, isLoading: isLoadingInteractions } = useQuery({
    queryKey: [`/api/heat-maps/emails/${emailId}/interactions`],
    enabled: !!emailId && activeTab === 'interactions',
  });

  if (!emailId) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Invalid Email ID</h1>
        <Button asChild>
          <Link to="/emails">Back to Emails</Link>
        </Button>
      </div>
    );
  }

  if (isLoadingEmail) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Email Not Found</h1>
        <Button asChild>
          <Link to="/emails">Back to Emails</Link>
        </Button>
      </div>
    );
  }

  // Extract campaign ID from the email data
  const campaignId = email.campaignId || 1; // Fallback to 1 if not available

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/emails">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Email Preview</h1>
          {email.status && (
            <Badge variant={email.status === 'active' ? 'default' : 'outline'}>
              {email.status}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{email.name}</CardTitle>
            <CardDescription>
              {email.subject}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">From</p>
              <p className="text-sm text-muted-foreground">{email.senderName} &lt;{email.replyToEmail}&gt;</p>
            </div>
            {email.previewText && (
              <div>
                <p className="text-sm font-medium mb-1">Preview Text</p>
                <p className="text-sm text-muted-foreground">{email.previewText}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-1">Campaign</p>
              <p className="text-sm text-muted-foreground">
                {email.campaignName || 'Unknown Campaign'}
              </p>
            </div>
            {activeTab === 'engagement' && (
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="show-heat-map"
                  checked={showHeatMap}
                  onCheckedChange={setShowHeatMap}
                />
                <Label htmlFor="show-heat-map">Show Heat Map</Label>
              </div>
            )}
            {activeTab === 'preview' && (
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="interaction-mode"
                  checked={interactionMode === 'record'}
                  onCheckedChange={(checked) => setInteractionMode(checked ? 'record' : 'view')}
                />
                <Label htmlFor="interaction-mode">Record Interactions</Label>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="space-y-2 w-full">
              <Button variant="outline" className="w-full">
                <Activity className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full">
                <Maximize2 className="mr-2 h-4 w-4" />
                Full Screen Preview
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Email Preview & Engagement Tabs */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="engagement">
                  <BarChart className="mr-2 h-4 w-4" />
                  Engagement
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-0">
              <TabsContent value="preview" className="m-0">
                <div className="p-6">
                  <div
                    className="border rounded-md overflow-hidden"
                    style={{ height: '600px' }}
                  >
                    {interactionMode === 'record' ? (
                      <EmailInteractionTracker
                        emailId={emailId}
                        campaignId={campaignId}
                        className="w-full h-full overflow-auto"
                      >
                        <ScrollArea className="w-full h-full">
                          <div className="p-4">
                            <div
                              dangerouslySetInnerHTML={{ __html: email.content || '' }}
                              className="prose max-w-none"
                            />
                          </div>
                        </ScrollArea>
                      </EmailInteractionTracker>
                    ) : (
                      <ScrollArea className="w-full h-full">
                        <div className="p-4">
                          <div
                            dangerouslySetInnerHTML={{ __html: email.content || '' }}
                            className="prose max-w-none"
                          />
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                  {interactionMode === 'record' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Interaction recording is active. Your clicks, hovers, and scrolls are being tracked to generate a heat map.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="m-0">
                <div className="p-6">
                  <div
                    className="border rounded-md overflow-hidden"
                    style={{ height: '600px' }}
                  >
                    {isLoadingHeatMap ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {showHeatMap ? (
                          <HeatMapVisualization
                            dataPoints={heatMapData?.dataPoints || []}
                            maxIntensity={heatMapData?.maxIntensity || 0}
                            width={800}
                            height={600}
                            emailContent={email.content}
                            showOverlay={true}
                            className="w-full h-full"
                          />
                        ) : (
                          <ScrollArea className="w-full h-full">
                            <div className="p-4">
                              <div
                                dangerouslySetInnerHTML={{ __html: email.content || '' }}
                                className="prose max-w-none"
                              />
                            </div>
                          </ScrollArea>
                        )}
                      </>
                    )}
                  </div>
                  {heatMapData && !isLoadingHeatMap && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Engagement Statistics</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Card className="bg-gray-50">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Interactions</p>
                            <p className="text-2xl font-bold">{heatMapData.totalInteractions}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-50">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Click Hotspots</p>
                            <p className="text-2xl font-bold">
                              {heatMapData.dataPoints?.filter(d => d.type === 'click').length || 0}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-50">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Engagement Score</p>
                            <p className="text-2xl font-bold">
                              {heatMapData.totalInteractions > 0 ? 
                                Math.min(100, Math.round((heatMapData.totalInteractions / 10) * 100)) : 0}%
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default EmailPreviewPage;