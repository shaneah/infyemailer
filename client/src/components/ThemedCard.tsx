import React, { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
  hover = true,
  variant = 'default'
}) => {
  const { themeColors } = useTheme();
  
  // Different card styling based on variant
  const getCardStyle = () => {
    switch (variant) {
      case 'accent':
        return {
          border: `1px solid ${themeColors.accent}30`,
          backgroundColor: `${themeColors.accent}08`, // Very light tint
          boxShadow: hover ? `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px ${themeColors.accent}20` : undefined
        };
      case 'secondary':
        return {
          border: `1px solid ${themeColors.secondary}30`,
          backgroundColor: `${themeColors.secondary}08`, // Very light tint
          boxShadow: hover ? `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px ${themeColors.secondary}20` : undefined
        };
      case 'subtle':
        return {
          border: `1px solid ${themeColors.border}`,
          backgroundColor: themeColors.cardBg,
          boxShadow: hover ? '0 1px 3px rgba(0, 0, 0, 0.05)' : undefined
        };
      default:
        return {
          border: `1px solid ${themeColors.border}`,
          backgroundColor: themeColors.cardBg,
          boxShadow: hover ? '0 1px 3px rgba(0, 0, 0, 0.1)' : undefined
        };
    }
  };

  const cardStyle = getCardStyle();
  
  const hoverClass = hover 
    ? 'transition-all duration-200 hover:shadow-md' 
    : '';

  return (
    <Card 
      className={`${className} ${hoverClass}`}
      style={cardStyle}
    >
      {(title || description) && (
        <CardHeader className={noPadding ? 'p-0 pb-2' : undefined}>
          {title && <CardTitle style={{ color: themeColors.textPrimary }}>{title}</CardTitle>}
          {description && (
            <CardDescription style={{ color: themeColors.textSecondary }}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      
      <CardContent className={noPadding ? 'p-0' : undefined}>
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className={noPadding ? 'p-0 pt-4' : undefined}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default ThemedCard;