import React, { useRef, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface EmailInteractionTrackerProps {
  emailId: number;
  campaignId: number;
  contactId?: number;
  children: React.ReactNode;
  className?: string;
}

interface InteractionData {
  emailId: number;
  campaignId: number;
  contactId?: number;
  elementId?: string;
  elementType?: string;
  xCoordinate: number;
  yCoordinate: number;
  interactionType: string;
  interactionDuration?: number;
  metadata?: Record<string, any>;
}

const EmailInteractionTracker: React.FC<EmailInteractionTrackerProps> = ({
  emailId,
  campaignId,
  contactId,
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTracking, setIsTracking] = useState(true);
  const hoverStartTimeRef = useRef<Record<string, number>>({});
  
  // Normalize coordinates to percentage of container
  const normalizeCoordinates = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } | null => {
    if (!containerRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate position relative to container
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    // Convert to percentage (0-100)
    const percentX = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
    
    return { x: percentX, y: percentY };
  };
  
  // Track click events
  const handleClick = (e: MouseEvent) => {
    if (!isTracking) return;
    
    const target = e.target as HTMLElement;
    const coords = normalizeCoordinates(e.clientX, e.clientY);
    
    if (!coords) return;
    
    const interactionData: InteractionData = {
      emailId,
      campaignId,
      contactId,
      elementId: target.id || undefined,
      elementType: target.tagName.toLowerCase(),
      xCoordinate: coords.x,
      yCoordinate: coords.y,
      interactionType: 'click',
      metadata: {
        href: target.tagName.toLowerCase() === 'a' ? (target as HTMLAnchorElement).href : undefined,
        text: target.textContent || undefined,
        classes: target.className || undefined,
      }
    };
    
    recordInteraction(interactionData);
  };
  
  // Track hover events
  const handleMouseOver = (e: MouseEvent) => {
    if (!isTracking) return;
    
    const target = e.target as HTMLElement;
    const targetKey = `${target.tagName}_${target.id || Math.random()}`;
    
    // Record start time of hover
    hoverStartTimeRef.current[targetKey] = Date.now();
  };
  
  const handleMouseOut = (e: MouseEvent) => {
    if (!isTracking) return;
    
    const target = e.target as HTMLElement;
    const targetKey = `${target.tagName}_${target.id || Math.random()}`;
    
    // If we have a start time, calculate duration
    if (hoverStartTimeRef.current[targetKey]) {
      const duration = Date.now() - hoverStartTimeRef.current[targetKey];
      
      // Only record if hover was longer than 500ms
      if (duration > 500) {
        const coords = normalizeCoordinates(e.clientX, e.clientY);
        
        if (!coords) return;
        
        const interactionData: InteractionData = {
          emailId,
          campaignId,
          contactId,
          elementId: target.id || undefined,
          elementType: target.tagName.toLowerCase(),
          xCoordinate: coords.x,
          yCoordinate: coords.y,
          interactionType: 'hover',
          interactionDuration: duration,
          metadata: {
            text: target.textContent || undefined,
            classes: target.className || undefined,
          }
        };
        
        recordInteraction(interactionData);
      }
      
      // Clean up
      delete hoverStartTimeRef.current[targetKey];
    }
  };
  
  // Track scroll events (throttled)
  const handleScroll = (() => {
    let lastScrollTime = 0;
    
    return () => {
      if (!isTracking || !containerRef.current) return;
      
      const now = Date.now();
      
      // Throttle to once every 1000ms
      if (now - lastScrollTime < 1000) return;
      
      lastScrollTime = now;
      
      const scrollPercentY = (containerRef.current.scrollTop / 
        (containerRef.current.scrollHeight - containerRef.current.clientHeight)) * 100;
      
      const interactionData: InteractionData = {
        emailId,
        campaignId,
        contactId,
        xCoordinate: 50, // Center X
        yCoordinate: scrollPercentY,
        interactionType: 'scroll',
        metadata: {
          scrollTop: containerRef.current.scrollTop,
          scrollHeight: containerRef.current.scrollHeight,
          clientHeight: containerRef.current.clientHeight,
        }
      };
      
      recordInteraction(interactionData);
    };
  })();
  
  // Send interaction data to the server
  const recordInteraction = async (data: InteractionData) => {
    try {
      await apiRequest('POST', '/api/heat-maps/interactions', data);
    } catch (error) {
      console.error('Failed to record interaction:', error);
    }
  };
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Add event listeners
    container.addEventListener('click', handleClick);
    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseout', handleMouseOut);
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      // Remove event listeners
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseout', handleMouseOut);
      container.removeEventListener('scroll', handleScroll);
      setIsTracking(false);
    };
  }, [emailId, campaignId, contactId]);
  
  return (
    <div 
      ref={containerRef} 
      className={`email-interaction-tracker ${className}`}
      style={{ position: 'relative' }}
    >
      {children}
    </div>
  );
};

export default EmailInteractionTracker;