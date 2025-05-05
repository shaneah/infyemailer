import React, { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface ThemedGradientHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

const ThemedGradientHeader: React.FC<ThemedGradientHeaderProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  const { themeColors, isDarkMode } = useTheme();
  
  // Use primary and secondary colors for gradient
  const headerStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
    color: 'white',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)'
  };
  
  return (
    <motion.div 
      className={`rounded-lg p-6 mb-6 ${className}`}
      style={headerStyle}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
          {description && <p className="text-sm md:text-base opacity-90">{description}</p>}
        </div>
        {children && (
          <div className="mt-4 md:mt-0">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ThemedGradientHeader;