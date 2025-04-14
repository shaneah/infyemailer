import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit2, Trash2, UserPlus, BarChart3, Filter, Users, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PersonaModal from "@/modals/PersonaModal";
import PersonaDetailsView from "@/components/PersonaDetailsView";

export default function AudiencePersonas() {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch audience personas
  const { data: personas, isLoading, error } = useQuery({
    queryKey: ['/api/audience-personas'],
    enabled: true,
  });

  // Delete mutation
  const deletePersonaMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/audience-personas/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Persona deleted",
        description: "The audience persona has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/audience-personas'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete persona: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle persona deletion
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this persona? This action cannot be undone.")) {
      deletePersonaMutation.mutate(id);
    }
  };

  // Handle persona selection for viewing details
  const handleSelectPersona = (persona: any) => {
    setSelectedPersona(persona);
  };

  // Filter personas based on search term and active tab
  const filteredPersonas = React.useMemo(() => {
    if (!personas) return [];
    
    let filtered = personas;
    
    // Filter by tab
    if (activeTab === "default") {
      filtered = filtered.filter((p: any) => p.isDefault);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p: any) => 
        p.name.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [personas, activeTab, searchTerm]);

  if (error) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-red-500">Error loading audience personas: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Audience Personas</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your audience personas for targeted marketing campaigns
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <PlusCircle size={16} />
          <span>Create Persona</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search personas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="all" className="flex-1">All Personas</TabsTrigger>
              <TabsTrigger value="default" className="flex-1">Default Personas</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPersonas.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-medium">No personas found</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first audience persona to get started.</p>
                <Button onClick={() => setIsCreateModalOpen(true)} variant="secondary" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Persona
                </Button>
              </div>
            ) : (
              filteredPersonas.map((persona: any) => (
                <Card 
                  key={persona.id} 
                  className={`cursor-pointer hover:border-primary/50 transition-all ${selectedPersona?.id === persona.id ? 'border-primary' : ''}`}
                  onClick={() => handleSelectPersona(persona)}
                >
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={persona.imageUrl || ''} alt={persona.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {persona.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{persona.name}</CardTitle>
                          {persona.isDefault && (
                            <Badge variant="outline" className="mt-1 bg-primary/10">Default</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPersona(persona);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit2 size={15} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(persona.id);
                          }}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {persona.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">{persona.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No description provided</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedPersona ? (
            <PersonaDetailsView 
              persona={selectedPersona} 
              onEdit={() => {
                setIsEditModalOpen(true);
              }}
            />
          ) : (
            <div className="border rounded-lg h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md mx-auto">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Select a Persona</h2>
                <p className="text-muted-foreground mb-4">
                  Create and select an audience persona to view detailed insights and demographics.
                  Personas help you target your campaigns more effectively.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create New Persona
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <PersonaModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {isEditModalOpen && selectedPersona && (
        <PersonaModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          personaToEdit={selectedPersona}
        />
      )}
    </div>
  );
}