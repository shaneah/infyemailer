import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AITemplateGeneratorProps {
  onTemplateGenerated?: (template: any) => void;
}

export default function AITemplateGenerator({ onTemplateGenerated }: AITemplateGeneratorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    templateType: "newsletter",
    industry: "",
    purpose: "",
    targetAudience: "",
    brandTone: "professional",
    keyPoints: "",
    saveTemplate: true
  });
  
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  
  const templateTypeOptions = [
    { value: "newsletter", label: "Newsletter" },
    { value: "promotional", label: "Promotional" },
    { value: "announcement", label: "Announcement" },
    { value: "welcome", label: "Welcome Email" },
    { value: "invitation", label: "Invitation" },
    { value: "transactional", label: "Transactional" },
    { value: "feedback", label: "Feedback Request" }
  ];
  
  const brandToneOptions = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly" },
    { value: "formal", label: "Formal" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "motivational", label: "Motivational" },
    { value: "humorous", label: "Humorous" }
  ];
  
  const generateTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/generate-template', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Template Generated",
        description: data.message || "Your AI template was successfully generated.",
        variant: "default" // Using 'default' variant
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      if (onTemplateGenerated) {
        onTemplateGenerated(data.template);
      }
      setGeneratingTemplate(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate template. Please try again.",
        variant: "destructive"
      });
      setGeneratingTemplate(false);
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingTemplate(true);
    generateTemplateMutation.mutate(formData);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="d-flex align-items-center">
          <i className="bi bi-robot fs-4 text-success me-2"></i>
          <h5 className="mb-0">AI-Powered Template Generator</h5>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="templateType" className="form-label">Template Type</label>
              <select 
                id="templateType" 
                name="templateType" 
                className="form-select"
                value={formData.templateType}
                onChange={handleInputChange}
                required
              >
                {templateTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-6">
              <label htmlFor="industry" className="form-label">Industry</label>
              <input 
                type="text" 
                id="industry" 
                name="industry" 
                className="form-control"
                placeholder="e.g., e-commerce, healthcare, technology"
                value={formData.industry}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="col-12">
              <label htmlFor="purpose" className="form-label">Purpose</label>
              <input 
                type="text" 
                id="purpose" 
                name="purpose" 
                className="form-control"
                placeholder="e.g., announce a sale, share monthly updates"
                value={formData.purpose}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="col-12">
              <label htmlFor="targetAudience" className="form-label">Target Audience</label>
              <input 
                type="text" 
                id="targetAudience" 
                name="targetAudience" 
                className="form-control"
                placeholder="e.g., existing customers aged 25-45"
                value={formData.targetAudience}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="col-md-6">
              <label htmlFor="brandTone" className="form-label">Brand Tone</label>
              <select 
                id="brandTone" 
                name="brandTone" 
                className="form-select"
                value={formData.brandTone}
                onChange={handleInputChange}
              >
                {brandToneOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-6">
              <div className="form-check mt-4">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="saveTemplate" 
                  name="saveTemplate"
                  checked={formData.saveTemplate}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="saveTemplate">
                  Save template after generation
                </label>
              </div>
            </div>
            
            <div className="col-12">
              <label htmlFor="keyPoints" className="form-label">Key Points to Include (optional)</label>
              <textarea 
                id="keyPoints" 
                name="keyPoints" 
                className="form-control"
                placeholder="e.g., limited time offer, new features, special benefits"
                rows={3}
                value={formData.keyPoints}
                onChange={handleInputChange}
              ></textarea>
            </div>
            
            <div className="col-12 mt-3">
              <button 
                type="submit" 
                className="btn btn-success w-100"
                disabled={generateTemplateMutation.isPending || generatingTemplate}
              >
                {(generateTemplateMutation.isPending || generatingTemplate) ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Generating Template...
                  </>
                ) : (
                  <>
                    <i className="bi bi-magic me-2"></i>
                    Generate AI Template
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}