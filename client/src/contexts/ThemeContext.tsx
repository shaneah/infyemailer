import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto' | 'mood';
type MoodType = 'happy' | 'calm' | 'focused' | 'energetic' | 'relaxed' | 'creative';
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gradient: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  themeColors: ThemeColors;
  isDarkMode: boolean;
  currentMood: MoodType;
  setCurrentMood: (mood: MoodType) => void;
  currentTimeOfDay: TimeOfDay;
}

const defaultColors: ThemeColors = {
  primary: '#6366f1',
  secondary: '#2a3050',
  accent: '#d4af37',
  background: '#f8f9fa',
  cardBg: '#ffffff',
  border: '#e2e8f0',
  textPrimary: '#1a202c',
  textSecondary: '#4a5568',
  textMuted: '#718096',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  gradient: 'linear-gradient(to right, #6366f1, #8b5cf6)'
};

const darkColors: ThemeColors = {
  primary: '#818cf8',
  secondary: '#515686',
  accent: '#f1c254',
  background: '#111827',
  cardBg: '#1f2937',
  border: '#374151',
  textPrimary: '#f3f4f6',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  gradient: 'linear-gradient(to right, #4338ca, #6366f1)'
};

// Morning colors (refreshing, energetic)
const morningColors: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#2563eb',
  accent: '#f59e0b',
  background: '#f0f9ff',
  cardBg: '#ffffff',
  border: '#bfdbfe',
  textPrimary: '#1e3a8a',
  textSecondary: '#3b82f6',
  textMuted: '#60a5fa',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0284c7',
  gradient: 'linear-gradient(to right, #3b82f6, #60a5fa)'
};

// Afternoon colors (productive, focused)
const afternoonColors: ThemeColors = {
  primary: '#8b5cf6',
  secondary: '#6d28d9',
  accent: '#d4af37',
  background: '#f5f3ff',
  cardBg: '#ffffff',
  border: '#ddd6fe',
  textPrimary: '#4c1d95',
  textSecondary: '#7c3aed',
  textMuted: '#8b5cf6',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  gradient: 'linear-gradient(to right, #8b5cf6, #c084fc)'
};

// Evening colors (calm, relaxing)
const eveningColors: ThemeColors = {
  primary: '#ec4899',
  secondary: '#be185d',
  accent: '#c084fc',
  background: '#fdf2f8',
  cardBg: '#ffffff',
  border: '#fbcfe8',
  textPrimary: '#831843',
  textSecondary: '#db2777',
  textMuted: '#ec4899',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  gradient: 'linear-gradient(to right, #ec4899, #f472b6)'
};

// Mood-based colors
const happyColors: ThemeColors = {
  primary: '#f59e0b',
  secondary: '#d97706',
  accent: '#fbbf24',
  background: '#fffbeb',
  cardBg: '#ffffff',
  border: '#fef3c7',
  textPrimary: '#78350f',
  textSecondary: '#b45309',
  textMuted: '#d97706',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  gradient: 'linear-gradient(to right, #f59e0b, #fbbf24)'
};

const calmColors: ThemeColors = {
  primary: '#06b6d4',
  secondary: '#0e7490',
  accent: '#67e8f9',
  background: '#ecfeff',
  cardBg: '#ffffff',
  border: '#cffafe',
  textPrimary: '#155e75',
  textSecondary: '#0891b2',
  textMuted: '#06b6d4',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  gradient: 'linear-gradient(to right, #06b6d4, #22d3ee)'
};

const focusedColors: ThemeColors = {
  primary: '#4f46e5',
  secondary: '#4338ca',
  accent: '#818cf8',
  background: '#eef2ff',
  cardBg: '#ffffff',
  border: '#c7d2fe',
  textPrimary: '#312e81',
  textSecondary: '#4338ca',
  textMuted: '#4f46e5',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  gradient: 'linear-gradient(to right, #4f46e5, #818cf8)'
};

// Additional creative mood-based themes
const energeticColors: ThemeColors = {
  primary: '#ef4444',
  secondary: '#dc2626',
  accent: '#fca5a5',
  background: '#fef2f2',
  cardBg: '#ffffff',
  border: '#fee2e2',
  textPrimary: '#991b1b',
  textSecondary: '#ef4444',
  textMuted: '#f87171',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  gradient: 'linear-gradient(to right, #ef4444, #f87171)'
};

const relaxedColors: ThemeColors = {
  primary: '#10b981',
  secondary: '#059669',
  accent: '#6ee7b7',
  background: '#ecfdf5',
  cardBg: '#ffffff',
  border: '#d1fae5',
  textPrimary: '#065f46',
  textSecondary: '#10b981',
  textMuted: '#34d399',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  gradient: 'linear-gradient(to right, #10b981, #34d399)'
};

const creativeColors: ThemeColors = {
  primary: '#c026d3',
  secondary: '#a21caf',
  accent: '#e879f9',
  background: '#fdf4ff',
  cardBg: '#ffffff',
  border: '#f5d0fe',
  textPrimary: '#701a75',
  textSecondary: '#c026d3',
  textMuted: '#d946ef',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  gradient: 'linear-gradient(to right, #c026d3, #e879f9)'
};

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('themeMode');
    return (savedTheme as ThemeMode) || 'light';
  });
  
  const [currentMood, setCurrentMood] = useState<MoodType>(() => {
    const savedMood = localStorage.getItem('currentMood');
    return (savedMood as MoodType) || 'happy';
  });
  
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<TimeOfDay>('morning');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeColors, setThemeColors] = useState<ThemeColors>(defaultColors);
  
  // Save theme preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('currentMood', currentMood);
  }, [themeMode, currentMood]);
  
  // Update current time of day based on hour
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) {
        setCurrentTimeOfDay('morning');
      } else if (hour >= 12 && hour < 18) {
        setCurrentTimeOfDay('afternoon');
      } else if (hour >= 18 && hour < 22) {
        setCurrentTimeOfDay('evening');
      } else {
        setCurrentTimeOfDay('night');
      }
    };
    
    updateTimeOfDay();
    
    // Update time of day every hour
    const interval = setInterval(updateTimeOfDay, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Update theme colors based on mode, time, and mood
  useEffect(() => {
    const updateThemeColors = () => {
      if (themeMode === 'auto') {
        // Time-based colors
        if (currentTimeOfDay === 'morning') {
          setThemeColors(morningColors);
          setIsDarkMode(false);
        } else if (currentTimeOfDay === 'afternoon') {
          setThemeColors(afternoonColors);
          setIsDarkMode(false);
        } else if (currentTimeOfDay === 'evening') {
          setThemeColors(eveningColors);
          setIsDarkMode(false);
        } else {
          // Night time
          setThemeColors({...eveningColors, background: '#1a1a2e', cardBg: '#16213e', textPrimary: '#f1f1f1', gradient: 'linear-gradient(to right, #c026d3, #9333ea)'});
          setIsDarkMode(true);
        }
      } else if (themeMode === 'mood') {
        // Mood-based colors
        switch(currentMood) {
          case 'happy':
            setThemeColors(happyColors);
            break;
          case 'calm':
            setThemeColors(calmColors);
            break;
          case 'focused':
            setThemeColors(focusedColors);
            break;
          case 'energetic':
            setThemeColors(energeticColors);
            break;
          case 'relaxed':
            setThemeColors(relaxedColors);
            break;
          case 'creative':
            setThemeColors(creativeColors);
            break;
          default:
            setThemeColors(happyColors);
        }
        setIsDarkMode(false);
      } else if (themeMode === 'dark') {
        setThemeColors(darkColors);
        setIsDarkMode(true);
      } else {
        // Default light theme
        setThemeColors(defaultColors);
        setIsDarkMode(false);
      }
    };
    
    updateThemeColors();
  }, [themeMode, currentMood, currentTimeOfDay]);
  
  // Apply theme to document body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Apply CSS variables for theme colors
    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [themeColors, isDarkMode]);
  
  return (
    <ThemeContext.Provider value={{ 
      themeMode, 
      setThemeMode, 
      themeColors, 
      isDarkMode, 
      currentMood, 
      setCurrentMood, 
      currentTimeOfDay 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};