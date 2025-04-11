import React, { useRef, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [trackingActive, setTrackingActive] = useState(true);
  const [hoveredElementStart, setHoveredElementStart] = useState<{
    element: HTMLElement;
    time: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !trackingActive) return;

    // Save current time when tracking starts
    const trackingStartTime = Date.now();

    // Track clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Get coordinates relative to the container
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const interactionData: InteractionData = {
        emailId,
        campaignId,
        contactId,
        elementId: target.id || undefined,
        elementType: target.tagName.toLowerCase(),
        xCoordinate: x,
        yCoordinate: y,
        interactionType: 'click',
        metadata: {
          href: target.tagName === 'A' ? (target as HTMLAnchorElement).href : undefined,
          innerText: target.innerText?.substring(0, 50),
          classNames: target.className,
        },
      };

      recordInteraction(interactionData);
    };

    // Track hover events
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target !== container) {
        setHoveredElementStart({
          element: target,
          time: Date.now(),
        });
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (hoveredElementStart && hoveredElementStart.element === target) {
        const hoverDuration = Date.now() - hoveredElementStart.time;
        
        // Only track hovers that last at least 500ms (configurable)
        if (hoverDuration >= 500) {
          const rect = container.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const interactionData: InteractionData = {
            emailId,
            campaignId,
            contactId,
            elementId: target.id || undefined,
            elementType: target.tagName.toLowerCase(),
            xCoordinate: x,
            yCoordinate: y,
            interactionType: 'hover',
            interactionDuration: hoverDuration,
            metadata: {
              href: target.tagName === 'A' ? (target as HTMLAnchorElement).href : undefined,
              innerText: target.innerText?.substring(0, 50),
              classNames: target.className,
            },
          };
          
          recordInteraction(interactionData);
        }
        
        setHoveredElementStart(null);
      }
    };

    // Track scroll (record only once per second to avoid excessive data)
    let lastScrollTime = 0;
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime > 1000) {
        lastScrollTime = now;
        
        const interactionData: InteractionData = {
          emailId,
          campaignId,
          contactId,
          xCoordinate: container.scrollLeft,
          yCoordinate: container.scrollTop,
          interactionType: 'scroll',
          metadata: {
            scrollPercentage: Math.round((container.scrollTop / (container.scrollHeight - container.clientHeight)) * 100),
          },
        };
        
        recordInteraction(interactionData);
      }
    };

    // Add event listeners
    container.addEventListener('click', handleClick);
    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseout', handleMouseOut);
    container.addEventListener('scroll', handleScroll);

    // Record initial view
    const initialViewData: InteractionData = {
      emailId,
      campaignId,
      contactId,
      xCoordinate: 0,
      yCoordinate: 0,
      interactionType: 'view',
      metadata: {
        viewportWidth: container.clientWidth,
        viewportHeight: container.clientHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
      },
    };
    
    recordInteraction(initialViewData);

    toast({
      title: "Interaction tracking started",
      description: "Your interactions with this email are being recorded.",
      duration: 3000,
    });

    // Clean up event listeners
    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseout', handleMouseOut);
      container.removeEventListener('scroll', handleScroll);
      
      // Record session duration when component unmounts
      const sessionDuration = Date.now() - trackingStartTime;
      
      const finalData: InteractionData = {
        emailId,
        campaignId,
        contactId,
        xCoordinate: 0,
        yCoordinate: 0,
        interactionType: 'session',
        interactionDuration: sessionDuration,
        metadata: {
          totalDuration: sessionDuration,
        },
      };
      
      recordInteraction(finalData);
    };
  }, [emailId, campaignId, contactId, trackingActive, hoveredElementStart, toast]);

  // Send interaction data to the server
  const recordInteraction = async (data: InteractionData) => {
    try {
      await fetch('/api/heat-maps/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to record interaction:', error);
    }
  };

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default EmailInteractionTracker;