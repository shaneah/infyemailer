import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardWithEmojiProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal';
  delay?: number;
}

/**
 * Enhanced Metric Card with contextual emoji reactions
 * Shows appropriate emoji based on metric type and value
 */
const MetricCardWithEmoji: React.FC<MetricCardWithEmojiProps> = ({ 
  title, 
  value, 
  subValue, 
  trend = 'neutral',
  trendValue,
  icon,
  color = 'blue',
  delay = 0
}) => {
  // Define color schemes based on trend and color prop
  const getBgColor = () => {
    switch(color) {
      case 'green': return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20';
      case 'red': return 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20';
      case 'purple': return 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20';
      case 'orange': return 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20';
      case 'teal': return 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20';
      case 'blue':
      default: return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20';
    }
  };

  const getTrendColor = () => {
    switch(color) {
      case 'green': return 'text-green-600 dark:text-green-400';
      case 'red': return 'text-red-600 dark:text-red-400';
      case 'purple': return 'text-purple-600 dark:text-purple-400';
      case 'orange': return 'text-orange-600 dark:text-orange-400';
      case 'teal': return 'text-teal-600 dark:text-teal-400';
      case 'blue':
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };
  
  const getBadgeColor = () => {
    switch(color) {
      case 'green': return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300';
      case 'red': return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300';
      case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300';
      case 'orange': return 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300';
      case 'teal': return 'bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-300';
      case 'blue':
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300';
    }
  };

  /**
   * Gets contextual emoji based on metric title and trend
   * This provides a visual, emotional reaction to the metric value
   */
  const getEmojiReaction = () => {
    const titleLower = title.toLowerCase();
    
    // Handle Open Rate
    if (titleLower.includes('open rate') || titleLower.includes('opens')) {
      if (trend === 'up') return '🎯'; // Target hit
      if (trend === 'down') return '😟'; // Sad face
      return '📬'; // Mailbox with mail
    }
    
    // Handle Click Rate
    if (titleLower.includes('click rate') || titleLower.includes('clicks')) {
      if (trend === 'up') return '👆'; // Pointer finger up
      if (trend === 'down') return '👇'; // Pointer finger down
      return '🖱️'; // Computer mouse
    }
    
    // Handle Conversion Rate
    if (titleLower.includes('conversion')) {
      if (trend === 'up') return '🎉'; // Celebration
      if (trend === 'down') return '😰'; // Worried face
      return '💲'; // Dollar sign
    }
    
    // Handle Bounce Rate (reversed - down is good)
    if (titleLower.includes('bounce')) {
      if (trend === 'up') return '😱'; // Shocked face
      if (trend === 'down') return '🙌'; // Celebrating hands
      return '↩️'; // Return arrow
    }
    
    // Handle Unsubscribe Rate (reversed - down is good)
    if (titleLower.includes('unsubscribe')) {
      if (trend === 'up') return '👋'; // Waving hand goodbye
      if (trend === 'down') return '💪'; // Strong arm
      return '✋'; // Hand
    }
    
    // Handle Email Volume
    if (titleLower.includes('sent') || titleLower.includes('emails sent')) {
      return '📮'; // Outbox tray
    }
    
    // Handle Revenue or monetary metrics
    if (titleLower.includes('revenue') || titleLower.includes('sales')) {
      if (trend === 'up') return '💰'; // Money bag
      if (trend === 'down') return '📉'; // Chart decreasing
      return '💵'; // Dollar bill
    }
    
    // Handle Growth
    if (titleLower.includes('growth')) {
      if (trend === 'up') return '📈'; // Chart increasing
      if (trend === 'down') return '📉'; // Chart decreasing
      return '📊'; // Bar chart
    }
    
    // Handle Audience or Subscriber metrics
    if (titleLower.includes('audience') || titleLower.includes('subscriber')) {
      if (trend === 'up') return '👥'; // People
      if (trend === 'down') return '🔍'; // Magnifying glass
      return '🧑‍🤝‍🧑'; // People holding hands
    }
    
    // Handle Engagement Score
    if (titleLower.includes('engagement') || titleLower.includes('score')) {
      if (trend === 'up') return '🌟'; // Star
      if (trend === 'down') return '⭐'; // Small star
      return '⚡'; // Lightning
    }
    
    // Default based just on trend
    if (trend === 'up') return '📈'; // Chart increasing
    if (trend === 'down') return '📉'; // Chart decreasing
    return '📊'; // Bar chart
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={`rounded-xl p-0.5 shadow-lg transition-all duration-300 hover:shadow-xl ${getBgColor()}`}
    >
      <div className="h-full rounded-lg bg-white dark:bg-gray-900 p-4 transition-all duration-300">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            </div>
            {trend && trendValue && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor()}`}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${getTrendColor()}`}>{value}</span>
              <span className="text-2xl ml-2" role="img" aria-label="emoji reaction">
                {getEmojiReaction()}
              </span>
            </div>
            {subValue && <p className="text-xs text-gray-500 dark:text-gray-400">{subValue}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCardWithEmoji;