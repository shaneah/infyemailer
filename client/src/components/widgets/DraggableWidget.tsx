import React, { ReactNode, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Widget } from '@/hooks/useWidgets';

const ItemTypes = {
  WIDGET: 'widget'
};

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

  // Set up the drag source
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.WIDGET,
    item: () => ({ 
      id: widget.id, 
      index, 
      row: widget.row,
      col: widget.col,
      sourceRow: widget.row,
      sourceCol: widget.col,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up the drop target
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.WIDGET,
    hover: (item: { id: string; index: number; sourceRow: number; sourceCol: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      
      const dragId = item.id;
      const hoverId = widget.id;
      
      // Don't replace items with themselves
      if (dragId === hoverId) {
        return;
      }

      // Calculate new row and column
      const targetRow = widget.row;
      const targetCol = widget.col;
      
      // Only perform move when actually hovering over a new position
      if (item.sourceRow !== targetRow || item.sourceCol !== targetCol) {
        // Update the moved widget's position
        moveWidget(dragId, targetCol, targetRow);
        
        // Remember new position
        item.sourceRow = targetRow;
        item.sourceCol = targetCol;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  // Connect the drag and drop refs
  drag(drop(ref));

  // Apply visual styles for dragging and hover states
  return (
    <div 
      ref={ref}
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isOver ? '0 0 10px rgba(100, 100, 255, 0.5)' : 'none',
        zIndex: isDragging ? 1000 : 1,
      }}
      className="widget-container transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
    >
      {children}
    </div>
  );
};

export default DraggableWidget;