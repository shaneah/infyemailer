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
import { 
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Image, 
  Link, List, ListOrdered, Type, Grid, Layout, Columns, Rows, Save, 
  ArrowLeft, Loader2
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

// Section where components are dropped
const Section = ({ id, components, onDrop, onComponentClick, selected }: SectionProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className={`p-4 min-h-[100px] border-2 border-dashed rounded-md mb-4 transition-all ${
        selected ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onDrop={(e) => onDrop(e, id)}
      onDragOver={handleDragOver}
      onClick={() => onComponentClick(id)}
    >
      {components.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Drop elements here
        </div>
      ) : (
        <div className="space-y-2">
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

// Renders different types of email components
const EmailComponentRenderer = ({ component, onClick }: { component: EmailComponent; onClick: () => void }) => {
  const { type, content, styles } = component;

  const componentStyles = {
    ...styles,
    cursor: 'pointer',
  };

  switch (type) {
    case 'header':
      return (
        <div onClick={onClick} style={componentStyles} className="p-2 border rounded hover:bg-gray-50">
          <h1 style={{ fontSize: styles.fontSize, textAlign: styles.textAlign, color: styles.color }}>{content.text}</h1>
        </div>
      );
    case 'text':
      return (
        <div onClick={onClick} style={componentStyles} className="p-2 border rounded hover:bg-gray-50">
          <p style={{ fontSize: styles.fontSize, textAlign: styles.textAlign, color: styles.color }}>{content.text}</p>
        </div>
      );
    case 'image':
      return (
        <div onClick={onClick} style={componentStyles} className="p-2 border rounded hover:bg-gray-50">
          <img 
            src={content.src || "https://via.placeholder.com/400x200?text=Your+Image+Here"} 
            alt={content.alt || "Email image"} 
            style={{ width: '100%', maxWidth: styles.maxWidth }}
          />
        </div>
      );
    case 'button':
      return (
        <div onClick={onClick} style={componentStyles} className="p-2 border rounded hover:bg-gray-50 text-center">
          <button 
            style={{ 
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              padding: `${styles.paddingY}px ${styles.paddingX}px`,
              borderRadius: `${styles.borderRadius}px`,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-block',
            }}
          >
            {content.text}
          </button>
        </div>
      );
    case 'divider':
      return (
        <div onClick={onClick} style={componentStyles} className="p-2 border rounded hover:bg-gray-50">
          <hr style={{ borderTop: `${styles.thickness}px solid ${styles.color}` }} />
        </div>
      );
    case 'spacer':
      return (
        <div 
          onClick={onClick} 
          style={{ height: `${styles.height}px` }} 
          className="p-2 border rounded hover:bg-gray-50 bg-gray-50 bg-opacity-50"
        >
          <div className="text-center text-xs text-gray-400">
            Spacer: {styles.height}px
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
      className="p-3 border rounded-md flex flex-col items-center justify-center gap-2 hover:bg-gray-50 cursor-grab"
      draggable
      onDragStart={(e) => onDragStart(e, type)}
    >
      {icon}
      <span className="text-xs">{label}</span>
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
      <div className="p-4 text-center text-gray-400">
        Select a component to edit its properties
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
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label htmlFor={`color-${styleProperty}`}>{label}</Label>
        <div 
          className="w-6 h-6 rounded border"
          style={{ backgroundColor: currentValue }}
        ></div>
      </div>
      <Input
        id={`color-${styleProperty}`}
        type="color"
        value={currentValue}
        onChange={(e) => handleStyleChange(styleProperty, e.target.value)}
      />
    </div>
  );

  const renderCommonStyles = () => (
    <>
      {type !== 'divider' && type !== 'spacer' && type !== 'image' && (
        <>
          {renderColorPicker("Text Color", "color", styles.color)}
          
          <div className="space-y-1">
            <Label htmlFor="font-size">Font Size (px)</Label>
            <Input
              id="font-size"
              type="number"
              value={styles.fontSize.replace('px', '')}
              onChange={(e) => handleStyleChange("fontSize", `${e.target.value}px`)}
            />
          </div>
          
          <div className="space-y-1">
            <Label>Text Alignment</Label>
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                type="button" 
                variant={styles.textAlign === 'left' ? "default" : "ghost"} 
                className="flex-1 rounded-none"
                onClick={() => handleStyleChange("textAlign", "left")}
              >
                <AlignLeft size={16} />
              </Button>
              <Button 
                type="button" 
                variant={styles.textAlign === 'center' ? "default" : "ghost"} 
                className="flex-1 rounded-none"
                onClick={() => handleStyleChange("textAlign", "center")}
              >
                <AlignCenter size={16} />
              </Button>
              <Button 
                type="button" 
                variant={styles.textAlign === 'right' ? "default" : "ghost"} 
                className="flex-1 rounded-none"
                onClick={() => handleStyleChange("textAlign", "right")}
              >
                <AlignRight size={16} />
              </Button>
            </div>
          </div>
        </>
      )}

      <div className="space-y-1">
        <Label htmlFor="padding">Padding (px)</Label>
        <Input
          id="padding"
          type="number"
          value={styles.padding || 0}
          onChange={(e) => handleStyleChange("padding", Number(e.target.value))}
        />
      </div>
    </>
  );

  const renderComponentSpecificProperties = () => {
    switch (type) {
      case 'header':
      case 'text':
        return (
          <div className="space-y-1">
            <Label htmlFor="text-content">Text Content</Label>
            <textarea
              id="text-content"
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={content.text}
              onChange={handleTextChange}
            />
          </div>
        );
      
      case 'image':
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="image-src">Image URL</Label>
              <Input
                id="image-src"
                value={content.src || ""}
                onChange={(e) => updateComponent(id, { content: { ...content, src: e.target.value } })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={content.alt || ""}
                onChange={(e) => updateComponent(id, { content: { ...content, alt: e.target.value } })}
                placeholder="Image description"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="image-max-width">Max Width (%)</Label>
              <Input
                id="image-max-width"
                type="number"
                min="10"
                max="100"
                value={styles.maxWidth?.replace('%', '') || "100"}
                onChange={(e) => handleStyleChange("maxWidth", `${e.target.value}%`)}
              />
            </div>
          </>
        );
      
      case 'button':
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                value={content.text}
                onChange={handleTextChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="button-url">Button URL</Label>
              <Input
                id="button-url"
                value={content.url || ""}
                onChange={(e) => updateComponent(id, { content: { ...content, url: e.target.value } })}
                placeholder="https://example.com"
              />
            </div>
            {renderColorPicker("Button Color", "backgroundColor", styles.backgroundColor)}
            {renderColorPicker("Text Color", "color", styles.color)}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="button-padding-x">Padding X (px)</Label>
                <Input
                  id="button-padding-x"
                  type="number"
                  value={styles.paddingX || 20}
                  onChange={(e) => handleStyleChange("paddingX", Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="button-padding-y">Padding Y (px)</Label>
                <Input
                  id="button-padding-y"
                  type="number"
                  value={styles.paddingY || 10}
                  onChange={(e) => handleStyleChange("paddingY", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="button-radius">Border Radius (px)</Label>
              <Input
                id="button-radius"
                type="number"
                value={styles.borderRadius || 4}
                onChange={(e) => handleStyleChange("borderRadius", Number(e.target.value))}
              />
            </div>
          </>
        );
      
      case 'divider':
        return (
          <>
            {renderColorPicker("Line Color", "color", styles.color)}
            <div className="space-y-1">
              <Label htmlFor="divider-thickness">Thickness (px)</Label>
              <Input
                id="divider-thickness"
                type="number"
                min="1"
                max="10"
                value={styles.thickness || 1}
                onChange={(e) => handleStyleChange("thickness", Number(e.target.value))}
              />
            </div>
          </>
        );
      
      case 'spacer':
        return (
          <div className="space-y-1">
            <Label htmlFor="spacer-height">Height (px)</Label>
            <Input
              id="spacer-height"
              type="number"
              min="10"
              max="200"
              value={styles.height || 20}
              onChange={(e) => handleStyleChange("height", Number(e.target.value))}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">{type} Properties</h3>
        <Button variant="destructive" size="sm" onClick={() => deleteComponent(id)}>Delete</Button>
      </div>
      
      <Separator />

      <div className="space-y-4">
        {renderComponentSpecificProperties()}
        <Separator />
        {renderCommonStyles()}
      </div>
    </div>
  );
};

// Main Template Builder component
export default function TemplateBuilder() {
  const { toast } = useToast();
  const params = useParams();
  const templateId = params.id;
  const [activeTab, setActiveTab] = useState("editor");
  const [templateName, setTemplateName] = useState("Untitled Template");
  const [sections, setSections] = useState<{ id: string; components: EmailComponent[] }[]>([
    { id: "section-1", components: [] }
  ]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [htmlOutput, setHtmlOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  
  // Fetch template if template ID is provided
  const { data: template, isLoading: isTemplateLoading } = useQuery({
    queryKey: ['/api/templates', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      return response.json();
    },
    enabled: !!templateId,
  });

  // Load template data when it's fetched
  useEffect(() => {
    if (template && !isLoading) {
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
  }, [template, isLoading, toast]);

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
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.5;
      color: #333333;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    .section {
      padding: 10px;
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
            html += `      <h1 style="font-size: ${component.styles.fontSize}; color: ${component.styles.color}; text-align: ${component.styles.textAlign}; padding: ${component.styles.padding}px;">${component.content.text}</h1>\n`;
            break;
          case 'text':
            html += `      <p style="font-size: ${component.styles.fontSize}; color: ${component.styles.color}; text-align: ${component.styles.textAlign}; padding: ${component.styles.padding}px;">${component.content.text}</p>\n`;
            break;
          case 'image':
            html += `      <img src="${component.content.src || 'https://via.placeholder.com/600x200'}" alt="${component.content.alt || ''}" style="width: 100%; max-width: ${component.styles.maxWidth}; padding: ${component.styles.padding}px;">\n`;
            break;
          case 'button':
            html += `      <div style="text-align: ${component.styles.textAlign || 'center'}; padding: ${component.styles.padding}px;">
        <a href="${component.content.url || '#'}" style="display: inline-block; background-color: ${component.styles.backgroundColor}; color: ${component.styles.color}; padding: ${component.styles.paddingY}px ${component.styles.paddingX}px; text-decoration: none; border-radius: ${component.styles.borderRadius}px;">${component.content.text}</a>
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

    html += `  </div>
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

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const method = isEditMode ? 'PATCH' : 'POST';
      const url = isEditMode ? `/api/templates/${templateId}` : '/api/templates';
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

  // Save template
  const handleSaveTemplate = () => {
    setIsLoading(true);
    
    // Prepare the template data
    const templateData = {
      name: templateName,
      content: JSON.stringify({
        sections: sections
      }),
      description: `Email template for ${templateName}`,
      category: 'custom'
    };
    
    // Save the template
    saveTemplateMutation.mutate(templateData);
    setIsLoading(false);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Email Template Builder</h1>
          <p className="text-gray-500">Create and customize email templates with drag-and-drop</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-64">
            <Input 
              placeholder="Template Name" 
              value={templateName} 
              onChange={(e) => setTemplateName(e.target.value)} 
            />
          </div>
          <Button onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full lg:w-auto">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">HTML Code</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div className="grid grid-cols-12 gap-4">
            {/* Components Toolbox */}
            <div className="col-span-12 lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Components</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <ComponentToolboxItem 
                      type="header" 
                      icon={<Type className="h-5 w-5" />} 
                      label="Header" 
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
                      icon={<Separator className="h-5 w-5" />} 
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
                  
                  <h3 className="font-medium mb-3">Layout</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" onClick={addSection}>
                      <Rows className="mr-2 h-4 w-4" />
                      Add Section
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Email Canvas */}
            <div className="col-span-12 lg:col-span-7">
              <div className="bg-white border rounded-md p-6">
                <div className="max-w-[600px] mx-auto">
                  {sections.map((section, index) => (
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
              </div>
            </div>
            
            {/* Property Editor */}
            <div className="col-span-12 lg:col-span-3">
              <Card className="h-full">
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
          <Card>
            <CardContent className="p-4">
              <div className="border rounded-md overflow-hidden h-[600px]">
                <iframe
                  ref={previewFrameRef}
                  className="w-full h-full"
                  title="Email Preview"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute right-2 top-2"
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
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-[600px] text-sm">
                  {htmlOutput}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}