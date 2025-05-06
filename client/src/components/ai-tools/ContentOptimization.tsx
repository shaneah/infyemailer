import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Copy, Check, Lightbulb } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ContentOptimizationProps {
  clientId?: number;
}

export default function ContentOptimization({ clientId }: ContentOptimizationProps) {
  const [emailContent, setEmailContent] = useState('');
  const [optimizationGoal, setOptimizationGoal] = useState('engagement');
  const [optimizedContent, setOptimizedContent] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const optimizeContent = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter your email content to optimize.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);

    try {
      const response = await fetch('/api/ai/optimize-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: emailContent,
          goal: optimizationGoal,
          clientId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize content');
      }

      const data = await response.json();
      setOptimizedContent(data.optimizedContent || '');
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast({
        title: "Optimization failed",
        description: "There was an error optimizing your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedContent);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Optimized content has been copied to clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-indigo-500" />
          Content Optimization
        </CardTitle>
        <CardDescription>
          Enhance your email content for better engagement and conversions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="optimization-goal">Optimization Goal</Label>
          <Select
            value={optimizationGoal}
            onValueChange={setOptimizationGoal}
          >
            <SelectTrigger id="optimization-goal" className="w-full">
              <SelectValue placeholder="Select an optimization goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">Boost Engagement</SelectItem>
              <SelectItem value="clickthrough">Increase Click-Through Rate</SelectItem>
              <SelectItem value="conversion">Improve Conversions</SelectItem>
              <SelectItem value="clarity">Enhance Clarity</SelectItem>
              <SelectItem value="brevity">Make More Concise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email-content">Your Email Content</Label>
          <Textarea
            id="email-content"
            placeholder="Paste your email content here..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            className="min-h-40"
          />
        </div>

        {optimizedContent && (
          <div className="space-y-3 mt-6 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <Label className="text-md font-medium">Optimized Content</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <p className="whitespace-pre-wrap text-sm">{optimizedContent}</p>
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3 mt-4">
            <Label className="text-md font-medium">Improvement Suggestions</Label>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-blue-50 rounded-md p-3 border border-blue-100 text-sm">
                  <div className="flex gap-2 items-start">
                    <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p>{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          <Badge variant="outline" className="mr-2">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
          Optimized for your specific goal
        </div>
        <Button
          onClick={optimizeContent}
          disabled={isOptimizing || !emailContent.trim()}
          className="gap-1.5"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Optimize
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}