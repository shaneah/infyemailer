import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ColorPaletteGenerator, { ColorPalette } from "@/components/ColorPaletteGenerator";
import { 
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Image, 
  Link, List, ListOrdered, Type, Grid, Layout, Columns, Rows, Save, 
  ArrowLeft, Loader2, SeparatorHorizontal, X, ArrowDown, Settings, Palette
} from "lucide-react";

// Define types for our email components
interface EmailComponent {
  id: string;
  type: string;
  content: any;
  styles: any;
}

interface SectionProps {
  id: string;
  components: EmailComponent[];
  onDrop: (e: React.DragEvent, sectionId: string) => void;
  onComponentClick: (componentId: string) => void;
  selected: boolean;
}

interface ComponentToolboxItemProps {
  type: string;
  icon: React.ReactNode;
  label: string;
  onDragStart: (e: React.DragEvent, type: string) => void;
}

// Section component
const Section = ({ id, components, onDrop, onComponentClick, selected }: SectionProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  return (
    <div 
      className={`p-6 min-h-[140px] rounded-md mb-6 transition-all ${
        selected 
          ? "outline outline-2 outline-primary bg-primary/5" 
          : components.length === 0 
            ? "border-2 border-dashed border-gray-300 bg-gray-50 hover:border-primary/50 hover:bg-gray-100/80" 
            : "border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/30"
      }`}
      onDrop={(e) => onDrop(e, id)}
      onDragOver={handleDragOver}
      onClick={() => onComponentClick(id)}
    >
      {components.length === 0 ? (
        <div className="text-center text-gray-500 py-10 flex flex-col items-center justify-center">
          <div className="bg-gray-100 rounded-full p-3 mb-3 border border-gray-200">
            <ArrowDown className="h-5 w-5 text-primary" />
          </div>
          <p className="font-medium text-gray-600 mb-1">Drop content here</p>
          <p className="text-xs text-gray-400">Drag elements from the left panel</p>
        </div>
      ) : (
        <div className="space-y-4">
          {components.map((component) => (
            <EmailComponentRenderer 
              key={component.id} 
              component={component} 
              onClick={() => onComponentClick(component.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Component renderer
const EmailComponentRenderer = ({ component, onClick }: { component: EmailComponent; onClick: () => void }) => {
  const { type, content, styles } = component;

  const baseClass = "group relative transition-all duration-200 rounded-md hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50";

  switch (type) {
    case 'header':
      return (
        <div onClick={onClick} className={`${baseClass} p-4 border border-gray-200 hover:border-primary`}>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white shadow-sm rounded-full p-1 border border-gray-200">
              <Settings className="h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>
          <h1 
            style={{ 
              fontSize: styles.fontSize, 
              textAlign: styles.textAlign as any, 
              color: styles.color,
              margin: 0
            }}
          >
            {content.text}
          </h1>
        </div>
      );
    case 'text':
      return (
        <div onClick={onClick} className={`${baseClass} p-4 border border-gray-200 hover:border-primary`}>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white shadow-sm rounded-full p-1 border border-gray-200">
              <Settings className="h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>
          <p 
            style={{ 
              fontSize: styles.fontSize, 
              textAlign: styles.textAlign as any, 
              color: styles.color,
              margin: 0,
              lineHeight: 1.5
            }}
          >
            {content.text}
          </p>
        </div>
      );
    case 'image':
      return (
        <div onClick={onClick} className={`${baseClass} p-3 border border-gray-200 hover:border-primary`}>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white shadow-sm rounded-full p-1 border border-gray-200">
              <Settings className="h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>
          <img 
            src={content.src || "https://via.placeholder.com/600x300?text=Add+Your+Image"} 
            alt={content.alt || "Email image"} 
            style={{ width: '100%', maxWidth: styles.maxWidth || '100%' }}
            className="rounded-md"
          />
        </div>
      );
    case 'button':
      return (
        <div onClick={onClick} className={`${baseClass} p-4 border border-gray-200 hover:border-primary text-center`}>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white shadow-sm rounded-full p-1 border border-gray-200">
              <Settings className="h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>
          <button 
            style={{ 
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              padding: `${styles.paddingY || 10}px ${styles.paddingX || 20}px`,
              borderRadius: `${styles.borderRadius || 4}px`,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-block',
              fontWeight: 500,
            }}
            onClick={(e) => e.stopPropagation()} // Prevent the parent onClick from firing
          >
            {content.text}
          </button>
        </div>
      );
    case 'divider':
      return (
        <div onClick={onClick} className={`${baseClass} py-4 px-4 border border-gray-200 hover:border-primary`}>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white shadow-sm rounded-full p-1 border border-gray-200">
              <Settings className="h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>
          <hr style={{ borderTop: `${styles.thickness || 1}px solid ${styles.color || '#dddddd'}`, margin: "4px 0" }} />
        </div>
      );
    case 'spacer':
      return (
        <div 
          onClick={onClick} 
          className={`${baseClass} px-4 border border-gray-200 hover:border-primary bg-gray-50 flex items-center justify-center`}
          style={{ height: `${styles.height || 30}px` }}
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white shadow-sm rounded-full p-1 border border-gray-200">
              <Settings className="h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 font-medium">
            {styles.height || 30}px spacer
          </div>
        </div>
      );
    default:
      return null;
  }
};

// Component toolbox item
const ComponentToolboxItem = ({ type, icon, label, onDragStart }: ComponentToolboxItemProps) => {
  return (
    <div
      className="toolbox-item group"
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      data-element-type={type}
    >
      <div className="absolute inset-0 rounded-lg border border-primary/25 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
        </div>
      </div>
      <div className="bg-primary/10 text-primary p-3 rounded-full shadow-sm">{icon}</div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
};

// Property editor for components
const PropertyEditor = ({ 
  selectedComponent, 
  updateComponent,
  deleteComponent
}: { 
  selectedComponent: EmailComponent | null; 
  updateComponent: (id: string, updates: Partial<EmailComponent>) => void;
  deleteComponent: (id: string) => void;
}) => {
  if (!selectedComponent) {
    return (
      <div className="p-6 text-center text-gray-400 h-full flex items-center justify-center">
        <div>
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <SeparatorHorizontal className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm">Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const { id, type, content, styles } = selectedComponent;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateComponent(id, {
      content: { ...content, text: e.target.value }
    });
  };

  const handleStyleChange = (style: string, value: any) => {
    updateComponent(id, {
      styles: { ...styles, [style]: value }
    });
  };

  const renderColorPicker = (label: string, styleProperty: string, currentValue: string) => (
    <div className="mb-4">
      <Label htmlFor={styleProperty} className="text-gray-700 mb-1 block text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <input 
          type="color" 
          id={styleProperty}
          value={currentValue || '#000000'} 
          onChange={(e) => handleStyleChange(styleProperty, e.target.value)}
          className="w-8 h-8 rounded border-0 p-0"
        />
        <Input 
          value={currentValue || '#000000'} 
          onChange={(e) => handleStyleChange(styleProperty, e.target.value)}
          className="flex-1 h-8 text-sm"
        />
      </div>
    </div>
  );

  const renderCommonStyles = () => (
    <div className="space-y-3 mt-4">
      {(type === 'header' || type === 'text') && (
        <>
          <div className="mb-3">
            <Label htmlFor="fontSize" className="text-gray-700 mb-1 block text-sm font-medium">Font Size</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                id="fontSize"
                value={parseInt(styles.fontSize) || 16} 
                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                className="w-20 text-sm"
                min={8}
                max={72}
              />
              <span className="text-gray-500 text-sm">px</span>
            </div>
          </div>

          <div className="mb-3">
            <Label className="text-gray-700 mb-1 block text-sm font-medium">Text Alignment</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Button
                type="button"
                variant={styles.textAlign === 'left' ? 'default' : 'outline'}
                size="sm"
                className={`h-9 w-9 p-0 ${styles.textAlign === 'left' ? 'bg-primary text-white' : 'border-gray-300'}`}
                onClick={() => handleStyleChange('textAlign', 'left')}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={styles.textAlign === 'center' ? 'default' : 'outline'}
                size="sm"
                className={`h-9 w-9 p-0 ${styles.textAlign === 'center' ? 'bg-primary text-white' : 'border-gray-300'}`}
                onClick={() => handleStyleChange('textAlign', 'center')}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={styles.textAlign === 'right' ? 'default' : 'outline'}
                size="sm"
                className={`h-9 w-9 p-0 ${styles.textAlign === 'right' ? 'bg-primary text-white' : 'border-gray-300'}`}
                onClick={() => handleStyleChange('textAlign', 'right')}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {renderColorPicker('Text Color', 'color', styles.color)}
        </>
      )}

      {type === 'image' && (
        <>
          <div className="mb-3">
            <Label htmlFor="imageSrc" className="text-gray-700 mb-1 block text-sm font-medium">Image URL</Label>
            <Input 
              id="imageSrc"
              value={content.src || ''} 
              onChange={(e) => updateComponent(id, { content: { ...content, src: e.target.value } })}
              placeholder="https://example.com/image.jpg"
              className="text-sm"
            />
          </div>
          <div className="mb-3">
            <Label htmlFor="altText" className="text-gray-700 mb-1 block text-sm font-medium">Alt Text</Label>
            <Input 
              id="altText"
              value={content.alt || ''} 
              onChange={(e) => updateComponent(id, { content: { ...content, alt: e.target.value } })}
              placeholder="Image description"
              className="text-sm"
            />
          </div>
        </>
      )}

      {type === 'button' && (
        <>
          <div className="mb-3">
            <Label htmlFor="buttonText" className="text-gray-700 mb-1 block text-sm font-medium">Button Text</Label>
            <Input 
              id="buttonText"
              value={content.text || ''} 
              onChange={handleTextChange}
              className="text-sm"
            />
          </div>
          <div className="mb-3">
            <Label htmlFor="buttonUrl" className="text-gray-700 mb-1 block text-sm font-medium">Button URL</Label>
            <Input 
              id="buttonUrl"
              value={content.url || ''} 
              onChange={(e) => updateComponent(id, { content: { ...content, url: e.target.value } })}
              placeholder="https://example.com"
              className="text-sm"
            />
          </div>
          {renderColorPicker('Background Color', 'backgroundColor', styles.backgroundColor)}
          {renderColorPicker('Text Color', 'color', styles.color)}
          <div className="mb-3">
            <Label htmlFor="borderRadius" className="text-gray-700 mb-1 block text-sm font-medium">Border Radius</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                id="borderRadius"
                value={parseInt(styles.borderRadius) || 4} 
                onChange={(e) => handleStyleChange('borderRadius', parseInt(e.target.value))}
                className="w-20 text-sm"
                min={0}
                max={24}
              />
              <span className="text-gray-500 text-sm">px</span>
            </div>
          </div>
        </>
      )}

      {type === 'divider' && (
        <>
          <div className="mb-3">
            <Label htmlFor="thickness" className="text-gray-700 mb-1 block text-sm font-medium">Thickness</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                id="thickness"
                value={parseInt(styles.thickness) || 1} 
                onChange={(e) => handleStyleChange('thickness', parseInt(e.target.value))}
                className="w-20 text-sm"
                min={1}
                max={10}
              />
              <span className="text-gray-500 text-sm">px</span>
            </div>
          </div>
          {renderColorPicker('Color', 'color', styles.color)}
        </>
      )}

      {type === 'spacer' && (
        <div className="mb-3">
          <Label htmlFor="height" className="text-gray-700 mb-1 block text-sm font-medium">Height</Label>
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              id="height"
              value={parseInt(styles.height) || 30} 
              onChange={(e) => handleStyleChange('height', parseInt(e.target.value))}
              className="w-20 text-sm"
              min={5}
              max={200}
            />
            <span className="text-gray-500 text-sm">px</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderComponentSpecificProperties = () => {
    switch (type) {
      case 'header':
        return (
          <div>
            <Label htmlFor="headerText" className="text-gray-700 mb-1 block text-sm font-medium">Header Text</Label>
            <Input 
              id="headerText"
              value={content.text || ''} 
              onChange={handleTextChange}
              className="text-sm mb-3"
            />
          </div>
        );
      case 'text':
        return (
          <div>
            <Label htmlFor="paragraphText" className="text-gray-700 mb-1 block text-sm font-medium">Text Content</Label>
            <textarea 
              id="paragraphText"
              value={content.text || ''} 
              onChange={handleTextChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y min-h-[100px] text-sm mb-3"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-700 capitalize">{type} Properties</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => deleteComponent(id)}
          className="h-8 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <X className="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>
      
      <Separator className="mb-4" />
      
      {renderComponentSpecificProperties()}
      {renderCommonStyles()}
    </div>
  );
};

// Main Template Builder component
export default function TemplateBuilder() {
  const { toast } = useToast();
  const params = useParams();
  const entityId = params.id;
  const [activeTab, setActiveTab] = useState("editor");
  const [entityType, setEntityType] = useState<"template" | "campaign">("template");
  const [templateName, setTemplateName] = useState("Untitled Template");
  const [sections, setSections] = useState<{ id: string; components: EmailComponent[] }[]>([
    { id: "section-1", components: [] }
  ]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [htmlOutput, setHtmlOutput] = useState<string>("");
  const [htmlEditorContent, setHtmlEditorContent] = useState<string | null>(null);
  const [currentPalette, setCurrentPalette] = useState<ColorPalette | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  
  // Check if the entityId starts with a number (likely a campaign) or not (likely a template)
  useEffect(() => {
    if (entityId) {
      // Use a simple check to determine if we're editing a campaign or template
      // Campaign IDs are typically numeric, while template IDs might have prefixes
      const isNumeric = /^\d+$/.test(entityId);
      setEntityType(isNumeric ? "campaign" : "template");
    }
  }, [entityId]);

  // Fetch template if template ID is provided
  const { data: template, isLoading: isTemplateLoading } = useQuery({
    queryKey: ['/api/templates', entityId],
    queryFn: async () => {
      if (!entityId || entityType !== "template") return null;
      const response = await fetch(`/api/templates/${entityId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      return response.json();
    },
    enabled: !!entityId && entityType === "template",
  });

  // Fetch campaign if campaign ID is provided
  const { data: campaign, isLoading: isCampaignLoading } = useQuery({
    queryKey: ['/api/campaigns', entityId],
    queryFn: async () => {
      if (!entityId || entityType !== "campaign") return null;
      const response = await fetch(`/api/campaigns/${entityId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }
      return response.json();
    },
    enabled: !!entityId && entityType === "campaign",
  });

  // Load template data when it's fetched
  useEffect(() => {
    if (template && !isLoading && entityType === "template") {
      try {
        setIsEditMode(true);
        setTemplateName(template.name || "Untitled Template");
        
        // Try to parse the template content as JSON to get the sections and components
        if (template.content) {
          try {
            const templateData = JSON.parse(template.content);
            if (templateData.sections && Array.isArray(templateData.sections)) {
              setSections(templateData.sections);
            }
          } catch (err) {
            // If content is not valid JSON, create a text component with the content
            setSections([
              {
                id: "section-1",
                components: [
                  {
                    id: `component-${Date.now()}`,
                    type: "text",
                    content: { text: template.content },
                    styles: { fontSize: '16px', color: '#666666', textAlign: 'left', padding: 10 }
                  }
                ]
              }
            ]);
          }
        }
      } catch (error) {
        console.error("Error loading template:", error);
        toast({
          title: "Error",
          description: "Failed to load template data",
          variant: "destructive"
        });
      }
    }
  }, [template, isLoading, toast, entityType]);

  // Load campaign data when it's fetched
  useEffect(() => {
    if (campaign && !isLoading && entityType === "campaign") {
      try {
        setIsEditMode(true);
        setTemplateName(campaign.name || "Untitled Campaign");
        
        // Try to parse the campaign content as JSON to get the sections and components
        if (campaign.content) {
          try {
            const campaignData = JSON.parse(campaign.content);
            if (campaignData.sections && Array.isArray(campaignData.sections)) {
              setSections(campaignData.sections);
            }
          } catch (err) {
            // If content is not valid JSON, create a text component with the content
            setSections([
              {
                id: "section-1",
                components: [
                  {
                    id: `component-${Date.now()}`,
                    type: "text",
                    content: { text: campaign.content },
                    styles: { fontSize: '16px', color: '#666666', textAlign: 'left', padding: 10 }
                  }
                ]
              }
            ]);
          }
        } else if (campaign.templateId) {
          // If campaign doesn't have content but has a templateId, fetch the template
          const fetchTemplate = async () => {
            try {
              const response = await fetch(`/api/templates/${campaign.templateId}`);
              if (!response.ok) {
                throw new Error('Failed to fetch template for campaign');
              }
              const templateData = await response.json();
              
              setTemplateName(campaign.name || "Untitled Campaign");
              
              // Try to parse the template content
              if (templateData.content) {
                try {
                  const parsedTemplate = JSON.parse(templateData.content);
                  if (parsedTemplate.sections && Array.isArray(parsedTemplate.sections)) {
                    setSections(parsedTemplate.sections);
                  }
                } catch (err) {
                  // If content is not valid JSON, create a text component with the content
                  setSections([
                    {
                      id: "section-1",
                      components: [
                        {
                          id: `component-${Date.now()}`,
                          type: "text",
                          content: { text: templateData.content },
                          styles: { fontSize: '16px', color: '#666666', textAlign: 'left', padding: 10 }
                        }
                      ]
                    }
                  ]);
                }
              }
            } catch (error) {
              console.error("Error loading template for campaign:", error);
              toast({
                title: "Error",
                description: "Failed to load template data for campaign",
                variant: "destructive"
              });
            }
          };
          
          fetchTemplate();
        }
      } catch (error) {
        console.error("Error loading campaign:", error);
        toast({
          title: "Error",
          description: "Failed to load campaign data",
          variant: "destructive"
        });
      }
    }
  }, [campaign, isLoading, toast, entityType]);

  // Used to hold the selected component for the property editor
  const selectedComponent = selectedComponentId 
    ? findComponentById(selectedComponentId)
    : null;

  // Find a component by ID
  function findComponentById(id: string): EmailComponent | null {
    for (const section of sections) {
      if (section.id === id) {
        return null;
      }
      const component = section.components.find(comp => comp.id === id);
      if (component) {
        return component;
      }
    }
    return null;
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("componentType", type);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData("componentType");
    
    if (!componentType) return;
    
    // Create new component
    const newComponent: EmailComponent = createComponent(componentType);
    
    // Add to section
    setSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            components: [...section.components, newComponent]
          };
        }
        return section;
      });
    });
    
    // Select the new component
    setSelectedComponentId(newComponent.id);
  };

  // Create a component based on type
  const createComponent = (type: string): EmailComponent => {
    const id = `component-${Date.now()}`;
    
    switch (type) {
      case 'header':
        return {
          id,
          type,
          content: { text: 'Your Header Text' },
          styles: { fontSize: '24px', color: '#333333', textAlign: 'left', padding: 10 }
        };
      case 'text':
        return {
          id,
          type,
          content: { text: 'Your paragraph text goes here. Edit this to add your own content.' },
          styles: { fontSize: '16px', color: '#666666', textAlign: 'left', padding: 10 }
        };
      case 'image':
        return {
          id,
          type,
          content: { src: '', alt: 'Image description' },
          styles: { maxWidth: '100%', padding: 10 }
        };
      case 'button':
        return {
          id,
          type,
          content: { text: 'Click Me', url: '#' },
          styles: { 
            backgroundColor: '#007bff', 
            color: '#ffffff', 
            paddingX: 20, 
            paddingY: 10, 
            borderRadius: 4,
            textAlign: 'center',
            padding: 10
          }
        };
      case 'divider':
        return {
          id,
          type,
          content: {},
          styles: { thickness: 1, color: '#dddddd', padding: 10 }
        };
      case 'spacer':
        return {
          id,
          type,
          content: {},
          styles: { height: 30, padding: 0 }
        };
      default:
        return {
          id,
          type,
          content: {},
          styles: {}
        };
    }
  };

  // Update component properties
  const updateComponent = (id: string, updates: Partial<EmailComponent>) => {
    setSections(prevSections => {
      return prevSections.map(section => {
        return {
          ...section,
          components: section.components.map(component => {
            if (component.id === id) {
              return { ...component, ...updates };
            }
            return component;
          })
        };
      });
    });
  };

  // Delete component
  const deleteComponent = (id: string) => {
    setSections(prevSections => {
      return prevSections.map(section => {
        return {
          ...section,
          components: section.components.filter(component => component.id !== id)
        };
      });
    });
    setSelectedComponentId(null);
  };

  // Add a new section
  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      components: []
    };
    setSections([...sections, newSection]);
  };

  // Generate HTML output
  useEffect(() => {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateName}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.5;
      color: #333333;
      background-color: #f9f9f9;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 4px;
      overflow: hidden;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    .section {
      padding: 15px;
    }
    .footer {
      padding: 20px;
      background-color: #f7f7f7;
      text-align: center;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="email-container">
`;

    sections.forEach(section => {
      html += `    <div class="section">
`;
      section.components.forEach(component => {
        switch (component.type) {
          case 'header':
            html += `      <h1 style="font-size: ${component.styles.fontSize}; color: ${component.styles.color}; text-align: ${component.styles.textAlign}; padding: ${component.styles.padding}px; margin-top: 10px; margin-bottom: 15px;">${component.content.text}</h1>\n`;
            break;
          case 'text':
            html += `      <p style="font-size: ${component.styles.fontSize}; color: ${component.styles.color}; text-align: ${component.styles.textAlign}; padding: ${component.styles.padding}px; margin-top: 0; margin-bottom: 15px;">${component.content.text}</p>\n`;
            break;
          case 'image':
            html += `      <img src="${component.content.src || 'https://via.placeholder.com/600x200'}" alt="${component.content.alt || ''}" style="width: 100%; max-width: ${component.styles.maxWidth}; padding: ${component.styles.padding}px; display: block; margin: 0 auto;">\n`;
            break;
          case 'button':
            html += `      <div style="text-align: ${component.styles.textAlign || 'center'}; padding: ${component.styles.padding}px;">
        <a href="${component.content.url || '#'}" style="display: inline-block; background-color: ${component.styles.backgroundColor}; color: ${component.styles.color}; padding: ${component.styles.paddingY}px ${component.styles.paddingX}px; text-decoration: none; border-radius: ${component.styles.borderRadius}px; font-weight: 500;">${component.content.text}</a>
      </div>\n`;
            break;
          case 'divider':
            html += `      <hr style="border: 0; border-top: ${component.styles.thickness}px solid ${component.styles.color}; margin: ${component.styles.padding}px 0;">\n`;
            break;
          case 'spacer':
            html += `      <div style="height: ${component.styles.height}px;"></div>\n`;
            break;
        }
      });
      html += `    </div>
`;
    });

    html += `    <div class="footer">
      <p>Email sent with our Email Marketing Platform</p>
    </div>
  </div>
</body>
</html>`;

    setHtmlOutput(html);

    // Update preview
    if (previewFrameRef.current && previewFrameRef.current.contentWindow) {
      const doc = previewFrameRef.current.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [sections, templateName]);

  // Handle component selection
  const handleComponentClick = (id: string) => {
    setSelectedComponentId(id);
  };
  
  // Apply color palette to template components
  const applyColorPalette = (palette: ColorPalette) => {
    setCurrentPalette(palette);
    
    // Only apply if we have at least 3 colors
    if (palette.colors.length < 3) {
      toast({
        title: "Not enough colors",
        description: "The palette needs at least 3 colors to apply to template elements.",
        variant: "destructive",
      });
      return;
    }
    
    setSections(prevSections => {
      return prevSections.map(section => {
        return {
          ...section,
          components: section.components.map(component => {
            let updatedComponent = { ...component };
            
            // Apply colors based on component type
            switch (component.type) {
              case 'header':
                // Use the first color (usually primary) for headers
                updatedComponent.styles = {
                  ...updatedComponent.styles,
                  color: palette.colors[0].hex
                };
                break;
              case 'text':
                // Use a dark color (usually 2nd or 3rd) for text
                updatedComponent.styles = {
                  ...updatedComponent.styles,
                  color: palette.colors[1].hex
                };
                break;
              case 'button':
                // Use first color for background, and a light color for text
                updatedComponent.styles = {
                  ...updatedComponent.styles,
                  backgroundColor: palette.colors[0].hex,
                  color: palette.colors.length > 3 ? palette.colors[3].hex : '#FFFFFF'
                };
                break;
              case 'divider':
                // Use a lighter color for dividers
                updatedComponent.styles = {
                  ...updatedComponent.styles,
                  color: palette.colors[2].hex
                };
                break;
            }
            
            return updatedComponent;
          })
        };
      });
    });
    
    toast({
      title: "Colors Applied",
      description: `${palette.name} palette has been applied to template elements.`,
    });
  };

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const method = isEditMode ? 'PATCH' : 'POST';
      const url = isEditMode ? `/api/templates/${entityId}` : '/api/templates';
      return apiRequest(url, method, templateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Template Saved",
        description: `"${templateName}" has been saved successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Save campaign mutation
  const saveCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const method = isEditMode ? 'PATCH' : 'POST';
      const url = isEditMode ? `/api/campaigns/${entityId}` : '/api/campaigns';
      return apiRequest(url, method, campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: "Campaign Saved",
        description: `"${templateName}" campaign has been saved successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Error saving campaign:', error);
      toast({
        title: "Error",
        description: "Failed to save campaign. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Save content (template or campaign)
  const handleSaveTemplate = () => {
    setIsLoading(true);
    
    // Prepare the content
    let content;
    
    // If we have HTML content from the editor or import, use that directly
    if (htmlEditorContent) {
      content = htmlEditorContent;
    } else {
      // Otherwise use the sections data
      content = JSON.stringify({
        sections: sections
      });
    }
    
    if (entityType === "template") {
      // Save as template
      const templateData = {
        name: templateName,
        content: content,
        description: `Email template for ${templateName}`,
        category: htmlEditorContent ? 'imported' : 'custom'
      };
      
      // Save the template
      saveTemplateMutation.mutate(templateData);
    } else if (entityType === "campaign") {
      // Save as campaign
      const campaignData = {
        name: templateName,
        content: content,
        status: 'draft' // Keep as draft until explicitly scheduled
      };
      
      // Save the campaign
      saveCampaignMutation.mutate(campaignData);
    }
    
    setIsLoading(false);
  };

  // Show loading state if template or campaign is being fetched
  if (isTemplateLoading || isCampaignLoading) {
    return (
      <div className="container-fluid p-4">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="animate-spin mb-4">
            <Loader2 className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-medium">
            Loading {entityType === "template" ? "template" : "campaign"}...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Header with Mailchimp-like styling */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {entityType === "template" 
                  ? (isEditMode ? "Edit Template" : "Create Template")
                  : (isEditMode ? "Edit Campaign" : "Create Campaign")}
              </h1>
              <p className="text-gray-500 mt-1">Design your email with our drag-and-drop editor</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-64">
                <Input 
                  placeholder={entityType === "template" ? "Template Name" : "Campaign Name"} 
                  value={templateName} 
                  onChange={(e) => setTemplateName(e.target.value)} 
                  className="border-gray-300"
                />
              </div>
              <Button 
                onClick={handleSaveTemplate} 
                disabled={saveTemplateMutation.isPending || saveCampaignMutation.isPending || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {(saveTemplateMutation.isPending || saveCampaignMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save {entityType === "template" ? "Template" : "Campaign"}
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="border-gray-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b mb-6 pb-1">
            <TabsList className="bg-transparent border-0 p-0 gap-6">
              <TabsTrigger 
                value="editor" 
                className="rounded-none border-0 pb-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base font-medium data-[state=active]:text-primary"
              >
                Design
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="rounded-none border-0 pb-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base font-medium data-[state=active]:text-primary"
              >
                Preview
              </TabsTrigger>
              <TabsTrigger 
                value="palette" 
                className="rounded-none border-0 pb-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base font-medium data-[state=active]:text-primary"
              >
                <div className="flex items-center gap-1">
                  <Palette className="h-4 w-4" />
                  <span>Colors</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="code" 
                className="rounded-none border-0 pb-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base font-medium data-[state=active]:text-primary"
              >
                HTML
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor">
            <div className="grid grid-cols-12 gap-6">
              {/* Components Toolbox */}
              <div className="col-span-12 lg:col-span-3">
                <Card className="property-card sticky top-24">
                  <div className="property-header">
                    <h3 className="font-semibold text-primary text-lg">Email Elements</h3>
                  </div>
                  <CardContent className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      <ComponentToolboxItem 
                        type="header" 
                        icon={<Type className="h-5 w-5" />} 
                        label="Heading" 
                        onDragStart={handleDragStart} 
                      />
                      <ComponentToolboxItem 
                        type="text" 
                        icon={<AlignLeft className="h-5 w-5" />} 
                        label="Text" 
                        onDragStart={handleDragStart} 
                      />
                      <ComponentToolboxItem 
                        type="image" 
                        icon={<Image className="h-5 w-5" />} 
                        label="Image" 
                        onDragStart={handleDragStart} 
                      />
                      <ComponentToolboxItem 
                        type="button" 
                        icon={<Link className="h-5 w-5" />} 
                        label="Button" 
                        onDragStart={handleDragStart} 
                      />
                      <ComponentToolboxItem 
                        type="divider" 
                        icon={<SeparatorHorizontal className="h-5 w-5" />} 
                        label="Divider" 
                        onDragStart={handleDragStart} 
                      />
                      <ComponentToolboxItem 
                        type="spacer" 
                        icon={<Layout className="h-5 w-5" />} 
                        label="Spacer" 
                        onDragStart={handleDragStart} 
                      />
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="mb-4">
                      <h3 className="font-semibold mb-3 text-gray-700">Layout</h3>
                      <Button 
                        className="w-full bg-primary/10 text-primary border-primary/25 hover:bg-primary/20 hover:text-primary hover:border-primary/40 py-5" 
                        variant="outline"
                        onClick={addSection}
                      >
                        <Rows className="mr-2 h-5 w-5" />
                        Add New Section
                      </Button>
                    </div>
                    
                    <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-start">
                        <div className="mr-2 mt-1 text-amber-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        </div>
                        <div>
                          <p className="text-amber-800 text-sm font-medium mb-1">How to use</p>
                          <p className="text-amber-700 text-xs">
                            Drag elements from above and drop them into the sections on the canvas to build your email template.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Email Canvas - Professional design */}
              <div className="col-span-12 lg:col-span-7">
                <div className="flex flex-col h-full">
                  <div className="preview-window">
                    <div className="preview-header">
                      <div className="flex items-center space-x-3">
                        <div className="preview-dots">
                          <div className="preview-dot bg-red-500"></div>
                          <div className="preview-dot bg-yellow-500"></div>
                          <div className="preview-dot bg-green-500"></div>
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Email {entityType === "template" ? "Template" : "Campaign"} Preview
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 hidden md:block">
                        <span className="px-2 py-1 bg-gray-100 rounded-md border border-gray-200 text-xs font-mono">
                          width: 600px
                        </span>
                      </div>
                    </div>
                    
                    <div className="email-canvas">
                      <div className="email-container">
                        {/* Email Header */}
                        <div className="email-header">
                          <div className="font-medium text-center text-primary text-lg">
                            {templateName || (entityType === "template" ? "Untitled Template" : "Untitled Campaign")}
                          </div>
                        </div>
                        
                        {/* Email Content */}
                        <div className="email-content">
                          {sections.map((section) => (
                            <Section 
                              key={section.id}
                              id={section.id}
                              components={section.components}
                              onDrop={handleDrop}
                              onComponentClick={handleComponentClick}
                              selected={selectedComponentId === section.id}
                            />
                          ))}
                        </div>
                        
                        {/* Email Footer */}
                        <div className="email-footer">
                          <div className="mb-2">
                            <span className="text-primary font-medium">InfyMailer</span> Email Marketing
                          </div>
                          <p className="text-xs text-gray-400">
                            Sent with our Email Marketing Platform • <a href="#" className="text-primary hover:underline">Unsubscribe</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Property Editor */}
              <div className="col-span-12 lg:col-span-3">
                <Card className="property-card sticky top-24">
                  <div className="property-header">
                    <h3 className="font-semibold text-primary text-lg">Element Properties</h3>
                  </div>
                  <CardContent className="p-0">
                    <PropertyEditor 
                      selectedComponent={selectedComponent} 
                      updateComponent={updateComponent}
                      deleteComponent={deleteComponent}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 text-gray-700">Email Preview</h3>
                <div className="border rounded-md overflow-hidden h-[700px] bg-white">
                  <iframe
                    ref={previewFrameRef}
                    className="w-full h-full"
                    title="Email Preview"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="palette">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 text-lg">Color Palette Generator</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Palette className="h-4 w-4 mr-1 text-primary" />
                      <span>AI-powered palette creation</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    Generate a custom color palette for your email template based on your brand description and industry. The AI will create harmonious colors that match your brand identity.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <ColorPaletteGenerator 
                        brandDescription="" 
                        industry=""
                        onGenerate={(palette) => {
                          // Apply the palette to the template components
                          applyColorPalette(palette);
                          
                          // Show success toast
                          toast({
                            title: "Color Palette Generated",
                            description: `${palette.name} - ${palette.description}`,
                          });
                          
                          // Switch to editor tab to see the changes
                          setTimeout(() => setActiveTab('editor'), 1500);
                        }}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="rounded-md border border-gray-200 p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-700 mb-2">How to use the palette</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start">
                            <div className="mr-2 mt-0.5 text-primary">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span>Click on any color to copy its HEX code to clipboard</span>
                          </li>
                          <li className="flex items-start">
                            <div className="mr-2 mt-0.5 text-primary">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span>Use primary colors for headers, buttons, and focal points</span>
                          </li>
                          <li className="flex items-start">
                            <div className="mr-2 mt-0.5 text-primary">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span>Secondary colors work well for backgrounds and accents</span>
                          </li>
                          <li className="flex items-start">
                            <div className="mr-2 mt-0.5 text-primary">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span>Apply new colors using the Element Properties panel</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="mt-4 p-4 rounded-md bg-amber-50 border border-amber-200">
                        <div className="flex items-start">
                          <div className="mr-2 text-amber-500 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                          </div>
                          <div>
                            <p className="text-sm text-amber-800 font-medium">Pro Tip</p>
                            <p className="text-xs text-amber-700">
                              For the best results, provide specific details about your brand's personality, values, and target audience in the description.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-700">HTML Source Code</h3>
                  <div className="flex gap-2">
                    <label className="cursor-pointer">
                      <div className="flex items-center px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 border-gray-300">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Import HTML
                      </div>
                      <input 
                        type="file" 
                        accept=".html,.htm" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const htmlContent = event.target?.result as string;
                                // Update the preview with the imported HTML
                                if (previewFrameRef.current && previewFrameRef.current.contentWindow) {
                                  const doc = previewFrameRef.current.contentWindow.document;
                                  doc.open();
                                  doc.write(htmlContent);
                                  doc.close();
                                }
                                
                                // Update the HTML editor with the imported content
                                setHtmlOutput(htmlContent);
                                setHtmlEditorContent(htmlContent);
                                
                                // Switch to preview tab
                                setActiveTab('preview');
                                
                                toast({
                                  title: "HTML Imported",
                                  description: "HTML file was imported successfully. You can view it in the Preview tab."
                                });
                              } catch (error) {
                                console.error("Error parsing HTML:", error);
                                toast({
                                  title: "Import Error",
                                  description: "The HTML file could not be parsed. Please check the file format.",
                                  variant: "destructive"
                                });
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-white border-gray-300"
                      onClick={() => {
                        navigator.clipboard.writeText(htmlOutput);
                        toast({
                          title: "Copied!",
                          description: "HTML code copied to clipboard",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-[500px]">
                    <textarea 
                      value={htmlEditorContent !== null ? htmlEditorContent : htmlOutput} 
                      onChange={(e) => setHtmlEditorContent(e.target.value)}
                      className="w-full h-[400px] bg-transparent border-none outline-none text-sm font-mono resize-none"
                      placeholder="Paste or edit your HTML code here..."
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <p className="text-sm text-gray-500">
                      <svg className="inline-block h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      You can edit HTML directly or import a file
                    </p>
                    <Button 
                      onClick={() => {
                        if (htmlEditorContent) {
                          // Update the preview with the custom HTML
                          if (previewFrameRef.current && previewFrameRef.current.contentWindow) {
                            const doc = previewFrameRef.current.contentWindow.document;
                            doc.open();
                            doc.write(htmlEditorContent);
                            doc.close();
                          }
                          
                          // Store the HTML content for saving
                          setHtmlOutput(htmlEditorContent);
                          
                          // Switch to preview tab
                          setActiveTab('preview');
                          
                          toast({
                            title: "HTML Applied",
                            description: `Custom HTML has been applied to the ${entityType}. Don't forget to save your ${entityType}.`
                          });
                        }
                      }}
                      disabled={!htmlEditorContent}
                      size="sm"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Apply Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}