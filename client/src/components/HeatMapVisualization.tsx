import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DataPoint {
  x: number;
  y: number;
  value: number;
  type: string;
}

interface HeatMapVisualizationProps {
  dataPoints: DataPoint[];
  maxIntensity: number;
  width: number;
  height: number;
  className?: string;
  emailContent?: string; // HTML content of the email to overlay the heat map on
  showOverlay?: boolean; // Whether to show the heat map as an overlay on the email content
}

const colorRanges = [
  { threshold: 0.2, color: 'rgba(0, 200, 255, VAR_OPACITY)' },  // Low intensity - blue
  { threshold: 0.4, color: 'rgba(0, 255, 170, VAR_OPACITY)' },  // Low-medium intensity - teal
  { threshold: 0.6, color: 'rgba(255, 255, 0, VAR_OPACITY)' },  // Medium intensity - yellow
  { threshold: 0.8, color: 'rgba(255, 128, 0, VAR_OPACITY)' },  // High-medium intensity - orange
  { threshold: 1.0, color: 'rgba(255, 0, 0, VAR_OPACITY)' },    // High intensity - red
];

const HeatMapVisualization = ({
  dataPoints,
  maxIntensity,
  width,
  height,
  className = '',
  emailContent,
  showOverlay = false
}: HeatMapVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const emailContainerRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (dataPoints.length === 0) {
      // Draw "No Data" message
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No interaction data available', width / 2, height / 2);
      return;
    }

    // Draw heat map
    dataPoints.forEach(point => {
      const normalizedValue = maxIntensity > 0 ? point.value / maxIntensity : 0;
      
      // Determine color based on intensity
      let color = colorRanges[colorRanges.length - 1].color;
      for (const range of colorRanges) {
        if (normalizedValue <= range.threshold) {
          color = range.color;
          break;
        }
      }

      // Calculate size based on intensity (between 10 and 30)
      const size = 10 + (normalizedValue * 20);
      
      // Replace VAR_OPACITY with actual opacity value (between 0.3 and 0.8)
      const opacity = 0.3 + (normalizedValue * 0.5);
      const actualColor = color.replace('VAR_OPACITY', opacity.toString());
      
      // Draw the heat spot
      const xPos = (point.x / 100) * width;
      const yPos = (point.y / 100) * height;
      
      // Create radial gradient for a more realistic heat spot
      const gradient = ctx.createRadialGradient(
        xPos, yPos, 0,
        xPos, yPos, size
      );
      gradient.addColorStop(0, actualColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(xPos, yPos, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [dataPoints, maxIntensity, width, height]);

  useEffect(() => {
    if (showOverlay && emailContent && emailContainerRef.current) {
      emailContainerRef.current.innerHTML = emailContent;
    }
  }, [emailContent, showOverlay]);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {showOverlay && emailContent && (
        <div 
          ref={emailContainerRef} 
          className="absolute inset-0 overflow-auto"
          style={{ zIndex: 1 }}
        />
      )}
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`${showOverlay ? 'absolute inset-0' : ''}`}
        style={{ zIndex: showOverlay ? 2 : 1, opacity: showOverlay ? 0.7 : 1 }}
      />
      
      {dataPoints.length > 0 && (
        <div className="absolute bottom-2 right-2 bg-white/90 rounded-md shadow-md p-2 flex items-center space-x-2 z-10">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(0, 200, 255, 0.7)' }} />
            <span className="text-xs">Low</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255, 255, 0, 0.7)' }} />
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255, 0, 0, 0.7)' }} />
            <span className="text-xs">High</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatMapVisualization;