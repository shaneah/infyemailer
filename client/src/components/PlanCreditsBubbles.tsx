import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface PlanCreditsBubblesProps {
  credits: number;
  isActive?: boolean;
  className?: string;
}

const PlanCreditsBubbles: React.FC<PlanCreditsBubblesProps> = ({ credits, isActive = false, className = "" }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  
  // Generate bubbles based on credits (more credits = more bubbles)
  useEffect(() => {
    const bubbleCount = Math.min(Math.max(Math.floor(credits / 1000), 3), 15);
    const newBubbles: Bubble[] = [];
    
    const colors = [
      'rgba(147, 51, 234, 0.7)',  // Purple
      'rgba(168, 85, 247, 0.65)', // Purple lighter
      'rgba(192, 132, 252, 0.6)', // Purple even lighter
      'rgba(79, 70, 229, 0.65)',  // Indigo
      'rgba(99, 102, 241, 0.6)'   // Indigo lighter
    ];
    
    for (let i = 0; i < bubbleCount; i++) {
      newBubbles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setBubbles(newBubbles);
  }, [credits]);
  
  return (
    <div className={`relative h-28 w-full overflow-hidden rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 ${className}`}>
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          initial={{ 
            x: `${bubble.x}%`, 
            y: `${bubble.y}%`,
            opacity: 0.4,
            scale: 0.8
          }}
          animate={{ 
            x: isActive ? [`${bubble.x}%`, `${(bubble.x + 10) % 100}%`, `${bubble.x}%`] : `${bubble.x}%`,
            y: isActive ? [`${bubble.y}%`, `${(bubble.y + 15) % 100}%`, `${bubble.y}%`] : `${bubble.y}%`,
            opacity: isActive ? [0.4, 0.9, 0.4] : 0.4,
            scale: isActive ? [0.8, 1.1, 0.8] : 0.8
          }}
          transition={isActive ? {
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: bubble.id * 0.2
          } : {}}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            backgroundColor: bubble.color
          }}
        />
      ))}
      
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="block text-2xl font-bold text-center text-purple-800">{credits.toLocaleString()}</span>
          <span className="block text-sm text-purple-600 text-center">Email Credits</span>
        </motion.div>
      </div>
    </div>
  );
};

export default PlanCreditsBubbles;