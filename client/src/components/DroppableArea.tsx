import React from 'react';

interface DroppableAreaProps {
  onDrop: (item: any) => void;
  placeholder: string;
}

const DroppableArea: React.FC<DroppableAreaProps> = ({ onDrop, placeholder }) => {
  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-md p-6 my-4 flex flex-col items-center justify-center text-gray-500 hover:border-[#1a3a5f]/50 transition-colors"
      style={{ minHeight: '100px' }}
    >
      <p className="text-sm text-center">{placeholder}</p>
      <p className="text-xs mt-2 text-center">Click on blocks in the sidebar to add content</p>
    </div>
  );
};

export default DroppableArea;