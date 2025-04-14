import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ColorPicker } from "@/components/ui/color-picker";
import { 
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Image, 
  Link, List, ListOrdered, Type, Grid, Layout, Columns, Rows, Save, 
  ArrowLeft, Loader2, SeparatorHorizontal, X, ArrowDown, Settings, Palette,
  Plus, Trash2, MoveVertical, Copy, Code, Eye, ArrowUp
} from "lucide-react";

// Define types for our email elements
interface EmailElement {
  id: string;
  type: string;
  content: any;
  styles: any;
}

interface EmailSection {
  id: string;
  elements: EmailElement[];
  styles: {
    backgroundColor?: string;
    padding?: string;
    textAlign?: 'left' | 'center' | 'right';
    width?: string;
    maxWidth?: string;
  };
}

interface EmailTemplate {
  name: string;
  subject: string;
  previewText?: string;
  sections: EmailSection[];
  styles: {
    fontFamily?: string;
    backgroundColor?: string;
    width?: string;
    maxWidth?: string;
  };
}

interface ToolboxItemProps {
  type: string;
  icon: React.ReactNode;
  label: string;
  onDragStart: (e: React.DragEvent, type: string) => void;
}

interface SectionProps {
  section: EmailSection;
  index: number;
  isSelected: boolean;
  onSelectSection: (id: string) => void;
  onDrop: (e: React.DragEvent, sectionId: string) => void;
  onElementClick: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onMoveSection: (id: string, direction: 'up' | 'down') => void;
  selectedElementId: string | null;
}

interface ElementRendererProps {
  element: EmailElement;
  isSelected: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, elementId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetElementId: string) => void;
  isDragging: boolean;
  isDraggedOver: boolean;
}

interface PropertyEditorProps {
  selectedElement: EmailElement | null;
  selectedSection: EmailSection | null;
  updateElement: (id: string, updates: Partial<EmailElement>) => void;
  updateSection: (id: string, updates: Partial<EmailSection>) => void;
  deleteElement: (id: string) => void;
  onTemplateStyling: () => void;
}

// Toolbox item component
const ToolboxItem: React.FC<ToolboxItemProps> = ({ type, icon, label, onDragStart }) => {
  return (
    <div
      className="relative flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg cursor-grab bg-white hover:shadow-md hover:border-primary/40 transition-all"
      draggable
      onDragStart={(e) => onDragStart(e, type)}
    >
      <div className="bg-primary/10 text-primary p-2 rounded-full mb-2">{icon}</div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </div>
  );
};

// Element renderer component
const ElementRenderer: React.FC<ElementRendererProps> = ({ element, isSelected, onClick }) => {
  const { type, content, styles } = element;

  const baseClass = `group relative transition-all duration-150 ${
    isSelected 
      ? 'outline outline-2 outline-primary/80 shadow-sm' 
      : 'hover:outline hover:outline-1 hover:outline-primary/40'
  } rounded-sm`;

  switch (type) {
    case 'header':
      return (
        <div onClick={onClick} className={`${baseClass} p-3`}>
          <div className={`absolute top-0 right-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity bg-primary text-white text-xs rounded-bl-md px-1.5 py-0.5`}>
            Heading
          </div>
          <h1 
            style={{ 
              fontSize: styles.fontSize || '24px', 
              textAlign: styles.textAlign as any || 'left', 
              color: styles.color || '#333333',
              fontWeight: styles.fontWeight || 600,
              margin: 0,
              lineHeight: 1.2
            }}
          >
            {content.text || 'Your Heading Text'}
          </h1>
        </div>
      );
    
    case 'text':
      return (
        <div onClick={onClick} className={`${baseClass} p-3`}>
          <div className={`absolute top-0 right-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity bg-primary text-white text-xs rounded-bl-md px-1.5 py-0.5`}>
            Text
          </div>
          <p 
            style={{ 
              fontSize: styles.fontSize || '16px', 
              textAlign: styles.textAlign as any || 'left', 
              color: styles.color || '#666666',
              margin: 0,
              lineHeight: styles.lineHeight || 1.5
            }}
          >
            {content.text || 'Your paragraph text goes here. Edit this to add your own content.'}
          </p>
        </div>
      );
    
    case 'image':
      return (
        <div onClick={onClick} className={`${baseClass} p-3`}>
          <div className={`absolute top-0 right-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity bg-primary text-white text-xs rounded-bl-md px-1.5 py-0.5`}>
            Image
          </div>
          <div className="text-center">
            {content.src ? (
              <img 
                src={content.src} 
                alt={content.alt || "Email image"} 
                style={{ 
                  width: styles.width || '100%', 
                  maxWidth: styles.maxWidth || '100%',
                  margin: styles.centered ? '0 auto' : undefined,
                  display: 'block',
                  borderRadius: (styles.rounded ? '0.375rem' : '0')
                }}
              />
            ) : (
              <div className="bg-gray-100 border border-dashed border-gray-300 rounded-md p-8 flex flex-col items-center justify-center">
                <Image className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Add an image URL in the properties panel</p>
              </div>
            )}
            {content.caption && (
              <p className="text-sm text-gray-500 mt-2" style={{ textAlign: styles.captionAlign || 'center' }}>
                {content.caption}
              </p>
            )}
          </div>
        </div>
      );
    
    case 'button':
      return (
        <div onClick={onClick} className={`${baseClass} p-3 ${styles.alignment === 'center' ? 'text-center' : styles.alignment === 'right' ? 'text-right' : ''}`}>
          <div className={`absolute top-0 right-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity bg-primary text-white text-xs rounded-bl-md px-1.5 py-0.5`}>
            Button
          </div>
          <a 
            href={content.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              backgroundColor: styles.backgroundColor || '#4F46E5',
              color: styles.color || '#FFFFFF',
              padding: `${styles.paddingY || 10}px ${styles.paddingX || 20}px`,
              borderRadius: `${styles.borderRadius || 4}px`,
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: 500,
              fontSize: styles.fontSize || '16px',
              textAlign: 'center',
              border: styles.border || 'none'
            }}
            onClick={(e) => e.preventDefault()}
          >
            {content.text || 'Click Here'}
          </a>
        </div>
      );
    
    case 'divider':
      return (
        <div onClick={onClick} className={`${baseClass} py-3 px-3`}>
          <div className={`absolute top-0 right-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity bg-primary text-white text-xs rounded-bl-md px-1.5 py-0.5`}>
            Divider
          </div>
          <hr style={{ 
            borderTop: `${styles.thickness || 1}px ${styles.style || 'solid'} ${styles.color || '#dddddd'}`, 
            margin: "4px 0",
            width: styles.width || '100%'
          }} />
        </div>
      );
    
    case 'spacer':
      return (
        <div 
          onClick={onClick} 
          className={`${baseClass} px-3 relative flex items-center justify-center`}
          style={{ height: `${styles.height || 30}px` }}
        >
          <div className={`absolute top-0 right-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity bg-primary text-white text-xs rounded-bl-md px-1.5 py-0.5`}>
            Spacer
          </div>
          <div className={`${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'} text-center text-xs text-gray-400 font-medium border border-dashed border-gray-300 w-full h-full flex items-center justify-center`}>
            {styles.height || 30}px
          </div>
        </div>
      );
      
    case 'html':
      return (
        <div onClick={onClick} className={`${baseClass} p-3`}>
          <div className={`absolute top-0 right-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity bg-primary text-white text-xs rounded-bl-md px-1.5 py-0.5`}>
            HTML
          </div>
          <div className="relative">
            <iframe 
              srcDoc={content.html || '<div style="padding: 20px; text-align: center;">HTML content will display here</div>'} 
              title="HTML Content" 
              className="w-full border rounded min-h-[100px]"
              style={{ 
                height: styles.height || '200px',
                pointerEvents: 'none'
              }}
            />
            <div className="absolute inset-0 bg-transparent"></div>
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

// Section component
const Section: React.FC<SectionProps> = ({ 
  section, 
  index, 
  isSelected, 
  onSelectSection, 
  onDrop, 
  onElementClick, 
  onDeleteSection,
  onDuplicateSection,
  onMoveSection,
  selectedElementId
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  return (
    <div 
      className={`mb-4 relative group ${
        isSelected ? 'ring-2 ring-primary/70' : 'hover:ring-1 hover:ring-primary/40'
      }`}
    >
      {/* Section controls overlay */}
      <div className={`absolute -left-10 top-1/2 transform -translate-y-1/2 bg-white rounded-l-md border border-gray-200 shadow-sm 
        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex flex-col`}>
        <button 
          className="p-1.5 hover:bg-gray-100 text-gray-700 transition-colors" 
          onClick={() => onMoveSection(section.id, 'up')}
          disabled={index === 0}
          title="Move section up"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
        <button 
          className="p-1.5 hover:bg-gray-100 text-gray-700 transition-colors" 
          onClick={() => onDuplicateSection(section.id)}
          title="Duplicate section"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
        <button 
          className="p-1.5 hover:bg-gray-100 text-gray-700 transition-colors" 
          onClick={() => onMoveSection(section.id, 'down')}
          title="Move section down"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <button 
          className="p-1.5 hover:bg-red-100 text-red-600 transition-colors" 
          onClick={() => onDeleteSection(section.id)}
          title="Delete section"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
      
      {/* Section header bar for selection */}
      <div 
        className={`h-6 ${isSelected ? 'bg-primary/20' : 'bg-gray-100'} cursor-pointer flex items-center px-2 justify-between`}
        onClick={() => onSelectSection(section.id)}
      >
        <span className="text-xs font-medium text-gray-600">Section {index + 1}</span>
        {isSelected && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>Click to edit section properties</span>
          </div>
        )}
      </div>
      
      {/* Section content */}
      <div 
        className="section-content border border-gray-200 border-t-0"
        style={{ 
          backgroundColor: section.styles.backgroundColor || '#ffffff',
          padding: section.styles.padding || '12px',
        }}
        onClick={() => onSelectSection(section.id)}
        onDrop={(e) => onDrop(e, section.id)}
        onDragOver={handleDragOver}
      >
        {section.elements.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
            <div className="flex flex-col items-center">
              <ArrowDown className="h-5 w-5 text-primary mb-2" />
              <p className="font-medium text-gray-600 mb-1">Drop content here</p>
              <p className="text-xs text-gray-400">Drag elements from the left sidebar</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {section.elements.map((element) => (
              <ElementRenderer 
                key={element.id} 
                element={element} 
                isSelected={selectedElementId === element.id}
                onClick={() => onElementClick(element.id)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Property editor component
const PropertyEditor: React.FC<PropertyEditorProps> = ({ 
  selectedElement, 
  selectedSection,
  updateElement, 
  updateSection,
  deleteElement,
  onTemplateStyling
}) => {
  const [tab, setTab] = useState<'content' | 'style'>('content');
  
  if (!selectedElement && !selectedSection) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        <div className="bg-gray-100 rounded-full p-3 mb-3">
          <Settings className="h-5 w-5 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">No element selected</h3>
        <p className="text-sm text-gray-500 mb-4">Select an element to edit its properties</p>
        <Button variant="outline" onClick={onTemplateStyling} className="text-xs">
          <Palette className="h-4 w-4 mr-2" />
          Edit Template Style
        </Button>
      </div>
    );
  }
  
  if (selectedSection && !selectedElement) {
    // Show section properties
    return (
      <div className="p-4 h-full overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
          <Layout className="h-5 w-5 mr-2 text-primary" />
          Section Properties
        </h3>
        
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="style" className="pt-4 space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="sectionBgColor">Background Color</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="color"
                    id="sectionBgColor"
                    value={selectedSection.styles.backgroundColor || '#ffffff'}
                    onChange={(e) => updateSection(selectedSection.id, { 
                      styles: { ...selectedSection.styles, backgroundColor: e.target.value }
                    })}
                    className="w-8 h-8 rounded border-0 p-0"
                  />
                  <Input
                    value={selectedSection.styles.backgroundColor || '#ffffff'}
                    onChange={(e) => updateSection(selectedSection.id, { 
                      styles: { ...selectedSection.styles, backgroundColor: e.target.value }
                    })}
                    className="flex-1 h-8 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="sectionPadding">Padding</Label>
                <Input
                  id="sectionPadding"
                  value={selectedSection.styles.padding || '12px'}
                  onChange={(e) => updateSection(selectedSection.id, { 
                    styles: { ...selectedSection.styles, padding: e.target.value }
                  })}
                  placeholder="e.g., 12px or 10px 20px"
                  className="mt-1.5 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Use CSS padding format (e.g., 12px or 10px 20px)</p>
              </div>
              
              <div>
                <Label htmlFor="sectionWidth">Width</Label>
                <Input
                  id="sectionWidth"
                  value={selectedSection.styles.width || '100%'}
                  onChange={(e) => updateSection(selectedSection.id, { 
                    styles: { ...selectedSection.styles, width: e.target.value }
                  })}
                  placeholder="e.g., 100% or 600px"
                  className="mt-1.5 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="sectionMaxWidth">Max Width</Label>
                <Input
                  id="sectionMaxWidth"
                  value={selectedSection.styles.maxWidth || '100%'}
                  onChange={(e) => updateSection(selectedSection.id, { 
                    styles: { ...selectedSection.styles, maxWidth: e.target.value }
                  })}
                  placeholder="e.g., 100% or 600px"
                  className="mt-1.5 text-sm"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  if (!selectedElement) return null;

  // Element property editor logic
  const { id, type, content, styles } = selectedElement;
  
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-700 flex items-center">
          {type === 'header' && <Type className="h-5 w-5 mr-2 text-primary" />}
          {type === 'text' && <AlignLeft className="h-5 w-5 mr-2 text-primary" />}
          {type === 'image' && <Image className="h-5 w-5 mr-2 text-primary" />}
          {type === 'button' && <Link className="h-5 w-5 mr-2 text-primary" />}
          {type === 'divider' && <SeparatorHorizontal className="h-5 w-5 mr-2 text-primary" />}
          {type === 'spacer' && <Layout className="h-5 w-5 mr-2 text-primary" />}
          {type.charAt(0).toUpperCase() + type.slice(1)} Properties
        </h3>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => deleteElement(id)}
          title="Delete element"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue={tab} onValueChange={(value) => setTab(value as 'content' | 'style')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="pt-4 space-y-4">
          {/* Content properties by element type */}
          {(type === 'header' || type === 'text') && (
            <div>
              <Label htmlFor="elementText" className="text-gray-700 mb-1 block text-sm font-medium">
                {type === 'header' ? 'Heading Text' : 'Paragraph Text'}
              </Label>
              {type === 'header' ? (
                <Input 
                  id="elementText"
                  value={content.text || ''} 
                  onChange={(e) => updateElement(id, { content: { ...content, text: e.target.value } })}
                  className="mt-1.5"
                />
              ) : (
                <Textarea 
                  id="elementText"
                  value={content.text || ''} 
                  onChange={(e) => updateElement(id, { content: { ...content, text: e.target.value } })}
                  className="mt-1.5 min-h-[100px]"
                />
              )}
            </div>
          )}
          
          {type === 'image' && (
            <>
              <div>
                <Label htmlFor="imageSrc" className="text-gray-700 mb-1 block text-sm font-medium">Image URL</Label>
                <Input 
                  id="imageSrc"
                  value={content.src || ''} 
                  onChange={(e) => updateElement(id, { content: { ...content, src: e.target.value } })}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="imageAlt" className="text-gray-700 mb-1 block text-sm font-medium">Alt Text</Label>
                <Input 
                  id="imageAlt"
                  value={content.alt || ''} 
                  onChange={(e) => updateElement(id, { content: { ...content, alt: e.target.value } })}
                  placeholder="Image description for accessibility"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="imageCaption" className="text-gray-700 mb-1 block text-sm font-medium">Caption (optional)</Label>
                <Input 
                  id="imageCaption"
                  value={content.caption || ''} 
                  onChange={(e) => updateElement(id, { content: { ...content, caption: e.target.value } })}
                  placeholder="Image caption"
                  className="mt-1.5"
                />
              </div>
            </>
          )}
          
          {type === 'button' && (
            <>
              <div>
                <Label htmlFor="buttonText" className="text-gray-700 mb-1 block text-sm font-medium">Button Text</Label>
                <Input 
                  id="buttonText"
                  value={content.text || ''} 
                  onChange={(e) => updateElement(id, { content: { ...content, text: e.target.value } })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="buttonUrl" className="text-gray-700 mb-1 block text-sm font-medium">Button URL</Label>
                <Input 
                  id="buttonUrl"
                  value={content.url || ''} 
                  onChange={(e) => updateElement(id, { content: { ...content, url: e.target.value } })}
                  placeholder="https://example.com"
                  className="mt-1.5"
                />
              </div>
            </>
          )}
          
          {type === 'spacer' && (
            <div>
              <Label htmlFor="spacerHeight" className="text-gray-700 mb-1 block text-sm font-medium">Height (px)</Label>
              <Input 
                id="spacerHeight"
                type="number"
                value={styles.height || 30} 
                onChange={(e) => updateElement(id, { styles: { ...styles, height: parseInt(e.target.value) } })}
                min={5}
                max={200}
                className="mt-1.5"
              />
            </div>
          )}
          
          {type === 'html' && (
            <div>
              <Label htmlFor="htmlContent" className="text-gray-700 mb-1 block text-sm font-medium">HTML Content</Label>
              <Textarea 
                id="htmlContent"
                value={content.html || ''} 
                onChange={(e) => updateElement(id, { content: { ...content, html: e.target.value } })}
                className="mt-1.5 min-h-[300px] font-mono text-xs"
                placeholder="Enter your HTML code here"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use valid HTML with inline CSS for best email client compatibility.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="style" className="pt-4 space-y-4">
          {/* Style properties by element type */}
          {type === 'html' && (
            <div>
              <Label htmlFor="htmlHeight" className="text-gray-700 mb-1 block text-sm font-medium">Height</Label>
              <Input 
                id="htmlHeight"
                value={styles.height || '200px'} 
                onChange={(e) => updateElement(id, { styles: { ...styles, height: e.target.value } })}
                placeholder="200px, 300px, etc."
                className="mt-1.5 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Specify the height of the HTML content container (e.g., 200px)</p>
            </div>
          )}
          
          {(type === 'header' || type === 'text' || type === 'button') && (
            <>
              <div>
                <Label htmlFor="fontSize" className="text-gray-700 mb-1 block text-sm font-medium">Font Size</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input 
                    type="number" 
                    id="fontSize"
                    value={parseInt(styles.fontSize) || (type === 'header' ? 24 : 16)} 
                    onChange={(e) => updateElement(id, { styles: { ...styles, fontSize: `${e.target.value}px` } })}
                    className="w-20 text-sm"
                    min={8}
                    max={72}
                  />
                  <span className="text-gray-500 text-sm">px</span>
                </div>
              </div>
              
              {(type === 'header' || type === 'text') && (
                <div>
                  <Label className="text-gray-700 mb-1 block text-sm font-medium">Text Alignment</Label>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <Button
                      type="button"
                      variant={styles.textAlign === 'left' ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => updateElement(id, { styles: { ...styles, textAlign: 'left' } })}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={styles.textAlign === 'center' ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => updateElement(id, { styles: { ...styles, textAlign: 'center' } })}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={styles.textAlign === 'right' ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => updateElement(id, { styles: { ...styles, textAlign: 'right' } })}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {type === 'button' && (
                <div>
                  <Label className="text-gray-700 mb-1 block text-sm font-medium">Button Alignment</Label>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <Button
                      type="button"
                      variant={styles.alignment === 'left' ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => updateElement(id, { styles: { ...styles, alignment: 'left' } })}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={styles.alignment === 'center' ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => updateElement(id, { styles: { ...styles, alignment: 'center' } })}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={styles.alignment === 'right' ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => updateElement(id, { styles: { ...styles, alignment: 'right' } })}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="textColor" className="text-gray-700 mb-1 block text-sm font-medium">Text Color</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input 
                    type="color" 
                    id="textColor"
                    value={styles.color || (type === 'header' ? '#333333' : '#666666')} 
                    onChange={(e) => updateElement(id, { styles: { ...styles, color: e.target.value } })}
                    className="w-8 h-8 rounded border-0 p-0"
                  />
                  <Input 
                    value={styles.color || (type === 'header' ? '#333333' : '#666666')} 
                    onChange={(e) => updateElement(id, { styles: { ...styles, color: e.target.value } })}
                    className="flex-1 h-8 text-sm"
                  />
                </div>
              </div>
            </>
          )}
          
          {type === 'button' && (
            <>
              <div>
                <Label htmlFor="bgColor" className="text-gray-700 mb-1 block text-sm font-medium">Background Color</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input 
                    type="color" 
                    id="bgColor"
                    value={styles.backgroundColor || '#4F46E5'} 
                    onChange={(e) => updateElement(id, { styles: { ...styles, backgroundColor: e.target.value } })}
                    className="w-8 h-8 rounded border-0 p-0"
                  />
                  <Input 
                    value={styles.backgroundColor || '#4F46E5'} 
                    onChange={(e) => updateElement(id, { styles: { ...styles, backgroundColor: e.target.value } })}
                    className="flex-1 h-8 text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="paddingY" className="text-gray-700 mb-1 block text-sm font-medium">Padding Y</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input 
                      type="number" 
                      id="paddingY"
                      value={styles.paddingY || 10} 
                      onChange={(e) => updateElement(id, { styles: { ...styles, paddingY: parseInt(e.target.value) } })}
                      className="text-sm"
                      min={0}
                      max={50}
                    />
                    <span className="text-gray-500 text-sm">px</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="paddingX" className="text-gray-700 mb-1 block text-sm font-medium">Padding X</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input 
                      type="number" 
                      id="paddingX"
                      value={styles.paddingX || 20} 
                      onChange={(e) => updateElement(id, { styles: { ...styles, paddingX: parseInt(e.target.value) } })}
                      className="text-sm"
                      min={0}
                      max={100}
                    />
                    <span className="text-gray-500 text-sm">px</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="borderRadius" className="text-gray-700 mb-1 block text-sm font-medium">Border Radius</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input 
                    type="number" 
                    id="borderRadius"
                    value={styles.borderRadius || 4} 
                    onChange={(e) => updateElement(id, { styles: { ...styles, borderRadius: parseInt(e.target.value) } })}
                    className="text-sm"
                    min={0}
                    max={50}
                  />
                  <span className="text-gray-500 text-sm">px</span>
                </div>
              </div>
            </>
          )}
          
          {type === 'image' && (
            <>
              <div className="flex items-center gap-4 mt-1.5">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="imageCentered"
                    checked={styles.centered || false} 
                    onChange={(e) => updateElement(id, { styles: { ...styles, centered: e.target.checked } })}
                  />
                  <Label htmlFor="imageCentered" className="text-sm">Center image</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="imageRounded"
                    checked={styles.rounded || false} 
                    onChange={(e) => updateElement(id, { styles: { ...styles, rounded: e.target.checked } })}
                  />
                  <Label htmlFor="imageRounded" className="text-sm">Rounded corners</Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="imageWidth" className="text-gray-700 mb-1 block text-sm font-medium">Width</Label>
                <Input 
                  id="imageWidth"
                  value={styles.width || '100%'} 
                  onChange={(e) => updateElement(id, { styles: { ...styles, width: e.target.value } })}
                  placeholder="100%, 300px, etc."
                  className="mt-1.5 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="imageMaxWidth" className="text-gray-700 mb-1 block text-sm font-medium">Max Width</Label>
                <Input 
                  id="imageMaxWidth"
                  value={styles.maxWidth || '100%'} 
                  onChange={(e) => updateElement(id, { styles: { ...styles, maxWidth: e.target.value } })}
                  placeholder="100%, 300px, etc."
                  className="mt-1.5 text-sm"
                />
              </div>
              
              {content.caption && (
                <div>
                  <Label className="text-gray-700 mb-1 block text-sm font-medium">Caption Alignment</Label>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <Button
                      type="button"
                      variant={styles.captionAlign === 'left' ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => updateElement(id, { styles: { ...styles, captionAlign: 'left' } })}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={styles.captionAlign === 'center' ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => updateElement(id, { styles: { ...styles, captionAlign: 'center' } })}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={styles.captionAlign === 'right' ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => updateElement(id, { styles: { ...styles, captionAlign: 'right' } })}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          
          {type === 'divider' && (
            <>
              <div>
                <Label htmlFor="dividerColor" className="text-gray-700 mb-1 block text-sm font-medium">Color</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input 
                    type="color" 
                    id="dividerColor"
                    value={styles.color || '#dddddd'} 
                    onChange={(e) => updateElement(id, { styles: { ...styles, color: e.target.value } })}
                    className="w-8 h-8 rounded border-0 p-0"
                  />
                  <Input 
                    value={styles.color || '#dddddd'} 
                    onChange={(e) => updateElement(id, { styles: { ...styles, color: e.target.value } })}
                    className="flex-1 h-8 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="dividerThickness" className="text-gray-700 mb-1 block text-sm font-medium">Thickness</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input 
                    type="number" 
                    id="dividerThickness"
                    value={styles.thickness || 1} 
                    onChange={(e) => updateElement(id, { styles: { ...styles, thickness: parseInt(e.target.value) } })}
                    className="text-sm"
                    min={1}
                    max={20}
                  />
                  <span className="text-gray-500 text-sm">px</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="dividerStyle" className="text-gray-700 mb-1 block text-sm font-medium">Style</Label>
                <select
                  id="dividerStyle"
                  value={styles.style || 'solid'}
                  onChange={(e) => updateElement(id, { styles: { ...styles, style: e.target.value } })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="dividerWidth" className="text-gray-700 mb-1 block text-sm font-medium">Width</Label>
                <Input 
                  id="dividerWidth"
                  value={styles.width || '100%'} 
                  onChange={(e) => updateElement(id, { styles: { ...styles, width: e.target.value } })}
                  placeholder="100%, 300px, etc."
                  className="mt-1.5 text-sm"
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Template Styling Dialog Component
const TemplateStylingDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  templateStyles: EmailTemplate['styles'];
  updateTemplateStyles: (styles: Partial<EmailTemplate['styles']>) => void;
  updateTemplateName: (name: string) => void;
  updateTemplateSubject: (subject: string) => void;
  updateTemplatePreviewText: (previewText: string) => void;
  templateName: string;
  templateSubject: string;
  templatePreviewText: string;
}> = ({
  isOpen,
  onClose,
  templateStyles,
  updateTemplateStyles,
  updateTemplateName,
  updateTemplateSubject,
  updateTemplatePreviewText,
  templateName,
  templateSubject,
  templatePreviewText
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Email Template Settings</DialogTitle>
          <DialogDescription>
            Configure global settings for your email template.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="pt-4 space-y-4">
            <div>
              <Label htmlFor="templateName" className="text-gray-700 mb-1 block text-sm font-medium">Template Name</Label>
              <Input 
                id="templateName"
                value={templateName} 
                onChange={(e) => updateTemplateName(e.target.value)}
                placeholder="My Email Template"
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="templateSubject" className="text-gray-700 mb-1 block text-sm font-medium">Email Subject Line</Label>
              <Input 
                id="templateSubject"
                value={templateSubject} 
                onChange={(e) => updateTemplateSubject(e.target.value)}
                placeholder="Enter subject line"
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="templatePreviewText" className="text-gray-700 mb-1 block text-sm font-medium">
                Preview Text <span className="text-xs text-gray-500">(optional)</span>
              </Label>
              <Textarea 
                id="templatePreviewText"
                value={templatePreviewText} 
                onChange={(e) => updateTemplatePreviewText(e.target.value)}
                placeholder="Brief summary that will appear in email clients"
                className="mt-1.5 min-h-[80px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                This text appears in email clients after the subject line. Recommended length: 50-100 characters.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="style" className="pt-4 space-y-4">
            <div>
              <Label htmlFor="templateFont" className="text-gray-700 mb-1 block text-sm font-medium">Font Family</Label>
              <select
                id="templateFont"
                value={templateStyles.fontFamily || 'Arial, sans-serif'}
                onChange={(e) => updateTemplateStyles({ fontFamily: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                <option value="'Times New Roman', Times, serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                <option value="Verdana, Geneva, sans-serif">Verdana</option>
                <option value="'Courier New', Courier, monospace">Courier New</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="templateBgColor" className="text-gray-700 mb-1 block text-sm font-medium">Background Color</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <input 
                  type="color" 
                  id="templateBgColor"
                  value={templateStyles.backgroundColor || '#f4f4f4'} 
                  onChange={(e) => updateTemplateStyles({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 p-0"
                />
                <Input 
                  value={templateStyles.backgroundColor || '#f4f4f4'} 
                  onChange={(e) => updateTemplateStyles({ backgroundColor: e.target.value })}
                  className="flex-1 h-8 text-sm"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="templateWidth" className="text-gray-700 mb-1 block text-sm font-medium">Width</Label>
              <Input 
                id="templateWidth"
                value={templateStyles.width || '100%'} 
                onChange={(e) => updateTemplateStyles({ width: e.target.value })}
                placeholder="e.g., 100% or 600px"
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="templateMaxWidth" className="text-gray-700 mb-1 block text-sm font-medium">Max Width</Label>
              <Input 
                id="templateMaxWidth"
                value={templateStyles.maxWidth || '600px'} 
                onChange={(e) => updateTemplateStyles({ maxWidth: e.target.value })}
                placeholder="e.g., 600px"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Most email clients render best at 600px width.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Email Preview Dialog Component
const EmailPreviewDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
}> = ({ isOpen, onClose, htmlContent }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
        </DialogHeader>
        
        <div className="border rounded-md overflow-hidden h-[60vh]">
          <iframe 
            srcDoc={htmlContent}
            title="Email Preview" 
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main EmailEditor component
const EmailEditor: React.FC<{
  initialTemplate?: EmailTemplate;
  onSave: (template: EmailTemplate, html: string) => void;
  isSaving?: boolean;
  className?: string;
}> = ({ initialTemplate, onSave, isSaving = false, className = '' }) => {
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState(initialTemplate?.name || 'Untitled Template');
  const [templateSubject, setTemplateSubject] = useState(initialTemplate?.subject || '');
  const [templatePreviewText, setTemplatePreviewText] = useState(initialTemplate?.previewText || '');
  const [sections, setSections] = useState<EmailSection[]>(initialTemplate?.sections || [
    { 
      id: `section-${Date.now()}`, 
      elements: [],
      styles: {
        backgroundColor: '#ffffff',
        padding: '12px',
      }
    }
  ]);
  const [templateStyles, setTemplateStyles] = useState<EmailTemplate['styles']>(initialTemplate?.styles || {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f4',
    maxWidth: '600px'
  });
  
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isStylingDialogOpen, setIsStylingDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  
  // Get selected element
  const selectedElement = selectedElementId 
    ? sections.flatMap(s => s.elements).find(e => e.id === selectedElementId) || null 
    : null;
    
  // Get selected section
  const selectedSection = selectedSectionId
    ? sections.find(s => s.id === selectedSectionId) || null
    : null;
  
  // Handle drag start for components
  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("elementType", type);
    e.dataTransfer.effectAllowed = "copy";
  };
  
  // Handle drop of components
  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData("elementType");
    
    if (!elementType) return;
    
    // Create new component
    const newElement = createNewElement(elementType);
    
    // Add to section
    setSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            elements: [...section.elements, newElement]
          };
        }
        return section;
      });
    });
    
    // Select the new component
    setSelectedElementId(newElement.id);
    setSelectedSectionId(sectionId);
    
    toast({
      title: "Element added",
      description: `Added new ${elementType} element to your template.`,
      duration: 2000,
    });
  };
  
  // Create a new element based on type
  const createNewElement = (type: string): EmailElement => {
    const id = `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    switch (type) {
      case 'header':
        return {
          id,
          type,
          content: { text: 'Your Header Text' },
          styles: { fontSize: '24px', fontWeight: 600, color: '#333333', textAlign: 'left' }
        };
      case 'text':
        return {
          id,
          type,
          content: { text: 'Your paragraph text goes here. Edit this to add your own content.' },
          styles: { fontSize: '16px', color: '#666666', textAlign: 'left', lineHeight: 1.5 }
        };
      case 'image':
        return {
          id,
          type,
          content: { src: '', alt: 'Image description' },
          styles: { width: '100%', maxWidth: '100%', rounded: false, centered: false }
        };
      case 'button':
        return {
          id,
          type,
          content: { text: 'Click Here', url: '#' },
          styles: { 
            backgroundColor: '#4F46E5', 
            color: '#FFFFFF', 
            paddingY: 10, 
            paddingX: 20, 
            borderRadius: 4,
            fontSize: '16px',
            alignment: 'center'
          }
        };
      case 'divider':
        return {
          id,
          type,
          content: {},
          styles: { thickness: 1, color: '#dddddd', style: 'solid', width: '100%' }
        };
      case 'spacer':
        return {
          id,
          type,
          content: {},
          styles: { height: 30 }
        };
      case 'html':
        return {
          id,
          type,
          content: { 
            html: '<div style="padding: 20px; text-align: center; font-family: Arial, sans-serif; color: #666;">This is a custom HTML component.<br>Edit the HTML in the properties panel.</div>' 
          },
          styles: { height: '200px' }
        };
      default:
        return {
          id,
          type: 'text',
          content: { text: 'Default text element' },
          styles: { fontSize: '16px', color: '#666666', textAlign: 'left' }
        };
    }
  };
  
  // Handle element click to select it
  const handleElementClick = (elementId: string) => {
    setSelectedElementId(elementId);
    
    // Find which section contains this element and select it too
    const sectionWithElement = sections.find(section => 
      section.elements.some(element => element.id === elementId)
    );
    
    if (sectionWithElement) {
      setSelectedSectionId(sectionWithElement.id);
    }
  };
  
  // Handle section selection
  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedElementId(null);
  };
  
  // Update element properties
  const updateElement = (id: string, updates: Partial<EmailElement>) => {
    setSections(prevSections => 
      prevSections.map(section => ({
        ...section,
        elements: section.elements.map(element => 
          element.id === id 
            ? { ...element, ...updates } 
            : element
        )
      }))
    );
  };
  
  // Update section properties
  const updateSection = (id: string, updates: Partial<EmailSection>) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === id 
          ? { ...section, ...updates } 
          : section
      )
    );
  };
  
  // Delete element
  const deleteElement = (id: string) => {
    setSections(prevSections => 
      prevSections.map(section => ({
        ...section,
        elements: section.elements.filter(element => element.id !== id)
      }))
    );
    
    setSelectedElementId(null);
    
    toast({
      title: "Element deleted",
      description: "The element has been removed from your template.",
      duration: 2000,
    });
  };
  
  // Add a new section
  const addSection = () => {
    const newSection: EmailSection = {
      id: `section-${Date.now()}`,
      elements: [],
      styles: {
        backgroundColor: '#ffffff',
        padding: '12px',
      }
    };
    
    setSections(prevSections => [...prevSections, newSection]);
    setSelectedSectionId(newSection.id);
    setSelectedElementId(null);
    
    toast({
      title: "Section added",
      description: "A new section has been added to your template.",
      duration: 2000,
    });
  };
  
  // Delete a section
  const deleteSection = (id: string) => {
    if (sections.length === 1) {
      toast({
        title: "Cannot delete section",
        description: "You need at least one section in your template.",
        variant: "destructive",
      });
      return;
    }
    
    setSections(prevSections => prevSections.filter(section => section.id !== id));
    setSelectedSectionId(null);
    setSelectedElementId(null);
    
    toast({
      title: "Section deleted",
      description: "The section has been removed from your template.",
      duration: 2000,
    });
  };
  
  // Duplicate a section
  const duplicateSection = (id: string) => {
    const sectionToDuplicate = sections.find(section => section.id === id);
    
    if (!sectionToDuplicate) return;
    
    // Create deep copy of elements with new IDs
    const duplicatedElements = sectionToDuplicate.elements.map(element => ({
      ...JSON.parse(JSON.stringify(element)),
      id: `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }));
    
    const newSection: EmailSection = {
      id: `section-${Date.now()}`,
      elements: duplicatedElements,
      styles: { ...sectionToDuplicate.styles }
    };
    
    // Find the index of the section to duplicate
    const sectionIndex = sections.findIndex(section => section.id === id);
    
    // Insert the new section after the duplicated one
    const newSections = [...sections];
    newSections.splice(sectionIndex + 1, 0, newSection);
    
    setSections(newSections);
    setSelectedSectionId(newSection.id);
    setSelectedElementId(null);
    
    toast({
      title: "Section duplicated",
      description: "The section has been duplicated.",
      duration: 2000,
    });
  };
  
  // Move a section up or down
  const moveSection = (id: string, direction: 'up' | 'down') => {
    const sectionIndex = sections.findIndex(section => section.id === id);
    
    if (
      (direction === 'up' && sectionIndex === 0) || 
      (direction === 'down' && sectionIndex === sections.length - 1)
    ) {
      return;
    }
    
    const newSections = [...sections];
    const movedSection = newSections[sectionIndex];
    
    if (direction === 'up') {
      newSections[sectionIndex] = newSections[sectionIndex - 1];
      newSections[sectionIndex - 1] = movedSection;
    } else {
      newSections[sectionIndex] = newSections[sectionIndex + 1];
      newSections[sectionIndex + 1] = movedSection;
    }
    
    setSections(newSections);
  };
  
  // Update template styles
  const updateTemplateStyles = (updates: Partial<EmailTemplate['styles']>) => {
    setTemplateStyles(prev => ({ ...prev, ...updates }));
  };
  
  // Generate HTML from template
  const generateHtml = () => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${templateName}</title>
        ${templatePreviewText ? `<meta name="description" content="${templatePreviewText}">` : ''}
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: ${templateStyles.fontFamily || 'Arial, sans-serif'};
            background-color: ${templateStyles.backgroundColor || '#f4f4f4'};
          }
          .container {
            width: ${templateStyles.width || '100%'};
            max-width: ${templateStyles.maxWidth || '600px'};
            margin: 0 auto;
          }
          table {
            border-spacing: 0;
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
          td {
            padding: 0;
          }
          img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="container">
    `;
    
    sections.forEach(section => {
      html += `
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: ${section.styles.backgroundColor || '#ffffff'};">
          <tr>
            <td style="padding: ${section.styles.padding || '12px'};">
      `;
      
      section.elements.forEach(element => {
        switch (element.type) {
          case 'header':
            html += `
              <h1 style="font-size: ${element.styles.fontSize || '24px'}; color: ${element.styles.color || '#333333'}; font-weight: ${element.styles.fontWeight || '600'}; text-align: ${element.styles.textAlign || 'left'}; margin: 0; line-height: 1.2;">
                ${element.content.text || 'Header Text'}
              </h1>
            `;
            break;
            
          case 'text':
            html += `
              <p style="font-size: ${element.styles.fontSize || '16px'}; color: ${element.styles.color || '#666666'}; text-align: ${element.styles.textAlign || 'left'}; margin: 0 0 16px 0; line-height: ${element.styles.lineHeight || '1.5'};">
                ${element.content.text || 'Paragraph text'}
              </p>
            `;
            break;
            
          case 'image':
            const imgStyle = [
              `width: ${element.styles.width || '100%'}`,
              `max-width: ${element.styles.maxWidth || '100%'}`,
              element.styles.centered ? 'margin: 0 auto;' : '',
              element.styles.rounded ? 'border-radius: 8px;' : ''
            ].filter(Boolean).join('; ');
            
            html += `
              <div align="${element.styles.centered ? 'center' : 'left'}" style="margin-bottom: 16px;">
                <img src="${element.content.src || 'https://via.placeholder.com/600x300?text=Add+Your+Image'}" 
                  alt="${element.content.alt || 'Email image'}" 
                  width="${element.styles.width || '100%'}" 
                  style="${imgStyle}">
                ${element.content.caption ? `<p style="margin-top: 8px; font-size: 14px; color: #666; text-align: ${element.styles.captionAlign || 'center'};">${element.content.caption}</p>` : ''}
              </div>
            `;
            break;
            
          case 'button':
            const buttonAlign = element.styles.alignment || 'center';
            
            html += `
              <div align="${buttonAlign}" style="margin-bottom: 16px;">
                <a href="${element.content.url || '#'}" target="_blank" style="background-color: ${element.styles.backgroundColor || '#4F46E5'}; color: ${element.styles.color || '#FFFFFF'}; display: inline-block; font-size: ${element.styles.fontSize || '16px'}; font-weight: 500; line-height: 1; padding: ${element.styles.paddingY || 10}px ${element.styles.paddingX || 20}px; text-align: center; text-decoration: none; border-radius: ${element.styles.borderRadius || 4}px; ${element.styles.border || ''};">
                  ${element.content.text || 'Click Here'}
                </a>
              </div>
            `;
            break;
            
          case 'divider':
            html += `
              <div style="margin: 16px 0;">
                <hr style="border: 0; border-top: ${element.styles.thickness || 1}px ${element.styles.style || 'solid'} ${element.styles.color || '#dddddd'}; width: ${element.styles.width || '100%'}; margin: 0;">
              </div>
            `;
            break;
            
          case 'spacer':
            html += `
              <div style="height: ${element.styles.height || 30}px;"></div>
            `;
            break;
        }
      });
      
      html += `
            </td>
          </tr>
        </table>
      `;
    });
    
    html += `
        </div>
      </body>
      </html>
    `;
    
    return html;
  };
  
  // Preview email template
  const previewTemplate = () => {
    const html = generateHtml();
    setPreviewHtml(html);
    setIsPreviewDialogOpen(true);
  };
  
  // Save email template
  const saveTemplate = () => {
    if (!templateName) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template.",
        variant: "destructive",
      });
      setIsStylingDialogOpen(true);
      return;
    }
    
    if (!templateSubject) {
      toast({
        title: "Email subject required",
        description: "Please enter a subject line for your email.",
        variant: "destructive",
      });
      setIsStylingDialogOpen(true);
      return;
    }
    
    const template: EmailTemplate = {
      name: templateName,
      subject: templateSubject,
      previewText: templatePreviewText,
      sections,
      styles: templateStyles
    };
    
    const html = generateHtml();
    onSave(template, html);
  };
  
  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      {/* Top Action Bar */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsStylingDialogOpen(true)}
            className="text-xs"
          >
            <Settings className="h-3.5 w-3.5 mr-1" />
            Template Settings
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={previewTemplate}
            className="text-xs"
          >
            Preview
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={saveTemplate}
            disabled={isSaving}
            className="text-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Editor Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Elements */}
        <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <ToolboxItem 
                type="header" 
                icon={<Type className="h-4 w-4" />} 
                label="Heading" 
                onDragStart={handleDragStart} 
              />
              <ToolboxItem 
                type="text" 
                icon={<AlignLeft className="h-4 w-4" />} 
                label="Text" 
                onDragStart={handleDragStart} 
              />
              <ToolboxItem 
                type="image" 
                icon={<Image className="h-4 w-4" />} 
                label="Image" 
                onDragStart={handleDragStart} 
              />
              <ToolboxItem 
                type="button" 
                icon={<Link className="h-4 w-4" />} 
                label="Button" 
                onDragStart={handleDragStart} 
              />
              <ToolboxItem 
                type="divider" 
                icon={<SeparatorHorizontal className="h-4 w-4" />} 
                label="Divider" 
                onDragStart={handleDragStart} 
              />
              <ToolboxItem 
                type="spacer" 
                icon={<Layout className="h-4 w-4" />} 
                label="Spacer" 
                onDragStart={handleDragStart} 
              />
              <ToolboxItem 
                type="html" 
                icon={<Code className="h-4 w-4" />} 
                label="HTML" 
                onDragStart={handleDragStart} 
              />
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sections</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addSection}
              className="w-full justify-start text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add New Section
            </Button>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="p-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p className="mb-1 font-medium">Tips:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Drag elements from above into sections</li>
                <li>Click any element to edit its properties</li>
                <li>Use sections to organize your content</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Middle - Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100" style={{ backgroundColor: templateStyles.backgroundColor || '#f4f4f4' }}>
          <div 
            className="mx-auto p-6 min-h-full" 
            style={{ maxWidth: templateStyles.maxWidth || '600px' }}
          >
            {/* Email Canvas */}
            <div 
              className="email-canvas bg-white mx-auto shadow-sm overflow-hidden"
              style={{ 
                fontFamily: templateStyles.fontFamily || 'Arial, sans-serif',
                maxWidth: templateStyles.maxWidth || '600px',
                width: templateStyles.width || '100%',
              }}
            >
              {/* Subject Line Preview */}
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-500">Subject:</span>
                  <span className="text-gray-800">{templateSubject || 'Your email subject'}</span>
                </div>
                
                {templatePreviewText && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="font-medium text-gray-500">Preview:</span>
                    <span className="text-gray-600 truncate">{templatePreviewText}</span>
                  </div>
                )}
              </div>
              
              {/* Sections Container */}
              <div className="sections-container">
                {sections.map((section, index) => (
                  <Section
                    key={section.id}
                    section={section}
                    index={index}
                    isSelected={selectedSectionId === section.id}
                    onSelectSection={handleSelectSection}
                    onDrop={handleDrop}
                    onElementClick={handleElementClick}
                    onDeleteSection={deleteSection}
                    onDuplicateSection={duplicateSection}
                    onMoveSection={moveSection}
                    selectedElementId={selectedElementId}
                  />
                ))}
              </div>
              
              {/* Email Footer */}
              <div className="email-footer text-center p-4 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
                <p>© {new Date().getFullYear()} InfyMailer. All rights reserved.</p>
                <p className="mt-1">
                  <a href="#" className="text-primary hover:underline">Unsubscribe</a> • 
                  <a href="#" className="text-primary hover:underline ml-1">Privacy Policy</a> •
                  <a href="#" className="text-primary hover:underline ml-1">View in Browser</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Properties */}
        <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
          <PropertyEditor
            selectedElement={selectedElement}
            selectedSection={selectedSection}
            updateElement={updateElement}
            updateSection={updateSection}
            deleteElement={deleteElement}
            onTemplateStyling={() => setIsStylingDialogOpen(true)}
          />
        </div>
      </div>
      
      {/* Template Styling Dialog */}
      <TemplateStylingDialog
        isOpen={isStylingDialogOpen}
        onClose={() => setIsStylingDialogOpen(false)}
        templateStyles={templateStyles}
        updateTemplateStyles={updateTemplateStyles}
        updateTemplateName={setTemplateName}
        updateTemplateSubject={setTemplateSubject}
        updateTemplatePreviewText={setTemplatePreviewText}
        templateName={templateName}
        templateSubject={templateSubject}
        templatePreviewText={templatePreviewText}
      />
      
      {/* Email Preview Dialog */}
      <EmailPreviewDialog
        isOpen={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        htmlContent={previewHtml}
      />
    </div>
  );
};

// Using the imported ColorPicker component

export default EmailEditor;