import React from 'react';

interface CollaborationSelectionProps {
  username: string;
  color: string;
  elementId: string;
  selection: { start: number; end: number };
}

/**
 * Displays the text selection of another user in collaboration mode
 * This component should be rendered inside the text element that contains the selection
 */
export function CollaborationSelection({
  username,
  color,
  elementId,
  selection,
}: CollaborationSelectionProps) {
  // Find the target text element by ID
  const applySelectionHighlight = React.useCallback(() => {
    try {
      const element = document.getElementById(elementId);
      if (!element) return null;
      
      // Only support text elements for now
      if (element.tagName !== 'INPUT' && 
          element.tagName !== 'TEXTAREA' && 
          !element.getAttribute('contenteditable')) {
        return null;
      }
      
      // For contenteditable elements, highlighting is more complex
      // This is a simplified version that works for simple text
      const text = element.textContent || '';
      if (!text || selection.start >= text.length || selection.end <= 0) return null;
      
      // Normalize selection indices
      const startIndex = Math.max(0, selection.start);
      const endIndex = Math.min(text.length, selection.end);
      
      // Calculate position for the highlight element
      // This is complex and would require measuring text positions
      // A simplified version just highlights the whole element for now
      const rect = element.getBoundingClientRect();
      
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    } catch (err) {
      console.error('Error applying selection highlight:', err);
      return null;
    }
  }, [elementId, selection]);
  
  const highlightPosition = applySelectionHighlight();
  if (!highlightPosition) return null;
  
  // Create a colored highlight element
  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: highlightPosition.left,
        top: highlightPosition.top,
        width: highlightPosition.width,
        height: highlightPosition.height,
        backgroundColor: `${color}33`, // Use the color with 20% opacity
        border: `2px solid ${color}`,
        borderRadius: '2px',
      }}
    >
      {/* Username label */}
      <div 
        className="absolute -top-6 left-0 px-2 py-1 rounded text-xs whitespace-nowrap"
        style={{ 
          backgroundColor: color,
          color: '#fff',
          fontWeight: 500,
          boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
          zIndex: 41
        }}
      >
        {username} is editing...
      </div>
    </div>
  );
}