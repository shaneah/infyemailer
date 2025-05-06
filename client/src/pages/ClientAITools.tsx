import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Sparkles, Zap, Lightbulb, MessageSquare, Text, Bot } from "lucide-react";
import SubjectLineGenerator from "@/components/ai-tools/SubjectLineGenerator";
import ContentOptimization from "@/components/ai-tools/ContentOptimization";
import { Badge } from "@/components/ui/badge";
import ClientHeader from "@/components/headers/ClientHeader";
import { Button } from "@/components/ui/button";
import { useClientSession } from "@/hooks/use-client-session";

export default function ClientAITools() {
  const { clientId, clientData } = useClientSession();
  const [activeTab, setActiveTab] = useState<string>("subject-lines");
  const [sampleContent, setSampleContent] = useState<string>(
    "Welcome to our monthly newsletter! We are excited to share our latest updates with you. Our team has been working hard to bring you new features and improvements. Stay tuned for more updates. Click here to learn more about our services."
  );
  
  if (!clientId) {
    // Redirect or handle unauthorized access
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Update sample content with client name if available
  useEffect(() => {
    if (clientData?.clientName) {
      setSampleContent(prev => prev.replace("Welcome to our monthly newsletter!", `Welcome to the ${clientData.clientName} monthly newsletter!`));
    }
  }, [clientData]);

  return (
    <ClientLayout>
      <Helmet>
        <title>AI Marketing Tools | InfyMail</title>
      </Helmet>

      <div className="space-y-8">
        <ClientHeader
          title="AI Marketing Tools"
          description="Leverage AI to optimize your email marketing campaigns"
          icon={<Sparkles className="h-5 w-5" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Zap className="h-5 w-5 text-blue-600" />
                AI-Powered Email Marketing
              </CardTitle>
              <CardDescription className="text-blue-700">
                Use artificial intelligence to improve your email campaigns with intelligent
                subject lines, content optimization, and performance insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-3">
                    <Text className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-1">Smart Subject Lines</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Generate high-performing subject lines tailored to your audience and campaign
                    goals.
                  </p>
                  <Badge className="mt-auto" variant="outline">
                    Boosts open rates by 35%
                  </Badge>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-3">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-1">Content Optimization</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Get AI recommendations to enhance your content and fix potential issues.
                  </p>
                  <Badge className="mt-auto" variant="outline">
                    Increases engagement
                  </Badge>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-3">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-1">AI Assistant</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Coming soon: Chat with our AI assistant to get marketing advice and insights.
                  </p>
                  <Badge variant="secondary" className="mt-auto">
                    Coming soon
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger
                  value="subject-lines"
                  className="flex items-center gap-2 data-[state=active]:bg-white"
                >
                  <Text className="h-4 w-4" />
                  Subject Line Generator
                </TabsTrigger>
                <TabsTrigger
                  value="content-optimization"
                  className="flex items-center gap-2 data-[state=active]:bg-white"
                >
                  <Lightbulb className="h-4 w-4" />
                  Content Optimization
                </TabsTrigger>
              </TabsList>

              <TabsContent value="subject-lines" className="space-y-6 pt-2">
                <SubjectLineGenerator
                  clientId={clientId}
                  initialContent={sampleContent}
                  onSelect={(subject) => console.log("Selected subject:", subject)}
                />
              </TabsContent>

              <TabsContent value="content-optimization" className="space-y-6 pt-2">
                <ContentOptimization
                  clientId={clientId}
                  content={sampleContent}
                  onUpdate={(content) => setSampleContent(content)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}