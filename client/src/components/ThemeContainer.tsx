import React, { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeContainerProps {
  children: ReactNode;
  className?: string;
  applyBackground?: boolean;
  applyTextColor?: boolean;
  applyBorder?: boolean;
}

const ThemeContainer: React.FC<ThemeContainerProps> = ({
  children,
  className = '',
  applyBackground = true,
  applyTextColor = true,
  applyBorder = false
}) => {
  const { themeColors } = useTheme();
  
  const containerStyle: React.CSSProperties = {
    ...(applyBackground && { backgroundColor: themeColors.background }),
    ...(applyTextColor && { color: themeColors.textPrimary }),
    ...(applyBorder && { borderColor: themeColors.border })
  };
  
  return (
    <div className={className} style={containerStyle}>
      {children}
    </div>
  );
};

export default ThemeContainer;