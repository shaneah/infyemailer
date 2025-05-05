import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sun,
  Moon,
  Clock,
  Smile,
  Heart,
  Target,
  Zap,
  Coffee,
  Palette
} from 'lucide-react';

const ThemeSelector: React.FC = () => {
  const { themeMode, setThemeMode, currentMood, setCurrentMood } = useTheme();

  const moodEmoji = {
    happy: '😊',
    calm: '😌',
    focused: '🧠',
    energetic: '⚡',
    relaxed: '🌿',
    creative: '🎨'
  };

  const getCurrentMoodIcon = () => {
    switch (currentMood) {
      case 'happy':
        return <Smile className="h-4 w-4 mr-2" />;
      case 'calm':
        return <Heart className="h-4 w-4 mr-2" />;
      case 'focused':
        return <Target className="h-4 w-4 mr-2" />;
      case 'energetic':
        return <Zap className="h-4 w-4 mr-2" />;
      case 'relaxed':
        return <Coffee className="h-4 w-4 mr-2" />;
      case 'creative':
        return <Palette className="h-4 w-4 mr-2" />;
      default:
        return <Smile className="h-4 w-4 mr-2" />;
    }
  };

  const getThemeModeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'auto':
        return <Clock className="h-4 w-4" />;
      case 'mood':
        return getCurrentMoodIcon();
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            {getThemeModeIcon()}
            {themeMode === 'mood' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setThemeMode('light')}>
            <Sun className="h-4 w-4 mr-2" />
            <span>Light</span>
            {themeMode === 'light' && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setThemeMode('dark')}>
            <Moon className="h-4 w-4 mr-2" />
            <span>Dark</span>
            {themeMode === 'dark' && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setThemeMode('auto')}>
            <Clock className="h-4 w-4 mr-2" />
            <span>Time-based</span>
            {themeMode === 'auto' && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Mood-based</DropdownMenuLabel>
          
          <Dialog>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                {getCurrentMoodIcon()}
                <span>Select Mood</span>
                {themeMode === 'mood' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Choose Your Mood</DialogTitle>
                <DialogDescription>
                  Select a mood to personalize your interface colors.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button
                  variant={currentMood === 'happy' && themeMode === 'mood' ? "default" : "outline"}
                  className="justify-start flex items-center"
                  onClick={() => {
                    setCurrentMood('happy');
                    setThemeMode('mood');
                  }}
                >
                  <Smile className="h-4 w-4 mr-2" />
                  <div className="flex flex-col items-start">
                    <span>Happy {moodEmoji.happy}</span>
                    <span className="text-xs text-muted-foreground">Bright and cheerful</span>
                  </div>
                </Button>
                
                <Button
                  variant={currentMood === 'calm' && themeMode === 'mood' ? "default" : "outline"}
                  className="justify-start flex items-center"
                  onClick={() => {
                    setCurrentMood('calm');
                    setThemeMode('mood');
                  }}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  <div className="flex flex-col items-start">
                    <span>Calm {moodEmoji.calm}</span>
                    <span className="text-xs text-muted-foreground">Peaceful and serene</span>
                  </div>
                </Button>
                
                <Button
                  variant={currentMood === 'focused' && themeMode === 'mood' ? "default" : "outline"}
                  className="justify-start flex items-center"
                  onClick={() => {
                    setCurrentMood('focused');
                    setThemeMode('mood');
                  }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  <div className="flex flex-col items-start">
                    <span>Focused {moodEmoji.focused}</span>
                    <span className="text-xs text-muted-foreground">Clarity and concentration</span>
                  </div>
                </Button>
                
                <Button
                  variant={currentMood === 'energetic' && themeMode === 'mood' ? "default" : "outline"}
                  className="justify-start flex items-center"
                  onClick={() => {
                    setCurrentMood('energetic');
                    setThemeMode('mood');
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  <div className="flex flex-col items-start">
                    <span>Energetic {moodEmoji.energetic}</span>
                    <span className="text-xs text-muted-foreground">Dynamic and vibrant</span>
                  </div>
                </Button>
                
                <Button
                  variant={currentMood === 'relaxed' && themeMode === 'mood' ? "default" : "outline"}
                  className="justify-start flex items-center"
                  onClick={() => {
                    setCurrentMood('relaxed');
                    setThemeMode('mood');
                  }}
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  <div className="flex flex-col items-start">
                    <span>Relaxed {moodEmoji.relaxed}</span>
                    <span className="text-xs text-muted-foreground">Soothing and natural</span>
                  </div>
                </Button>
                
                <Button
                  variant={currentMood === 'creative' && themeMode === 'mood' ? "default" : "outline"}
                  className="justify-start flex items-center"
                  onClick={() => {
                    setCurrentMood('creative');
                    setThemeMode('mood');
                  }}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  <div className="flex flex-col items-start">
                    <span>Creative {moodEmoji.creative}</span>
                    <span className="text-xs text-muted-foreground">Inspiration and artistry</span>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ThemeSelector;