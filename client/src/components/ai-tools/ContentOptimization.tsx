import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  RotateCcw, 
  LoaderCircle, 
  CheckCircle2, 
  AlertCircle,
  LightbulbIcon,
  PencilIcon,
  Zap,
  ArrowRight,
  Info,
  Megaphone,
  Target
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Optimization goal options
const goalOptions = [
  { value: 'engagement', label: 'Increase Engagement', icon: <Zap className="h-4 w-4 text-amber-500" /> },
  { value: 'conversion', label: 'Improve Conversions', icon: <Target className="h-4 w-4 text-green-500" /> },
  { value: 'clarity', label: 'Enhance Clarity', icon: <LightbulbIcon className="h-4 w-4 text-blue-500" /> },
  { value: 'persuasion', label: 'Boost Persuasiveness', icon: <Megaphone className="h-4 w-4 text-violet-500" /> },
];

// Sample improvement suggestions
const improvementCategories = [
  { 
    id: 'structure',
    title: 'Content Structure',
    description: 'How your content is organized and formatted',
    icon: <PencilIcon className="h-5 w-5 text-blue-500" />
  },
  { 
    id: 'persuasion',
    title: 'Persuasive Elements',
    description: 'Compelling aspects that drive action',
    icon: <Megaphone className="h-5 w-5 text-violet-500" />
  },
  { 
    id: 'clarity',
    title: 'Clarity & Readability',
    description: 'How easily the content can be understood',
    icon: <LightbulbIcon className="h-5 w-5 text-amber-500" />
  },
  { 
    id: 'optimization',
    title: 'Optimization Tactics',
    description: 'Strategic improvements for better performance',
    icon: <Target className="h-5 w-5 text-green-500" />
  },
];

interface Suggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  before?: string;
  after?: string;
}

interface AnalysisResult {
  score: number;
  suggestions: Suggestion[];
  summary?: string;
  strengths?: string[];
  enhancedContent?: string;
}

export default function ContentOptimization() {
  const [emailContent, setEmailContent] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('engagement');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  // Analyze the content
  const handleAnalyze = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Missing content",
        description: "Please provide some email content to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/optimize-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: emailContent,
          goal: selectedGoal,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }
      
      const data = await response.json();
      setAnalysisResult(data);
      setActiveTab('analysis');
      
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your content. Please try again.",
        variant: "destructive",
      });
      
      // Sample data for demonstration
      setAnalysisResult({
        score: 68,
        suggestions: [
          {
            id: 'struct-1',
            category: 'structure',
            title: 'Add clear section headings',
            description: 'Breaking up your content with descriptive headings improves scannability and helps readers find information quickly.',
            impact: 'medium',
          },
          {
            id: 'pers-1',
            category: 'persuasion',
            title: 'Strengthen your call-to-action',
            description: 'Your current CTA doesn\'t create enough urgency. Consider adding time-sensitive language.',
            impact: 'high',
            before: 'Click here to learn more about our service.',
            after: 'Get started today – limited spots available this month!',
          },
          {
            id: 'clar-1',
            category: 'clarity',
            title: 'Simplify complex sentences',
            description: 'Several sentences exceed 25 words, making them difficult to process quickly.',
            impact: 'medium',
          },
          {
            id: 'opt-1',
            category: 'optimization',
            title: 'Add personalization tokens',
            description: 'Including the recipient\'s name can increase engagement by 26%.',
            impact: 'high',
          },
        ],
        strengths: [
          'Strong brand voice throughout',
          'Good use of bullet points in product section',
          'Appropriate length for an promotional email'
        ],
        summary: 'Your email has good elements but needs improvements in clarity and persuasion to maximize engagement. Focus on strengthening your call-to-action and simplifying complex sentences for better results.'
      });
      setActiveTab('analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setEmailContent('');
    setSelectedGoal('engagement');
    setAnalysisResult(null);
    setActiveTab('content');
  };

  // Apply the suggested improvements
  const handleApplyImprovements = async () => {
    if (!analysisResult) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/apply-content-improvements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: emailContent,
          goal: selectedGoal,
          suggestions: analysisResult.suggestions.map(s => s.id)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply improvements');
      }
      
      const data = await response.json();
      
      // Update analysis result with enhanced content
      setAnalysisResult({
        ...analysisResult,
        enhancedContent: data.enhancedContent
      });
      
      setActiveTab('enhanced');
      
      toast({
        title: "Improvements applied",
        description: "Your content has been enhanced based on the suggestions.",
      });
      
    } catch (error) {
      console.error('Error applying improvements:', error);
      toast({
        title: "Process failed",
        description: "There was an error enhancing your content. Please try again.",
        variant: "destructive",
      });
      
      // Sample enhanced content for demonstration
      setAnalysisResult({
        ...analysisResult,
        enhancedContent: `# Special Offer This Month Only!

Dear [Customer Name],

We're excited to bring you our latest product innovations that will transform your workflow.

## What's New
* Automated task management that saves you 5+ hours weekly
* Intuitive dashboard with real-time analytics
* Mobile integration for on-the-go productivity

## Why It Matters
Teams using our platform report a 34% increase in productivity and 28% reduction in administrative costs.

Get started today – limited spots available this month!

Best regards,
The Product Team`
      });
      
      setActiveTab('enhanced');
    } finally {
      setIsLoading(false);
    }
  };

  // Get the impact badge color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Get the score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <CardTitle>Email Content Optimization</CardTitle>
        </div>
        <CardDescription>
          Analyze and improve your email content to achieve better results.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!analysisResult}>
              Analysis
            </TabsTrigger>
            <TabsTrigger value="enhanced" disabled={!analysisResult?.enhancedContent}>
              Enhanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-0">
            <div className="space-y-6">
              <div>
                <Label htmlFor="email-content" className="text-base font-medium block mb-2">
                  Email Content
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="email-content"
                  placeholder="Paste your email content here..."
                  className="min-h-[300px] resize-y"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  For best results, include the full content of your email including subject line, headings, and CTA.
                </p>
              </div>

              <div>
                <Label className="text-base font-medium block mb-3">
                  Optimization Goal
                </Label>
                <RadioGroup 
                  value={selectedGoal} 
                  onValueChange={setSelectedGoal}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {goalOptions.map((goal) => (
                    <div key={goal.value} className="flex items-start space-x-2">
                      <RadioGroupItem 
                        value={goal.value} 
                        id={`goal-${goal.value}`} 
                        className="mt-1"
                      />
                      <Label 
                        htmlFor={`goal-${goal.value}`}
                        className="font-normal cursor-pointer flex flex-col"
                      >
                        <span className="flex items-center gap-1.5">
                          {goal.icon}
                          <span className="font-medium">{goal.label}</span>
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Alert className="bg-blue-50 border-blue-100">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 ml-2">Optimization Tip</AlertTitle>
                <AlertDescription className="text-blue-700 ml-6">
                  For the goal "{goalOptions.find(g => g.value === selectedGoal)?.label}", focus on clear benefits and a compelling call-to-action.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-0">
            {analysisResult && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Content Analysis</h3>
                    <p className="text-sm text-gray-500">
                      Optimizing for: {goalOptions.find(g => g.value === selectedGoal)?.label}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm text-gray-500">Overall Score</h4>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(analysisResult.score)}`}>
                      {analysisResult.score}/100
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Score Breakdown</p>
                  <Progress value={analysisResult.score} className="h-2 w-full" />
                </div>
                
                {analysisResult.summary && (
                  <Alert className="bg-indigo-50 border-indigo-100">
                    <AlertDescription className="text-indigo-800 font-medium">
                      {analysisResult.summary}
                    </AlertDescription>
                  </Alert>
                )}
                
                {analysisResult.strengths && analysisResult.strengths.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Content Strengths
                    </h4>
                    <ul className="ml-6 space-y-1">
                      {analysisResult.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-700 list-disc">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Improvement Suggestions
                  </h4>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {improvementCategories.map(category => {
                      const categorySuggestions = analysisResult.suggestions.filter(
                        s => s.category === category.id
                      );
                      
                      if (categorySuggestions.length === 0) return null;
                      
                      return (
                        <AccordionItem value={category.id} key={category.id}>
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-2">
                              {category.icon}
                              <div className="text-left">
                                <p className="font-medium">{category.title}</p>
                                <p className="text-xs text-gray-500">{category.description}</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-3">
                            <div className="space-y-4">
                              {categorySuggestions.map((suggestion) => (
                                <div 
                                  key={suggestion.id} 
                                  className="p-3 bg-gray-50 border border-gray-100 rounded-md"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                                    <div 
                                      className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(suggestion.impact)}`}
                                    >
                                      {suggestion.impact.charAt(0).toUpperCase() + suggestion.impact.slice(1)} Impact
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                                  
                                  {suggestion.before && suggestion.after && (
                                    <div className="mt-3 space-y-2">
                                      <div className="bg-white border-l-2 border-red-300 p-2 text-sm">
                                        <div className="text-xs text-red-600 font-medium mb-1">Current Version:</div>
                                        {suggestion.before}
                                      </div>
                                      
                                      <div className="flex justify-center">
                                        <ArrowRight className="text-gray-400 h-5 w-5" />
                                      </div>
                                      
                                      <div className="bg-white border-l-2 border-green-300 p-2 text-sm">
                                        <div className="text-xs text-green-600 font-medium mb-1">Suggested Improvement:</div>
                                        {suggestion.after}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="enhanced" className="mt-0">
            {analysisResult?.enhancedContent ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Enhanced Content</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(analysisResult.enhancedContent || '');
                      toast({
                        title: "Copied to clipboard",
                        description: "Enhanced content has been copied to your clipboard.",
                        duration: 2000,
                      });
                    }}
                  >
                    Copy All
                  </Button>
                </div>
                
                <div className="p-4 bg-white border rounded-md whitespace-pre-line text-gray-800">
                  {analysisResult.enhancedContent}
                </div>
                
                <Alert className="bg-green-50 border-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 ml-2">
                    This enhanced version improves on key areas identified in our analysis while maintaining your original message.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No enhanced content available yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab('analysis')}>
                  Return to Analysis
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t px-6 py-4">
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={isLoading}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          
          {activeTab === 'content' ? (
            <Button 
              onClick={handleAnalyze}
              disabled={isLoading || !emailContent.trim()}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Content
                </>
              )}
            </Button>
          ) : activeTab === 'analysis' ? (
            <Button 
              onClick={handleApplyImprovements}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Apply Improvements
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={() => setActiveTab('content')}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Optimize New Content
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}