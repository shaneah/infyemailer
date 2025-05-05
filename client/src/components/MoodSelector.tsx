import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { 
  Smile, 
  Droplets, 
  Target, 
  Zap, 
  Leaf, 
  Sparkles 
} from 'lucide-react';

type MoodButtonProps = {
  mood: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const MoodButton = ({ mood, icon, label, isActive, onClick }: MoodButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-3 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-br from-white to-purple-50 shadow-md border border-purple-200' 
          : 'hover:bg-white/50 hover:shadow-sm'
      }`}
    >
      <div className={`p-2 rounded-full mb-2 ${getMoodColor(mood)}`}>
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

// Helper function to get mood-specific color classes
const getMoodColor = (mood: string): string => {
  switch (mood) {
    case 'happy':
      return 'bg-amber-100 text-amber-500';
    case 'calm':
      return 'bg-cyan-100 text-cyan-500';
    case 'focused':
      return 'bg-indigo-100 text-indigo-500';
    case 'energetic':
      return 'bg-red-100 text-red-500';
    case 'relaxed':
      return 'bg-emerald-100 text-emerald-500';
    case 'creative':
      return 'bg-fuchsia-100 text-fuchsia-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const MoodSelector: React.FC = () => {
  const { currentMood, setCurrentMood, themeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Only show mood selector when in mood theme mode
  const showMoodSelector = themeMode === 'mood';
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  // Handle clicking outside to close the dropdown
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
  
  // Close dropdown when mood is selected
  useEffect(() => {
    setIsOpen(false);
  }, [currentMood]);
  
  // Do not render if not in mood theme mode
  if (!showMoodSelector) return null;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 hover:bg-white/70 border border-transparent hover:border-purple-100"
        aria-label="Select your mood"
      >
        <div className={`p-1.5 rounded-full ${getMoodColor(currentMood)}`}>
          {currentMood === 'happy' && <Smile size={18} />}
          {currentMood === 'calm' && <Droplets size={18} />}
          {currentMood === 'focused' && <Target size={18} />}
          {currentMood === 'energetic' && <Zap size={18} />}
          {currentMood === 'relaxed' && <Leaf size={18} />}
          {currentMood === 'creative' && <Sparkles size={18} />}
        </div>
        <span className="text-sm font-medium mr-1">
          {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
        </span>
        <svg className="w-3 h-3 fill-current text-gray-400" viewBox="0 0 12 12">
          <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
        </svg>
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 p-3 w-72 bg-gradient-to-b from-white to-purple-50 rounded-xl shadow-lg border border-purple-100 z-50"
        >
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">How are you feeling today?</h3>
            <div className="grid grid-cols-3 gap-2">
              <MoodButton 
                mood="happy" 
                icon={<Smile size={20} />} 
                label="Happy" 
                isActive={currentMood === 'happy'} 
                onClick={() => setCurrentMood('happy')} 
              />
              <MoodButton 
                mood="calm" 
                icon={<Droplets size={20} />} 
                label="Calm" 
                isActive={currentMood === 'calm'} 
                onClick={() => setCurrentMood('calm')} 
              />
              <MoodButton 
                mood="focused" 
                icon={<Target size={20} />} 
                label="Focused" 
                isActive={currentMood === 'focused'} 
                onClick={() => setCurrentMood('focused')} 
              />
              <MoodButton 
                mood="energetic" 
                icon={<Zap size={20} />} 
                label="Energetic" 
                isActive={currentMood === 'energetic'} 
                onClick={() => setCurrentMood('energetic')} 
              />
              <MoodButton 
                mood="relaxed" 
                icon={<Leaf size={20} />} 
                label="Relaxed" 
                isActive={currentMood === 'relaxed'} 
                onClick={() => setCurrentMood('relaxed')} 
              />
              <MoodButton 
                mood="creative" 
                icon={<Sparkles size={20} />} 
                label="Creative" 
                isActive={currentMood === 'creative'} 
                onClick={() => setCurrentMood('creative')} 
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MoodSelector;