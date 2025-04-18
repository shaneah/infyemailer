import React, { ReactNode } from 'react';
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
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.WIDGET,
    item: { id: widget.id, index, widget },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.WIDGET,
    hover: (item: { id: string; index: number; widget: Widget }) => {
      if (item.id !== widget.id) {
        // Determine new position based on row/col
        moveWidget(item.id, widget.col, widget.row);
      }
    },
  });

  // Apply the drag and drop refs to the widget
  return (
    <div 
      ref={(node) => drag(drop(node))}
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
      className="transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
    >
      {children}
    </div>
  );
};

export default DraggableWidget;