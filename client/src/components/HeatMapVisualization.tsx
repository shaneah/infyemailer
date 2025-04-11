import React, { useEffect, useRef, useState } from 'react';

export interface DataPoint {
  xCoordinate: number;
  yCoordinate: number;
  intensity?: number;
  type: string;
}

interface HeatMapVisualizationProps {
  data: {
    dataPoints: DataPoint[];
    maxIntensity: number;
  };
  emailContent: string;
  width?: string | number;
  height?: string | number;
}

const HeatMapVisualization: React.FC<HeatMapVisualizationProps> = ({
  data,
  emailContent,
  width = 800,
  height = 600
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Initialize the container size when email content is loaded
  useEffect(() => {
    if (containerRef.current && emailContent && !initialized) {
      // Add the email content to the DOM to get its dimensions
      containerRef.current.innerHTML = emailContent;
      
      // Get the actual width and height of the email content
      const emailWidth = containerRef.current.scrollWidth;
      const emailHeight = containerRef.current.scrollHeight;
      
      // Set the container width and height
      setContainerWidth(emailWidth);
      setContainerHeight(emailHeight);
      
      // Calculate the scale based on the container width
      const containerWidth = typeof width === 'number' ? width : parseInt(width, 10) || 800;
      const newScale = containerWidth / emailWidth;
      setScale(newScale);
      
      setInitialized(true);
    }
  }, [emailContent, width, height, initialized]);

  // Draw the heat map when the data changes
  useEffect(() => {
    if (!canvasRef.current || !containerWidth || !containerHeight || data.dataPoints.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return;
    }
    
    // Set canvas dimensions
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw individual heat points
    data.dataPoints.forEach((point) => {
      const { xCoordinate, yCoordinate, intensity = 1, type } = point;
      
      // Determine the radius based on intensity
      const radius = Math.max(10, 15 * (intensity / (data.maxIntensity || 1)));
      
      // Create a radial gradient for the heat effect
      const gradient = ctx.createRadialGradient(
        xCoordinate, yCoordinate, 0,
        xCoordinate, yCoordinate, radius
      );
      
      // Set gradient colors based on interaction type
      if (type === 'click') {
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      } else if (type === 'hover') {
        gradient.addColorStop(0, 'rgba(0, 0, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 165, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
      }
      
      // Draw the heat point
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(xCoordinate, yCoordinate, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [data, containerWidth, containerHeight]);

  // Reset and re-initialize when container changes
  const resetVisualization = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = emailContent;
      setInitialized(false);
    }
  };

  return (
    <div className="relative" style={{ width, height: typeof height === 'number' ? `${height}px` : height, overflow: 'auto' }}>
      {/* Email content container for sizing */}
      <div 
        ref={containerRef} 
        className="absolute top-0 left-0 opacity-40 pointer-events-none" 
        style={{ width: '100%', transform: `scale(${scale})`, transformOrigin: 'top left' }}
      />
      
      {/* Heat map canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 z-10 pointer-events-none" 
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      />
      
      {/* Original email content */}
      <div 
        className="relative z-0"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        dangerouslySetInnerHTML={{ __html: emailContent }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-md z-20 text-xs">
        <div className="flex items-center mb-1">
          <span className="w-3 h-3 inline-block mr-2 rounded-full bg-red-500"></span>
          <span>Click</span>
        </div>
        <div className="flex items-center mb-1">
          <span className="w-3 h-3 inline-block mr-2 rounded-full bg-blue-500"></span>
          <span>Hover</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 inline-block mr-2 rounded-full bg-orange-500"></span>
          <span>Other interactions</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMapVisualization;