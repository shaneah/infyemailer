import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Users, Loader2, Copy } from 'lucide-react';
import { CollaborativeEmailEditor } from '@/components/collaboration/CollaborativeEmailEditor';
import { v4 as uuidv4 } from 'uuid';

// This is the template type we'll be editing
interface Template {
  id: string;
  name: string;
  subject: string;
  description: string;
  content: any; // Template content
}

const initialTemplate = {
  id: '',
  name: 'New Collaborative Template',
  subject: 'Collaborative Email Subject',
  description: 'A template being edited collaboratively',
  content: {
    sections: [
      {
        id: 'header',
        type: 'header',
        content: 'Welcome to our collaborative email'
      },
      {
        id: 'content-1',
        type: 'text',
        content: 'This email is being edited in real-time by multiple users.'
      },
      {
        id: 'cta',
        type: 'button',
        content: 'Click me'
      }
    ]
  }
};

export default function CollaborativeTemplateEditor() {
  const { toast } = useToast();
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  
  // User information for collaboration
  const [userId] = useState(sessionStorage.getItem('userId') || uuidv4());
  const [username, setUsername] = useState(sessionStorage.getItem('username') || `User_${userId.substring(0, 6)}`);
  const [avatar, setAvatar] = useState(sessionStorage.getItem('avatar') || '');
  
  // Template data
  const [template, setTemplate] = useState<Template>(initialTemplate);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [shareUrl, setShareUrl] = useState('');
  
  // Store user ID and username in session storage
  useEffect(() => {
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('username', username);
    if (avatar) sessionStorage.setItem('avatar', avatar);
  }, [userId, username, avatar]);

  // Load template data based on ID
  useEffect(() => {
    const loadTemplate = async () => {
      if (params.id) {
        try {
          // In a real app, we would fetch from the server
          // For now, we'll use the initialTemplate with the ID from the URL
          setTemplate({ ...initialTemplate, id: params.id });
          setIsLoading(false);
          
          const baseUrl = window.location.origin;
          setShareUrl(`${baseUrl}/collaborative-template-editor/${params.id}`);
          
          toast({
            title: 'Template loaded',
            description: 'You can now edit this template collaboratively',
          });
        } catch (error) {
          console.error('Error loading template:', error);
          toast({
            title: 'Error',
            description: 'Failed to load template',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      } else {
        // Create a new template with a unique ID
        const newId = uuidv4();
        setTemplate({ ...initialTemplate, id: newId });
        setIsLoading(false);
        
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/collaborative-template-editor/${newId}`);
        
        // Update URL to include the new ID
        navigate(`/collaborative-template-editor/${newId}`, { replace: true });
      }
    };

    loadTemplate();
  }, [params.id, navigate, toast]);

  // Handle template save
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // In a real app, save to server here
      // For demo purposes, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Template saved',
        description: 'Your changes have been saved successfully',
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle template changes from the collaborative editor
  const handleTemplateChange = (updatedContent: any) => {
    setTemplate(prev => ({
      ...prev,
      content: updatedContent
    }));
  };

  // Copy share URL to clipboard
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'URL copied',
      description: 'Share link copied to clipboard',
    });
  };

  // Update template metadata
  const updateTemplate = (field: keyof Template, value: string) => {
    setTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/templates')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Collaborative Template Editor</h1>
            <p className="text-muted-foreground">
              Edit and design your template with real-time collaboration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-muted rounded-md px-3 py-1">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">Collaborative Mode</span>
          </div>
          <Button variant="outline" onClick={copyShareUrl}>
            <Copy className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template settings sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
              <CardDescription>Configure your template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={template.name}
                  onChange={(e) => updateTemplate('name', e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-subject">Email Subject</Label>
                <Input
                  id="template-subject"
                  value={template.subject}
                  onChange={(e) => updateTemplate('subject', e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  value={template.description}
                  onChange={(e) => updateTemplate('description', e.target.value)}
                  placeholder="Enter template description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-name">Your Display Name</Label>
                <Input
                  id="user-name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                />
                <p className="text-xs text-muted-foreground">
                  This name will be shown to other collaborators
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="border-b">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <TabsContent value="editor" className="m-0">
                <div className="p-4">
                  <CollaborativeEmailEditor
                    roomId={`template_${template.id}`}
                    userId={userId}
                    username={username}
                    avatar={avatar}
                    initialTemplate={template.content}
                    onSave={handleTemplateChange}
                    readOnly={false}
                  />
                </div>
              </TabsContent>
              <TabsContent value="preview" className="m-0">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Template Preview</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Desktop
                      </Button>
                      <Button variant="outline" size="sm">
                        Mobile
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-md p-6 bg-white min-h-[600px]">
                    {/* In a real implementation, render the actual template preview here */}
                    <div className="text-center py-10">
                      <h2 className="text-2xl font-bold mb-4">{template.name}</h2>
                      <p className="text-lg mb-4">Subject: {template.subject}</p>
                      <div className="bg-slate-100 p-6 rounded-lg mx-auto max-w-2xl text-left">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(template.content, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
            <CardFooter className="border-t p-4 flex justify-between">
              <div className="text-sm text-muted-foreground">
                ID: {template.id}
              </div>
              <div className="text-sm text-muted-foreground">
                Last edited: {new Date().toLocaleString()}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}