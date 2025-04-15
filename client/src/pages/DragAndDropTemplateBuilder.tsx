import { useState, useEffect, useCallback } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft, 
  Loader2, 
  Save, 
  Eye,
  Settings,
  Send,
  FileText,
  Plus,
  Undo2,
  Redo2,
  Columns,
  AlignLeft
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { v4 as uuidv4 } from 'uuid';
import DraggableBlock, { 
  BlockItem, 
  AvailableBlocks, 
  ColumnStructures, 
  ColumnTypes,
  BlockTypes,
  ItemTypes
} from "@/components/DraggableTemplateBlock";

// Template interface
interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  previewImage?: string;
  isDefault?: boolean;
  author?: string;
  status?: string;
}

const DragAndDropTemplateBuilder = () => {
  const [location, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [history, setHistory] = useState<Array<BlockItem[]>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Template form state
  const [template, setTemplate] = useState<Partial<Template>>({
    name: "",
    description: "",
    category: "marketing",
    tags: [],
    content: "",
  });

  // Editor settings
  const [editorSettings, setEditorSettings] = useState({
    backgroundColor: "#ffffff",
    contentWidth: "600px",
    fontFamily: "Arial, sans-serif",
    textColor: "#000000",
    linkColor: "#0000FF",
  });
  
  // Fetch template data if editing existing template
  const { isLoading, error, data } = useQuery<Template>({
    queryKey: ['/api/templates', id],
    queryFn: id ? async () => {
      const response = await apiRequest('GET', `/api/templates/${id}`);
      return response.json();
    } : undefined,
    enabled: !!id,
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: async (template: Partial<Template>) => {
      const response = await apiRequest(
        id ? 'PATCH' : 'POST',
        id ? `/api/templates/${id}` : '/api/templates',
        template
      );
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: id ? "Template updated" : "Template created",
        description: `Successfully ${id ? "updated" : "created"} template: ${template.name}`,
      });
      setIsDirty(false);
      if (!id) {
        setLocation(`/templates/${data.id}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${id ? "update" : "create"} template: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Save current state to history
  const saveToHistory = useCallback((newBlocks: BlockItem[]) => {
    // Clone blocks to avoid reference issues
    const blocksToSave = JSON.parse(JSON.stringify(newBlocks));
    
    // If we're not at the end of the history, remove everything after current index
    if (historyIndex < history.length - 1) {
      setHistory(prev => prev.slice(0, historyIndex + 1));
    }
    
    setHistory(prev => [...prev, blocksToSave]);
    setHistoryIndex(prev => prev + 1);
  }, [history, historyIndex]);

  // Initialize template data
  useEffect(() => {
    if (data) {
      const templateData = data as Template;
      setTemplate({
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        tags: templateData.tags || [],
        content: templateData.content,
      });
      
      try {
        // Try to parse content as JSON for blocks
        const content = JSON.parse(templateData.content);
        if (Array.isArray(content)) {
          setBlocks(content);
          saveToHistory(content);
        }
      } catch (e) {
        // If content is not valid JSON, treat it as HTML
        console.error("Failed to parse template content as JSON:", e);
      }
    }
  }, [data, saveToHistory]);

  // Undo action
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex - 1])));
      setIsDirty(true);
    }
  }, [history, historyIndex]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex + 1])));
      setIsDirty(true);
    }
  }, [history, historyIndex]);

  // Add a new block to the template
  const handleAddBlock = useCallback((type: string) => {
    const newBlock: BlockItem = {
      id: uuidv4(),
      type,
      content: {}
    };
    
    // Initialize columns if it's a column layout
    if (Object.values(ColumnTypes).includes(type as any)) {
      // Initialize columns based on layout type
      let columnCount = 1;
      switch (type) {
        case ColumnTypes.TWO_COLUMNS:
          columnCount = 2;
          break;
        case ColumnTypes.THREE_COLUMNS:
          columnCount = 3;
          break;
        case ColumnTypes.ONE_TWO_RATIO:
          columnCount = 2;
          break;
        default:
          columnCount = 1;
      }
      
      newBlock.columns = Array(columnCount).fill(0).map(() => []);
    }
    
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
    setIsDirty(true);
  }, [blocks, saveToHistory]);

  // Remove a block from the template
  const handleRemoveBlock = useCallback((id: string) => {
    const newBlocks = blocks.filter(block => block.id !== id);
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
    setIsDirty(true);
  }, [blocks, saveToHistory]);

  // Move a block within the template
  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    const draggedBlock = blocks[dragIndex];
    const newBlocks = [...blocks];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, draggedBlock);
    setBlocks(newBlocks);
    // Don't save to history on every move to avoid bloating history
    // Only save when drag ends
  }, [blocks]);

  // Handle block drop after dragging ended
  const handleDragEnd = useCallback(() => {
    saveToHistory(blocks);
    setIsDirty(true);
  }, [blocks, saveToHistory]);

  // Update block content
  const updateBlockContent = useCallback((id: string, content: any) => {
    const newBlocks = blocks.map(block => {
      if (block.id === id) {
        return { ...block, content };
      }
      return block;
    });
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
    setIsDirty(true);
  }, [blocks, saveToHistory]);

  // Save template
  const handleSaveTemplate = useCallback(() => {
    // Convert blocks to JSON string for storage
    const content = JSON.stringify(blocks);
    
    // Update template with content
    updateMutation.mutate({
      ...template,
      content
    });
  }, [template, blocks, updateMutation]);

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-bold mb-2">Error loading template</h2>
        <p className="text-red-500">{(error as Error).message}</p>
        <Button onClick={() => setLocation('/templates')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="border-b bg-white z-20">
          <div className="container mx-auto py-2 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/templates')}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <h1 className="text-xl font-semibold">
                  {id ? "Edit Template" : "Create Template"}
                </h1>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                >
                  <Undo2 className="h-4 w-4 mr-1" />
                  Undo
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo2 className="h-4 w-4 mr-1" />
                  Redo
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {previewMode ? "Edit" : "Preview"}
                </Button>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Template Settings</SheetTitle>
                      <SheetDescription>
                        Configure the appearance and behavior of your template
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <Label htmlFor="backgroundColor">Background Color</Label>
                        <div className="flex mt-1">
                          <Input
                            id="backgroundColor"
                            type="color"
                            value={editorSettings.backgroundColor}
                            onChange={(e) => setEditorSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="w-12 p-1 h-10"
                          />
                          <Input
                            type="text"
                            value={editorSettings.backgroundColor}
                            onChange={(e) => setEditorSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="ml-2 flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="contentWidth">Content Width</Label>
                        <Input
                          id="contentWidth"
                          type="text"
                          value={editorSettings.contentWidth}
                          onChange={(e) => setEditorSettings(prev => ({ ...prev, contentWidth: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <Select
                          value={editorSettings.fontFamily}
                          onValueChange={(value) => setEditorSettings(prev => ({ ...prev, fontFamily: value }))}
                        >
                          <SelectTrigger id="fontFamily">
                            <SelectValue placeholder="Select font family" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                            <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                            <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                            <SelectItem value="Georgia, serif">Georgia</SelectItem>
                            <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="textColor">Text Color</Label>
                        <div className="flex mt-1">
                          <Input
                            id="textColor"
                            type="color"
                            value={editorSettings.textColor}
                            onChange={(e) => setEditorSettings(prev => ({ ...prev, textColor: e.target.value }))}
                            className="w-12 p-1 h-10"
                          />
                          <Input
                            type="text"
                            value={editorSettings.textColor}
                            onChange={(e) => setEditorSettings(prev => ({ ...prev, textColor: e.target.value }))}
                            className="ml-2 flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="linkColor">Link Color</Label>
                        <div className="flex mt-1">
                          <Input
                            id="linkColor"
                            type="color"
                            value={editorSettings.linkColor}
                            onChange={(e) => setEditorSettings(prev => ({ ...prev, linkColor: e.target.value }))}
                            className="w-12 p-1 h-10"
                          />
                          <Input
                            type="text"
                            value={editorSettings.linkColor}
                            onChange={(e) => setEditorSettings(prev => ({ ...prev, linkColor: e.target.value }))}
                            className="ml-2 flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveTemplate}
                  disabled={updateMutation.isPending || !isDirty}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save Template
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left sidebar for template info */}
          {!previewMode && (
            <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="blocks">Blocks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={template.name}
                      onChange={handleInputChange}
                      placeholder="Enter template name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={template.description}
                      onChange={handleInputChange}
                      placeholder="Enter template description"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={template.category}
                      onValueChange={(value) => setTemplate(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="blocks">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2 text-sm flex items-center">
                        <Columns className="h-4 w-4 mr-1" />
                        Layout Structures
                      </h3>
                      <ColumnStructures onAddColumn={handleAddBlock} />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2 text-sm flex items-center">
                        <AlignLeft className="h-4 w-4 mr-1" />
                        Content Blocks
                      </h3>
                      <AvailableBlocks onAddBlock={handleAddBlock} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {/* Main editor area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
            <div 
              className="mx-auto bg-white rounded-lg shadow-sm p-4 relative transition-all"
              style={{ 
                width: editorSettings.contentWidth,
                maxWidth: "100%",
                backgroundColor: editorSettings.backgroundColor,
                color: editorSettings.textColor,
                fontFamily: editorSettings.fontFamily 
              }}
            >
              {blocks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-4">
                    Add blocks from the sidebar to build your template
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddBlock(BlockTypes.TEXT)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Text Block
                  </Button>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <DraggableBlock
                    key={block.id}
                    id={block.id}
                    index={index}
                    type={block.type}
                    content={block.content}
                    columns={block.columns}
                    moveBlock={moveBlock}
                    removeBlock={handleRemoveBlock}
                    updateBlockContent={updateBlockContent}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default DragAndDropTemplateBuilder;