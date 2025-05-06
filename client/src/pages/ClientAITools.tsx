import { useState } from 'react';
import ClientLayout from '@/components/layouts/ClientLayout';
import ClientHeader from '@/components/headers/ClientHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Zap, Wand2 } from 'lucide-react';
import { useClientSession } from '@/hooks/use-client-session';
import SubjectLineGenerator from '@/components/ai-tools/SubjectLineGenerator';
import ContentOptimization from '@/components/ai-tools/ContentOptimization';
import { cn } from '@/lib/utils';

export default function ClientAITools() {
  // We can use the session hook but don't need to pass clientId to components
  const { clientId: _ } = useClientSession();
  const [activeTab, setActiveTab] = useState('subject-lines');
  
  // Feature cards that will be displayed
  const aiFeatures = [
    {
      id: 'subject-lines',
      title: 'Subject Line Generator',
      description: 'Create high-performing email subject lines optimized for your audience',
      icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
      component: <SubjectLineGenerator />
    },
    {
      id: 'content-optimization',
      title: 'Content Optimization',
      description: 'Enhance your email content for better engagement and conversions',
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      component: <ContentOptimization />
    },
    {
      id: 'campaign-insights',
      title: 'Campaign Insights',
      description: 'Generate data-driven insights about your campaign performance',
      icon: <Wand2 className="h-5 w-5 text-emerald-500" />,
      component: <ComingSoonFeature title="Campaign Insights" />
    }
  ];
  
  return (
    <ClientLayout>
      <ClientHeader
        title="AI Tools"
        description="Leverage AI to enhance your email marketing campaigns"
        icon={<Sparkles className="h-6 w-6" />}
      />
      
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto p-0 bg-transparent mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-3">
              {aiFeatures.map((feature) => (
                <TabsTrigger
                  key={feature.id}
                  value={feature.id}
                  className={cn(
                    "w-full text-left h-auto flex flex-col items-start p-4 border rounded-lg space-y-1.5",
                    activeTab === feature.id 
                      ? "bg-indigo-50 border-indigo-200" 
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <span className="font-medium text-base">{feature.title}</span>
                  </div>
                  <span className="text-xs text-gray-500 pl-7">{feature.description}</span>
                </TabsTrigger>
              ))}
            </div>
          </TabsList>
          
          {aiFeatures.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="mt-0">
              {feature.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ClientLayout>
  );
}

// A simple component to show for features that are coming soon
function ComingSoonFeature({ title }: { title: string }) {
  return (
    <div className="h-80 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center p-6 text-center">
      <Wand2 className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4 max-w-md">
        We're working on making this feature available to you soon. Stay tuned for updates!
      </p>
      <div className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
        Coming Soon
      </div>
    </div>
  );
}