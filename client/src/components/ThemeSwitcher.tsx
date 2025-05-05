import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Palette, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

type ThemeMode = 'light' | 'dark' | 'auto' | 'mood';

const ThemeSwitcher: React.FC = () => {
  const { themeMode, setThemeMode, themeColors } = useTheme();
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
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="p-1.5 rounded-full bg-gradient-to-r from-white to-[#f5f0e1] shadow-sm border border-[rgba(212,175,55,0.2)] text-[#1a3a5f] hover:text-[#d4af37] transition-all duration-200"
        onClick={toggleDropdown}
        aria-label="Theme settings"
      >
        {themeMode === 'light' && <Sun size={20} />}
        {themeMode === 'dark' && <Moon size={20} />}
        {themeMode === 'auto' && <Clock size={20} />}
        {themeMode === 'mood' && <Palette size={20} />}
      </button>
      
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-white to-[#f5f0e1] rounded-md shadow-gold-lg border border-[rgba(212,175,55,0.2)] z-20"
        >
          <div className="py-1">
            <h3 className="px-4 py-2 text-sm font-medium text-[#1a3a5f] border-b border-[rgba(212,175,55,0.2)]">Theme Settings</h3>
            
            <button 
              className={`flex items-center w-full px-4 py-2 text-sm hover:bg-white transition-colors duration-200 ${themeMode === 'light' ? 'text-[#d4af37] font-medium' : 'text-[#1a3a5f]'}`}
              onClick={() => setThemeMode('light' as ThemeMode)}
            >
              <Sun size={18} className="mr-2" />
              Light Mode
            </button>
            
            <button 
              className={`flex items-center w-full px-4 py-2 text-sm hover:bg-white transition-colors duration-200 ${themeMode === 'dark' ? 'text-[#d4af37] font-medium' : 'text-[#1a3a5f]'}`}
              onClick={() => setThemeMode('dark' as ThemeMode)}
            >
              <Moon size={18} className="mr-2" />
              Dark Mode
            </button>
            
            <button 
              className={`flex items-center w-full px-4 py-2 text-sm hover:bg-white transition-colors duration-200 ${themeMode === 'auto' ? 'text-[#d4af37] font-medium' : 'text-[#1a3a5f]'}`}
              onClick={() => setThemeMode('auto' as ThemeMode)}
            >
              <Clock size={18} className="mr-2" />
              Time-Based
              <span className="ml-2 text-xs text-gray-500">(Auto)</span>
            </button>
            
            <button 
              className={`flex items-center w-full px-4 py-2 text-sm hover:bg-white transition-colors duration-200 ${themeMode === 'mood' ? 'text-[#d4af37] font-medium' : 'text-[#1a3a5f]'}`}
              onClick={() => setThemeMode('mood' as ThemeMode)}
            >
              <Palette size={18} className="mr-2" />
              Mood-Based
              <span className="ml-2 text-xs text-gray-500">(AI)</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ThemeSwitcher;