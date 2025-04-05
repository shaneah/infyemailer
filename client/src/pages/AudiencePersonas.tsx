import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Edit, Trash2, Target, ChevronRight, Plus, Save, X, User, PieChart, FileText, List, Tag, Settings, Layers, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface PersonaFormData {
  name: string;
  description: string | null;
  clientId: number | null;
  isDefault: boolean | null;
  traits: any;
}

interface DemographicsFormData {
  personaId: number;
  ageRange: string | null;
  gender: string | null;
  location: string | null;
  income: string | null;
  education: string | null;
  occupation: string | null;
  maritalStatus: string | null;
}

interface BehaviorsFormData {
  personaId: number;
  purchaseFrequency: string | null;
  browserUsage: string | null;
  devicePreference: string | null;
  emailOpenRate: number | null;
  clickThroughRate: number | null;
  socialMediaUsage: any;
  interests: any;
}

interface InsightFormData {
  personaId: number;
  insightType: string;
  title: string;
  description: string;
  score: number | null;
}

interface SegmentFormData {
  personaId: number;
  name: string;
  description: string | null;
  rules: any;
}

const AudiencePersonas: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("personas");
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null);
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false);
  const [isDemographicsDialogOpen, setIsDemographicsDialogOpen] = useState(false);
  const [isBehaviorsDialogOpen, setIsBehaviorsDialogOpen] = useState(false);
  const [isInsightDialogOpen, setIsInsightDialogOpen] = useState(false);
  const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false);

  // Form states
  const [personaForm, setPersonaForm] = useState<PersonaFormData>({
    name: "",
    description: "",
    clientId: null,
    isDefault: false,
    traits: {},
  });

  const [demographicsForm, setDemographicsForm] = useState<DemographicsFormData>({
    personaId: 0,
    ageRange: "",
    gender: "",
    location: "",
    income: "",
    education: "",
    occupation: "",
    maritalStatus: "",
  });

  const [behaviorsForm, setBehaviorsForm] = useState<BehaviorsFormData>({
    personaId: 0,
    purchaseFrequency: "",
    browserUsage: "",
    devicePreference: "",
    emailOpenRate: null,
    clickThroughRate: null,
    socialMediaUsage: {},
    interests: [],
  });

  const [insightForm, setInsightForm] = useState<InsightFormData>({
    personaId: 0,
    insightType: "behavior",
    title: "",
    description: "",
    score: null,
  });

  const [segmentForm, setSegmentForm] = useState<SegmentFormData>({
    personaId: 0,
    name: "",
    description: "",
    rules: {},
  });

  // Queries
  const { data: personas, isLoading: isLoadingPersonas } = useQuery({
    queryKey: ["/api/audience-personas"],
    queryFn: ({ signal }) => fetch("/api/audience-personas", { signal }).then(res => res.json()),
  });

  const { data: selectedPersona, isLoading: isLoadingSelectedPersona } = useQuery({
    queryKey: ["/api/audience-personas", selectedPersonaId],
    queryFn: ({ signal }) => 
      selectedPersonaId 
        ? fetch(`/api/audience-personas/${selectedPersonaId}`, { signal }).then(res => res.json())
        : null,
    enabled: !!selectedPersonaId,
  });

  const { data: demographics, isLoading: isLoadingDemographics } = useQuery({
    queryKey: ["/api/audience-personas", selectedPersonaId, "demographics"],
    queryFn: ({ signal }) => 
      selectedPersonaId 
        ? fetch(`/api/audience-personas/${selectedPersonaId}/demographics`, { signal })
            .then(res => res.status === 404 ? null : res.json())
        : null,
    enabled: !!selectedPersonaId,
  });

  const { data: behaviors, isLoading: isLoadingBehaviors } = useQuery({
    queryKey: ["/api/audience-personas", selectedPersonaId, "behaviors"],
    queryFn: ({ signal }) => 
      selectedPersonaId 
        ? fetch(`/api/audience-personas/${selectedPersonaId}/behaviors`, { signal })
            .then(res => res.status === 404 ? null : res.json())
        : null,
    enabled: !!selectedPersonaId,
  });

  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ["/api/audience-personas", selectedPersonaId, "insights"],
    queryFn: ({ signal }) => 
      selectedPersonaId 
        ? fetch(`/api/audience-personas/${selectedPersonaId}/insights`, { signal }).then(res => res.json())
        : [],
    enabled: !!selectedPersonaId,
  });

  const { data: segments, isLoading: isLoadingSegments } = useQuery({
    queryKey: ["/api/audience-personas", selectedPersonaId, "segments"],
    queryFn: ({ signal }) => 
      selectedPersonaId 
        ? fetch(`/api/audience-personas/${selectedPersonaId}/segments`, { signal }).then(res => res.json())
        : [],
    enabled: !!selectedPersonaId,
  });

  // Mutations
  const createPersonaMutation = useMutation({
    mutationFn: async (data: PersonaFormData) => {
      const res = await apiRequest("POST", "/api/audience-personas", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audience-personas"] });
      setIsPersonaDialogOpen(false);
      toast({
        title: "Success",
        description: "Persona created successfully",
      });
      resetPersonaForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create persona: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const createDemographicsMutation = useMutation({
    mutationFn: async (data: DemographicsFormData) => {
      const res = await apiRequest("POST", `/api/audience-personas/${data.personaId}/demographics`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audience-personas", selectedPersonaId, "demographics"] });
      setIsDemographicsDialogOpen(false);
      toast({
        title: "Success",
        description: "Demographics updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update demographics: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const createBehaviorsMutation = useMutation({
    mutationFn: async (data: BehaviorsFormData) => {
      const res = await apiRequest("POST", `/api/audience-personas/${data.personaId}/behaviors`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audience-personas", selectedPersonaId, "behaviors"] });
      setIsBehaviorsDialogOpen(false);
      toast({
        title: "Success",
        description: "Behaviors updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update behaviors: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const createInsightMutation = useMutation({
    mutationFn: async (data: InsightFormData) => {
      const res = await apiRequest("POST", `/api/audience-personas/${data.personaId}/insights`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audience-personas", selectedPersonaId, "insights"] });
      setIsInsightDialogOpen(false);
      toast({
        title: "Success",
        description: "Insight created successfully",
      });
      resetInsightForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create insight: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteInsightMutation = useMutation({
    mutationFn: async (insightId: number) => {
      const res = await apiRequest("DELETE", `/api/audience-personas/insights/${insightId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audience-personas", selectedPersonaId, "insights"] });
      toast({
        title: "Success",
        description: "Insight deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete insight: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const createSegmentMutation = useMutation({
    mutationFn: async (data: SegmentFormData) => {
      const res = await apiRequest("POST", `/api/audience-personas/${data.personaId}/segments`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audience-personas", selectedPersonaId, "segments"] });
      setIsSegmentDialogOpen(false);
      toast({
        title: "Success",
        description: "Segment created successfully",
      });
      resetSegmentForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create segment: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteSegmentMutation = useMutation({
    mutationFn: async (segmentId: number) => {
      const res = await apiRequest("DELETE", `/api/audience-personas/segments/${segmentId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audience-personas", selectedPersonaId, "segments"] });
      toast({
        title: "Success",
        description: "Segment deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete segment: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Form reset functions
  const resetPersonaForm = () => {
    setPersonaForm({
      name: "",
      description: "",
      clientId: null,
      isDefault: false,
      traits: {},
    });
  };

  const resetDemographicsForm = () => {
    setDemographicsForm({
      personaId: selectedPersonaId || 0,
      ageRange: demographics?.ageRange || "",
      gender: demographics?.gender || "",
      location: demographics?.location || "",
      income: demographics?.income || "",
      education: demographics?.education || "",
      occupation: demographics?.occupation || "",
      maritalStatus: demographics?.maritalStatus || "",
    });
  };

  const resetBehaviorsForm = () => {
    setBehaviorsForm({
      personaId: selectedPersonaId || 0,
      purchaseFrequency: behaviors?.purchaseFrequency || "",
      browserUsage: behaviors?.browserUsage || "",
      devicePreference: behaviors?.devicePreference || "",
      emailOpenRate: behaviors?.emailOpenRate || null,
      clickThroughRate: behaviors?.clickThroughRate || null,
      socialMediaUsage: behaviors?.socialMediaUsage || {},
      interests: behaviors?.interests || [],
    });
  };

  const resetInsightForm = () => {
    setInsightForm({
      personaId: selectedPersonaId || 0,
      insightType: "behavior",
      title: "",
      description: "",
      score: null,
    });
  };

  const resetSegmentForm = () => {
    setSegmentForm({
      personaId: selectedPersonaId || 0,
      name: "",
      description: "",
      rules: {},
    });
  };

  // Function to handle persona selection
  const handlePersonaSelect = (personaId: number) => {
    setSelectedPersonaId(personaId);
  };

  // Function to handle creating a new persona
  const handleCreatePersona = () => {
    createPersonaMutation.mutate(personaForm);
  };

  // Function to update demographics
  const handleUpdateDemographics = () => {
    createDemographicsMutation.mutate(demographicsForm);
  };

  // Function to update behaviors
  const handleUpdateBehaviors = () => {
    createBehaviorsMutation.mutate(behaviorsForm);
  };

  // Function to create insight
  const handleCreateInsight = () => {
    createInsightMutation.mutate(insightForm);
  };

  // Function to create segment
  const handleCreateSegment = () => {
    createSegmentMutation.mutate(segmentForm);
  };

  // Initialize forms when data changes
  React.useEffect(() => {
    if (selectedPersonaId && demographics) {
      resetDemographicsForm();
    }
  }, [selectedPersonaId, demographics]);

  React.useEffect(() => {
    if (selectedPersonaId && behaviors) {
      resetBehaviorsForm();
    }
  }, [selectedPersonaId, behaviors]);

  React.useEffect(() => {
    if (selectedPersonaId) {
      resetInsightForm();
      resetSegmentForm();
    }
  }, [selectedPersonaId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Audience Personas</h1>
          <p className="text-muted-foreground">Build detailed audience profiles for targeted campaigns</p>
        </div>
        <Dialog open={isPersonaDialogOpen} onOpenChange={setIsPersonaDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Create Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Persona</DialogTitle>
              <DialogDescription>
                Enter the details to create a new audience persona
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="persona-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="persona-name"
                  className="col-span-3"
                  value={personaForm.name}
                  onChange={(e) => setPersonaForm({...personaForm, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="persona-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="persona-description"
                  className="col-span-3"
                  value={personaForm.description || ""}
                  onChange={(e) => setPersonaForm({...personaForm, description: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPersonaDialogOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                onClick={handleCreatePersona}
                disabled={!personaForm.name || createPersonaMutation.isPending}
              >
                {createPersonaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-1 gap-6">
        <div className="w-1/4 border rounded-lg overflow-hidden bg-white">
          <div className="p-4 border-b font-medium">
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              <span>Personas</span>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
            {isLoadingPersonas ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !personas || personas.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p>No personas found</p>
                <p className="text-sm mt-2">Create your first persona to get started</p>
              </div>
            ) : (
              <ul className="divide-y">
                {personas.map((persona: any) => (
                  <li 
                    key={persona.id} 
                    className={`p-4 cursor-pointer hover:bg-slate-50 ${selectedPersonaId === persona.id ? 'bg-slate-100' : ''}`}
                    onClick={() => handlePersonaSelect(persona.id)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{persona.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {persona.status === 'active' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Draft</Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex-1">
          {!selectedPersonaId ? (
            <Card className="border-dashed h-full flex items-center justify-center">
              <CardContent className="text-center p-6">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Persona Selected</h3>
                <p className="text-muted-foreground mb-6">
                  Select a persona from the list or create a new one to get started
                </p>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setIsPersonaDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Persona
                  </Button>
                </DialogTrigger>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {isLoadingSelectedPersona ? (
                <Card>
                  <CardContent className="p-6 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl font-bold">{selectedPersona?.name}</CardTitle>
                          <CardDescription>{selectedPersona?.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className={`${selectedPersona?.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          {selectedPersona?.status === 'active' ? 'Active' : 'Draft'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-5 w-full">
                          <TabsTrigger value="demographics">
                            <User className="h-4 w-4 mr-2" />
                            Demographics
                          </TabsTrigger>
                          <TabsTrigger value="behaviors">
                            <PieChart className="h-4 w-4 mr-2" />
                            Behaviors
                          </TabsTrigger>
                          <TabsTrigger value="insights">
                            <FileText className="h-4 w-4 mr-2" />
                            Insights
                          </TabsTrigger>
                          <TabsTrigger value="segments">
                            <Tag className="h-4 w-4 mr-2" />
                            Segments
                          </TabsTrigger>
                          <TabsTrigger value="settings">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="demographics" className="pt-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Demographic Profile</CardTitle>
                                <Dialog open={isDemographicsDialogOpen} onOpenChange={setIsDemographicsDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => resetDemographicsForm()}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                      <DialogTitle>Edit Demographics</DialogTitle>
                                      <DialogDescription>
                                        Update demographic information for {selectedPersona?.name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor="age-range">Age Range</Label>
                                          <Select
                                            value={demographicsForm.ageRange || ""}
                                            onValueChange={(value) => setDemographicsForm({...demographicsForm, ageRange: value})}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select age range" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="18-24">18-24</SelectItem>
                                              <SelectItem value="25-34">25-34</SelectItem>
                                              <SelectItem value="35-44">35-44</SelectItem>
                                              <SelectItem value="45-54">45-54</SelectItem>
                                              <SelectItem value="55-64">55-64</SelectItem>
                                              <SelectItem value="65+">65+</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label htmlFor="gender">Gender</Label>
                                          <Select
                                            value={demographicsForm.gender || ""}
                                            onValueChange={(value) => setDemographicsForm({...demographicsForm, gender: value})}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="male">Male</SelectItem>
                                              <SelectItem value="female">Female</SelectItem>
                                              <SelectItem value="non-binary">Non-binary</SelectItem>
                                              <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label htmlFor="location">Location</Label>
                                          <Input 
                                            id="location"
                                            value={demographicsForm.location || ""}
                                            onChange={(e) => setDemographicsForm({...demographicsForm, location: e.target.value})}
                                            placeholder="Country, region, or city"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="income">Income Level</Label>
                                          <Select
                                            value={demographicsForm.income || ""}
                                            onValueChange={(value) => setDemographicsForm({...demographicsForm, income: value})}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select income level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="low">Low</SelectItem>
                                              <SelectItem value="medium">Medium</SelectItem>
                                              <SelectItem value="high">High</SelectItem>
                                              <SelectItem value="very-high">Very High</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label htmlFor="education">Education</Label>
                                          <Select
                                            value={demographicsForm.education || ""}
                                            onValueChange={(value) => setDemographicsForm({...demographicsForm, education: value})}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select education level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="high-school">High School</SelectItem>
                                              <SelectItem value="some-college">Some College</SelectItem>
                                              <SelectItem value="associates">Associate's Degree</SelectItem>
                                              <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                                              <SelectItem value="masters">Master's Degree</SelectItem>
                                              <SelectItem value="doctorate">Doctorate</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label htmlFor="occupation">Occupation</Label>
                                          <Input 
                                            id="occupation"
                                            value={demographicsForm.occupation || ""}
                                            onChange={(e) => setDemographicsForm({...demographicsForm, occupation: e.target.value})}
                                            placeholder="Job title or field"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="marital-status">Marital Status</Label>
                                          <Select
                                            value={demographicsForm.maritalStatus || ""}
                                            onValueChange={(value) => setDemographicsForm({...demographicsForm, maritalStatus: value})}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select marital status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="single">Single</SelectItem>
                                              <SelectItem value="married">Married</SelectItem>
                                              <SelectItem value="divorced">Divorced</SelectItem>
                                              <SelectItem value="widowed">Widowed</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsDemographicsDialogOpen(false)}>Cancel</Button>
                                      <Button 
                                        type="submit" 
                                        onClick={handleUpdateDemographics}
                                        disabled={createDemographicsMutation.isPending}
                                      >
                                        {createDemographicsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {isLoadingDemographics ? (
                                <div className="flex justify-center p-6">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                              ) : !demographics ? (
                                <div className="text-center p-6 bg-slate-50 rounded-md">
                                  <p className="text-sm text-muted-foreground mb-4">
                                    No demographic information available for this persona.
                                  </p>
                                  <Button variant="outline" size="sm" onClick={() => setIsDemographicsDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Demographics
                                  </Button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Age Range</Label>
                                    <p>{demographics.ageRange || "Not specified"}</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Gender</Label>
                                    <p className="capitalize">{demographics.gender || "Not specified"}</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Location</Label>
                                    <p>{demographics.location || "Not specified"}</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Income Level</Label>
                                    <p className="capitalize">{demographics.income || "Not specified"}</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Education</Label>
                                    <p className="capitalize">{demographics.education?.replace(/-/g, ' ') || "Not specified"}</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Occupation</Label>
                                    <p>{demographics.occupation || "Not specified"}</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Marital Status</Label>
                                    <p className="capitalize">{demographics.maritalStatus || "Not specified"}</p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="behaviors" className="pt-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Behavioral Profile</CardTitle>
                                <Dialog open={isBehaviorsDialogOpen} onOpenChange={setIsBehaviorsDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => resetBehaviorsForm()}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                      <DialogTitle>Edit Behaviors</DialogTitle>
                                      <DialogDescription>
                                        Update behavioral information for {selectedPersona?.name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor="purchase-frequency">Purchase Frequency</Label>
                                          <Select
                                            value={behaviorsForm.purchaseFrequency || ""}
                                            onValueChange={(value) => setBehaviorsForm({...behaviorsForm, purchaseFrequency: value})}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="rarely">Rarely</SelectItem>
                                              <SelectItem value="occasionally">Occasionally</SelectItem>
                                              <SelectItem value="frequently">Frequently</SelectItem>
                                              <SelectItem value="regular">Regular</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label htmlFor="browser-usage">Browser Usage</Label>
                                          <Select
                                            value={behaviorsForm.browserUsage || ""}
                                            onValueChange={(value) => setBehaviorsForm({...behaviorsForm, browserUsage: value})}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select browser" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="chrome">Chrome</SelectItem>
                                              <SelectItem value="firefox">Firefox</SelectItem>
                                              <SelectItem value="safari">Safari</SelectItem>
                                              <SelectItem value="edge">Edge</SelectItem>
                                              <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label htmlFor="device-preference">Device Preference</Label>
                                          <Select
                                            value={behaviorsForm.devicePreference || ""}
                                            onValueChange={(value) => setBehaviorsForm({...behaviorsForm, devicePreference: value})}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select device" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="mobile">Mobile</SelectItem>
                                              <SelectItem value="tablet">Tablet</SelectItem>
                                              <SelectItem value="desktop">Desktop</SelectItem>
                                              <SelectItem value="mixed">Mixed</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <Label>Email Open Rate (%)</Label>
                                        <Slider
                                          value={behaviorsForm.emailOpenRate !== null ? [behaviorsForm.emailOpenRate] : [0]}
                                          min={0}
                                          max={100}
                                          step={1}
                                          onValueChange={(values) => setBehaviorsForm({...behaviorsForm, emailOpenRate: values[0]})}
                                        />
                                        <div className="text-right text-sm text-muted-foreground">
                                          {behaviorsForm.emailOpenRate !== null ? behaviorsForm.emailOpenRate : 0}%
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <Label>Click-Through Rate (%)</Label>
                                        <Slider
                                          value={behaviorsForm.clickThroughRate !== null ? [behaviorsForm.clickThroughRate] : [0]}
                                          min={0}
                                          max={100}
                                          step={1}
                                          onValueChange={(values) => setBehaviorsForm({...behaviorsForm, clickThroughRate: values[0]})}
                                        />
                                        <div className="text-right text-sm text-muted-foreground">
                                          {behaviorsForm.clickThroughRate !== null ? behaviorsForm.clickThroughRate : 0}%
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="interests">Interests (comma separated)</Label>
                                        <Textarea
                                          placeholder="Technology, Sports, Travel, etc."
                                          value={Array.isArray(behaviorsForm.interests) ? behaviorsForm.interests.join(", ") : ""}
                                          onChange={(e) => setBehaviorsForm({
                                            ...behaviorsForm, 
                                            interests: e.target.value.split(",").map(item => item.trim()).filter(Boolean)
                                          })}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsBehaviorsDialogOpen(false)}>Cancel</Button>
                                      <Button 
                                        type="submit" 
                                        onClick={handleUpdateBehaviors}
                                        disabled={createBehaviorsMutation.isPending}
                                      >
                                        {createBehaviorsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {isLoadingBehaviors ? (
                                <div className="flex justify-center p-6">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                              ) : !behaviors ? (
                                <div className="text-center p-6 bg-slate-50 rounded-md">
                                  <p className="text-sm text-muted-foreground mb-4">
                                    No behavioral information available for this persona.
                                  </p>
                                  <Button variant="outline" size="sm" onClick={() => setIsBehaviorsDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Behaviors
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                      <Label className="text-xs text-muted-foreground">Purchase Frequency</Label>
                                      <p className="capitalize">{behaviors.purchaseFrequency || "Not specified"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs text-muted-foreground">Browser</Label>
                                      <p className="capitalize">{behaviors.browserUsage || "Not specified"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs text-muted-foreground">Device</Label>
                                      <p className="capitalize">{behaviors.devicePreference || "Not specified"}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Email Open Rate</Label>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${behaviors.emailOpenRate || 0}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                      {behaviors.emailOpenRate !== null ? behaviors.emailOpenRate : 0}%
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Click-Through Rate</Label>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${behaviors.clickThroughRate || 0}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                      {behaviors.clickThroughRate !== null ? behaviors.clickThroughRate : 0}%
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Interests</Label>
                                    <div className="flex flex-wrap gap-1">
                                      {Array.isArray(behaviors.interests) && behaviors.interests.length > 0 ? (
                                        behaviors.interests.map((interest: string, index: number) => (
                                          <Badge key={index} variant="secondary">{interest}</Badge>
                                        ))
                                      ) : (
                                        <p className="text-sm text-muted-foreground">No interests specified</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="insights" className="pt-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Insights</CardTitle>
                                <Dialog open={isInsightDialogOpen} onOpenChange={setIsInsightDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button size="sm">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Insight
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                      <DialogTitle>Add New Insight</DialogTitle>
                                      <DialogDescription>
                                        Create an insight for {selectedPersona?.name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="insight-title" className="text-right">
                                          Title
                                        </Label>
                                        <Input
                                          id="insight-title"
                                          className="col-span-3"
                                          value={insightForm.title}
                                          onChange={(e) => setInsightForm({...insightForm, title: e.target.value})}
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="insight-type" className="text-right">
                                          Type
                                        </Label>
                                        <Select
                                          value={insightForm.insightType}
                                          onValueChange={(value) => setInsightForm({...insightForm, insightType: value})}
                                          className="col-span-3"
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select insight type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="behavior">Behavior</SelectItem>
                                            <SelectItem value="preference">Preference</SelectItem>
                                            <SelectItem value="trend">Trend</SelectItem>
                                            <SelectItem value="opportunity">Opportunity</SelectItem>
                                            <SelectItem value="risk">Risk</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="insight-score" className="text-right">
                                          Score (1-100)
                                        </Label>
                                        <Input
                                          id="insight-score"
                                          className="col-span-3"
                                          type="number"
                                          min="1"
                                          max="100"
                                          value={insightForm.score !== null ? insightForm.score : ""}
                                          onChange={(e) => setInsightForm({...insightForm, score: e.target.value ? parseInt(e.target.value) : null})}
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="insight-description" className="text-right">
                                          Description
                                        </Label>
                                        <Textarea
                                          id="insight-description"
                                          className="col-span-3"
                                          value={insightForm.description}
                                          onChange={(e) => setInsightForm({...insightForm, description: e.target.value})}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsInsightDialogOpen(false)}>Cancel</Button>
                                      <Button 
                                        type="submit" 
                                        onClick={handleCreateInsight}
                                        disabled={!insightForm.title || !insightForm.description || createInsightMutation.isPending}
                                      >
                                        {createInsightMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {isLoadingInsights ? (
                                <div className="flex justify-center p-6">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                              ) : !insights || insights.length === 0 ? (
                                <div className="text-center p-6 bg-slate-50 rounded-md">
                                  <p className="text-sm text-muted-foreground mb-4">
                                    No insights yet. Add insights to better understand this persona.
                                  </p>
                                  <Button variant="outline" size="sm" onClick={() => setIsInsightDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Insight
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {insights.map((insight: any) => (
                                    <Card key={insight.id}>
                                      <CardHeader className="py-3">
                                        <div className="flex justify-between items-start">
                                          <div className="space-y-1">
                                            <CardTitle className="text-base">{insight.title}</CardTitle>
                                            <Badge variant="outline" className="capitalize">{insight.insightType}</Badge>
                                          </div>
                                          <div className="flex space-x-2">
                                            {insight.score !== null && (
                                              <div className="bg-primary/10 text-primary font-medium rounded-full h-8 w-8 flex items-center justify-center text-sm">
                                                {insight.score}
                                              </div>
                                            )}
                                            <Button 
                                              variant="ghost" 
                                              size="icon"
                                              onClick={() => deleteInsightMutation.mutate(insight.id)}
                                              disabled={deleteInsightMutation.isPending}
                                            >
                                              {deleteInsightMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <Trash2 className="h-4 w-4" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="py-0">
                                        <p className="text-muted-foreground text-sm">{insight.description}</p>
                                      </CardContent>
                                      <CardFooter className="py-3">
                                        <p className="text-xs text-muted-foreground">
                                          Created on {new Date(insight.createdAt).toLocaleDateString()}
                                        </p>
                                      </CardFooter>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="segments" className="pt-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Audience Segments</CardTitle>
                                <Dialog open={isSegmentDialogOpen} onOpenChange={setIsSegmentDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button size="sm">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Segment
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                      <DialogTitle>Create Audience Segment</DialogTitle>
                                      <DialogDescription>
                                        Create a segment for {selectedPersona?.name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="segment-name" className="text-right">
                                          Name
                                        </Label>
                                        <Input
                                          id="segment-name"
                                          className="col-span-3"
                                          value={segmentForm.name}
                                          onChange={(e) => setSegmentForm({...segmentForm, name: e.target.value})}
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="segment-description" className="text-right">
                                          Description
                                        </Label>
                                        <Textarea
                                          id="segment-description"
                                          className="col-span-3"
                                          value={segmentForm.description || ""}
                                          onChange={(e) => setSegmentForm({...segmentForm, description: e.target.value})}
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">
                                          Rules
                                        </Label>
                                        <div className="col-span-3">
                                          <p className="text-sm text-muted-foreground mb-2">
                                            Simplified rules for this example. In a full implementation, this would include a rule builder UI.
                                          </p>
                                          <Textarea
                                            placeholder='Example: {"country": "US", "activity": "high"}'
                                            value={typeof segmentForm.rules === 'object' ? JSON.stringify(segmentForm.rules) : "{}"}
                                            onChange={(e) => {
                                              try {
                                                const rules = JSON.parse(e.target.value);
                                                setSegmentForm({...segmentForm, rules});
                                              } catch (error) {
                                                // Invalid JSON, but let the user continue editing
                                              }
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsSegmentDialogOpen(false)}>Cancel</Button>
                                      <Button 
                                        type="submit" 
                                        onClick={handleCreateSegment}
                                        disabled={!segmentForm.name || createSegmentMutation.isPending}
                                      >
                                        {createSegmentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {isLoadingSegments ? (
                                <div className="flex justify-center p-6">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                              ) : !segments || segments.length === 0 ? (
                                <div className="text-center p-6 bg-slate-50 rounded-md">
                                  <p className="text-sm text-muted-foreground mb-4">
                                    No audience segments created yet.
                                  </p>
                                  <Button variant="outline" size="sm" onClick={() => setIsSegmentDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Segment
                                  </Button>
                                </div>
                              ) : (
                                <div className="grid gap-4">
                                  {segments.map((segment: any) => (
                                    <Card key={segment.id}>
                                      <CardHeader className="py-3">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <CardTitle className="text-base">{segment.name}</CardTitle>
                                            <CardDescription className="text-xs">
                                              {segment.description || "No description"}
                                            </CardDescription>
                                          </div>
                                          <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => deleteSegmentMutation.mutate(segment.id)}
                                            disabled={deleteSegmentMutation.isPending}
                                          >
                                            {deleteSegmentMutation.isPending ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <Trash2 className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="py-2">
                                        <div className="space-y-2">
                                          <Label className="text-xs text-muted-foreground">Segment Rules</Label>
                                          <pre className="bg-slate-50 p-2 rounded text-xs overflow-auto whitespace-pre-wrap">
                                            {JSON.stringify(segment.rules, null, 2)}
                                          </pre>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="pt-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Persona Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                  <Card>
                                    <CardHeader className="p-4 pb-2">
                                      <CardTitle className="text-base">Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-1">
                                      <Badge variant="outline" className={`${selectedPersona?.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                        {selectedPersona?.status === 'active' ? 'Active' : 'Draft'}
                                      </Badge>
                                      <div className="mt-4">
                                        <Button size="sm" variant="outline">
                                          Change Status
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader className="p-4 pb-2">
                                      <CardTitle className="text-base">Client Association</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-1">
                                      <p className="text-sm">
                                        {selectedPersona?.clientId ? `Client ID: ${selectedPersona.clientId}` : 'No client assigned'}
                                      </p>
                                      <div className="mt-4">
                                        <Button size="sm" variant="outline">
                                          Assign Client
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader className="p-4 pb-2">
                                      <CardTitle className="text-base">Default Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-1">
                                      <Badge variant="outline" className={`${selectedPersona?.isDefault ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                        {selectedPersona?.isDefault ? 'Default Persona' : 'Not Default'}
                                      </Badge>
                                      <div className="mt-4">
                                        <Button size="sm" variant="outline">
                                          Set as Default
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                                
                                <Card className="border-red-200">
                                  <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-1">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="font-medium mb-1">Delete this persona</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Once deleted, it cannot be recovered
                                        </p>
                                      </div>
                                      <Button variant="destructive" size="sm">
                                        Delete Persona
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudiencePersonas;