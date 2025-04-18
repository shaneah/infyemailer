import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, RefreshCw, Sparkles, Brain, AlertCircle, TrendingUp, 
  Clock, Users, BarChart, Mail, Lightbulb, ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Widget } from '@/hooks/useWidgets';

interface AIRecommendationWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

const AIRecommendationWidget: React.FC<AIRecommendationWidgetProps> = ({ widget, onRemove }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

  // Mock data - in a real application, this would come from an API call
  const mockRecommendations: Recommendation[] = [
    {
      id: '1',
      category: 'content',
      title: 'Optimize email subject lines',
      description: 'Your subject lines are averaging 8.2 words. Our analysis shows that shorter subject lines (4-6 words) could improve open rates by up to 12%.',
      impact: 'high',
      aiConfidence: 91,
      suggestedAction: 'Shorten subject lines to 4-6 words and use action verbs',
      applied: false
    },
    {
      id: '2',
      category: 'timing',
      title: 'Adjust send times',
      description: 'Based on your audience engagement patterns, sending emails on Tuesdays at 10 AM instead of Mondays at 9 AM could increase open rates by 7.3%.',
      impact: 'medium',
      aiConfidence: 83,
      suggestedAction: 'Reschedule upcoming campaigns to Tuesday at 10 AM',
      applied: false
    },
    {
      id: '3',
      category: 'audience',
      title: 'Segment dormant subscribers',
      description: '2,345 subscribers haven't opened your emails in 90+ days. Creating a re-engagement campaign for this segment could recover up to 15% of these contacts.',
      impact: 'high',
      aiConfidence: 89,
      suggestedAction: 'Create a "Win-back" campaign for dormant subscribers',
      applied: false
    },
    {
      id: '4',
      category: 'performance',
      title: 'Optimize CTAs',
      description: 'Emails with a single, prominent call-to-action have 42% higher click rates than those with multiple CTAs. Consider simplifying your CTA strategy.',
      impact: 'medium',
      aiConfidence: 86,
      suggestedAction: 'Redesign templates to include a single primary CTA',
      applied: false
    },
    {
      id: '5',
      category: 'content',
      title: 'Personalize greeting lines',
      description: 'Only 68% of your emails include personalized greeting lines. Implementing personalization could increase engagement by up to 9.5%.',
      impact: 'medium',
      aiConfidence: 78,
      suggestedAction: 'Update templates to include personalized greetings',
      applied: false
    }
  ];

  useEffect(() => {
    // In a real app, we would make an API call here
    setRecommendations(mockRecommendations);
  }, []);

  const generateRecommendations = () => {
    setLoading(true);
    setTimeout(() => {
      setRecommendations(mockRecommendations.map(rec => ({...rec, applied: false})));
      setLoading(false);
    }, 1500);
  };

  const handleApplyRecommendation = (id: string) => {
    setRecommendations(
      recommendations.map(rec => 
        rec.id === id ? {...rec, applied: true} : rec
      )
    );
  };

  const applyAllRecommendations = () => {
    setRecommendations(
      recommendations.map(rec => ({...rec, applied: true}))
    );
  };

  const filteredRecommendations = activeCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === activeCategory);

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'content': return <Mail className="h-4 w-4" />;
      case 'timing': return <Clock className="h-4 w-4" />;
      case 'audience': return <Users className="h-4 w-4" />;
      case 'performance': return <BarChart className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="rounded-lg shadow-lg overflow-hidden border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-white" />
          <CardTitle className="text-lg font-semibold">{widget.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                  onClick={generateRecommendations}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh recommendations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                  onClick={() => onRemove(widget.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove widget</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Badge
                onClick={() => setActiveCategory('all')}
                className={`cursor-pointer px-3 py-1 ${
                  activeCategory === 'all'
                    ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </Badge>
              <Badge
                onClick={() => setActiveCategory('content')}
                className={`cursor-pointer px-3 py-1 flex items-center gap-1 ${
                  activeCategory === 'content'
                    ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Mail className="h-3 w-3" /> Content
              </Badge>
              <Badge
                onClick={() => setActiveCategory('timing')}
                className={`cursor-pointer px-3 py-1 flex items-center gap-1 ${
                  activeCategory === 'timing'
                    ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Clock className="h-3 w-3" /> Timing
              </Badge>
              <Badge
                onClick={() => setActiveCategory('audience')}
                className={`cursor-pointer px-3 py-1 flex items-center gap-1 ${
                  activeCategory === 'audience'
                    ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Users className="h-3 w-3" /> Audience
              </Badge>
              <Badge
                onClick={() => setActiveCategory('performance')}
                className={`cursor-pointer px-3 py-1 flex items-center gap-1 ${
                  activeCategory === 'performance'
                    ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BarChart className="h-3 w-3" /> Performance
              </Badge>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="mb-4 bg-white hover:bg-indigo-50 text-indigo-600 border-indigo-200"
            onClick={applyAllRecommendations}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Apply All Recommendations
          </Button>

          <AnimatePresence>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mb-2" />
                  <p className="text-sm text-gray-500">Analyzing your campaign data...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecommendations.map(recommendation => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          recommendation.category === 'content' ? 'bg-blue-100 text-blue-600' :
                          recommendation.category === 'timing' ? 'bg-purple-100 text-purple-600' :
                          recommendation.category === 'audience' ? 'bg-green-100 text-green-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {getCategoryIcon(recommendation.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{recommendation.title}</h3>
                            <Badge className={`${getImpactColor(recommendation.impact)}`}>
                              {recommendation.impact.charAt(0).toUpperCase() + recommendation.impact.slice(1)} Impact
                            </Badge>
                            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">
                              {recommendation.aiConfidence}% Confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Suggestion: {recommendation.suggestedAction}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <Button 
                        size="sm"
                        variant={recommendation.applied ? "outline" : "default"}
                        className={recommendation.applied 
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                          : "bg-indigo-600 text-white hover:bg-indigo-700"}
                        onClick={() => handleApplyRecommendation(recommendation.id)}
                        disabled={recommendation.applied}
                      >
                        {recommendation.applied ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Applied
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-1" />
                            Apply Now
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {filteredRecommendations.length === 0 && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No recommendations found</h3>
                    <p className="text-gray-500">
                      {activeCategory === 'all' 
                        ? 'We don't have any recommendations for you at the moment.' 
                        : `We don't have any ${activeCategory} recommendations right now.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendationWidget;