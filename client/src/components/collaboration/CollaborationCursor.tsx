import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CollaborationCursorProps {
  username: string;
  color: string;
  position: { x: number; y: number };
  isActive: boolean;
}

/**
 * Displays the cursor position of another user in the collaboration mode
 */
export function CollaborationCursor({ 
  username, 
  color, 
  position, 
  isActive 
}: CollaborationCursorProps) {
  const lastActivityRef = useRef<number>(Date.now());
  const opacityRef = useRef<number>(1);
  
  // Update last activity when position changes
  useEffect(() => {
    if (isActive) {
      lastActivityRef.current = Date.now();
      opacityRef.current = 1;
    }
  }, [position, isActive]);
  
  // Animate cursor to be more visible when it moves
  const variants = {
    active: { 
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 }
    },
    inactive: { 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  if (!isActive) return null;
  
  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      style={{ 
        left: position.x, 
        top: position.y,
        opacity: opacityRef.current
      }}
      initial="inactive"
      animate={isActive ? "active" : "inactive"}
      variants={variants}
    >
      {/* Custom cursor */}
      <div 
        className="relative"
        style={{ transform: 'translateY(-100%)' }}
      >
        {/* Cursor pointer */}
        <svg 
          width="16" 
          height="24" 
          viewBox="0 0 16 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ 
            fill: color,
            filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.25))'
          }}
        >
          <path d="M0 0L0 16L3.5 12.5L7 20L10 18.5L6.5 11L11 11L0 0Z" />
        </svg>
        
        {/* Username label */}
        <div 
          className="absolute left-4 top-0 px-2 py-1 rounded text-xs whitespace-nowrap"
          style={{ 
            backgroundColor: color,
            color: '#fff',
            fontWeight: 500,
            boxShadow: '0px 1px 3px rgba(0,0,0,0.2)'
          }}
        >
          {username}
        </div>
      </div>
    </motion.div>
  );
}