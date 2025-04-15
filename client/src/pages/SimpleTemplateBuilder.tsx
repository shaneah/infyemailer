import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft, 
  Loader2, 
  Code, 
  Image as ImageIcon, 
  Type, 
  Save, 
  SeparatorHorizontal, 
  Menu, 
  Eye,
  FileDown,
  Send,
  Trash2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Simplified Email Template Builder
export default function SimpleTemplateBuilder() {
  const { toast } = useToast();
  const params = useParams();
  const [location, navigate] = useLocation();
  const entityId = params.id;
  
  // State for template information
  const [templateName, setTemplateName] = useState("New Email Template");
  const [templateSubject, setTemplateSubject] = useState("Your Email Subject");
  
  // State for HTML preview
  const [previewHtml, setPreviewHtml] = useState("");
  const [currentTab, setCurrentTab] = useState("design");
  const [isSaving, setIsSaving] = useState(false);
  
  // Blocks state
  const [blocks, setBlocks] = useState<{id: string; type: string; content: string}[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // Add new block
  const addBlock = (type: string) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type)
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    
    toast({
      title: "Block added",
      description: `Added a new ${type} block to your template`,
    });
  };
  
  // Get default content for block type
  const getDefaultContent = (type: string): string => {
    switch(type) {
      case 'text':
        return 'Enter your text here';
      case 'image':
        return 'https://placehold.co/600x200?text=Image';
      case 'button':
        return 'Click Me';
      case 'spacer':
        return '20px';
      default:
        return '';
    }
  };
  
  // Update block content
  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };
  
  // Delete block
  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };
  
  // Move block up or down
  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(block => block.id === id);
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === blocks.length - 1)) {
      return;
    }
    
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };
  
  // Generate HTML preview
  const generateHtml = () => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${templateName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          img { max-width: 100%; height: auto; }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #1a3a5f;
            color: white;
            text-decoration: none;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
    `;
    
    blocks.forEach(block => {
      switch(block.type) {
        case 'text':
          html += `<div style="margin-bottom: 15px;">${block.content}</div>`;
          break;
        case 'image':
          html += `<div style="margin-bottom: 15px;"><img src="${block.content}" alt="Image" style="display: block; margin: 0 auto;"></div>`;
          break;
        case 'button':
          html += `<div style="margin-bottom: 15px; text-align: center;"><a href="#" class="button">${block.content}</a></div>`;
          break;
        case 'spacer':
          html += `<div style="height: ${block.content}; clear: both;"></div>`;
          break;
      }
    });
    
    html += `
        </div>
      </body>
      </html>
    `;
    
    return html;
  };
  
  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateHtml: string) => {
      setIsSaving(true);
      try {
        const templateData = {
          name: templateName,
          subject: templateSubject,
          content: JSON.stringify({
            name: templateName,
            subject: templateSubject,
            blocks: blocks
          }),
          category: "custom",
          html: templateHtml
        };
        
        // Create a new template
        const response = await apiRequest('POST', '/api/templates', templateData);
        
        if (!response.ok) {
          throw new Error("Failed to save template");
        }
        
        return await response.json();
      } catch (error: any) {
        console.error("Error saving template:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Template saved",
        description: "Your email template has been saved successfully",
      });
      
      // Invalidate templates query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      
      // Navigate back to templates after a short delay
      setTimeout(() => navigate('/templates'), 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to save template: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle save template
  const handleSaveTemplate = () => {
    const html = generateHtml();
    saveTemplateMutation.mutate(html);
  };
  
  // Go back to templates list
  const handleBack = () => {
    navigate('/templates');
  };
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b px-6 py-3 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Email Template Builder</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentTab(currentTab === 'design' ? 'preview' : 'design')}
          >
            <Eye className="h-4 w-4 mr-2" />
            {currentTab === 'design' ? 'Preview' : 'Edit'}
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="bg-[#1a3a5f] hover:bg-[#1a3a5f]/90"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Template
          </Button>
        </div>
      </header>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col">
        <div className="bg-gray-50 px-6 border-b">
          <TabsList className="h-10">
            <TabsTrigger value="design" className="data-[state=active]:bg-white">Design</TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-white">Preview</TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-white">HTML</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="design" className="flex flex-1 p-0 m-0 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r flex flex-col overflow-hidden bg-white">
            <div className="p-4 border-b">
              <h3 className="font-medium mb-2">Template Settings</h3>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="template-name" className="text-xs">Template Name</Label>
                  <Input 
                    id="template-name" 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="template-subject" className="text-xs">Email Subject</Label>
                  <Input 
                    id="template-subject" 
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-b">
              <h3 className="font-medium mb-2">Add Content</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-24 flex flex-col gap-1"
                  onClick={() => addBlock('text')}
                >
                  <Type className="h-5 w-5" />
                  <span className="text-xs">Text</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-24 flex flex-col gap-1"
                  onClick={() => addBlock('image')}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs">Image</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-24 flex flex-col gap-1"
                  onClick={() => addBlock('button')}
                >
                  <span className="text-xs font-bold">BTN</span>
                  <span className="text-xs">Button</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-24 flex flex-col gap-1"
                  onClick={() => addBlock('spacer')}
                >
                  <SeparatorHorizontal className="h-5 w-5" />
                  <span className="text-xs">Spacer</span>
                </Button>
              </div>
            </div>
            
            {selectedBlockId && (
              <div className="p-4 flex-1 overflow-auto">
                <h3 className="font-medium mb-2">Block Settings</h3>
                {blocks.find(block => block.id === selectedBlockId)?.type === 'text' && (
                  <div>
                    <Label className="text-xs mb-1 block">Text Content</Label>
                    <Textarea 
                      rows={5}
                      value={blocks.find(block => block.id === selectedBlockId)?.content || ''}
                      onChange={(e) => updateBlockContent(selectedBlockId, e.target.value)}
                      className="mb-3 text-sm"
                    />
                  </div>
                )}
                
                {blocks.find(block => block.id === selectedBlockId)?.type === 'image' && (
                  <div>
                    <Label className="text-xs mb-1 block">Image URL</Label>
                    <Input 
                      value={blocks.find(block => block.id === selectedBlockId)?.content || ''}
                      onChange={(e) => updateBlockContent(selectedBlockId, e.target.value)}
                      className="mb-3 text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {['https://placehold.co/600x200/D4AF37/ffffff?text=Sample+1', 
                        'https://placehold.co/600x200/1A3A5F/ffffff?text=Sample+2',
                        'https://placehold.co/600x200/F5F0E1/000000?text=Sample+3'
                      ].map((url, idx) => (
                        <img 
                          key={idx} 
                          src={url} 
                          alt={`Sample ${idx+1}`} 
                          className="w-full border border-gray-200 cursor-pointer hover:border-blue-400"
                          onClick={() => updateBlockContent(selectedBlockId, url)} 
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {blocks.find(block => block.id === selectedBlockId)?.type === 'button' && (
                  <div>
                    <Label className="text-xs mb-1 block">Button Text</Label>
                    <Input 
                      value={blocks.find(block => block.id === selectedBlockId)?.content || ''}
                      onChange={(e) => updateBlockContent(selectedBlockId, e.target.value)}
                      className="mb-3 text-sm"
                    />
                  </div>
                )}
                
                {blocks.find(block => block.id === selectedBlockId)?.type === 'spacer' && (
                  <div>
                    <Label className="text-xs mb-1 block">Height (px)</Label>
                    <Input 
                      type="number"
                      min="5"
                      max="100"
                      value={parseInt(blocks.find(block => block.id === selectedBlockId)?.content || '20')}
                      onChange={(e) => updateBlockContent(selectedBlockId, `${e.target.value}px`)}
                      className="mb-3 text-sm"
                    />
                  </div>
                )}
                
                <div className="mt-4 flex space-x-2">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteBlock(selectedBlockId)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Block
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Content Area */}
          <div className="flex-1 bg-gray-100 overflow-auto p-4">
            <div className="max-w-[600px] mx-auto bg-white shadow rounded-md overflow-hidden">
              {/* Template Header */}
              <div className="bg-[#1a3a5f] text-white p-4">
                <h2 className="text-lg font-medium">{templateName}</h2>
                <p className="text-sm opacity-75">{templateSubject}</p>
              </div>
              
              {/* Content Blocks */}
              <div className="p-6">
                {blocks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Your template is empty. Add some content blocks from the sidebar.</p>
                  </div>
                ) : (
                  blocks.map((block, index) => (
                    <div 
                      key={block.id}
                      className={`mb-4 p-2 border rounded relative ${selectedBlockId === block.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'}`}
                      onClick={() => setSelectedBlockId(block.id)}
                    >
                      {/* Block controls */}
                      <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100">
                        <button 
                          className="rounded-full p-1 bg-white shadow"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(block.id, 'up');
                          }}
                          disabled={index === 0}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                        </button>
                        <button 
                          className="rounded-full p-1 bg-white shadow"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(block.id, 'down');
                          }}
                          disabled={index === blocks.length - 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                      </div>
                      
                      {/* Block content */}
                      {block.type === 'text' && (
                        <div className="py-2">{block.content}</div>
                      )}
                      
                      {block.type === 'image' && (
                        <div className="py-2">
                          <img 
                            src={block.content} 
                            alt="Template content" 
                            className="max-w-full mx-auto"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/600x200?text=Image+Not+Found';
                            }}
                          />
                        </div>
                      )}
                      
                      {block.type === 'button' && (
                        <div className="py-2 flex justify-center">
                          <button className="px-4 py-2 bg-[#1a3a5f] text-white rounded">
                            {block.content}
                          </button>
                        </div>
                      )}
                      
                      {block.type === 'spacer' && (
                        <div className="py-1 flex items-center justify-center text-xs text-gray-400">
                          <SeparatorHorizontal className="h-4 w-4 mr-1" />
                          <span>Spacer: {block.content}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 p-0 m-0 bg-gray-100">
          <div className="h-full w-full flex justify-center p-4 overflow-auto">
            <div className="shadow-lg bg-white rounded">
              <iframe 
                srcDoc={previewHtml || generateHtml()} 
                title="Email Preview" 
                className="w-[600px] h-full border-0 rounded"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="flex-1 p-0 m-0">
          <div className="h-full w-full flex justify-center p-4 overflow-auto">
            <div className="w-full max-w-4xl">
              <div className="bg-gray-900 text-gray-200 p-4 rounded-md overflow-auto h-[calc(100vh-180px)]">
                <pre className="text-sm">{generateHtml()}</pre>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}