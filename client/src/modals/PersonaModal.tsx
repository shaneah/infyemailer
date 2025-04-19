import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, XCircle } from 'lucide-react';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaToEdit?: any;
}

const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  personaToEdit
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: personaToEdit?.name || '',
    description: personaToEdit?.description || '',
    isDefault: personaToEdit?.isDefault || false,
    status: personaToEdit?.status || 'active',
    imageUrl: personaToEdit?.imageUrl || '',
    // Demographics tab
    demographics: {
      ageRange: personaToEdit?.demographics?.ageRange || '',
      gender: personaToEdit?.demographics?.gender || '',
      location: personaToEdit?.demographics?.location || '',
      income: personaToEdit?.demographics?.income || '',
      education: personaToEdit?.demographics?.education || '',
      occupation: personaToEdit?.demographics?.occupation || '',
      maritalStatus: personaToEdit?.demographics?.maritalStatus || ''
    },
    // Behavior tab
    behavior: {
      purchaseFrequency: personaToEdit?.behavior?.purchaseFrequency || '',
      browserUsage: personaToEdit?.behavior?.browserUsage || '',
      devicePreference: personaToEdit?.behavior?.devicePreference || '',
      emailOpenRate: personaToEdit?.behavior?.emailOpenRate || 0,
      clickThroughRate: personaToEdit?.behavior?.clickThroughRate || 0,
      socialMediaUsage: personaToEdit?.behavior?.socialMediaUsage || {},
      interests: personaToEdit?.behavior?.interests || []
    }
  });

  // Create persona mutation
  const createPersonaMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/audience-personas', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Persona created",
        description: "The audience persona has been successfully created."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/audience-personas'] });
      onClose();
      
      // If demographics or behaviors were added, save those too
      if (Object.values(formData.demographics).some(v => v)) {
        savePersonaDemographics(data.id);
      }
      
      if (Object.values(formData.behavior).some(v => v && 
         (typeof v === 'string' ? v.length > 0 : 
          (typeof v === 'object' ? Object.keys(v).length > 0 : true)))) {
        savePersonaBehavior(data.id);
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: "Error",
        description: `Failed to create persona: ${error.message}`,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });
  
  // Update persona mutation
  const updatePersonaMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PATCH', `/api/audience-personas/${personaToEdit.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Persona updated",
        description: "The audience persona has been successfully updated."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/audience-personas'] });
      onClose();
      
      // If demographics or behaviors were updated, save those too
      if (Object.values(formData.demographics).some(v => v)) {
        savePersonaDemographics(personaToEdit.id);
      }
      
      if (Object.values(formData.behavior).some(v => v && 
         (typeof v === 'string' ? v.length > 0 : 
          (typeof v === 'object' ? Object.keys(v).length > 0 : true)))) {
        savePersonaBehavior(personaToEdit.id);
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: "Error",
        description: `Failed to update persona: ${error.message}`,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });
  
  // Save demographics mutation
  const savePersonaDemographics = async (personaId: number) => {
    try {
      await apiRequest('POST', `/api/audience-personas/${personaId}/demographics`, formData.demographics);
    } catch (error) {
      console.error("Error saving demographics:", error);
    }
  };
  
  // Save behavior mutation
  const savePersonaBehavior = async (personaId: number) => {
    try {
      await apiRequest('POST', `/api/audience-personas/${personaId}/behaviors`, formData.behavior);
    } catch (error) {
      console.error("Error saving behavior:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDemographicsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        [name]: value
      }
    }));
  };
  
  const handleBehaviorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      behavior: {
        ...prev.behavior,
        [name]: name === 'emailOpenRate' || name === 'clickThroughRate' 
          ? parseFloat(value) 
          : value
      }
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isDefault: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Validation
    if (!formData.name.trim()) {
      setError("Persona name is required");
      setIsSubmitting(false);
      return;
    }
    
    // Prepare data
    const personaData = {
      name: formData.name,
      description: formData.description,
      isDefault: formData.isDefault,
      status: formData.status,
      imageUrl: formData.imageUrl,
      traits: {} // Will store AI-generated traits in the future
    };
    
    if (personaToEdit) {
      updatePersonaMutation.mutate(personaData);
    } else {
      createPersonaMutation.mutate(personaData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {personaToEdit ? 'Edit Persona' : 'Create Persona'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Persona Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="E.g., Marketing Mary"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    placeholder="Describe this persona's key characteristics"
                    rows={3}
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                  <Input 
                    id="imageUrl" 
                    name="imageUrl" 
                    value={formData.imageUrl} 
                    onChange={handleInputChange} 
                    placeholder="https://example.com/image.jpg"
                  />
                  
                  {/* Image preview */}
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <Label className="text-sm mb-1 block">Preview:</Label>
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={formData.imageUrl} alt={formData.name} />
                        <AvatarFallback className="bg-primary/10 text-lg">
                          {formData.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="isDefault">Set as default persona</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="demographics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="ageRange">Age Range</Label>
                  <Input 
                    id="ageRange" 
                    name="ageRange" 
                    value={formData.demographics.ageRange} 
                    onChange={handleDemographicsChange} 
                    placeholder="E.g., 25-34"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <Input 
                    id="gender" 
                    name="gender" 
                    value={formData.demographics.gender} 
                    onChange={handleDemographicsChange} 
                    placeholder="E.g., Female, Male, Non-binary"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    value={formData.demographics.location} 
                    onChange={handleDemographicsChange} 
                    placeholder="E.g., Urban, Suburban, Rural"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="income">Income Level</Label>
                  <Input 
                    id="income" 
                    name="income" 
                    value={formData.demographics.income} 
                    onChange={handleDemographicsChange} 
                    placeholder="E.g., $50,000-$75,000"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="education">Education</Label>
                  <Input 
                    id="education" 
                    name="education" 
                    value={formData.demographics.education} 
                    onChange={handleDemographicsChange} 
                    placeholder="E.g., Bachelor's degree"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input 
                    id="occupation" 
                    name="occupation" 
                    value={formData.demographics.occupation} 
                    onChange={handleDemographicsChange} 
                    placeholder="E.g., Marketing Manager"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Input 
                    id="maritalStatus" 
                    name="maritalStatus" 
                    value={formData.demographics.maritalStatus} 
                    onChange={handleDemographicsChange} 
                    placeholder="E.g., Married, Single"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="behavior" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="purchaseFrequency">Purchase Frequency</Label>
                  <Input 
                    id="purchaseFrequency" 
                    name="purchaseFrequency" 
                    value={formData.behavior.purchaseFrequency} 
                    onChange={handleBehaviorChange} 
                    placeholder="E.g., Monthly"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="browserUsage">Browser Usage</Label>
                  <Input 
                    id="browserUsage" 
                    name="browserUsage" 
                    value={formData.behavior.browserUsage} 
                    onChange={handleBehaviorChange} 
                    placeholder="E.g., Chrome, Safari"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="devicePreference">Device Preference</Label>
                  <Input 
                    id="devicePreference" 
                    name="devicePreference" 
                    value={formData.behavior.devicePreference} 
                    onChange={handleBehaviorChange} 
                    placeholder="E.g., Mobile, Desktop"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="emailOpenRate">
                    Email Open Rate (%)
                  </Label>
                  <Input 
                    id="emailOpenRate" 
                    name="emailOpenRate" 
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.behavior.emailOpenRate} 
                    onChange={handleBehaviorChange} 
                    placeholder="25.5"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="clickThroughRate">
                    Click-Through Rate (%)
                  </Label>
                  <Input 
                    id="clickThroughRate" 
                    name="clickThroughRate" 
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.behavior.clickThroughRate} 
                    onChange={handleBehaviorChange} 
                    placeholder="3.2"
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5 md:col-span-2">
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Input 
                    id="interests" 
                    name="interests" 
                    value={Array.isArray(formData.behavior.interests) 
                      ? formData.behavior.interests.join(', ') 
                      : ''}
                    onChange={(e) => {
                      const interests = e.target.value.split(',').map(i => i.trim()).filter(Boolean);
                      setFormData(prev => ({
                        ...prev,
                        behavior: {
                          ...prev.behavior,
                          interests
                        }
                      }));
                    }} 
                    placeholder="E.g., Travel, Technology, Fashion"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {personaToEdit ? 'Update Persona' : 'Create Persona'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PersonaModal;