import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import ClientLayout from '@/components/layouts/ClientLayout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Sparkles,
  Lightbulb,
  FileText,
  BarChart2,
  MessageSquare,
  Share2,
  User,
} from 'lucide-react';
import ClientHeader from '@/components/headers/ClientHeader';
import SubjectLineGenerator from '@/components/ai-tools/SubjectLineGenerator';
import ContentOptimization from '@/components/ai-tools/ContentOptimization';
import { useClientSession } from '@/hooks/use-client-session';

export default function ClientAITools() {
  const { clientId } = useClientSession();
  const [activeTab, setActiveTab] = useState('subject-lines');

  return (
    <ClientLayout>
      <Helmet>
        <title>AI Tools | Client Portal</title>
      </Helmet>
      
      <ClientHeader
        title="AI Marketing Tools"
        description="Leverage AI to enhance your email marketing campaigns"
        icon={<Sparkles className="h-6 w-6" />}
      />
      
      <div className="grid grid-cols-1 gap-6">
        <Tabs defaultValue="subject-lines" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-white p-1 border">
            <TabsTrigger value="subject-lines" className="flex items-center gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-900">
              <FileText className="h-4 w-4" />
              <span>Subject Lines</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-900">
              <Lightbulb className="h-4 w-4" />
              <span>Content Optimization</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-900" disabled>
              <BarChart2 className="h-4 w-4" />
              <span>Analytics Insight</span>
            </TabsTrigger>
            <TabsTrigger value="personalization" className="flex items-center gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-900" disabled>
              <User className="h-4 w-4" />
              <span>Personalization</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-900" disabled>
              <MessageSquare className="h-4 w-4" />
              <span>AI Assistant</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="bg-white rounded-lg border p-6">
            <TabsContent value="subject-lines" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Email Subject Line Generator</h3>
                  <p className="text-muted-foreground text-sm">
                    Generate attention-grabbing subject lines that boost open rates. Our AI analyzes successful campaigns and adapts to your brand voice.
                  </p>
                </div>
                
                <SubjectLineGenerator clientId={clientId || undefined} />
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Content Optimization</h3>
                  <p className="text-muted-foreground text-sm">
                    Enhance your email content for better engagement and conversions. Our AI helps refine your message to maximize impact.
                  </p>
                </div>
                
                <ContentOptimization clientId={clientId || undefined} />
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <div className="flex items-center justify-center p-12 text-center text-muted-foreground">
                <div className="max-w-md">
                  <BarChart2 className="h-12 w-12 mx-auto mb-4 text-indigo-200" />
                  <h3 className="text-lg font-medium mb-2">Analytics Insight (Coming Soon)</h3>
                  <p>
                    Get AI-powered insights from your campaign analytics to understand what works and why. Identify trends and opportunities for improvement.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="personalization" className="mt-0">
              <div className="flex items-center justify-center p-12 text-center text-muted-foreground">
                <div className="max-w-md">
                  <User className="h-12 w-12 mx-auto mb-4 text-indigo-200" />
                  <h3 className="text-lg font-medium mb-2">Personalization Tools (Coming Soon)</h3>
                  <p>
                    Create personalized content at scale with AI. Generate custom content variations tailored to different audience segments.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="assistant" className="mt-0">
              <div className="flex items-center justify-center p-12 text-center text-muted-foreground">
                <div className="max-w-md">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-indigo-200" />
                  <h3 className="text-lg font-medium mb-2">AI Marketing Assistant (Coming Soon)</h3>
                  <p>
                    Chat with our AI marketing assistant to get real-time help with campaign strategy, content ideas, and best practices.
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ClientLayout>
  );
}