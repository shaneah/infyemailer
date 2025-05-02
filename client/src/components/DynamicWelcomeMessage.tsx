import React, { useState, useEffect } from 'react';
import { Coffee, Sun, Moon, Sunset, Calendar, Clock } from 'lucide-react';

interface DynamicWelcomeMessageProps {
  clientName?: string;
  className?: string;
  showTime?: boolean;
  showDate?: boolean;
  showIcon?: boolean;
  compact?: boolean;
}

/**
 * A dynamic welcome message component that changes based on user's local time
 * Shows different greeting messages and icons based on time of day
 */
const DynamicWelcomeMessage: React.FC<DynamicWelcomeMessageProps> = ({
  clientName,
  className = '',
  showTime = true,
  showDate = true,
  showIcon = true,
  compact = false
}) => {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [welcomeIcon, setWelcomeIcon] = useState<React.ReactNode>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  // Set up time-based welcome message
  useEffect(() => {
    // Function to update the welcome message based on time
    const updateWelcomeMessage = () => {
      const now = new Date();
      setCurrentDateTime(now);
      
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const day = now.toLocaleDateString('en-US', { weekday: 'long' });
      const month = now.toLocaleDateString('en-US', { month: 'long' });
      const dayOfMonth = now.getDate();
      
      // Set message and icon based on time of day
      let timeMessage = '';
      let timeContext = '';
      
      if (hour >= 5 && hour < 12) {
        timeMessage = 'Good morning';
        setWelcomeIcon(<Coffee className="h-4 w-4 text-amber-500" />);
      } else if (hour >= 12 && hour < 17) {
        timeMessage = 'Good afternoon';
        setWelcomeIcon(<Sun className="h-4 w-4 text-amber-500" />);
      } else if (hour >= 17 && hour < 21) {
        timeMessage = 'Good evening';
        setWelcomeIcon(<Sunset className="h-4 w-4 text-amber-500" />);
      } else {
        timeMessage = 'Good night';
        setWelcomeIcon(<Moon className="h-4 w-4 text-blue-500" />);
      }
      
      // Format time
      const formattedTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      // Format date
      const formattedDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
      
      // Check for special occasions
      let specialMessage = '';
      if (month === 'January' && dayOfMonth === 1) {
        specialMessage = ' Happy New Year!';
      } else if (month === 'December' && dayOfMonth === 25) {
        specialMessage = ' Merry Christmas!';
      } else if (day === 'Friday') {
        specialMessage = ' Happy Friday!';
      } else if (day === 'Monday') {
        specialMessage = ' Ready for a productive week?';
      }
      
      // Build the final welcome message
      let finalMessage = '';
      
      if (compact) {
        // Compact version just has greeting and name
        finalMessage = clientName 
          ? `${timeMessage}, ${clientName}${specialMessage}`
          : `${timeMessage}${specialMessage}`;
      } else {
        // Full version with time and date
        let timeComponent = showTime ? ` • ${formattedTime}` : '';
        let dateComponent = showDate ? ` • ${formattedDate}` : '';
        
        finalMessage = clientName 
          ? `${timeMessage}, ${clientName}${specialMessage}${timeComponent}${dateComponent}`
          : `${timeMessage}${specialMessage}${timeComponent}${dateComponent}`;
      }
      
      setWelcomeMessage(finalMessage);
    };
    
    // Initial update
    updateWelcomeMessage();
    
    // Update every minute
    const timer = setInterval(updateWelcomeMessage, 60000);
    
    // Clean up
    return () => clearInterval(timer);
  }, [clientName, showTime, showDate, compact]);
  
  return (
    <div className={`flex items-center gap-1.5 text-sm ${className}`}>
      {showIcon && welcomeIcon}
      <span>{welcomeMessage}</span>
    </div>
  );
};

export default DynamicWelcomeMessage;