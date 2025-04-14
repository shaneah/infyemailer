import React from 'react';
import { useDrop } from 'react-dnd';
import { ITEM_TYPES } from './DraggableBlock';

interface DroppableAreaProps {
  onDrop: (item: any) => void;
  className?: string;
  children?: React.ReactNode;
  placeholder?: string;
}

const DroppableArea: React.FC<DroppableAreaProps> = ({ 
  onDrop, 
  className = '', 
  children, 
  placeholder = 'Drop content here' 
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ITEM_TYPES.CONTENT_BLOCK, ITEM_TYPES.STRUCTURE],
    drop: (item) => {
      onDrop(item);
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const isActive = isOver && canDrop;
  
  return (
    <div
      ref={drop}
      className={`
        border-2 border-dashed ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} 
        rounded-md p-4 mb-4 min-h-[120px] flex items-center justify-center transition-colors 
        ${className}
      `}
    >
      {children || (
        <p className="text-center text-sm text-gray-400">
          {placeholder}
        </p>
      )}
    </div>
  );
};

export default DroppableArea;