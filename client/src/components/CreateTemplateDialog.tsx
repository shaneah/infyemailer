import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, X, Pencil, Wand2, Import, Info } from "lucide-react";
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CreateTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTemplate: (data: any) => void;
  onShowAIGenerator: () => void;
  onShowImportModal: () => void;
}

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().default(""),
  subject: z.string().default("Welcome to our Newsletter"),
  content: z.string().default("<div>Template content will be populated by the visual builder</div>"),
  category: z.string().default("newsletter"),
});

export default function CreateTemplateDialog({
  isOpen,
  onOpenChange,
  onCreateTemplate,
  onShowAIGenerator,
  onShowImportModal
}: CreateTemplateDialogProps) {
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      subject: "Welcome to our Newsletter",
      content: "<div>Template content will be populated by the visual builder</div>",
      category: "newsletter"
    }
  });

  const handleCreateAndOpenBuilder = () => {
    form.handleSubmit((data) => {
      onCreateTemplate(data);
      window.open('/drag-and-drop-template-builder?templateId=' + Date.now(), '_blank');
      onOpenChange(false);
    })();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-xl">
        <div className="bg-gradient-to-b from-[#1a3a5f] to-[#09152E] p-5 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d4af37] to-[#ebd889] flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-[#09152E]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Create New Template</h3>
                <p className="text-sm text-white/80">Choose your preferred creation method</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-5">
          <div className="mb-6">
            <h4 className="text-[#1a3a5f] font-medium mb-2">Template Name</h4>
            <Form {...form}>
              <form>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            placeholder="e.g. Monthly Newsletter" 
                            className="border-[#1a3a5f]/20 focus-visible:ring-[#1a3a5f]/30 py-6 pl-10 text-base"
                          />
                          <FileText className="h-5 w-5 text-[#1a3a5f]/60 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-[#1a3a5f] mb-3">Choose Your Creation Tool</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Visual Builder */}
              <div 
                className="group cursor-pointer bg-white rounded-xl border border-[#1a3a5f]/10 shadow-sm hover:shadow-md hover:border-[#d4af37]/30 transition-all p-4 flex flex-col"
                onClick={handleCreateAndOpenBuilder}
              >
                <div className="mb-3 bg-[#1a3a5f]/5 text-[#1a3a5f] rounded-lg p-6 flex items-center justify-center">
                  <Pencil className="h-10 w-10 group-hover:scale-110 transition-transform" />
                </div>
                <h5 className="font-semibold text-[#1a3a5f] text-lg mb-2">Visual Builder</h5>
                <p className="text-[#1a3a5f]/70 text-sm mb-3">Create templates using our intuitive drag-and-drop interface. Perfect for all skill levels.</p>
                <div className="mt-auto">
                  <Badge variant="outline" className="bg-[#1a3a5f]/5 text-[#1a3a5f] border-[#1a3a5f]/10">Recommended</Badge>
                </div>
              </div>

              {/* Card 2: AI Generator */}
              <div 
                className="group cursor-pointer bg-white rounded-xl border border-[#1a3a5f]/10 shadow-sm hover:shadow-md hover:border-[#d4af37]/30 transition-all p-4 flex flex-col"
                onClick={() => {
                  onOpenChange(false);
                  onShowAIGenerator();
                }}
              >
                <div className="mb-3 bg-[#d4af37]/10 text-[#d4af37] rounded-lg p-6 flex items-center justify-center">
                  <Wand2 className="h-10 w-10 group-hover:scale-110 transition-transform" />
                </div>
                <h5 className="font-semibold text-[#1a3a5f] text-lg mb-2">AI Generator</h5>
                <p className="text-[#1a3a5f]/70 text-sm mb-3">Generate professional templates with AI in seconds. Just describe what you need.</p>
                <div className="mt-auto">
                  <Badge variant="outline" className="bg-[#d4af37]/5 text-[#d4af37] border-[#d4af37]/10">Fast</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-[#1a3a5f]/70">
                <Info className="h-4 w-4 mr-2" />
                You can import or edit HTML later
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onShowImportModal();
                }}
                className="text-sm border-[#1a3a5f]/20 text-[#1a3a5f] hover:bg-[#1a3a5f]/10"
              >
                <Import className="h-3.5 w-3.5 mr-1.5" />
                Import Template
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}