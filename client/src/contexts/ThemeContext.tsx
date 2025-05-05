import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto' | 'mood';

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
}

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  themeColors: ThemeColors;
  isDarkMode: boolean;
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
  info: '#3b82f6'
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
  info: '#60a5fa'
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
  info: '#0284c7'
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
  info: '#2563eb'
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
  info: '#2563eb'
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
  info: '#2563eb'
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
  info: '#2563eb'
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
  info: '#2563eb'
};

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('themeMode');
    return (savedTheme as ThemeMode) || 'light';
  });
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeColors, setThemeColors] = useState<ThemeColors>(defaultColors);
  
  // Save theme mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);
  
  // Update theme colors based on mode and time
  useEffect(() => {
    const updateThemeByTime = () => {
      const hour = new Date().getHours();
      
      if (themeMode === 'auto') {
        if (hour >= 5 && hour < 12) {
          // Morning (5am - 12pm)
          setThemeColors(morningColors);
          setIsDarkMode(false);
        } else if (hour >= 12 && hour < 18) {
          // Afternoon (12pm - 6pm)
          setThemeColors(afternoonColors);
          setIsDarkMode(false);
        } else {
          // Evening/Night (6pm - 5am)
          setThemeColors(eveningColors);
          setIsDarkMode(hour >= 20 || hour < 5);
        }
      } else if (themeMode === 'mood') {
        // Mood-based colors - this could be connected to AI in future to detect user's mood
        // For now, just cycle through different moods based on day of week or hour
        const day = new Date().getDay();
        const mood = hour % 3; // Simple cycle through 3 moods
        
        if (mood === 0) {
          setThemeColors(happyColors);
        } else if (mood === 1) {
          setThemeColors(calmColors);
        } else {
          setThemeColors(focusedColors);
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
    
    updateThemeByTime();
    
    // Update theme every hour if using auto mode
    const interval = setInterval(() => {
      if (themeMode === 'auto') {
        updateThemeByTime();
      }
    }, 60 * 60 * 1000); // Every hour
    
    return () => clearInterval(interval);
  }, [themeMode]);
  
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
    <ThemeContext.Provider value={{ themeMode, setThemeMode, themeColors, isDarkMode }}>
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