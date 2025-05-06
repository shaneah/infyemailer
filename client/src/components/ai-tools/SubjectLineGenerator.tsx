import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubjectLineGeneratorProps {
  clientId: number;
  onSelect?: (subjectLine: string) => void;
  initialContent?: string;
}

const INDUSTRY_OPTIONS = [
  { label: "Technology", value: "technology" },
  { label: "Retail", value: "retail" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Finance", value: "finance" },
  { label: "Education", value: "education" },
  { label: "Real Estate", value: "real_estate" },
  { label: "Marketing", value: "marketing" },
  { label: "Travel", value: "travel" },
  { label: "Food & Beverage", value: "food_beverage" },
  { label: "Entertainment", value: "entertainment" },
];

const OBJECTIVE_OPTIONS = [
  { label: "Increase Open Rates", value: "open_rate" },
  { label: "Promote New Product", value: "new_product" },
  { label: "Special Offer", value: "special_offer" },
  { label: "Newsletter", value: "newsletter" },
  { label: "Event Invitation", value: "event" },
  { label: "Re-engagement", value: "re_engagement" },
  { label: "Announcement", value: "announcement" },
  { label: "Follow-up", value: "follow_up" },
  { label: "Seasonal Promotion", value: "seasonal" },
  { label: "Educational Content", value: "educational" },
];

export default function SubjectLineGenerator({ clientId, onSelect, initialContent }: SubjectLineGeneratorProps) {
  const [emailContent, setEmailContent] = useState(initialContent || "");
  const [industry, setIndustry] = useState<string>("technology");
  const [objective, setObjective] = useState<string>("open_rate");
  const [tone, setTone] = useState<string>("professional");
  const [subjectLines, setSubjectLines] = useState<string[]>([]);
  const [selectedSubjectLine, setSelectedSubjectLine] = useState<string>("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: {
      emailContent: string;
      industry: string;
      objective: string;
      tone: string;
      clientId: number;
    }) => {
      const response = await apiRequest(
        "POST",
        `/api/client/${clientId}/ai/subject-lines`,
        data
      );
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.subjectLines && Array.isArray(data.subjectLines)) {
        setSubjectLines(data.subjectLines);
        if (data.subjectLines.length > 0) {
          setSelectedSubjectLine(data.subjectLines[0]);
        }
      } else {
        toast({
          title: "Error generating subject lines",
          description: "Received invalid data from the server",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate subject lines",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const handleCopySubjectLine = (subjectLine: string) => {
    navigator.clipboard.writeText(subjectLine);
    toast({
      title: "Copied to clipboard",
      description: "Subject line copied to clipboard",
    });
  };

  const handleSelectSubjectLine = (subjectLine: string) => {
    setSelectedSubjectLine(subjectLine);
    if (onSelect) {
      onSelect(subjectLine);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate({
      emailContent,
      industry,
      objective,
      tone,
      clientId,
    });
  };

  // Use OpenAI-powered mock subject lines for demonstration
  const handleDemoGenerate = () => {
    const demoSubjectLines = [
      `[${INDUSTRY_OPTIONS.find(i => i.value === industry)?.label}] ${emailContent.substring(0, 30)}...`,
      `Don't Miss: Our Latest ${OBJECTIVE_OPTIONS.find(o => o.value === objective)?.label} Update`,
      `${tone === 'professional' ? 'Important:' : 'Exciting!'} New Opportunities for ${INDUSTRY_OPTIONS.find(i => i.value === industry)?.label} Professionals`,
      `${emailContent.split(' ').slice(0, 5).join(' ')}...`,
      `${new Date().toLocaleDateString()} ${OBJECTIVE_OPTIONS.find(o => o.value === objective)?.label} - Just for You`
    ];
    
    setSubjectLines(demoSubjectLines);
    setSelectedSubjectLine(demoSubjectLines[0]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Subject Line Generator
          </CardTitle>
          <CardDescription>
            Generate high-performing subject lines based on your content, industry, and campaign
            objective.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailContent">Email Content</Label>
              <Textarea
                id="emailContent"
                placeholder="Enter your email content to generate relevant subject lines..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Providing your email content helps our AI generate more relevant subject lines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Campaign Objective</Label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger id="objective">
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    {OBJECTIVE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="button" 
              onClick={handleDemoGenerate}
              className="w-full"
              disabled={!emailContent.trim() || generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Subject Lines
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {subjectLines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Subject Lines</CardTitle>
            <CardDescription>
              Select the subject line that best fits your campaign. You can copy any subject line
              to use in your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjectLines.map((subjectLine, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border flex items-start justify-between ${
                    selectedSubjectLine === subjectLine
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleSelectSubjectLine(subjectLine)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="font-medium">{subjectLine}</div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {objective === "open_rate"
                          ? "Likely to increase opens"
                          : OBJECTIVE_OPTIONS.find((o) => o.value === objective)?.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tone.charAt(0).toUpperCase() + tone.slice(1)} tone
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopySubjectLine(subjectLine);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDemoGenerate()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>
            {selectedSubjectLine && (
              <Button onClick={() => onSelect && onSelect(selectedSubjectLine)}>
                Use This Subject Line
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}