import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, PaintBucket, Copy, Check } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface ColorPaletteProps {
  brandDescription: string;
  industry: string;
  mood?: string;
  paletteSize?: number;
  onGenerate?: (palette: ColorPalette) => void;
}

export interface ColorPalette {
  name: string;
  description: string;
  colors: Array<{
    name: string;
    hex: string;
    rgb: string;
  }>;
}

export function ColorPaletteGenerator({ 
  brandDescription = '', 
  industry = '', 
  mood = 'professional',
  paletteSize = 5,
  onGenerate
}: ColorPaletteProps) {
  const [inputBrandDescription, setInputBrandDescription] = useState(brandDescription);
  const [inputIndustry, setInputIndustry] = useState(industry);
  const [inputMood, setInputMood] = useState(mood);
  const [inputPaletteSize, setInputPaletteSize] = useState(paletteSize.toString());
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const paletteMutation = useMutation({
    mutationFn: async (data: ColorPaletteProps) => {
      const response = await apiRequest('POST', '/api/generate-color-palette', data);
      const result = await response.json();
      return result.palette as ColorPalette;
    },
    onSuccess: (data) => {
      setPalette(data);
      if (onGenerate) {
        onGenerate(data);
      }
      toast({
        title: "Color palette generated",
        description: "Your color palette has been successfully generated.",
      });
    },
    onError: (error) => {
      console.error('Error generating color palette:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate color palette. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGeneratePalette = () => {
    if (!inputBrandDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a brand description.",
        variant: "destructive",
      });
      return;
    }

    if (!inputIndustry.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide an industry.",
        variant: "destructive",
      });
      return;
    }

    paletteMutation.mutate({
      brandDescription: inputBrandDescription,
      industry: inputIndustry,
      mood: inputMood,
      paletteSize: parseInt(inputPaletteSize, 10)
    });
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedColor(value);
      setTimeout(() => setCopiedColor(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: `${value} has been copied to clipboard.`,
      });
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PaintBucket className="h-5 w-5" />
            <span>Color Palette Generator</span>
          </CardTitle>
          <CardDescription>
            Generate harmonious color palettes for your email templates based on your brand identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brandDescription">Brand Description</Label>
            <Textarea
              id="brandDescription"
              placeholder="Describe your brand identity, values, and target audience"
              value={inputBrandDescription}
              onChange={(e) => setInputBrandDescription(e.target.value)}
              className="min-h-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              placeholder="e.g., Technology, Healthcare, Retail"
              value={inputIndustry}
              onChange={(e) => setInputIndustry(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mood">Desired Mood</Label>
              <Select 
                value={inputMood} 
                onValueChange={setInputMood}
              >
                <SelectTrigger id="mood">
                  <SelectValue placeholder="Select a mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="tech">Tech-forward</SelectItem>
                  <SelectItem value="natural">Natural/Organic</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paletteSize">Number of Colors</Label>
              <Select 
                value={inputPaletteSize} 
                onValueChange={setInputPaletteSize}
              >
                <SelectTrigger id="paletteSize">
                  <SelectValue placeholder="Select palette size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Colors</SelectItem>
                  <SelectItem value="4">4 Colors</SelectItem>
                  <SelectItem value="5">5 Colors</SelectItem>
                  <SelectItem value="6">6 Colors</SelectItem>
                  <SelectItem value="7">7 Colors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGeneratePalette}
            disabled={paletteMutation.isPending}
            className="w-full"
          >
            {paletteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Color Palette'
            )}
          </Button>
        </CardFooter>
      </Card>

      {palette && (
        <Card>
          <CardHeader>
            <CardTitle>{palette.name}</CardTitle>
            <CardDescription>{palette.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {palette.colors.map((color, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center"
                  >
                    <div 
                      className="w-16 h-16 rounded-md shadow-md cursor-pointer relative flex items-center justify-center transition-transform hover:scale-105"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => copyToClipboard(color.hex)}
                      title="Click to copy hex value"
                    >
                      {copiedColor === color.hex ? (
                        <Check className="h-6 w-6 text-white drop-shadow-md" />
                      ) : (
                        <Copy className="h-5 w-5 text-white opacity-0 hover:opacity-80 drop-shadow-md" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium">{color.name}</div>
                      <div className="text-xs text-muted-foreground">{color.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border rounded-md bg-muted/20">
                <div className="text-sm font-medium mb-2">Sample Color Combinations:</div>
                <div className="space-y-2">
                  {palette.colors.length >= 2 && (
                    <div 
                      className="h-12 flex items-center justify-center rounded-md" 
                      style={{ backgroundColor: palette.colors[0].hex }}
                    >
                      <span 
                        className="font-medium" 
                        style={{ color: palette.colors[1].hex }}
                      >
                        Primary & Secondary Text
                      </span>
                    </div>
                  )}
                  
                  {palette.colors.length >= 3 && (
                    <div 
                      className="h-12 flex items-center justify-center rounded-md" 
                      style={{ backgroundColor: palette.colors[2].hex }}
                    >
                      <span 
                        className="font-medium" 
                        style={{ color: palette.colors[palette.colors.length > 4 ? 4 : 0].hex }}
                      >
                        Accent & Background
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setPalette(null)}
            >
              Reset
            </Button>
            <Button
              onClick={handleGeneratePalette}
              disabled={paletteMutation.isPending}
            >
              {paletteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate Palette'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default ColorPaletteGenerator;