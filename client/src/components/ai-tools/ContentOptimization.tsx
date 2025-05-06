import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  Check,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentOptimizationProps {
  clientId: number;
  content: string;
  onUpdate?: (content: string) => void;
}

interface SuggestionType {
  type: "improvement" | "warning" | "critical";
  originalText: string;
  suggestion: string;
  reason: string;
  category: "tone" | "clarity" | "engagement" | "personalization" | "deliverability";
}

export default function ContentOptimization({
  clientId,
  content,
  onUpdate,
}: ContentOptimizationProps) {
  const [emailContent, setEmailContent] = useState(content);
  const [activeTab, setActiveTab] = useState("improvements");
  const [suggestions, setSuggestions] = useState<SuggestionType[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setEmailContent(content);
  }, [content]);

  const optimizeMutation = useMutation({
    mutationFn: async (data: { content: string; clientId: number }) => {
      const response = await apiRequest(
        "POST",
        `/api/client/${clientId}/ai/optimize-content`,
        data
      );
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        setAppliedSuggestions([]);
      } else {
        toast({
          title: "Error optimizing content",
          description: "Received invalid data from the server",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to optimize content",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const handleApplySuggestion = (suggestion: SuggestionType) => {
    // Replace the original text with the suggested text
    const newContent = emailContent.replace(suggestion.originalText, suggestion.suggestion);
    setEmailContent(newContent);
    setAppliedSuggestions([...appliedSuggestions, suggestion.originalText]);
    
    if (onUpdate) {
      onUpdate(newContent);
    }
  };
  
  const handleOptimize = () => {
    // Demo function that generates mock suggestions
    generateDemoSuggestions();
  };

  const generateDemoSuggestions = () => {
    // Generate sample suggestions for demonstration
    const demoSuggestions: SuggestionType[] = [
      {
        type: "improvement",
        originalText: emailContent.split(" ").slice(0, 3).join(" "),
        suggestion: `${emailContent.split(" ").slice(0, 3).join(" ")} [personalized greeting]`,
        reason: "Adding personalization can increase engagement by 26%",
        category: "personalization"
      },
      {
        type: "warning",
        originalText: "FREE",
        suggestion: "Complimentary",
        reason: "Words like 'FREE' in all caps can trigger spam filters",
        category: "deliverability"
      },
      {
        type: "improvement",
        originalText: emailContent.split(".")[0],
        suggestion: `${emailContent.split(".")[0].replace(/we are/i, "you'll benefit from")}`,
        reason: "Focusing on customer benefits rather than company actions improves engagement",
        category: "engagement"
      },
      {
        type: "critical",
        originalText: "Click here",
        suggestion: "Learn more about our services",
        reason: "Generic call-to-actions like 'Click here' perform poorly and may trigger spam filters",
        category: "engagement"
      },
      {
        type: "improvement",
        originalText: emailContent.split(" ").slice(-4).join(" "),
        suggestion: `${emailContent.split(" ").slice(-4).join(" ")} with a clear next step`,
        reason: "Emails that end with a clear call to action have 371% higher click rates",
        category: "clarity"
      }
    ];
    
    // Filter to only include suggestions that match text in the content
    const filteredSuggestions = demoSuggestions.filter(s => 
      emailContent.includes(s.originalText) || s.originalText === "FREE" || s.originalText === "Click here"
    );
    
    setSuggestions(filteredSuggestions);
    setAppliedSuggestions([]);
  };

  const improvementSuggestions = suggestions.filter(s => s.type === "improvement");
  const warningSuggestions = suggestions.filter(s => s.type === "warning" || s.type === "critical");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Content Optimization
          </CardTitle>
          <CardDescription>
            Improve your email content with AI-powered suggestions for better engagement and
            deliverability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailContent">Email Content</Label>
              <Textarea
                id="emailContent"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Enter your email content to get optimization suggestions..."
                className="min-h-[200px]"
              />
            </div>

            <Button
              onClick={handleOptimize}
              className="w-full"
              disabled={!emailContent.trim() || optimizeMutation.isPending}
            >
              {optimizeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Optimize Content
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Content Suggestions</CardTitle>
            <CardDescription>
              Review and apply suggestions to optimize your email for better performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="improvements" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="improvements" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Improvements ({improvementSuggestions.length})
                </TabsTrigger>
                <TabsTrigger value="warnings" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings ({warningSuggestions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="improvements">
                <div className="space-y-4 mt-4">
                  {improvementSuggestions.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">
                      No improvement suggestions found.
                    </div>
                  ) : (
                    improvementSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-md border ${
                          appliedSuggestions.includes(suggestion.originalText)
                            ? "border-green-200 bg-green-50"
                            : "border-border"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {suggestion.category.charAt(0).toUpperCase() +
                                suggestion.category.slice(1)}
                            </Badge>
                            {appliedSuggestions.includes(suggestion.originalText) && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Applied
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mb-2">
                          <div className="text-sm font-medium mb-1">Original text:</div>
                          <div className="p-2 bg-muted rounded text-sm">{suggestion.originalText}</div>
                        </div>

                        <div className="mb-2">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2">
                            Suggested improvement:
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="p-2 bg-primary/5 border border-primary/20 rounded text-sm">
                            {suggestion.suggestion}
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground mb-3">{suggestion.reason}</div>

                        {!appliedSuggestions.includes(suggestion.originalText) && (
                          <Button
                            onClick={() => handleApplySuggestion(suggestion)}
                            size="sm"
                            className="mt-2"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Apply Suggestion
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="warnings">
                <div className="space-y-4 mt-4">
                  {warningSuggestions.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">
                      No warnings or issues found. Your content looks good!
                    </div>
                  ) : (
                    warningSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-md border ${
                          suggestion.type === "critical"
                            ? "border-red-200 bg-red-50"
                            : "border-amber-200 bg-amber-50"
                        } ${
                          appliedSuggestions.includes(suggestion.originalText)
                            ? "border-green-200 bg-green-50"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={suggestion.type === "critical" ? "destructive" : "outline"}
                              className={
                                suggestion.type === "critical"
                                  ? ""
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {suggestion.type === "critical" ? "Critical Issue" : "Warning"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {suggestion.category.charAt(0).toUpperCase() +
                                suggestion.category.slice(1)}
                            </Badge>
                            {appliedSuggestions.includes(suggestion.originalText) && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                Fixed
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mb-2">
                          <div className="text-sm font-medium mb-1">Problem:</div>
                          <div className="p-2 bg-muted rounded text-sm">{suggestion.originalText}</div>
                        </div>

                        <div className="mb-2">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2">
                            Suggested fix:
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="p-2 bg-primary/5 border border-primary/20 rounded text-sm">
                            {suggestion.suggestion}
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground mb-3">{suggestion.reason}</div>

                        {!appliedSuggestions.includes(suggestion.originalText) && (
                          <Button
                            onClick={() => handleApplySuggestion(suggestion)}
                            size="sm"
                            variant={suggestion.type === "critical" ? "destructive" : "default"}
                            className="mt-2"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {suggestion.type === "critical" ? "Fix Issue" : "Apply Fix"}
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="w-full flex justify-between">
              <div className="text-sm text-muted-foreground">
                {appliedSuggestions.length > 0
                  ? `${appliedSuggestions.length} of ${suggestions.length} suggestions applied`
                  : "No suggestions applied yet"}
              </div>
              {appliedSuggestions.length > 0 && (
                <Button onClick={() => onUpdate && onUpdate(emailContent)}>
                  Save Optimized Content
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}