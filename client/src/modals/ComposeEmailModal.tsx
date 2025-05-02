import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex={-1}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Compose New Email</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="row g-3">
                  <div className="col-md-8">
                    <div className="card">
                      <div className="card-header p-2">
                        <div className="input-group mb-2">
                          <span className="input-group-text">To</span>
                          <FormField
                            control={form.control}
                            name="to"
                            render={({ field }) => (
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="form-control"
                                  placeholder="Select recipients" 
                                />
                              </FormControl>
                            )}
                          />
                          <button className="btn btn-outline-secondary" type="button">
                            <i className="bi bi-people"></i>
                          </button>
                        </div>
                        <div className="input-group mb-2">
                          <span className="input-group-text">Subject</span>
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="form-control"
                                  placeholder="Email subject" 
                                />
                              </FormControl>
                            )}
                          />
                        </div>
                        <div className="btn-toolbar" role="toolbar" aria-label="Editor toolbar">
                          <div className="btn-group me-2" role="group">
                            <button type="button" className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-type-bold"></i>
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-type-italic"></i>
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-type-underline"></i>
                            </button>
                          </div>
                          <div className="btn-group me-2" role="group">
                            <button type="button" className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-list-ul"></i>
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-list-ol"></i>
                            </button>
                          </div>
                          <div className="btn-group me-2" role="group">
                            <button type="button" className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-link"></i>
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-image"></i>
                            </button>
                          </div>
                          <div className="btn-group" role="group">
                            <button type="button" className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-code"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-3" style={{ minHeight: '400px' }}>
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormControl>
                              <div className="p-3 border rounded bg-light text-center" style={{ minHeight: '350px' }}>
                                <p className="text-muted mb-4">Drag and drop content blocks here or use the template library</p>
                                <button 
                                  type="button" 
                                  className="btn btn-primary"
                                  onClick={() => {
                                    form.setValue("content", "Sample email content");
                                  }}
                                >
                                  <i className="bi bi-plus-circle me-1"></i> Add Content Block
                                </button>
                              </div>
                            </FormControl>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card mb-3">
                      <div className="card-header">
                        <h6 className="mb-0">Preview</h6>
                      </div>
                      <div className="card-body p-0">
                        <div className="p-3 text-center bg-light rounded-bottom" style={{ height: '250px' }}>
                          <div className="d-flex justify-content-center align-items-center h-100">
                            <p className="text-muted">
                              {form.watch("content") 
                                ? form.watch("content") 
                                : "Preview will appear here"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer p-2">
                        <div className="btn-group w-100">
                          <button 
                            type="button" 
                            className={`btn btn-sm btn-outline-secondary ${activeDevice === 'tablet' ? 'active' : ''}`}
                            onClick={() => setActiveDevice('tablet')}
                          >
                            <i className="bi bi-tablet"></i>
                          </button>
                          <button 
                            type="button" 
                            className={`btn btn-sm btn-outline-secondary ${activeDevice === 'phone' ? 'active' : ''}`}
                            onClick={() => setActiveDevice('phone')}
                          >
                            <i className="bi bi-phone"></i>
                          </button>
                          <button 
                            type="button" 
                            className={`btn btn-sm btn-outline-secondary ${activeDevice === 'laptop' ? 'active' : ''}`}
                            onClick={() => setActiveDevice('laptop')}
                          >
                            <i className="bi bi-laptop"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Content Blocks</h6>
                      </div>
                      <div className="card-body p-2">
                        <div className="list-group">
                          <button type="button" className="list-group-item list-group-item-action d-flex align-items-center">
                            <i className="bi bi-card-heading me-2"></i>
                            Header
                          </button>
                          <button type="button" className="list-group-item list-group-item-action d-flex align-items-center">
                            <i className="bi bi-text-paragraph me-2"></i>
                            Text
                          </button>
                          <button type="button" className="list-group-item list-group-item-action d-flex align-items-center">
                            <i className="bi bi-image me-2"></i>
                            Image
                          </button>
                          <button type="button" className="list-group-item list-group-item-action d-flex align-items-center">
                            <i className="bi bi-columns-gap me-2"></i>
                            Button
                          </button>
                          <button type="button" className="list-group-item list-group-item-action d-flex align-items-center">
                            <i className="bi bi-grid-3x3-gap me-2"></i>
                            Divider
                          </button>
                          <button type="button" className="list-group-item list-group-item-action d-flex align-items-center">
                            <i className="bi bi-layout-split me-2"></i>
                            Spacer
                          </button>
                          <button type="button" className="list-group-item list-group-item-action d-flex align-items-center">
                            <i className="bi bi-brush me-2"></i>
                            Social
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={form.handleSubmit(onSubmit)}
              disabled={sendEmailMutation.isPending}
            >
              <i className="bi bi-send me-1"></i> 
              {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
            </button>
            <div className="dropdown">
              <button 
                className="btn btn-outline-primary dropdown-toggle" 
                type="button" 
                id="sendOptionsDropdown" 
              >
                Save as
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmailModal;
