import React, { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemedStatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  onClick?: () => void;
  className?: string;
}

const ThemedStatsCard: React.FC<ThemedStatsCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  onClick,
  className = ''
}) => {
  const { themeColors } = useTheme();
  
  const cardStyle: React.CSSProperties = {
    backgroundColor: `${themeColors.cardBg}`,
    borderColor: themeColors.border,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out'
  };
  
  const iconContainerStyle: React.CSSProperties = {
    backgroundColor: `${themeColors.primary}20`,
    color: themeColors.primary
  };
  
  const trendStyle = trend?.direction === 'up' 
    ? {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        color: 'rgb(34, 197, 94)'
      }
    : {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: 'rgb(239, 68, 68)'
      };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border shadow-sm hover:shadow-md ${className}`}
      style={cardStyle}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-md font-semibold" style={{ color: themeColors.textPrimary }}>
              {title}
            </h3>
            {description && (
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                {description}
              </p>
            )}
          </div>
          <div className="p-2 rounded-full" style={iconContainerStyle}>
            {icon}
          </div>
        </div>
        
        <div className="flex items-baseline space-x-3 mt-3">
          <div className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
            {value}
          </div>
          {trend && (
            <div className="text-xs font-medium px-2 py-1 rounded-full flex items-center" 
              style={trendStyle}
            >
              {trend.direction === 'up' 
                ? <ChevronUp className="inline h-3 w-3 mr-1" /> 
                : <ChevronDown className="inline h-3 w-3 mr-1" />} 
              {trend.value}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ThemedStatsCard;