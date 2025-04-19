import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit2, BarChart2, Target, Users, User2, Calendar, Clock, Briefcase, GraduationCap, MapPin, HeartPulse, Laptop, Smartphone, Chrome, PieChart, Clock3, LucideIcon, Activity, Loader2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface PersonaDetailsViewProps {
  persona: any;
  onEdit: () => void;
}

// Helper component for demographic and behavior attributes
interface AttributeProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  emptyText?: string;
}

const Attribute: React.FC<AttributeProps> = ({ 
  icon, 
  label, 
  value, 
  emptyText = 'Not specified' 
}) => (
  <div className="flex items-start gap-3">
    <div className="p-2 rounded-lg bg-primary/10 text-primary">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1">
        {value ? (
          <span className="font-medium">{value}</span>
        ) : (
          <span className="text-muted-foreground text-sm italic">{emptyText}</span>
        )}
      </p>
    </div>
  </div>
);

const PersonaDetailsView: React.FC<PersonaDetailsViewProps> = ({ persona, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch demographics
  const { 
    data: demographics, 
    isLoading: isDemographicsLoading 
  } = useQuery({
    queryKey: [`/api/audience-personas/${persona.id}/demographics`],
    enabled: !!persona.id,
  });
  
  // Fetch behaviors
  const { 
    data: behaviors, 
    isLoading: isBehaviorsLoading 
  } = useQuery({
    queryKey: [`/api/audience-personas/${persona.id}/behaviors`],
    enabled: !!persona.id,
  });
  
  // Fetch insights
  const { 
    data: insights, 
    isLoading: isInsightsLoading 
  } = useQuery({
    queryKey: [`/api/audience-personas/${persona.id}/insights`],
    enabled: !!persona.id,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={persona.imageUrl || ''} alt={persona.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {persona.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{persona.name}</CardTitle>
                  {persona.isDefault && (
                    <Badge variant="outline" className="bg-primary/10">Default</Badge>
                  )}
                </div>
                <CardDescription className="mt-1">
                  {persona.description || 'No description provided'}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1">
              <Edit2 size={16} />
              <span>Edit</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users size={18} className="text-primary" />
                      Demographics Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isDemographicsLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : demographics ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Age: </span>
                          <span className="font-medium">{demographics.ageRange || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Gender: </span>
                          <span className="font-medium">{demographics.gender || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Location: </span>
                          <span className="font-medium">{demographics.location || 'Not specified'}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setActiveTab('demographics')}>
                          View All Demographics
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No demographics data available</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={onEdit}>
                          Add Demographics
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart2 size={18} className="text-primary" />
                      Behavior Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isBehaviorsLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : behaviors ? (
                      <div className="space-y-3">
                        {behaviors.emailOpenRate !== null && behaviors.emailOpenRate !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm">Email Open Rate:</span>
                              <span className="font-medium">{behaviors.emailOpenRate}%</span>
                            </div>
                            <Progress value={behaviors.emailOpenRate} className="h-2" />
                          </div>
                        )}
                        
                        {behaviors.clickThroughRate !== null && behaviors.clickThroughRate !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm">Click-Through Rate:</span>
                              <span className="font-medium">{behaviors.clickThroughRate}%</span>
                            </div>
                            <Progress value={behaviors.clickThroughRate * 5} className="h-2" />
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Device: </span>
                          <span className="font-medium">{behaviors.devicePreference || 'Not specified'}</span>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setActiveTab('behavior')}>
                          View All Behaviors
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No behavior data available</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={onEdit}>
                          Add Behavior Data
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target size={18} className="text-primary" />
                    Insights & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isInsightsLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : insights && insights.length > 0 ? (
                    <div className="space-y-4">
                      {insights.map((insight: any) => (
                        <Card key={insight.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{insight.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{insight.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="font-medium mb-1">No Insights Available</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add demographic and behavior data to generate AI-powered insights.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="demographics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    Demographic Profile
                  </CardTitle>
                  <CardDescription>
                    Detailed demographic information for this persona
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isDemographicsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : demographics ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Attribute 
                        icon={<Calendar size={20} />}
                        label="Age Range"
                        value={demographics.ageRange}
                      />
                      
                      <Attribute 
                        icon={<User2 size={20} />}
                        label="Gender"
                        value={demographics.gender}
                      />
                      
                      <Attribute 
                        icon={<MapPin size={20} />}
                        label="Location"
                        value={demographics.location}
                      />
                      
                      <Attribute 
                        icon={<HeartPulse size={20} />}
                        label="Marital Status"
                        value={demographics.maritalStatus}
                      />
                      
                      <Attribute 
                        icon={<Briefcase size={20} />}
                        label="Occupation"
                        value={demographics.occupation}
                      />
                      
                      <Attribute 
                        icon={<GraduationCap size={20} />}
                        label="Education"
                        value={demographics.education}
                      />
                      
                      <Attribute 
                        icon={<PieChart size={20} />}
                        label="Income Level"
                        value={demographics.income}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="font-medium mb-1">No Demographics Available</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add demographic data to better understand this persona.
                      </p>
                      <Button onClick={onEdit}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Add Demographics
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="behavior" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart2 size={18} className="text-primary" />
                    Behavior Profile
                  </CardTitle>
                  <CardDescription>
                    How this persona interacts with your marketing content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isBehaviorsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : behaviors ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Attribute 
                          icon={<Clock size={20} />}
                          label="Purchase Frequency"
                          value={behaviors.purchaseFrequency}
                        />
                        
                        <Attribute 
                          icon={<Chrome size={20} />}
                          label="Browser Usage"
                          value={behaviors.browserUsage}
                        />
                        
                        <Attribute 
                          icon={<Smartphone size={20} />}
                          label="Device Preference"
                          value={behaviors.devicePreference}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">Email Engagement</h3>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Email Open Rate</span>
                            <span className="font-medium">{behaviors.emailOpenRate || 0}%</span>
                          </div>
                          <Progress value={behaviors.emailOpenRate || 0} className="h-2" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Click-Through Rate</span>
                            <span className="font-medium">{behaviors.clickThroughRate || 0}%</span>
                          </div>
                          <Progress value={(behaviors.clickThroughRate || 0) * 5} className="h-2" />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <h3 className="font-medium">Interests</h3>
                        
                        {behaviors.interests && Array.isArray(behaviors.interests) && behaviors.interests.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {behaviors.interests.map((interest: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No interests specified</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="font-medium mb-1">No Behavior Data Available</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add behavior data to better understand how this persona interacts with your content.
                      </p>
                      <Button onClick={onEdit}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Add Behavior Data
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonaDetailsView;