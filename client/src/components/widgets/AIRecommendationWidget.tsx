import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, ArrowRight, BarChart2, Users, Clock, LineChart } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';

interface AIRecommendationWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

interface Recommendation {
  id: string;
  category: 'content' | 'timing' | 'audience' | 'performance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  aiConfidence: number; // 0-100
  suggestedAction: string;
  applied: boolean;
}

const AIRecommendationWidget: React.FC<AIRecommendationWidgetProps> = ({ widget, onRemove }) => {
  // Sample recommendations data
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      category: 'content',
      title: 'Subject Line Optimization',
      description: 'Your subject lines with 6-10 words have 25% higher open rates than shorter or longer ones.',
      impact: 'high',
      aiConfidence: 92,
      suggestedAction: 'Aim for 6-10 word subject lines in upcoming campaigns',
      applied: false
    },
    {
      id: '2',
      category: 'timing',
      title: 'Optimal Send Window',
      description: 'Sending emails between 10-11am on Tuesdays has yielded 18% higher engagement than your average send time.',
      impact: 'high',
      aiConfidence: 89,
      suggestedAction: 'Schedule important campaigns for Tuesday mornings',
      applied: false
    },
    {
      id: '3',
      category: 'audience',
      title: 'Segment dormant subscribers',
      description: '2,345 subscribers have not opened your emails in 90+ days. Creating a re-engagement campaign for this segment could recover up to 15% of these contacts.',
      impact: 'high',
      aiConfidence: 89,
      suggestedAction: 'Create a "Win-back" campaign for dormant subscribers',
      applied: false
    },
    {
      id: '4',
      category: 'performance',
      title: 'Content Length Analysis',
      description: 'Emails with 150-200 words perform 15% better in terms of click-through rates compared to longer content.',
      impact: 'medium',
      aiConfidence: 85,
      suggestedAction: 'Keep email content concise and focus on key messages',
      applied: false
    },
    {
      id: '5',
      category: 'content',
      title: 'CTA Button Analysis',
      description: 'Green CTA buttons with action-oriented text ("Get Started" vs "Learn More") have a 22% higher click rate.',
      impact: 'medium',
      aiConfidence: 83,
      suggestedAction: 'Update email templates with action-oriented green CTA buttons',
      applied: false
    }
  ]);

  const [activeTab, setActiveTab] = useState<string>('all');

  const handleApplyRecommendation = (id: string) => {
    setRecommendations(
      recommendations.map(rec => 
        rec.id === id ? { ...rec, applied: true } : rec
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return <Sparkles className="h-4 w-4" />;
      case 'timing':
        return <Clock className="h-4 w-4" />;
      case 'audience':
        return <Users className="h-4 w-4" />;
      case 'performance':
        return <LineChart className="h-4 w-4" />;
      default:
        return <BarChart2 className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const filteredRecommendations = activeTab === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === activeTab);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <CardTitle>{widget.title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onRemove(widget.id)}>
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
        <CardDescription>
          AI-powered marketing recommendations based on your campaign data and industry trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0 space-y-4">
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No recommendations available in this category
              </div>
            ) : (
              filteredRecommendations.map(recommendation => (
                <div key={recommendation.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(recommendation.category)}
                      <h3 className="font-medium">{recommendation.title}</h3>
                    </div>
                    <Badge className={getImpactColor(recommendation.impact)}>
                      {recommendation.impact.charAt(0).toUpperCase() + recommendation.impact.slice(1)} Impact
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {recommendation.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>AI Confidence: {recommendation.aiConfidence}%</span>
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${recommendation.aiConfidence}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium">
                      Suggested action: {recommendation.suggestedAction}
                    </span>
                    <Button 
                      size="sm" 
                      variant={recommendation.applied ? "outline" : "default"}
                      onClick={() => handleApplyRecommendation(recommendation.id)}
                      disabled={recommendation.applied}
                    >
                      {recommendation.applied ? "Applied" : "Apply"}
                      {!recommendation.applied && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIRecommendationWidget;