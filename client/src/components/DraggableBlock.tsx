import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { 
  ImageIcon, 
  Type, 
  Link as LinkIcon,
  SeparatorHorizontal, 
  Video, 
  Share2, 
  Menu, 
  Clock, 
  SlidersHorizontal, 
  ChevronsUpDown, 
  FileCode, 
  FormInput,
  CheckSquare
} from 'lucide-react';

interface DraggableBlockProps {
  type: string;
  title: string;
  icon: React.ReactNode;
}

export const ITEM_TYPES = {
  CONTENT_BLOCK: 'contentBlock',
  STRUCTURE: 'structure'
};

const DraggableBlock: React.FC<DraggableBlockProps> = ({ type, title, icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPES.CONTENT_BLOCK,
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`border border-gray-200 rounded p-2 hover:border-[#1a3a5f]/60 cursor-pointer transition-colors text-center ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex justify-center mb-1.5">
        {icon}
      </div>
      <p className="text-xs">{title}</p>
    </div>
  );
};

interface BlocksGridProps {
  onBlockDrop: (blockType: string) => void;
}

export const BlocksGrid: React.FC<BlocksGridProps> = ({ onBlockDrop }) => {
  const blocks = [
    { type: 'image', title: 'Image', icon: <ImageIcon className="h-5 w-5 text-gray-600" /> },
    { type: 'text', title: 'Text', icon: <Type className="h-5 w-5 text-gray-600" /> },
    { type: 'button', title: 'Button', icon: <div className="h-5 w-5 flex items-center justify-center text-gray-600">
      <div className="w-4 h-3 border border-gray-600 rounded text-[10px] flex items-center justify-center">B</div>
    </div> },
    { type: 'spacer', title: 'Spacer', icon: <div className="h-5 w-5 flex flex-col justify-center items-center">
      <div className="h-0.5 w-4 bg-gray-600"></div>
    </div> },
    { type: 'video', title: 'Video', icon: <Video className="h-5 w-5 text-gray-600" /> },
    { type: 'social', title: 'Social', icon: <Share2 className="h-5 w-5 text-gray-600" /> },
    { type: 'menu', title: 'Menu', icon: <Menu className="h-5 w-5 text-gray-600" /> },
    { type: 'timer', title: 'Timer', icon: <Clock className="h-5 w-5 text-gray-600" /> },
    { type: 'carousel', title: 'Carousel', icon: <SlidersHorizontal className="h-5 w-5 text-gray-600" /> },
    { type: 'accordion', title: 'Accordion', icon: <ChevronsUpDown className="h-5 w-5 text-gray-600" /> },
    { type: 'html', title: 'HTML', icon: <FileCode className="h-5 w-5 text-gray-600" /> },
    { type: 'form', title: 'Form', icon: <FormInput className="h-5 w-5 text-gray-600" /> },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {blocks.map((block) => (
        <DraggableBlock 
          key={block.type} 
          type={block.type} 
          title={block.title} 
          icon={block.icon} 
        />
      ))}
    </div>
  );
};

interface StructureItemProps {
  columns: number;
  title: string;
}

export const StructureItem: React.FC<StructureItemProps> = ({ columns, title }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPES.STRUCTURE,
    item: { type: 'structure', columns },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const renderColumnPreview = () => {
    if (columns === 1) {
      return <div className="w-full h-2 bg-gray-200 rounded"></div>;
    } else if (columns === 2) {
      return (
        <div className="flex items-center justify-center space-x-1">
          <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
        </div>
      );
    } else if (columns === 3) {
      return (
        <div className="flex items-center justify-center space-x-1">
          <div className="w-1/3 h-2 bg-gray-200 rounded"></div>
          <div className="w-1/3 h-2 bg-gray-200 rounded"></div>
          <div className="w-1/3 h-2 bg-gray-200 rounded"></div>
        </div>
      );
    } else if (columns === 4) {
      return (
        <div className="flex items-center justify-center space-x-1">
          <div className="w-1/3 h-2 bg-gray-200 rounded"></div>
          <div className="w-2/3 h-2 bg-gray-200 rounded"></div>
        </div>
      );
    }
  };

  return (
    <div
      ref={drag}
      className={`border border-gray-200 rounded p-2 hover:border-[#1a3a5f]/60 cursor-pointer transition-colors ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="h-10 flex items-center justify-center">
        {renderColumnPreview()}
      </div>
      <p className="text-xs text-center mt-2">{title}</p>
    </div>
  );
};

export const StructuresGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-2 mb-6">
      <StructureItem columns={1} title="1 Column" />
      <StructureItem columns={2} title="2 Columns" />
      <StructureItem columns={3} title="3 Columns" />
      <StructureItem columns={4} title="1:2 Ratio" />
    </div>
  );
};

export default DraggableBlock;