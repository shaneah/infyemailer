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
import { Loader2, Sparkles, Copy, Check, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SubjectLineGeneratorProps {
  clientId?: number;
}

export default function SubjectLineGenerator({ clientId }: SubjectLineGeneratorProps) {
  const [campaignDescription, setCampaignDescription] = useState('');
  const [generatedSubjects, setGeneratedSubjects] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateSubjectLines = async () => {
    if (!campaignDescription.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your campaign to generate subject lines.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/generate-subject-lines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignDescription,
          clientId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate subject lines');
      }

      const data = await response.json();
      setGeneratedSubjects(data.subjects || []);
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error generating subject lines:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating subject lines. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (subject: string) => {
    navigator.clipboard.writeText(subject);
    setCopied(true);
    setSelectedSubject(subject);
    
    toast({
      title: "Copied to clipboard",
      description: "Subject line has been copied to clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          Email Subject Line Generator
        </CardTitle>
        <CardDescription>
          Generate attention-grabbing subject lines for your email campaigns using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="campaign-description" className="text-sm font-medium">
            Describe your campaign
          </label>
          <Textarea
            id="campaign-description"
            placeholder="Briefly describe your campaign, target audience, and goals..."
            value={campaignDescription}
            onChange={(e) => setCampaignDescription(e.target.value)}
            className="min-h-32"
          />
        </div>

        {generatedSubjects.length > 0 && (
          <div className="space-y-3 mt-6">
            <label className="text-sm font-medium">Generated Subject Lines</label>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {generatedSubjects.map((subject, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-3 rounded-md border ${
                    subject === selectedSubject
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 bg-white'
                  } transition-all`}
                >
                  <span className="text-sm">{subject}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(subject)}
                    className="h-8 w-8 p-0"
                  >
                    {copied && subject === selectedSubject ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          <Badge variant="outline" className="mr-2">
            <Wand2 className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
          Unique subject lines with each generation
        </div>
        <Button
          onClick={generateSubjectLines}
          disabled={isGenerating || !campaignDescription.trim()}
          className="gap-1.5"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}