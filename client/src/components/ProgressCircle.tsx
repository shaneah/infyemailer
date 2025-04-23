import React from 'react';
import { motion } from 'framer-motion';

interface ProgressCircleProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showText?: boolean;
  textSize?: number;
  textColor?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  size = 64,
  strokeWidth = 8,
  color = '#6366f1',
  showText = true,
  textSize = 16,
  textColor = '#1f2937'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e9ecef"
        strokeWidth={strokeWidth}
      />
      {/* Foreground circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      {/* Display text in the center */}
      {showText && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={textSize}
          fontWeight="bold"
          fill={textColor}
          className="transform rotate-90"
        >
          {value}
        </text>
      )}
    </svg>
  );
};

export default ProgressCircle;