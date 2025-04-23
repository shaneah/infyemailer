import React, { ReactNode, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Widget } from '@/hooks/useWidgets';

// Define a constant for the drag type
export const WIDGET_TYPE = 'widget';

interface DraggableWidgetProps {
  widget: Widget;
  index: number;
  moveWidget: (id: string, col: number, row: number) => void;
  children: ReactNode;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({ 
  widget, 
  index,
  moveWidget, 
  children 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Setup drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: WIDGET_TYPE,
    item: { 
      id: widget.id, 
      index,
      originalRow: widget.row,
      originalCol: widget.col
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Setup drop functionality
  const [{ isOver }, drop] = useDrop({
    accept: WIDGET_TYPE,
    drop: (item: { id: string, originalRow: number, originalCol: number }) => {
      // Only move if it's not the same widget
      if (item.id !== widget.id) {
        // Move the dragged widget to this widget's position
        moveWidget(item.id, widget.col, widget.row);
      }
    },
    hover: (item: { id: string, originalRow: number, originalCol: number }, monitor) => {
      // Skip processing if hovering over itself
      if (item.id === widget.id) {
        return;
      }
      
      if (!ref.current) {
        return;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Initialize drag-and-drop refs
  drag(drop(ref));

  return (
    <div 
      ref={ref} 
      className="widget-wrapper"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        position: 'relative',
        transition: 'all 0.2s ease',
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isOver ? '0 0 15px rgba(77, 51, 153, 0.3)' : 'none',
        zIndex: isDragging ? 1000 : 1
      }}
    >
      <div className={`widget-container transition-all duration-200 ${isOver ? 'ring-2 ring-purple-400 ring-opacity-50' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default DraggableWidget;