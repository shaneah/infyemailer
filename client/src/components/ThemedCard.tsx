import React, { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface ThemedCardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  noPadding?: boolean;
  hover?: boolean;
  variant?: 'default' | 'accent' | 'secondary' | 'subtle';
}

const ThemedCard: React.FC<ThemedCardProps> = ({
  title,
  description,
  children,
  footer,
  className = '',
  noPadding = false,
  hover = false,
  variant = 'default'
}) => {
  const { themeColors, isDarkMode } = useTheme();
  
  // Style variables based on theme and variant
  let cardBgColor = themeColors.cardBg;
  let headerBgColor;
  let borderColor = themeColors.border;
  let titleColor = themeColors.textPrimary;
  let descriptionColor = themeColors.textSecondary;
  
  switch (variant) {
    case 'accent':
      headerBgColor = themeColors.primary;
      titleColor = 'white';
      descriptionColor = 'rgba(255, 255, 255, 0.8)';
      borderColor = themeColors.primary;
      break;
    case 'secondary':
      headerBgColor = themeColors.secondary;
      titleColor = 'white';
      descriptionColor = 'rgba(255, 255, 255, 0.8)';
      borderColor = themeColors.secondary;
      break;
    case 'subtle':
      cardBgColor = isDarkMode 
        ? `${themeColors.background}` 
        : `${themeColors.background}`;
      break;
    default:
      headerBgColor = undefined;
  }
  
  const cardStyle: React.CSSProperties = {
    backgroundColor: cardBgColor,
    borderColor: borderColor,
    transition: 'all 0.2s ease-in-out'
  };
  
  const headerStyle: React.CSSProperties = headerBgColor ? {
    backgroundColor: headerBgColor,
    color: 'white'
  } : {};
  
  return (
    <motion.div
      className={`rounded-lg border shadow ${hover ? 'hover:shadow-md' : ''} ${className}`}
      style={cardStyle}
      whileHover={hover ? { y: -5 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {(title || description) && (
        <div 
          className={`px-4 py-3 ${headerBgColor ? 'rounded-t-lg' : 'border-b'}`} 
          style={headerStyle}
        >
          {title && (
            <h3 
              className="text-lg font-semibold" 
              style={{ color: titleColor }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p 
              className="text-sm mt-1" 
              style={{ color: descriptionColor }}
            >
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={noPadding ? '' : 'p-4'}>
        {children}
      </div>
      
      {footer && (
        <div className="px-4 py-3 border-t" style={{ borderColor: themeColors.border }}>
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default ThemedCard;