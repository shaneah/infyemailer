import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
import { Sparkles, Copy, ThumbsUp, ThumbsDown, RotateCcw, SendHorizonal, LoaderCircle, Zap, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Tone options for subject lines
const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'curious', label: 'Curious' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'informative', label: 'Informative' },
  { value: 'personal', label: 'Personal' },
];

// Industry options
const industryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'nonprofit', label: 'Non-profit' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'retail', label: 'Retail' },
];

// Example subject line for demonstration
const exampleSubjectLines = [
  {
    text: "Your Q2 Performance Report is Ready",
    stats: { openRate: 32.5, clickRate: 12.8 }
  },
  {
    text: "Last Chance: 30% Off All Products Ends Tonight",
    stats: { openRate: 28.4, clickRate: 15.2 }
  },
  {
    text: "We've Updated Our Privacy Policy",
    stats: { openRate: 24.1, clickRate: 5.3 }
  },
  {
    text: "Join Us for Our Exclusive Webinar Series",
    stats: { openRate: 35.7, clickRate: 18.9 }
  },
  {
    text: "Your Account Security Alert",
    stats: { openRate: 45.3, clickRate: 22.1 }
  }
];

interface GeneratedSubjectLine {
  text: string;
  score: number;
  reasoning?: string;
  feedback?: string;
}

export default function SubjectLineGenerator() {
  const [emailContent, setEmailContent] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedIndustry, setSelectedIndustry] = useState('technology');
  const [targetAudience, setTargetAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedSubjectLines, setGeneratedSubjectLines] = useState<GeneratedSubjectLine[]>([]);
  const { toast } = useToast();

  // Handle text copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Subject line has been copied to your clipboard.",
      duration: 2000,
    });
  };

  // Handle feedback on subject lines
  const handleFeedback = (index: number, isPositive: boolean) => {
    const updatedLines = [...generatedSubjectLines];
    updatedLines[index] = {
      ...updatedLines[index],
      feedback: isPositive ? 'positive' : 'negative'
    };
    setGeneratedSubjectLines(updatedLines);
    
    toast({
      title: isPositive ? "Feedback received" : "Thanks for your feedback",
      description: isPositive 
        ? "We're glad you liked this suggestion!" 
        : "We'll use this to improve future suggestions.",
      duration: 2000,
    });
  };

  // Generate new subject lines
  const handleGenerate = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Missing email content",
        description: "Please provide some email content to generate subject lines.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/generate-subject-lines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailContent,
          tone: selectedTone,
          industry: selectedIndustry,
          targetAudience: targetAudience || undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate subject lines');
      }
      
      const data = await response.json();
      setGeneratedSubjectLines(data.subjectLines || []);
      setActiveTab('results');
      
    } catch (error) {
      console.error('Error generating subject lines:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating subject lines. Please try again.",
        variant: "destructive",
      });
      // Use example data for demonstration when real API fails
      setGeneratedSubjectLines([
        { text: "Introducing Our Latest Product Innovations for Q2", score: 87 },
        { text: "Your Personal Technology Report: May Insights", score: 92 },
        { text: "Important Updates to Your Software Subscription", score: 78 },
        { text: "[First Name], Don't Miss These Tech Updates", score: 84 }
      ]);
      setActiveTab('results');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setEmailContent('');
    setSelectedTone('professional');
    setSelectedIndustry('technology');
    setTargetAudience('');
    setGeneratedSubjectLines([]);
    setActiveTab('generate');
  };

  return (
    <Card className="w-full">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <CardTitle>AI Subject Line Generator</CardTitle>
        </div>
        <CardDescription>
          Create high-converting email subject lines with AI assistance.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="results" disabled={generatedSubjectLines.length === 0}>
              Results {generatedSubjectLines.length > 0 && `(${generatedSubjectLines.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-0">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-content" className="block mb-2 font-medium">
                  Email Content
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="email-content"
                  placeholder="Paste your email content here..."
                  className="min-h-[200px] resize-y"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include the main content of your email to generate relevant subject lines.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tone" className="block mb-2 font-medium">
                    Desired Tone
                  </Label>
                  <select
                    id="tone"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 h-10 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                  >
                    {toneOptions.map((tone) => (
                      <option key={tone.value} value={tone.value}>
                        {tone.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="industry" className="block mb-2 font-medium">
                    Industry
                  </Label>
                  <select
                    id="industry"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 h-10 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                  >
                    {industryOptions.map((industry) => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="target-audience" className="block mb-2 font-medium">
                  Target Audience (Optional)
                </Label>
                <Input
                  id="target-audience"
                  placeholder="e.g., Marketing professionals, Small business owners, etc."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            {generatedSubjectLines.length > 0 ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Generated Subject Lines</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('generate')}>
                    Edit Parameters
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {generatedSubjectLines.map((subjectLine, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-200 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-base font-medium">{subjectLine.text}</p>
                          
                          {subjectLine.reasoning && (
                            <p className="text-sm text-gray-500 mt-1">{subjectLine.reasoning}</p>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0 ml-4 flex items-center">
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 mr-2 font-medium">
                            Score: {subjectLine.score}
                          </Badge>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleCopy(subjectLine.text)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy to clipboard</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          <span>Was this useful?</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant={subjectLine.feedback === 'positive' ? "default" : "ghost"} 
                            size="sm"
                            onClick={() => handleFeedback(index, true)}
                            className={subjectLine.feedback === 'positive' ? "text-white" : "text-gray-500"}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Yes
                          </Button>
                          
                          <Button 
                            variant={subjectLine.feedback === 'negative' ? "secondary" : "ghost"} 
                            size="sm"
                            onClick={() => handleFeedback(index, false)}
                            className="text-gray-500"
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            No
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No subject lines generated yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab('generate')}>
                  Go to Generator
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-1">
            <Info className="h-4 w-4 text-gray-500" />
            <span>Subject Line Performance</span>
          </h3>
          
          <Alert className="bg-indigo-50 border-indigo-100 text-indigo-800">
            <AlertDescription className="text-sm">
              High-performing subject lines typically have 40-50 characters and create a sense of curiosity or urgency.
            </AlertDescription>
          </Alert>
          
          <div className="mt-3 space-y-2">
            {exampleSubjectLines.map((example, index) => (
              <div 
                key={index}
                className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-gray-50"
              >
                <span className="text-sm font-medium">{example.text}</span>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-1">Opens:</span>
                    <span className="font-medium">{example.stats.openRate}%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-1">Clicks:</span>
                    <span className="font-medium">{example.stats.clickRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
          
          {activeTab === 'generate' ? (
            <Button 
              onClick={handleGenerate}
              disabled={isLoading || !emailContent.trim()}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Subject Lines
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => setActiveTab('generate')}>
              <Zap className="mr-2 h-4 w-4" />
              Generate More
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}