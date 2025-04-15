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
  const [templateDescription, setTemplateDescription] = useState("A beautiful email template for your marketing campaigns");
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
      case "spacer":
        return "30"; // Height in pixels
      case "video": 
        return "https://www.youtube.com/embed/dQw4w9WgXcQ";
      case "social":
        return JSON.stringify({
          facebook: "https://facebook.com/your-page",
          twitter: "https://twitter.com/your-handle",
          instagram: "https://instagram.com/your-account",
          linkedin: "https://linkedin.com/in/your-profile"
        });
      case "banner":
        return JSON.stringify({
          imageUrl: "https://placehold.co/1200x300?text=Banner+Image",
          title: "Special Announcement",
          text: "Check out our latest offers and updates!"
        });
      case "timer":
        // Default to 7 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        return defaultDate.toISOString();
      case "menu":
        return JSON.stringify([
          { text: "Home", url: "#home" },
          { text: "Products", url: "#products" },
          { text: "About Us", url: "#about" },
          { text: "Contact", url: "#contact" }
        ]);
      case "html":
        return "<div style='padding: 20px; background-color: #f5f5f5;'>Custom HTML content goes here</div>";
      case "carousel":
        return JSON.stringify([
          { imageUrl: "https://placehold.co/800x400?text=Slide+1", caption: "Slide 1" },
          { imageUrl: "https://placehold.co/800x400?text=Slide+2", caption: "Slide 2" },
          { imageUrl: "https://placehold.co/800x400?text=Slide+3", caption: "Slide 3" }
        ]);
      case "accordion":
        return JSON.stringify([
          { title: "Section 1", content: "Content for section 1 goes here." },
          { title: "Section 2", content: "Content for section 2 goes here." },
          { title: "Section 3", content: "Content for section 3 goes here." }
        ]);
      case "form":
        return JSON.stringify({
          title: "Contact Form",
          fields: [
            { type: "text", label: "Name", required: true },
            { type: "email", label: "Email", required: true },
            { type: "textarea", label: "Message", required: false }
          ],
          submitButton: "Submit"
        });
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
          let buttonText = section.content;
          let buttonUrl = "#";
          
          try {
            const buttonData = JSON.parse(section.content);
            if (buttonData.text) buttonText = buttonData.text;
            if (buttonData.url) buttonUrl = buttonData.url;
          } catch (e) {
            // If not valid JSON, use content as button text with default URL
          }
          
          html += `
            <div class="button-container">
              <a href="${buttonUrl}" class="button">${buttonText}</a>
            </div>
          `;
          break;
        case "spacer":
          const spacerHeight = parseInt(section.content) || 30;
          html += `<div style="height: ${spacerHeight}px; line-height: 0; font-size: 0;">&nbsp;</div>`;
          break;
        case "video":
          html += `
            <div style="max-width: 100%; margin: 20px auto;">
              <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                <iframe 
                  src="${section.content}" 
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen>
                </iframe>
              </div>
            </div>
          `;
          break;
        case "social":
          try {
            const socialData = JSON.parse(section.content);
            html += `
              <div style="text-align: center; margin: 20px 0;">
                ${socialData.facebook ? `<a href="${socialData.facebook}" style="display: inline-block; margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="Facebook" width="32" height="32" /></a>` : ''}
                ${socialData.twitter ? `<a href="${socialData.twitter}" style="display: inline-block; margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/128/5968/5968958.png" alt="Twitter" width="32" height="32" /></a>` : ''}
                ${socialData.instagram ? `<a href="${socialData.instagram}" style="display: inline-block; margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/128/1409/1409946.png" alt="Instagram" width="32" height="32" /></a>` : ''}
                ${socialData.linkedin ? `<a href="${socialData.linkedin}" style="display: inline-block; margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" alt="LinkedIn" width="32" height="32" /></a>` : ''}
              </div>
            `;
          } catch (e) {
            // Fallback for malformed social data
            html += `<div style="text-align: center; margin: 20px 0;">Social Links</div>`;
          }
          break;
        case "banner":
          try {
            const bannerData = JSON.parse(section.content);
            html += `
              <div style="position: relative; margin: 20px 0;">
                <img src="${bannerData.imageUrl}" alt="Banner" style="width: 100%; display: block;" />
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0,0,0,0.5); color: white; padding: 20px; text-align: center; border-radius: 4px;">
                  <h3 style="margin: 0 0 10px 0; color: white;">${bannerData.title}</h3>
                  <p style="margin: 0; color: white;">${bannerData.text}</p>
                </div>
              </div>
            `;
          } catch (e) {
            // Fallback for malformed banner data
            html += `<div style="text-align: center; margin: 20px 0;">Banner</div>`;
          }
          break;
        case "html":
          // Include raw HTML content as-is without escaping
          if (section.content) {
            html += section.content;
          } else {
            html += '<!-- Empty HTML section -->';
          }
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
          description: templateDescription,
          content: htmlContent,
          category: "custom",
          metadata: {
            sections: sections
          }
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
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="bg-gray-50 px-4 border-b">
          <TabsList className="h-10">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="editor" className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-3xl overflow-visible">
            {/* Template Details */}
            <Card className="mb-6 border-blue-100 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
                <CardTitle className="text-lg font-semibold text-blue-800">Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="templateName" className="text-sm font-medium text-gray-700">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                    className="mt-1 focus-visible:ring-blue-300 border-blue-200"
                  />
                </div>
                <div>
                  <Label htmlFor="templateSubject" className="text-sm font-medium text-gray-700">Email Subject</Label>
                  <Input
                    id="templateSubject"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="Enter email subject line"
                    className="mt-1 focus-visible:ring-blue-300 border-blue-200"
                  />
                </div>
                <div>
                  <Label htmlFor="templateDescription" className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    id="templateDescription"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Enter template description"
                    className="mt-1 focus-visible:ring-blue-300 border-blue-200"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Content Sections */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-blue-800">Content Sections</CardTitle>
                  <div className="flex-shrink-0">
                    <div className="grid grid-cols-4 md:grid-cols-4 gap-2 mb-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("heading")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Heading
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("text")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Text
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("image")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Image
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("button")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Button
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-4 gap-2 mb-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("spacer")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Spacer
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("video")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Video
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("social")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Social
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("banner")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Banner
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-4 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("timer")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Timer
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("menu")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Menu
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("html")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        HTML
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSection("accordion")}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Accordion
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {sections.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500 mb-4">No content sections yet</p>
                      <Button 
                        onClick={() => addSection("text")}
                        className="bg-[#1a3a5f] hover:bg-[#1a3a5f]/90 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Section
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sections.map((section, index) => (
                        <Card key={section.id} className="border-gray-200 shadow-sm overflow-hidden">
                          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                            <CardTitle className="text-sm font-medium text-blue-800">
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
                                className="h-7 w-7 p-0 text-blue-600"
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
                                className="h-7 w-7 p-0 text-blue-600"
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
                          <CardContent className="p-4">
                            {section.type === "heading" && (
                              <Input
                                value={section.content}
                                onChange={(e) => updateSectionContent(section.id, e.target.value)}
                                placeholder="Enter heading text"
                                className="font-medium text-lg focus-visible:ring-blue-300 border-blue-200"
                              />
                            )}
                            
                            {section.type === "text" && (
                              <Textarea
                                value={section.content}
                                onChange={(e) => updateSectionContent(section.id, e.target.value)}
                                placeholder="Enter paragraph text"
                                rows={4}
                                className="focus-visible:ring-blue-300 border-blue-200"
                              />
                            )}
                            
                            {section.type === "image" && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div>
                                    <Label htmlFor={`image-url-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      Image URL
                                    </Label>
                                    <Input
                                      id={`image-url-${section.id}`}
                                      value={section.content}
                                      onChange={(e) => updateSectionContent(section.id, e.target.value)}
                                      placeholder="Enter image URL"
                                      className="focus-visible:ring-blue-300 border-blue-200"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`image-upload-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      Upload Image
                                    </Label>
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById(`file-upload-${section.id}`)?.click()}
                                        className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                      >
                                        Choose File
                                      </Button>
                                      <input 
                                        type="file" 
                                        id={`file-upload-${section.id}`}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                              if (event.target?.result) {
                                                updateSectionContent(section.id, event.target.result as string);
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 border rounded-md p-2">
                                  <img
                                    src={section.content}
                                    alt="Preview"
                                    className="max-h-[200px] mx-auto"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://placehold.co/600x200?text=Image+Not+Found';
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {section.type === "button" && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div>
                                    <Label htmlFor={`button-text-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      Button Text
                                    </Label>
                                    <Input
                                      id={`button-text-${section.id}`}
                                      value={section.content}
                                      onChange={(e) => updateSectionContent(section.id, e.target.value)}
                                      placeholder="Enter button text"
                                      className="focus-visible:ring-blue-300 border-blue-200"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`button-url-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      Button URL
                                    </Label>
                                    <Input
                                      id={`button-url-${section.id}`}
                                      type="url"
                                      placeholder="https://example.com"
                                      className="focus-visible:ring-blue-300 border-blue-200"
                                      onChange={(e) => {
                                        const buttonData = {
                                          text: section.content,
                                          url: e.target.value
                                        };
                                        updateSectionContent(section.id, JSON.stringify(buttonData));
                                      }}
                                      value={(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.url || '';
                                        } catch {
                                          return '';
                                        }
                                      })()}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-center">
                                  <div className="bg-[#d4af37] text-white px-6 py-3 rounded font-medium hover:bg-[#c4a027] transition-colors cursor-pointer">
                                    {(() => {
                                      try {
                                        const data = JSON.parse(section.content);
                                        return data.text;
                                      } catch {
                                        return section.content;
                                      }
                                    })()}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {section.type === "spacer" && (
                              <div className="space-y-4">
                                <Label htmlFor={`spacer-height-${section.id}`} className="text-sm font-medium text-gray-700">
                                  Spacer Height (px)
                                </Label>
                                <Input
                                  id={`spacer-height-${section.id}`}
                                  type="number"
                                  min="5"
                                  max="200"
                                  value={section.content}
                                  onChange={(e) => updateSectionContent(section.id, e.target.value)}
                                  className="focus-visible:ring-blue-300 border-blue-200 w-full md:w-1/3"
                                />
                                <div className="bg-gray-50 border rounded-md p-2">
                                  <div 
                                    className="w-full mx-auto bg-gray-200 border-dashed border-2 border-gray-300 rounded"
                                    style={{ height: `${parseInt(section.content) || 30}px` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            {section.type === "video" && (
                              <div className="space-y-4">
                                <Label htmlFor={`video-url-${section.id}`} className="text-sm font-medium text-gray-700">
                                  Video URL (YouTube or Vimeo)
                                </Label>
                                <Input
                                  id={`video-url-${section.id}`}
                                  type="url"
                                  value={section.content}
                                  onChange={(e) => updateSectionContent(section.id, e.target.value)}
                                  placeholder="https://www.youtube.com/embed/..."
                                  className="focus-visible:ring-blue-300 border-blue-200"
                                />
                                <div className="bg-gray-50 border rounded-md p-2">
                                  <div className="aspect-video">
                                    <iframe
                                      src={section.content}
                                      title="Video embed"
                                      className="w-full h-full"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    ></iframe>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {section.type === "banner" && (
                              <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Banner Section
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                      <Label htmlFor={`banner-image-url-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                        Banner Image URL
                                      </Label>
                                      <Input
                                        id={`banner-image-url-${section.id}`}
                                        type="url"
                                        placeholder="https://example.com/your-banner-image.jpg"
                                        className="focus-visible:ring-blue-300 border-blue-200"
                                        onChange={(e) => {
                                          try {
                                            const data = JSON.parse(section.content);
                                            updateSectionContent(section.id, JSON.stringify({
                                              ...data,
                                              imageUrl: e.target.value
                                            }));
                                          } catch {
                                            updateSectionContent(section.id, JSON.stringify({
                                              imageUrl: e.target.value,
                                              title: "Banner Title",
                                              text: "Banner description text goes here."
                                            }));
                                          }
                                        }}
                                        value={(() => {
                                          try {
                                            const data = JSON.parse(section.content);
                                            return data.imageUrl || '';
                                          } catch {
                                            return '';
                                          }
                                        })()}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`banner-image-upload-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                        Upload Banner Image
                                      </Label>
                                      <div className="flex items-center gap-2">
                                        <Button 
                                          type="button"
                                          variant="outline"
                                          onClick={() => document.getElementById(`banner-file-upload-${section.id}`)?.click()}
                                          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                        >
                                          Choose File
                                        </Button>
                                        <input 
                                          type="file" 
                                          id={`banner-file-upload-${section.id}`}
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onload = (event) => {
                                                if (event.target?.result) {
                                                  try {
                                                    const data = JSON.parse(section.content);
                                                    updateSectionContent(section.id, JSON.stringify({
                                                      ...data,
                                                      imageUrl: event.target.result as string
                                                    }));
                                                  } catch {
                                                    updateSectionContent(section.id, JSON.stringify({
                                                      imageUrl: event.target.result as string,
                                                      title: "Banner Title",
                                                      text: "Banner description text goes here."
                                                    }));
                                                  }
                                                }
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor={`banner-title-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      Banner Title
                                    </Label>
                                    <Input
                                      id={`banner-title-${section.id}`}
                                      placeholder="Enter banner title"
                                      className="focus-visible:ring-blue-300 border-blue-200"
                                      onChange={(e) => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          updateSectionContent(section.id, JSON.stringify({
                                            ...data,
                                            title: e.target.value
                                          }));
                                        } catch {
                                          updateSectionContent(section.id, JSON.stringify({
                                            imageUrl: "",
                                            title: e.target.value,
                                            text: "Banner description text goes here."
                                          }));
                                        }
                                      }}
                                      value={(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.title || '';
                                        } catch {
                                          return '';
                                        }
                                      })()}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`banner-text-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      Banner Text
                                    </Label>
                                    <Textarea
                                      id={`banner-text-${section.id}`}
                                      placeholder="Enter banner description text"
                                      className="focus-visible:ring-blue-300 border-blue-200"
                                      rows={3}
                                      onChange={(e) => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          updateSectionContent(section.id, JSON.stringify({
                                            ...data,
                                            text: e.target.value
                                          }));
                                        } catch {
                                          updateSectionContent(section.id, JSON.stringify({
                                            imageUrl: "",
                                            title: "Banner Title",
                                            text: e.target.value
                                          }));
                                        }
                                      }}
                                      value={(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.text || '';
                                        } catch {
                                          return '';
                                        }
                                      })()}
                                    />
                                  </div>
                                </div>
                                <div className="bg-gray-50 border rounded-md p-2 relative overflow-hidden">
                                  <img
                                    src={(() => {
                                      try {
                                        const data = JSON.parse(section.content);
                                        return data.imageUrl || 'https://placehold.co/1200x300?text=Banner+Image';
                                      } catch {
                                        return 'https://placehold.co/1200x300?text=Banner+Image';
                                      }
                                    })()}
                                    alt="Banner preview"
                                    className="w-full h-auto"
                                  />
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 rounded text-center">
                                    <h3 className="text-lg font-semibold mb-1">
                                      {(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.title || 'Banner Title';
                                        } catch {
                                          return 'Banner Title';
                                        }
                                      })()}
                                    </h3>
                                    <p className="text-sm">
                                      {(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.text || 'Banner description text goes here.';
                                        } catch {
                                          return 'Banner description text goes here.';
                                        }
                                      })()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {section.type === "timer" && (
                              <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Countdown Timer
                                </p>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div>
                                    <Label htmlFor={`timer-date-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      End Date
                                    </Label>
                                    <Input
                                      id={`timer-date-${section.id}`}
                                      type="date"
                                      className="focus-visible:ring-blue-300 border-blue-200"
                                      onChange={(e) => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          updateSectionContent(section.id, JSON.stringify({
                                            ...data,
                                            date: e.target.value
                                          }));
                                        } catch {
                                          updateSectionContent(section.id, JSON.stringify({
                                            date: e.target.value,
                                            title: "Limited Time Offer",
                                            color: "#1a3a5f"
                                          }));
                                        }
                                      }}
                                      value={(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.date || '';
                                        } catch {
                                          return '';
                                        }
                                      })()}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`timer-title-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      Timer Title
                                    </Label>
                                    <Input
                                      id={`timer-title-${section.id}`}
                                      placeholder="Limited Time Offer"
                                      className="focus-visible:ring-blue-300 border-blue-200"
                                      onChange={(e) => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          updateSectionContent(section.id, JSON.stringify({
                                            ...data,
                                            title: e.target.value
                                          }));
                                        } catch {
                                          updateSectionContent(section.id, JSON.stringify({
                                            date: "",
                                            title: e.target.value,
                                            color: "#1a3a5f"
                                          }));
                                        }
                                      }}
                                      value={(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.title || '';
                                        } catch {
                                          return '';
                                        }
                                      })()}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`timer-color-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      Timer Color
                                    </Label>
                                    <Input
                                      id={`timer-color-${section.id}`}
                                      type="color"
                                      className="h-10 p-1 focus-visible:ring-blue-300 border-blue-200"
                                      onChange={(e) => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          updateSectionContent(section.id, JSON.stringify({
                                            ...data,
                                            color: e.target.value
                                          }));
                                        } catch {
                                          updateSectionContent(section.id, JSON.stringify({
                                            date: "",
                                            title: "Limited Time Offer",
                                            color: e.target.value
                                          }));
                                        }
                                      }}
                                      value={(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.color || '#1a3a5f';
                                        } catch {
                                          return '#1a3a5f';
                                        }
                                      })()}
                                    />
                                  </div>
                                </div>
                                <div className="bg-gray-50 border rounded-md p-6 flex flex-col items-center">
                                  <p className="text-center font-medium mb-4">
                                    {(() => {
                                      try {
                                        const data = JSON.parse(section.content);
                                        return data.title || 'Limited Time Offer';
                                      } catch {
                                        return 'Limited Time Offer';
                                      }
                                    })()}
                                  </p>
                                  <div className="grid grid-cols-4 gap-2">
                                    {[
                                      { label: 'Days', value: '00' },
                                      { label: 'Hours', value: '00' },
                                      { label: 'Minutes', value: '00' },
                                      { label: 'Seconds', value: '00' }
                                    ].map((item, i) => (
                                      <div key={i} className="flex flex-col items-center">
                                        <div 
                                          className="w-14 h-14 flex items-center justify-center rounded-md font-mono text-white text-xl font-bold mb-1"
                                          style={{ 
                                            backgroundColor: (() => {
                                              try {
                                                const data = JSON.parse(section.content);
                                                return data.color || '#1a3a5f';
                                              } catch {
                                                return '#1a3a5f';
                                              }
                                            })() 
                                          }}
                                        >
                                          {item.value}
                                        </div>
                                        <span className="text-xs text-gray-500">{item.label}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                                  <p className="font-medium">Note:</p>
                                  <p>This is a static preview. In the actual email, the countdown will be dynamic if supported by the recipient's email client.</p>
                                </div>
                              </div>
                            )}
                            
                            {section.type === "accordion" && (
                              <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Accordion Content
                                </p>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Accordion Items
                                  </Label>
                                  <div className="space-y-3 mb-3">
                                    {(() => {
                                      let accordionItems;
                                      try {
                                        accordionItems = JSON.parse(section.content);
                                        if (!Array.isArray(accordionItems)) {
                                          accordionItems = [
                                            { title: "Frequently Asked Question 1", content: "This is the answer to question 1." },
                                            { title: "Frequently Asked Question 2", content: "This is the answer to question 2." },
                                            { title: "Frequently Asked Question 3", content: "This is the answer to question 3." }
                                          ];
                                        }
                                      } catch {
                                        accordionItems = [
                                          { title: "Frequently Asked Question 1", content: "This is the answer to question 1." },
                                          { title: "Frequently Asked Question 2", content: "This is the answer to question 2." },
                                          { title: "Frequently Asked Question 3", content: "This is the answer to question 3." }
                                        ];
                                      }
                                      
                                      return accordionItems.map((item, index) => (
                                        <div key={index} className="border border-blue-200 rounded-md overflow-hidden">
                                          <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-blue-200">
                                            <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                              Item {index + 1} Title
                                            </Label>
                                            <Input
                                              placeholder="Question title"
                                              value={item.title}
                                              onChange={(e) => {
                                                const updatedItems = [...accordionItems];
                                                updatedItems[index].title = e.target.value;
                                                updateSectionContent(section.id, JSON.stringify(updatedItems));
                                              }}
                                              className="focus-visible:ring-blue-300 border-blue-200"
                                            />
                                          </div>
                                          <div className="p-3">
                                            <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                              Item {index + 1} Content
                                            </Label>
                                            <Textarea
                                              placeholder="Answer content"
                                              value={item.content}
                                              rows={3}
                                              onChange={(e) => {
                                                const updatedItems = [...accordionItems];
                                                updatedItems[index].content = e.target.value;
                                                updateSectionContent(section.id, JSON.stringify(updatedItems));
                                              }}
                                              className="focus-visible:ring-blue-300 border-blue-200"
                                            />
                                          </div>
                                          <div className="px-3 pb-3 flex justify-end">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                const updatedItems = accordionItems.filter((_, i) => i !== index);
                                                updateSectionContent(section.id, JSON.stringify(updatedItems));
                                              }}
                                              className="border-red-200 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                              <Trash className="h-4 w-4 mr-1" />
                                              Remove Item
                                            </Button>
                                          </div>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      let accordionItems;
                                      try {
                                        accordionItems = JSON.parse(section.content);
                                        if (!Array.isArray(accordionItems)) {
                                          accordionItems = [
                                            { title: "Frequently Asked Question 1", content: "This is the answer to question 1." },
                                            { title: "Frequently Asked Question 2", content: "This is the answer to question 2." },
                                            { title: "Frequently Asked Question 3", content: "This is the answer to question 3." }
                                          ];
                                        }
                                      } catch {
                                        accordionItems = [
                                          { title: "Frequently Asked Question 1", content: "This is the answer to question 1." },
                                          { title: "Frequently Asked Question 2", content: "This is the answer to question 2." },
                                          { title: "Frequently Asked Question 3", content: "This is the answer to question 3." }
                                        ];
                                      }
                                      
                                      accordionItems.push({ title: "New Question", content: "Answer goes here." });
                                      updateSectionContent(section.id, JSON.stringify(accordionItems));
                                    }}
                                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Accordion Item
                                  </Button>
                                </div>
                                <div className="bg-gray-50 border rounded-md p-4">
                                  <div className="divide-y">
                                    {(() => {
                                      let accordionItems;
                                      try {
                                        accordionItems = JSON.parse(section.content);
                                        if (!Array.isArray(accordionItems)) {
                                          accordionItems = [
                                            { title: "Frequently Asked Question 1", content: "This is the answer to question 1." },
                                            { title: "Frequently Asked Question 2", content: "This is the answer to question 2." },
                                            { title: "Frequently Asked Question 3", content: "This is the answer to question 3." }
                                          ];
                                        }
                                      } catch {
                                        accordionItems = [
                                          { title: "Frequently Asked Question 1", content: "This is the answer to question 1." },
                                          { title: "Frequently Asked Question 2", content: "This is the answer to question 2." },
                                          { title: "Frequently Asked Question 3", content: "This is the answer to question 3." }
                                        ];
                                      }
                                      
                                      return accordionItems.map((item, index) => (
                                        <div key={index} className="py-3">
                                          <div className="font-medium text-[#1a3a5f] flex items-center justify-between cursor-pointer">
                                            {item.title}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                          </div>
                                          <div className="mt-2 text-gray-600 text-sm">
                                            {index === 0 ? item.content : ""}
                                          </div>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800 text-sm">
                                  <p className="font-medium">Note:</p>
                                  <p>In the actual email, accordion functionality may not be supported by all email clients. Fallback is to show only the first item expanded.</p>
                                </div>
                              </div>
                            )}
                            
                            {section.type === "menu" && (
                              <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Navigation Menu
                                </p>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Menu Items
                                  </Label>
                                  <div className="space-y-3 mb-3">
                                    {(() => {
                                      let menuItems;
                                      try {
                                        menuItems = JSON.parse(section.content);
                                        if (!Array.isArray(menuItems)) {
                                          menuItems = [
                                            { label: "Home", url: "#" },
                                            { label: "Products", url: "#" },
                                            { label: "Services", url: "#" },
                                            { label: "Contact", url: "#" }
                                          ];
                                        }
                                      } catch {
                                        menuItems = [
                                          { label: "Home", url: "#" },
                                          { label: "Products", url: "#" },
                                          { label: "Services", url: "#" },
                                          { label: "Contact", url: "#" }
                                        ];
                                      }
                                      
                                      return menuItems.map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                          <div className="flex-1">
                                            <Input
                                              placeholder="Menu label"
                                              value={item.label}
                                              onChange={(e) => {
                                                const updatedItems = [...menuItems];
                                                updatedItems[index].label = e.target.value;
                                                updateSectionContent(section.id, JSON.stringify(updatedItems));
                                              }}
                                              className="focus-visible:ring-blue-300 border-blue-200"
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <Input
                                              placeholder="URL"
                                              value={item.url}
                                              onChange={(e) => {
                                                const updatedItems = [...menuItems];
                                                updatedItems[index].url = e.target.value;
                                                updateSectionContent(section.id, JSON.stringify(updatedItems));
                                              }}
                                              className="focus-visible:ring-blue-300 border-blue-200"
                                            />
                                          </div>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                              const updatedItems = menuItems.filter((_, i) => i !== index);
                                              updateSectionContent(section.id, JSON.stringify(updatedItems));
                                            }}
                                            className="flex-shrink-0 h-10 w-10 border-red-200 text-red-500 hover:text-red-600 hover:bg-red-50"
                                          >
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      let menuItems;
                                      try {
                                        menuItems = JSON.parse(section.content);
                                        if (!Array.isArray(menuItems)) {
                                          menuItems = [
                                            { label: "Home", url: "#" },
                                            { label: "Products", url: "#" },
                                            { label: "Services", url: "#" },
                                            { label: "Contact", url: "#" }
                                          ];
                                        }
                                      } catch {
                                        menuItems = [
                                          { label: "Home", url: "#" },
                                          { label: "Products", url: "#" },
                                          { label: "Services", url: "#" },
                                          { label: "Contact", url: "#" }
                                        ];
                                      }
                                      
                                      menuItems.push({ label: "New Item", url: "#" });
                                      updateSectionContent(section.id, JSON.stringify(menuItems));
                                    }}
                                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Menu Item
                                  </Button>
                                </div>
                                <div className="bg-gray-50 border rounded-md p-4">
                                  <div className="flex flex-wrap justify-center gap-4">
                                    {(() => {
                                      let menuItems;
                                      try {
                                        menuItems = JSON.parse(section.content);
                                        if (!Array.isArray(menuItems)) {
                                          menuItems = [
                                            { label: "Home", url: "#" },
                                            { label: "Products", url: "#" },
                                            { label: "Services", url: "#" },
                                            { label: "Contact", url: "#" }
                                          ];
                                        }
                                      } catch {
                                        menuItems = [
                                          { label: "Home", url: "#" },
                                          { label: "Products", url: "#" },
                                          { label: "Services", url: "#" },
                                          { label: "Contact", url: "#" }
                                        ];
                                      }
                                      
                                      return menuItems.map((item, index) => (
                                        <div key={index} className="text-center">
                                          <a href={item.url} className="px-4 py-2 text-[#1a3a5f] font-medium hover:text-blue-700">
                                            {item.label}
                                          </a>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {section.type === "html" && (
                              <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Custom HTML Content
                                </p>
                                <Textarea
                                  value={section.content}
                                  onChange={(e) => updateSectionContent(section.id, e.target.value)}
                                  placeholder="Enter custom HTML code here"
                                  rows={8}
                                  className="font-mono text-sm focus-visible:ring-blue-300 border-blue-200"
                                />
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700">Preview:</p>
                                  <div className="bg-gray-50 border rounded-md p-4 overflow-auto">
                                    <div 
                                      className="html-preview" 
                                      dangerouslySetInnerHTML={{ __html: section.content }}
                                    />
                                  </div>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                                  <p className="font-medium">Warning:</p>
                                  <p>Custom HTML could be flagged by email clients. Keep your HTML simple and well-formed.</p>
                                </div>
                              </div>
                            )}
                            
                            {section.type === "social" && (
                              <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Social Media Links
                                </p>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div>
                                    <Label htmlFor={`facebook-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      Facebook URL
                                    </Label>
                                    <Input
                                      id={`facebook-${section.id}`}
                                      type="url"
                                      placeholder="https://facebook.com/your-page"
                                      className="focus-visible:ring-blue-300 border-blue-200"
                                      onChange={(e) => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          updateSectionContent(section.id, JSON.stringify({
                                            ...data,
                                            facebook: e.target.value
                                          }));
                                        } catch {
                                          updateSectionContent(section.id, JSON.stringify({
                                            facebook: e.target.value,
                                            twitter: "",
                                            instagram: "",
                                            linkedin: ""
                                          }));
                                        }
                                      }}
                                      value={(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.facebook || '';
                                        } catch {
                                          return '';
                                        }
                                      })()}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`twitter-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      Twitter URL
                                    </Label>
                                    <Input
                                      id={`twitter-${section.id}`}
                                      type="url"
                                      placeholder="https://twitter.com/your-handle"
                                      className="focus-visible:ring-blue-300 border-blue-200"
                                      onChange={(e) => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          updateSectionContent(section.id, JSON.stringify({
                                            ...data,
                                            twitter: e.target.value
                                          }));
                                        } catch {
                                          updateSectionContent(section.id, JSON.stringify({
                                            facebook: "",
                                            twitter: e.target.value,
                                            instagram: "",
                                            linkedin: ""
                                          }));
                                        }
                                      }}
                                      value={(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.twitter || '';
                                        } catch {
                                          return '';
                                        }
                                      })()}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`instagram-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      Instagram URL
                                    </Label>
                                    <Input
                                      id={`instagram-${section.id}`}
                                      type="url"
                                      placeholder="https://instagram.com/your-account"
                                      className="focus-visible:ring-blue-300 border-blue-200"
                                      onChange={(e) => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          updateSectionContent(section.id, JSON.stringify({
                                            ...data,
                                            instagram: e.target.value
                                          }));
                                        } catch {
                                          updateSectionContent(section.id, JSON.stringify({
                                            facebook: "",
                                            twitter: "",
                                            instagram: e.target.value,
                                            linkedin: ""
                                          }));
                                        }
                                      }}
                                      value={(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.instagram || '';
                                        } catch {
                                          return '';
                                        }
                                      })()}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`linkedin-${section.id}`} className="text-sm font-medium text-gray-700 mb-1 block">
                                      LinkedIn URL
                                    </Label>
                                    <Input
                                      id={`linkedin-${section.id}`}
                                      type="url"
                                      placeholder="https://linkedin.com/in/your-profile"
                                      className="focus-visible:ring-blue-300 border-blue-200"
                                      onChange={(e) => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          updateSectionContent(section.id, JSON.stringify({
                                            ...data,
                                            linkedin: e.target.value
                                          }));
                                        } catch {
                                          updateSectionContent(section.id, JSON.stringify({
                                            facebook: "",
                                            twitter: "",
                                            instagram: "",
                                            linkedin: e.target.value
                                          }));
                                        }
                                      }}
                                      value={(() => {
                                        try {
                                          const data = JSON.parse(section.content);
                                          return data.linkedin || '';
                                        } catch {
                                          return '';
                                        }
                                      })()}
                                    />
                                  </div>
                                </div>
                                <div className="bg-gray-50 border rounded-md p-4 flex items-center justify-center gap-4">
                                  {(() => {
                                    try {
                                      const data = JSON.parse(section.content);
                                      return (
                                        <>
                                          {data.facebook && (
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                                              </svg>
                                            </div>
                                          )}
                                          {data.twitter && (
                                            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                              </svg>
                                            </div>
                                          )}
                                          {data.instagram && (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                              </svg>
                                            </div>
                                          )}
                                          {data.linkedin && (
                                            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                                              </svg>
                                            </div>
                                          )}
                                        </>
                                      );
                                    } catch {
                                      return (
                                        <div className="text-gray-400">
                                          Social media icons will appear here
                                        </div>
                                      );
                                    }
                                  })()}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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