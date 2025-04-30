import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code, 
  Send, 
  Tablet, 
  Smartphone, 
  Laptop, 
  Users, 
  Plus, 
  SaveIcon,
  Heading,
  Type,
  Columns,
  SeparatorHorizontal,
  Space,
  Share
} from "lucide-react";

const emailSchema = z.object({
  to: z.string().min(1, "Recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Email content is required"),
});

interface ComposeEmailModalProps {
  onClose: () => void;
}

const ComposeEmailModal = ({ onClose }: ComposeEmailModalProps) => {
  const { toast } = useToast();
  const [activeDevice, setActiveDevice] = useState("phone");
  const [activeTab, setActiveTab] = useState("compose");
  
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      to: "",
      subject: "",
      content: "",
    },
  });
  
  const sendEmailMutation = useMutation({
    mutationFn: (values: z.infer<typeof emailSchema>) => {
      return apiRequest("POST", "/api/emails", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      toast({
        title: "Success",
        description: "Your email has been sent successfully!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send email: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof emailSchema>) => {
    sendEmailMutation.mutate(values);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90%] w-[1000px]">
        <DialogHeader>
          <DialogTitle>Compose New Email</DialogTitle>
          <DialogDescription>
            Create and send an email to your subscribers
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="compose" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="compose" onClick={() => setActiveTab("compose")}>Compose</TabsTrigger>
                <TabsTrigger value="design" onClick={() => setActiveTab("design")}>Design</TabsTrigger>
                <TabsTrigger value="preview" onClick={() => setActiveTab("preview")}>Preview</TabsTrigger>
              </TabsList>
              
              {/* Compose Tab */}
              <TabsContent value="compose" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-8 space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Email Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="to"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>To</FormLabel>
                              <div className="flex space-x-2">
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="Select recipients" 
                                  />
                                </FormControl>
                                <Button variant="outline" size="icon" type="button">
                                  <Users className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="Email subject" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <div className="flex items-center space-x-1 mb-2">
                                <Button variant="outline" size="sm" type="button">
                                  <Bold className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" type="button">
                                  <Italic className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" type="button">
                                  <Underline className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" type="button">
                                  <List className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" type="button">
                                  <ListOrdered className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" type="button">
                                  <Link className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" type="button">
                                  <Image className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" type="button">
                                  <Code className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormControl>
                                <Textarea 
                                  {...field}
                                  className="min-h-[200px]" 
                                  placeholder="Write your email content here..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="md:col-span-4 space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Preview</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[200px] flex items-center justify-center bg-slate-50 rounded-md border">
                        <div className="text-center p-4">
                          <p className="text-sm text-gray-500">
                            {form.watch("content") ? form.watch("content") : "Preview will appear here"}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-center pt-2 pb-3">
                        <div className="flex gap-2">
                          <Button 
                            variant={activeDevice === 'tablet' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => setActiveDevice('tablet')}
                          >
                            <Tablet className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={activeDevice === 'phone' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => setActiveDevice('phone')}
                          >
                            <Smartphone className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={activeDevice === 'laptop' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => setActiveDevice('laptop')}
                          >
                            <Laptop className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Content Blocks</CardTitle>
                        <CardDescription>Drag and drop elements</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Heading className="h-4 w-4 mr-2" />
                          <span>Header</span>
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Type className="h-4 w-4 mr-2" />
                          <span>Text</span>
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Image className="h-4 w-4 mr-2" />
                          <span>Image</span>
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Columns className="h-4 w-4 mr-2" />
                          <span>Button</span>
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <SeparatorHorizontal className="h-4 w-4 mr-2" />
                          <span>Divider</span>
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Space className="h-4 w-4 mr-2" />
                          <span>Spacer</span>
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Share className="h-4 w-4 mr-2" />
                          <span>Social</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* Design Tab */}
              <TabsContent value="design" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Design</CardTitle>
                    <CardDescription>Customize the design and appearance of your email</CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">Design tools will appear here in the next version</p>
                      <Button variant="outline" onClick={() => setActiveTab("compose")}>
                        Back to Compose
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Preview</CardTitle>
                    <CardDescription>Preview how your email will appear to recipients</CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px] flex items-center justify-center border-t">
                    <div className="text-center max-w-md mx-auto p-6">
                      <div className="mb-4 p-4 border rounded-lg">
                        <p className="font-semibold">{form.watch("subject") || "No Subject"}</p>
                        <hr className="my-2" />
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {form.watch("content") || "No content added yet. Return to the Compose tab to add content."}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sending to: {form.watch("to") || "No recipients specified"}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center pt-2 pb-3 border-t">
                    <div className="flex gap-2">
                      <Button 
                        variant={activeDevice === 'tablet' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setActiveDevice('tablet')}
                      >
                        <Tablet className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={activeDevice === 'phone' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setActiveDevice('phone')}
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={activeDevice === 'laptop' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setActiveDevice('laptop')}
                      >
                        <Laptop className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
        
        <DialogFooter className="flex justify-between">
          <div>
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={sendEmailMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeEmailModal;
