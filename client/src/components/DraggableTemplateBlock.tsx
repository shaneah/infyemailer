import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
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
  CheckSquare,
  MoveVertical,
  Trash2
} from 'lucide-react';

// Constants for drag and drop
export const ItemTypes = {
  BLOCK: 'block',
  COLUMN: 'column'
};

// Block types available for the template
export const BlockTypes = {
  IMAGE: 'image',
  TEXT: 'text',
  BUTTON: 'button',
  SPACER: 'spacer',
  VIDEO: 'video',
  SOCIAL: 'social',
  MENU: 'menu',
  TIMER: 'timer',
  CAROUSEL: 'carousel',
  ACCORDION: 'accordion',
  HTML: 'html',
  FORM: 'form'
};

// Column structure types
export const ColumnTypes = {
  ONE_COLUMN: 'one_column',
  TWO_COLUMNS: 'two_columns',
  THREE_COLUMNS: 'three_columns',
  ONE_TWO_RATIO: 'one_two_ratio'
};

// Interface for a block item
export interface BlockItem {
  id: string;
  type: string;
  content?: any;
  columns?: BlockItem[][];
}

// Interface for the draggable block component
interface DraggableBlockProps {
  id: string;
  index: number;
  type: string;
  content?: any;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  removeBlock: (id: string) => void;
  columns?: BlockItem[][];
  updateBlockContent?: (id: string, content: any) => void;
}

// Component for draggable template blocks
const DraggableBlock: React.FC<DraggableBlockProps> = ({ 
  id, 
  index, 
  type, 
  content, 
  moveBlock, 
  removeBlock,
  columns,
  updateBlockContent
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BLOCK,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop functionality
  const [, drop] = useDrop({
    accept: ItemTypes.BLOCK,
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Get rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      moveBlock(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  
  // Initialize drag and drop
  drag(drop(ref));
  
  // State for editing mode 
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingContent, setEditingContent] = React.useState<any>(content || {});
  
  // Handle edit completion
  const handleEditComplete = () => {
    setIsEditing(false);
    if (updateBlockContent) {
      updateBlockContent(id, editingContent);
    }
  };
  
  // Handle edit click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingContent(content || {});
  };
  
  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingContent(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Render the block based on type
  const renderBlockContent = () => {
    switch (type) {
      case BlockTypes.IMAGE:
        return (
          <div 
            className="p-4 bg-gray-100 rounded flex flex-col items-center justify-center min-h-[100px] cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="w-full space-y-3">
                <div>
                  <label className="block text-xs mb-1 font-medium">Image URL</label>
                  <input 
                    type="text" 
                    name="src"
                    value={editingContent.src || ''}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium">Alt Text</label>
                  <input 
                    type="text" 
                    name="alt"
                    value={editingContent.alt || ''}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Image description"
                  />
                </div>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : content?.src ? (
              <img 
                src={content.src} 
                alt={content.alt || 'Image'} 
                className="max-w-full max-h-[200px] object-contain" 
              />
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-gray-400" />
                <span className="ml-2 text-gray-500">Image Block (Click to edit)</span>
              </>
            )}
          </div>
        );
      
      case BlockTypes.TEXT:
        return (
          <div 
            className="p-4 bg-gray-50 rounded min-h-[60px] cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="w-full">
                <textarea 
                  name="text"
                  value={editingContent.text || ''}
                  onChange={handleContentChange}
                  className="w-full p-2 border rounded min-h-[100px] text-sm"
                  placeholder="Enter your text here..."
                />
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-gray-600">
                {content?.text || 'Text content goes here. Click to edit.'}
              </p>
            )}
          </div>
        );
      
      case BlockTypes.BUTTON:
        return (
          <div 
            className="p-4 flex flex-col items-center cursor-pointer"
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="w-full space-y-3">
                <div>
                  <label className="block text-xs mb-1 font-medium">Button Text</label>
                  <input 
                    type="text" 
                    name="label"
                    value={editingContent.label || ''}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Button text"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium">Link URL</label>
                  <input 
                    type="text" 
                    name="url"
                    value={editingContent.url || ''}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="https://example.com"
                  />
                </div>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : (
              <button className="px-4 py-2 bg-[#1a3a5f] text-white rounded hover:bg-[#1a3a5f]/90">
                {content?.label || 'Button'}
              </button>
            )}
          </div>
        );
      
      case BlockTypes.SPACER:
        return (
          <div 
            className="cursor-pointer hover:bg-gray-50 transition-colors" 
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="p-4 w-full">
                <label className="block text-xs mb-1 font-medium">Height (px)</label>
                <input 
                  type="number" 
                  name="height"
                  value={editingContent.height || 32}
                  onChange={handleContentChange}
                  className="w-full p-2 border rounded text-sm"
                  min="1"
                  max="200"
                />
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{ height: `${content?.height || 32}px` }} className="bg-gray-100/50 relative">
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                  Spacer ({content?.height || 32}px)
                </div>
              </div>
            )}
          </div>
        );
      
      case BlockTypes.VIDEO:
        return (
          <div 
            className="p-4 bg-gray-100 rounded flex flex-col items-center justify-center min-h-[120px] cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="w-full space-y-3">
                <div>
                  <label className="block text-xs mb-1 font-medium">Video URL (YouTube, Vimeo)</label>
                  <input 
                    type="text" 
                    name="url"
                    value={editingContent.url || ''}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : content?.url ? (
              <div className="w-full relative pt-[56.25%]">
                <iframe 
                  src={content.url.replace('watch?v=', 'embed/')} 
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <>
                <Video className="h-10 w-10 text-gray-400" />
                <span className="ml-2 text-gray-500">Video Block (Click to edit)</span>
              </>
            )}
          </div>
        );
      
      case BlockTypes.SOCIAL:
        return (
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="w-full space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1 font-medium">Facebook URL</label>
                    <input 
                      type="text" 
                      name="facebook"
                      value={editingContent.facebook || ''}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">Twitter URL</label>
                    <input 
                      type="text" 
                      name="twitter"
                      value={editingContent.twitter || ''}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">Instagram URL</label>
                    <input 
                      type="text" 
                      name="instagram"
                      value={editingContent.instagram || ''}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">LinkedIn URL</label>
                    <input 
                      type="text" 
                      name="linkedin"
                      value={editingContent.linkedin || ''}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex justify-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">f</div>
                <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white">t</div>
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">y</div>
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white">i</div>
              </div>
            )}
          </div>
        );
      
      case BlockTypes.MENU:
        return (
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="w-full space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1 font-medium">Menu Item 1</label>
                    <input 
                      type="text" 
                      name="item1"
                      value={editingContent.item1 || 'Home'}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">Link 1</label>
                    <input 
                      type="text" 
                      name="link1"
                      value={editingContent.link1 || '#'}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">Menu Item 2</label>
                    <input 
                      type="text" 
                      name="item2"
                      value={editingContent.item2 || 'Products'}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">Link 2</label>
                    <input 
                      type="text" 
                      name="link2"
                      value={editingContent.link2 || '#'}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">Menu Item 3</label>
                    <input 
                      type="text" 
                      name="item3"
                      value={editingContent.item3 || 'About'}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">Link 3</label>
                    <input 
                      type="text" 
                      name="link3"
                      value={editingContent.link3 || '#'}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">Menu Item 4</label>
                    <input 
                      type="text" 
                      name="item4"
                      value={editingContent.item4 || 'Contact'}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">Link 4</label>
                    <input 
                      type="text" 
                      name="link4"
                      value={editingContent.link4 || '#'}
                      onChange={handleContentChange}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                </div>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex justify-center space-x-4 border-b pb-2">
                <span className="text-gray-700 cursor-pointer">{content?.item1 || 'Home'}</span>
                <span className="text-gray-700 cursor-pointer">{content?.item2 || 'Products'}</span>
                <span className="text-gray-700 cursor-pointer">{content?.item3 || 'About'}</span>
                <span className="text-gray-700 cursor-pointer">{content?.item4 || 'Contact'}</span>
              </div>
            )}
          </div>
        );
      
      case BlockTypes.TIMER:
        return (
          <div 
            className="p-4 flex justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="w-full space-y-3">
                <div>
                  <label className="block text-xs mb-1 font-medium">End Date (YYYY-MM-DD)</label>
                  <input 
                    type="date" 
                    name="endDate"
                    value={editingContent.endDate || ''}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium">Title (optional)</label>
                  <input 
                    type="text" 
                    name="title"
                    value={editingContent.title || ''}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Countdown to..."
                  />
                </div>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="text-center">
                {content?.title && <div className="mb-2 font-medium">{content.title}</div>}
                <div className="flex space-x-2">
                  <div className="bg-gray-200 p-2 rounded">
                    <div className="text-xl font-bold">12</div>
                    <div className="text-xs">Days</div>
                  </div>
                  <div className="bg-gray-200 p-2 rounded">
                    <div className="text-xl font-bold">05</div>
                    <div className="text-xs">Hours</div>
                  </div>
                  <div className="bg-gray-200 p-2 rounded">
                    <div className="text-xl font-bold">20</div>
                    <div className="text-xs">Minutes</div>
                  </div>
                  <div className="bg-gray-200 p-2 rounded">
                    <div className="text-xl font-bold">33</div>
                    <div className="text-xs">Seconds</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case BlockTypes.CAROUSEL:
        return (
          <div 
            className="p-4 bg-gray-100 rounded flex flex-col items-center justify-center min-h-[150px] cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="w-full space-y-3">
                <div>
                  <label className="block text-xs mb-1 font-medium">Image URL 1</label>
                  <input 
                    type="text" 
                    name="image1"
                    value={editingContent.image1 || ''}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="https://example.com/image1.jpg"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium">Image URL 2</label>
                  <input 
                    type="text" 
                    name="image2"
                    value={editingContent.image2 || ''}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="https://example.com/image2.jpg"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium">Image URL 3</label>
                  <input 
                    type="text" 
                    name="image3"
                    value={editingContent.image3 || ''}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="https://example.com/image3.jpg"
                  />
                </div>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <SlidersHorizontal className="h-10 w-10 text-gray-400" />
                <span className="ml-2 text-gray-500">Carousel Block (Click to edit)</span>
              </>
            )}
          </div>
        );
      
      case BlockTypes.ACCORDION:
        return (
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="w-full space-y-3">
                <div>
                  <label className="block text-xs mb-1 font-medium">Section 1 Title</label>
                  <input 
                    type="text" 
                    name="title1"
                    value={editingContent.title1 || 'Section Title 1'}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium">Section 1 Content</label>
                  <textarea 
                    name="content1"
                    value={editingContent.content1 || 'Content for section 1 goes here.'}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium">Section 2 Title</label>
                  <input 
                    type="text" 
                    name="title2"
                    value={editingContent.title2 || 'Section Title 2'}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium">Section 2 Content</label>
                  <textarea 
                    name="content2"
                    value={editingContent.content2 || 'Content for section 2 goes here.'}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm min-h-[80px]"
                  />
                </div>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <div className="border rounded mb-2">
                  <div className="p-2 flex justify-between items-center bg-gray-50 cursor-pointer">
                    <span>{content?.title1 || 'Section Title 1'}</span>
                    <ChevronsUpDown className="h-4 w-4" />
                  </div>
                  <div className="p-2 border-t">
                    {content?.content1 || 'Content for section 1 goes here.'}
                  </div>
                </div>
                <div className="border rounded">
                  <div className="p-2 flex justify-between items-center bg-gray-50 cursor-pointer">
                    <span>{content?.title2 || 'Section Title 2'}</span>
                    <ChevronsUpDown className="h-4 w-4" />
                  </div>
                  <div className="p-2 border-t">
                    {content?.content2 || 'Content for section 2 goes here.'}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      
      case BlockTypes.HTML:
        return (
          <div 
            className="p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="w-full">
                <textarea 
                  name="code"
                  value={editingContent.code || ''}
                  onChange={handleContentChange}
                  className="w-full p-2 border rounded text-sm min-h-[150px] font-mono"
                  placeholder="<div>Your custom HTML here</div>"
                />
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : content?.code ? (
              <div className="h-20 overflow-auto text-xs font-mono bg-gray-800 text-gray-200 p-2 rounded">
                {content.code}
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[80px]">
                <FileCode className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-500">Custom HTML Block (Click to edit)</span>
              </div>
            )}
          </div>
        );
      
      case BlockTypes.FORM:
        return (
          <div 
            className="p-4 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleEditClick}
          >
            {isEditing ? (
              <div className="w-full space-y-3">
                <div>
                  <label className="block text-xs mb-1 font-medium">Form Title</label>
                  <input 
                    type="text" 
                    name="title"
                    value={editingContent.title || 'Subscribe to our newsletter'}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium">Button Label</label>
                  <input 
                    type="text" 
                    name="buttonLabel"
                    value={editingContent.buttonLabel || 'Subscribe'}
                    onChange={handleContentChange}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium">Include Name Field</label>
                  <select
                    name="includeName"
                    value={editingContent.includeName ? "true" : "false"}
                    onChange={(e) => {
                      setEditingContent(prev => ({
                        ...prev,
                        includeName: e.target.value === "true"
                      }));
                    }}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs mt-2"
                  onClick={handleEditComplete}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                {content?.title && <h3 className="font-medium mb-3">{content.title}</h3>}
                {content?.includeName !== false && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Name</label>
                    <input type="text" className="w-full p-2 border rounded" placeholder="John Doe" />
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full p-2 border rounded" placeholder="john@example.com" />
                </div>
                <button className="px-4 py-2 bg-[#1a3a5f] text-white rounded hover:bg-[#1a3a5f]/90">
                  {content?.buttonLabel || 'Subscribe'}
                </button>
              </>
            )}
          </div>
        );
      
      // Handle column layouts
      case ColumnTypes.ONE_COLUMN:
      case ColumnTypes.TWO_COLUMNS:
      case ColumnTypes.THREE_COLUMNS:
      case ColumnTypes.ONE_TWO_RATIO:
        return renderColumnLayout();
      default:
        return <div className="p-4 border rounded">Unknown block type: {type}</div>;
    }
  };
  
  // Render column layout if applicable
  const renderColumnLayout = () => {
    if (!columns) return null;
    
    const getColumnClasses = () => {
      switch (type) {
        case ColumnTypes.ONE_COLUMN:
          return 'grid-cols-1';
        case ColumnTypes.TWO_COLUMNS:
          return 'grid-cols-2';
        case ColumnTypes.THREE_COLUMNS:
          return 'grid-cols-3';
        case ColumnTypes.ONE_TWO_RATIO:
          return 'grid-cols-3';
        default:
          return 'grid-cols-1';
      }
    };
    
    return (
      <div className={`grid ${getColumnClasses()} gap-4 p-4`}>
        {columns.map((column, colIndex) => (
          <div 
            key={colIndex} 
            className={`border border-dashed border-gray-300 rounded p-2 min-h-[50px] ${
              type === ColumnTypes.ONE_TWO_RATIO && colIndex === 0 ? 'col-span-1' : 
              type === ColumnTypes.ONE_TWO_RATIO && colIndex === 1 ? 'col-span-2' : ''
            }`}
          >
            {column.map((item, itemIndex) => (
              <div key={item.id} className="mb-2 last:mb-0">
                {/* Render nested blocks here if needed */}
                <div className="p-1 text-xs text-center bg-gray-100 border-b">
                  Column {colIndex + 1} - {getBlockTitle(item.type)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  // Get human-readable title for block type
  const getBlockTitle = (blockType: string) => {
    switch (blockType) {
      case BlockTypes.IMAGE: return 'Image';
      case BlockTypes.TEXT: return 'Text';
      case BlockTypes.BUTTON: return 'Button';
      case BlockTypes.SPACER: return 'Spacer';
      case BlockTypes.VIDEO: return 'Video';
      case BlockTypes.SOCIAL: return 'Social';
      case BlockTypes.MENU: return 'Menu';
      case BlockTypes.TIMER: return 'Timer';
      case BlockTypes.CAROUSEL: return 'Carousel';
      case BlockTypes.ACCORDION: return 'Accordion';
      case BlockTypes.HTML: return 'HTML';
      case BlockTypes.FORM: return 'Form';
      default: return blockType;
    }
  };
  
  // Opacity style for dragging feedback
  const opacity = isDragging ? 0.4 : 1;
  
  return (
    <div 
      ref={ref} 
      className="mb-4 border border-gray-200 rounded group relative"
      style={{ opacity }}
    >
      <div className="absolute -top-3 left-2 bg-white px-2 text-xs text-gray-500 border border-gray-200 rounded-full">
        {getBlockTitle(type)}
      </div>
      
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border rounded-md p-1">
        <button 
          className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
          title="Move Block"
        >
          <MoveVertical className="h-4 w-4" />
        </button>
        
        <button 
          className="p-1 rounded-md text-red-500 hover:bg-gray-100"
          title="Remove Block"
          onClick={() => removeBlock(id)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      {renderBlockContent()}
    </div>
  );
};

// Component to display available blocks for dragging
export const AvailableBlocks: React.FC<{ onAddBlock: (type: string) => void }> = ({ onAddBlock }) => {
  const blocks = [
    { type: BlockTypes.IMAGE, title: 'Image', icon: <ImageIcon className="h-5 w-5 text-gray-600" /> },
    { type: BlockTypes.TEXT, title: 'Text', icon: <Type className="h-5 w-5 text-gray-600" /> },
    { type: BlockTypes.BUTTON, title: 'Button', icon: <div className="h-5 w-5 flex items-center justify-center text-gray-600">
      <div className="w-4 h-3 border border-gray-600 rounded text-[10px] flex items-center justify-center">B</div>
    </div> },
    { type: BlockTypes.SPACER, title: 'Spacer', icon: <div className="h-5 w-5 flex flex-col justify-center items-center">
      <div className="h-0.5 w-4 bg-gray-600"></div>
    </div> },
    { type: BlockTypes.VIDEO, title: 'Video', icon: <Video className="h-5 w-5 text-gray-600" /> },
    { type: BlockTypes.SOCIAL, title: 'Social', icon: <Share2 className="h-5 w-5 text-gray-600" /> },
    { type: BlockTypes.MENU, title: 'Menu', icon: <Menu className="h-5 w-5 text-gray-600" /> },
    { type: BlockTypes.TIMER, title: 'Timer', icon: <Clock className="h-5 w-5 text-gray-600" /> },
    { type: BlockTypes.CAROUSEL, title: 'Carousel', icon: <SlidersHorizontal className="h-5 w-5 text-gray-600" /> },
    { type: BlockTypes.ACCORDION, title: 'Accordion', icon: <ChevronsUpDown className="h-5 w-5 text-gray-600" /> },
    { type: BlockTypes.HTML, title: 'HTML', icon: <FileCode className="h-5 w-5 text-gray-600" /> },
    { type: BlockTypes.FORM, title: 'Form', icon: <FormInput className="h-5 w-5 text-gray-600" /> }
  ];
  
  return (
    <div className="grid grid-cols-3 gap-2">
      {blocks.map((block) => (
        <div
          key={block.type}
          className="border border-gray-200 rounded p-2 hover:border-[#1a3a5f]/60 cursor-pointer transition-colors text-center"
          onClick={() => onAddBlock(block.type)}
        >
          <div className="flex justify-center mb-1.5">
            {block.icon}
          </div>
          <p className="text-xs">{block.title}</p>
        </div>
      ))}
    </div>
  );
};

// Component to display available column structures
export const ColumnStructures: React.FC<{ onAddColumn: (type: string) => void }> = ({ onAddColumn }) => {
  return (
    <div className="grid grid-cols-2 gap-2 mb-6">
      <div 
        className="border border-gray-200 rounded p-2 hover:border-[#1a3a5f]/60 cursor-pointer transition-colors"
        onClick={() => onAddColumn(ColumnTypes.ONE_COLUMN)}
      >
        <div className="h-10 flex items-center justify-center">
          <div className="w-full h-2 bg-gray-200 rounded"></div>
        </div>
        <p className="text-xs text-center mt-2">1 Column</p>
      </div>
      
      <div 
        className="border border-gray-200 rounded p-2 hover:border-[#1a3a5f]/60 cursor-pointer transition-colors"
        onClick={() => onAddColumn(ColumnTypes.TWO_COLUMNS)}
      >
        <div className="h-10 flex items-center justify-center space-x-1">
          <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
        </div>
        <p className="text-xs text-center mt-2">2 Columns</p>
      </div>
      
      <div 
        className="border border-gray-200 rounded p-2 hover:border-[#1a3a5f]/60 cursor-pointer transition-colors"
        onClick={() => onAddColumn(ColumnTypes.THREE_COLUMNS)}
      >
        <div className="h-10 flex items-center justify-center space-x-1">
          <div className="w-1/3 h-2 bg-gray-200 rounded"></div>
          <div className="w-1/3 h-2 bg-gray-200 rounded"></div>
          <div className="w-1/3 h-2 bg-gray-200 rounded"></div>
        </div>
        <p className="text-xs text-center mt-2">3 Columns</p>
      </div>
      
      <div 
        className="border border-gray-200 rounded p-2 hover:border-[#1a3a5f]/60 cursor-pointer transition-colors"
        onClick={() => onAddColumn(ColumnTypes.ONE_TWO_RATIO)}
      >
        <div className="h-10 flex items-center justify-center space-x-1">
          <div className="w-1/3 h-2 bg-gray-200 rounded"></div>
          <div className="w-2/3 h-2 bg-gray-200 rounded"></div>
        </div>
        <p className="text-xs text-center mt-2">1:2 Ratio</p>
      </div>
    </div>
  );
};

export default DraggableBlock;