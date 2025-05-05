import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Palette, Clock, Sunrise, Sunset, CloudMoon } from 'lucide-react';
import { motion } from 'framer-motion';

type ThemeMode = 'light' | 'dark' | 'auto' | 'mood';

const ThemeSwitcher: React.FC = () => {
  const { themeMode, setThemeMode, themeColors, currentTimeOfDay, currentMood } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get time icon based on current time of day
  const getTimeIcon = () => {
    switch(currentTimeOfDay) {
      case 'morning':
        return <Sunrise size={20} />;
      case 'afternoon':
        return <Sun size={20} />;
      case 'evening':
        return <Sunset size={20} />;
      case 'night':
        return <CloudMoon size={20} />;
      default:
        return <Clock size={20} />;
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        style={{ 
          background: themeMode === 'mood' 
            ? `linear-gradient(to right, ${themeColors.primary}, ${themeColors.accent})` 
            : themeMode === 'auto'
              ? 'linear-gradient(to right, #f59e0b, #3b82f6)'
              : ''
        }}
        className={`p-2 rounded-full shadow-sm border transition-all duration-300 flex items-center ${
          themeMode === 'light' 
            ? 'bg-gradient-to-r from-amber-50 to-blue-50 border-blue-100 text-blue-500 hover:text-amber-500' 
            : themeMode === 'dark'
              ? 'bg-gradient-to-r from-gray-800 to-indigo-900 border-indigo-900 text-white hover:text-indigo-300'
              : themeMode === 'auto'
                ? 'border-blue-200 text-white hover:opacity-80'
                : 'border-purple-200 text-white hover:opacity-80'
        }`}
        onClick={toggleDropdown}
        aria-label="Theme settings"
      >
        <div className="flex items-center space-x-1">
          {themeMode === 'light' && <Sun size={16} />}
          {themeMode === 'dark' && <Moon size={16} />}
          {themeMode === 'auto' && getTimeIcon()}
          {themeMode === 'mood' && <Palette size={16} />}
          
          <span className="text-xs font-medium hidden sm:inline">
            {themeMode === 'auto' 
              ? currentTimeOfDay.charAt(0).toUpperCase() + currentTimeOfDay.slice(1) 
              : themeMode === 'mood'
                ? currentMood.charAt(0).toUpperCase() + currentMood.slice(1)
                : themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
          </span>
        </div>
      </button>
      
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{ 
            background: `linear-gradient(to bottom, ${themeColors.cardBg}, ${themeColors.background})`,
            borderColor: themeColors.border
          }}
          className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg border z-50"
        >
          <div className="py-3 px-2">
            <h3 className="px-4 py-2 text-sm font-medium" 
              style={{ color: themeColors.textPrimary, borderColor: themeColors.border }}
            >
              Theme Settings
            </h3>
            
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button 
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                  themeMode === 'light' 
                    ? 'bg-gradient-to-br from-amber-50 to-blue-50 shadow-md border border-blue-100' 
                    : 'hover:bg-white/50 hover:shadow-sm'
                }`}
                onClick={() => setThemeMode('light' as ThemeMode)}
              >
                <Sun 
                  size={20} 
                  className={themeMode === 'light' ? 'text-amber-500' : ''} 
                  style={{ color: themeMode !== 'light' ? themeColors.primary : undefined }}
                />
                <span 
                  className="text-xs font-medium mt-2"
                  style={{ color: themeMode !== 'light' ? themeColors.textPrimary : undefined }}
                >
                  Light Mode
                </span>
              </button>
              
              <button 
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                  themeMode === 'dark' 
                    ? 'bg-gradient-to-br from-gray-800 to-indigo-900 shadow-md border border-indigo-900' 
                    : 'hover:bg-white/50 hover:shadow-sm'
                }`}
                onClick={() => setThemeMode('dark' as ThemeMode)}
              >
                <Moon 
                  size={20} 
                  className={themeMode === 'dark' ? 'text-white' : ''} 
                  style={{ color: themeMode !== 'dark' ? themeColors.primary : undefined }}
                />
                <span 
                  className={`text-xs font-medium mt-2 ${themeMode === 'dark' ? 'text-white' : ''}`}
                  style={{ color: themeMode !== 'dark' ? themeColors.textPrimary : undefined }}
                >
                  Dark Mode
                </span>
              </button>
              
              <button 
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                  themeMode === 'auto' 
                    ? 'bg-gradient-to-br from-amber-200 to-blue-300 shadow-md border border-blue-200' 
                    : 'hover:bg-white/50 hover:shadow-sm'
                }`}
                onClick={() => setThemeMode('auto' as ThemeMode)}
              >
                <Clock 
                  size={20} 
                  className={themeMode === 'auto' ? 'text-blue-700' : ''} 
                  style={{ color: themeMode !== 'auto' ? themeColors.primary : undefined }}
                />
                <span 
                  className="text-xs font-medium mt-2"
                  style={{ color: themeMode !== 'auto' ? themeColors.textPrimary : undefined }}
                >
                  Time-Based
                </span>
              </button>
              
              <button 
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                  themeMode === 'mood' 
                    ? 'bg-gradient-to-br from-pink-300 to-purple-400 shadow-md border border-purple-200' 
                    : 'hover:bg-white/50 hover:shadow-sm'
                }`}
                onClick={() => setThemeMode('mood' as ThemeMode)}
              >
                <Palette 
                  size={20} 
                  className={themeMode === 'mood' ? 'text-white' : ''} 
                  style={{ color: themeMode !== 'mood' ? themeColors.primary : undefined }}
                />
                <span 
                  className={`text-xs font-medium mt-2 ${themeMode === 'mood' ? 'text-white' : ''}`}
                  style={{ color: themeMode !== 'mood' ? themeColors.textPrimary : undefined }}
                >
                  Mood-Based
                </span>
              </button>
            </div>
            
            {themeMode === 'auto' && (
              <div className="mt-3 px-2">
                <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-700">
                    Currently in <span className="font-semibold">{currentTimeOfDay}</span> mode. Colors will adapt to the time of day.
                  </p>
                </div>
              </div>
            )}
            
            {themeMode === 'mood' && (
              <div className="mt-3 px-2">
                <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                  <p className="text-xs text-purple-700">
                    You're feeling <span className="font-semibold">{currentMood}</span>. Select "How are you feeling?" from the navbar to change.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ThemeSwitcher;