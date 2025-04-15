import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BasicTemplateBuilder() {
  const { toast } = useToast();
  const params = useParams();
  const [location, navigate] = useLocation();

  // Template data
  const [templateName, setTemplateName] = useState("New Template");
  const [templateSubject, setTemplateSubject] = useState("Your Email Subject");
  const [sections, setSections] = useState<Array<{
    id: string;
    type: string;
    content: string;
  }>>([]);
  const [activeTab, setActiveTab] = useState("editor");
  const [isSaving, setIsSaving] = useState(false);

  // Add a new section to the template
  const addSection = (type: string) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type,
      content: getDefaultContent(type)
    };
    
    setSections([...sections, newSection]);
  };

  // Get default content based on section type
  const getDefaultContent = (type: string) => {
    switch(type) {
      case "heading":
        return "Your Heading";
      case "text":
        return "Enter your paragraph text here. This is where you can write the main content of your email.";
      case "image":
        return "https://placehold.co/600x200?text=Your+Image+Here";
      case "button":
        return "Click Me";
      default:
        return "";
    }
  };

  // Update section content
  const updateSectionContent = (id: string, content: string) => {
    setSections(
      sections.map(section => 
        section.id === id ? { ...section, content } : section
      )
    );
  };

  // Remove section
  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
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
          .header {
            background-color: #1a3a5f;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          h1, h2 {
            color: #1a3a5f;
          }
          p {
            line-height: 1.5;
            color: #333333;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #d4af37;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            background-color: #f5f0e1;
            padding: 15px;
            text-align: center;
            color: #666666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${templateName}</h1>
            <p>${templateSubject}</p>
          </div>
          <div class="content">
    `;

    sections.forEach(section => {
      switch(section.type) {
        case "heading":
          html += `<h2>${section.content}</h2>`;
          break;
        case "text":
          html += `<p>${section.content}</p>`;
          break;
        case "image":
          html += `<img src="${section.content}" alt="Email image" />`;
          break;
        case "button":
          html += `
            <div class="button-container">
              <a href="#" class="button">${section.content}</a>
            </div>
          `;
          break;
      }
    });

    html += `
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} InfyMailer. All rights reserved.</p>
            <p>You received this email because you signed up for our newsletter.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  // Save template
  const saveTemplateMutation = useMutation({
    mutationFn: async () => {
      setIsSaving(true);
      
      try {
        const htmlContent = generateHtml();
        
        const templateData = {
          name: templateName,
          subject: templateSubject,
          content: JSON.stringify({
            sections,
            name: templateName,
            subject: templateSubject
          }),
          html: htmlContent,
          category: "custom"
        };
        
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
        title: "Success",
        description: "Template saved successfully",
      });
      
      // Invalidate templates cache
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      
      // Navigate back to templates
      setTimeout(() => navigate('/templates'), 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to save template: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Handle saving the template
  const handleSave = () => {
    if (sections.length === 0) {
      toast({
        title: "Cannot save",
        description: "Please add at least one content section to your template",
        variant: "destructive",
      });
      return;
    }
    
    saveTemplateMutation.mutate();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/templates')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <h1 className="text-xl font-medium text-gray-900">
            {params.id ? "Edit Template" : "Create New Template"}
          </h1>
        </div>
        
        <Button 
          onClick={handleSave}
          className="bg-[#1a3a5f] hover:bg-[#1a3a5f]/90"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </>
          )}
        </Button>
      </div>
      
      {/* Tabs */}
      <Tabs
        defaultValue="editor"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="bg-gray-50 px-4 border-b">
          <TabsList className="h-10">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="editor" className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-3xl">
            {/* Template Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="templateSubject">Email Subject</Label>
                  <Input
                    id="templateSubject"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="Enter email subject line"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Content Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium">Content Sections</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addSection("heading")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Heading
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addSection("text")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Text
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addSection("image")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Image
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addSection("button")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Button
                  </Button>
                </div>
              </div>
              
              {sections.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">No content sections yet</p>
                  <Button onClick={() => addSection("text")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Section
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <Card key={section.id}>
                      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">
                          {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (index > 0) {
                                const newSections = [...sections];
                                [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
                                setSections(newSections);
                              }
                            }}
                            disabled={index === 0}
                            className="h-7 w-7 p-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (index < sections.length - 1) {
                                const newSections = [...sections];
                                [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
                                setSections(newSections);
                              }
                            }}
                            disabled={index === sections.length - 1}
                            className="h-7 w-7 p-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(section.id)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {section.type === "heading" && (
                          <Input
                            value={section.content}
                            onChange={(e) => updateSectionContent(section.id, e.target.value)}
                            placeholder="Enter heading text"
                            className="font-medium text-lg"
                          />
                        )}
                        
                        {section.type === "text" && (
                          <Textarea
                            value={section.content}
                            onChange={(e) => updateSectionContent(section.id, e.target.value)}
                            placeholder="Enter paragraph text"
                            rows={4}
                          />
                        )}
                        
                        {section.type === "image" && (
                          <div className="space-y-4">
                            <Input
                              value={section.content}
                              onChange={(e) => updateSectionContent(section.id, e.target.value)}
                              placeholder="Enter image URL"
                            />
                            <div className="bg-gray-50 border rounded-md p-2">
                              <img
                                src={section.content}
                                alt="Preview"
                                className="max-h-[200px] mx-auto"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://placehold.co/600x200?text=Image+Not+Found';
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {section.type === "button" && (
                          <div className="space-y-4">
                            <Input
                              value={section.content}
                              onChange={(e) => updateSectionContent(section.id, e.target.value)}
                              placeholder="Enter button text"
                            />
                            <div className="flex justify-center">
                              <div className="bg-[#d4af37] text-white px-4 py-2 rounded">
                                {section.content}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 overflow-auto p-6 bg-gray-100">
          <div className="max-w-3xl mx-auto bg-white shadow-md">
            <iframe
              srcDoc={generateHtml()}
              title="Email Preview"
              className="w-full h-[calc(100vh-180px)] border-0"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}