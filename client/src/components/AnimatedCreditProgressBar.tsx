import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AnimatedCreditProgressBarProps {
  used: number;
  total: number;
  className?: string;
  showEmojis?: boolean;
  animate?: boolean;
}

const AnimatedCreditProgressBar: React.FC<AnimatedCreditProgressBarProps> = ({
  used,
  total,
  className = "",
  showEmojis = true,
  animate = true
}) => {
  const [progress, setProgress] = useState(0);
  const [visibleEmoji, setVisibleEmoji] = useState(true);
  const percentage = Math.min((used / total) * 100, 100);
  
  // Determine emoji based on usage percentage
  const getEmoji = () => {
    if (percentage <= 20) return { emoji: "🥳", label: "Excellent! Plenty of credits remaining" };
    if (percentage <= 40) return { emoji: "😊", label: "Looking good! You're using your credits wisely" };
    if (percentage <= 60) return { emoji: "🙂", label: "You still have a good amount of credits left" };
    if (percentage <= 80) return { emoji: "🤔", label: "Getting low on credits, consider purchasing more soon" };
    if (percentage <= 95) return { emoji: "😬", label: "Almost out of credits! Time to recharge" };
    return { emoji: "😱", label: "You've used all your credits! Purchase more to continue sending" };
  };
  
  const emojiData = getEmoji();
  
  // Animation for the progress bar
  useEffect(() => {
    if (animate) {
      setProgress(0);
      const timer = setTimeout(() => {
        setProgress(percentage);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setProgress(percentage);
    }
  }, [percentage, animate]);
  
  // Emoji blinking effect
  useEffect(() => {
    if (showEmojis && percentage > 80) {
      const interval = setInterval(() => {
        setVisibleEmoji(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setVisibleEmoji(true);
    }
  }, [showEmojis, percentage]);
  
  // Determine color based on usage
  const getBarColor = () => {
    if (percentage <= 40) return "bg-green-500";
    if (percentage <= 70) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getBarColor()}`}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: animate ? 1.5 : 0, 
            ease: "easeOut",
            delay: animate ? 0.2 : 0
          }}
        />
      </div>
      
      {showEmojis && (
        <div className="absolute -right-2 -top-2">
          <AnimatePresence>
            {visibleEmoji && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.3 }}
                      className="cursor-help"
                    >
                      <span role="img" aria-label="usage indicator" style={{ fontSize: '1.2rem' }}>
                        {emojiData.emoji}
                      </span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{emojiData.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </AnimatePresence>
        </div>
      )}
      
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>{used.toLocaleString()} used</span>
        <span>{total.toLocaleString()} total</span>
      </div>
      
      {/* Animated dots that follow the progress */}
      {animate && percentage > 10 && (
        <div className="relative h-0">
          <motion.div 
            className="absolute top-[-18px] left-0"
            initial={{ left: "0%" }}
            animate={{ left: `${Math.min(progress - 2, 98)}%` }}
            transition={{ 
              duration: 1.5,
              ease: "easeOut",
              delay: 0.2
            }}
          >
            <motion.div
              animate={{ 
                y: [0, -4, 0],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }}
              className="w-1 h-1 bg-white rounded-full shadow-sm"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AnimatedCreditProgressBar;