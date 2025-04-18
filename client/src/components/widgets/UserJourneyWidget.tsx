import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, RefreshCw, Route, MapPin, ArrowRight, CheckCircle2, XCircle,
  Calendar, Clock, PieChart, Users, Filter, ChevronRight, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Widget } from '@/hooks/useWidgets';

interface UserJourneyWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

interface JourneyStep {
  id: string;
  name: string;
  usersEntered: number;
  usersCompleted: number;
  timeToComplete: string;
  dropoffRate: number;
}

interface JourneyPath {
  id: string;
  name: string;
  description: string;
  totalUsers: number;
  conversionRate: number;
  avgCompletionTime: string;
  steps: JourneyStep[];
}

// Mock data for user journeys
const mockJourneyPaths: JourneyPath[] = [
  {
    id: '1',
    name: 'Newsletter Signup Flow',
    description: 'User journey from landing page to newsletter subscription',
    totalUsers: 12487,
    conversionRate: 38.2,
    avgCompletionTime: '1:24',
    steps: [
      {
        id: '1-1',
        name: 'Landing Page Visit',
        usersEntered: 12487,
        usersCompleted: 9356,
        timeToComplete: '0:32',
        dropoffRate: 25.1
      },
      {
        id: '1-2',
        name: 'Signup Form View',
        usersEntered: 9356,
        usersCompleted: 6245,
        timeToComplete: '0:48',
        dropoffRate: 33.3
      },
      {
        id: '1-3',
        name: 'Form Submission',
        usersEntered: 6245,
        usersCompleted: 4982,
        timeToComplete: '1:12',
        dropoffRate: 20.2
      },
      {
        id: '1-4',
        name: 'Confirmation',
        usersEntered: 4982,
        usersCompleted: 4762,
        timeToComplete: '0:12',
        dropoffRate: 4.4
      }
    ]
  },
  {
    id: '2',
    name: 'Email Engagement Flow',
    description: 'User journey from email open to website conversion',
    totalUsers: 35648,
    conversionRate: 21.7,
    avgCompletionTime: '2:53',
    steps: [
      {
        id: '2-1',
        name: 'Email Open',
        usersEntered: 35648,
        usersCompleted: 28452,
        timeToComplete: '0:08',
        dropoffRate: 20.2
      },
      {
        id: '2-2',
        name: 'Email Link Click',
        usersEntered: 28452,
        usersCompleted: 14875,
        timeToComplete: '0:34',
        dropoffRate: 47.7
      },
      {
        id: '2-3',
        name: 'Landing Page Visit',
        usersEntered: 14875,
        usersCompleted: 10347,
        timeToComplete: '1:12',
        dropoffRate: 30.4
      },
      {
        id: '2-4',
        name: 'Product View',
        usersEntered: 10347,
        usersCompleted: 8745,
        timeToComplete: '2:24',
        dropoffRate: 15.5
      },
      {
        id: '2-5',
        name: 'Add to Cart',
        usersEntered: 8745,
        usersCompleted: 7732,
        timeToComplete: '1:48',
        dropoffRate: 11.6
      }
    ]
  },
  {
    id: '3',
    name: 'Reengagement Campaign',
    description: 'User journey for inactive subscribers receiving a win-back campaign',
    totalUsers: 8745,
    conversionRate: 12.4,
    avgCompletionTime: '3:15',
    steps: [
      {
        id: '3-1',
        name: 'Reengagement Email',
        usersEntered: 8745,
        usersCompleted: 2452,
        timeToComplete: '0:15',
        dropoffRate: 72.0
      },
      {
        id: '3-2',
        name: 'Special Offer Click',
        usersEntered: 2452,
        usersCompleted: 1875,
        timeToComplete: '0:22',
        dropoffRate: 23.5
      },
      {
        id: '3-3',
        name: 'Offer Page Visit',
        usersEntered: 1875,
        usersCompleted: 1347,
        timeToComplete: '1:34',
        dropoffRate: 28.2
      },
      {
        id: '3-4',
        name: 'Conversion',
        usersEntered: 1347,
        usersCompleted: 1087,
        timeToComplete: '2:42',
        dropoffRate: 19.3
      }
    ]
  }
];

const UserJourneyWidget: React.FC<UserJourneyWidgetProps> = ({ widget, onRemove }) => {
  const [loading, setLoading] = useState(false);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(mockJourneyPaths[0].id);
  const [selectedTab, setSelectedTab] = useState('flow');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
  
  // Get the selected journey data
  const selectedJourney = mockJourneyPaths.find(j => j.id === selectedJourneyId) || mockJourneyPaths[0];
  
  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  };

  // Get step completion percentage
  const getCompletionPercentage = (step: JourneyStep) => {
    return (step.usersCompleted / step.usersEntered) * 100;
  };

  // Get color based on completion rate
  const getCompletionColor = (completionRate: number) => {
    if (completionRate >= 75) return "bg-green-500";
    if (completionRate >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <Card className="rounded-lg shadow-lg overflow-hidden border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-white" />
          <CardTitle className="text-lg font-semibold">{widget.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedJourneyId} onValueChange={(value) => setSelectedJourneyId(value)}>
            <SelectTrigger className="h-8 bg-white/10 border-0 text-white text-sm w-[210px]">
              <SelectValue placeholder="Select user journey" />
            </SelectTrigger>
            <SelectContent>
              {mockJourneyPaths.map(journey => (
                <SelectItem key={journey.id} value={journey.id}>
                  {journey.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                  onClick={refreshData}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                  onClick={() => onRemove(widget.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove widget</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{selectedJourney.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{formatNumber(selectedJourney.totalUsers)} users</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{selectedJourney.conversionRate}% conversion</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>~{selectedJourney.avgCompletionTime} avg. completion</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="h-8 bg-white border-gray-200 text-sm w-[160px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="14days">Last 14 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="bg-transparent h-10 px-6">
              <TabsTrigger value="flow" className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none px-3 h-10">
                User Flow
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none px-3 h-10">
                Path Analytics
              </TabsTrigger>
              <TabsTrigger value="comparison" className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none px-3 h-10">
                Journey Comparison
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* User Flow Tab */}
          <TabsContent value="flow" className="p-6">
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Journey Flow Map</h3>
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer">
                  <Filter className="h-3 w-3 mr-1" />
                  Filter
                </Badge>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Advanced Analysis
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                {/* Render the user journey flow with connecting lines */}
                <div className="absolute left-7 top-8 bottom-8 border-l-2 border-dashed border-gray-300 z-0"></div>
                
                {selectedJourney.steps.map((step, index) => (
                  <div key={step.id} className="relative z-10 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0 w-14 flex justify-center items-start pt-2">
                        <div className={`h-10 w-10 rounded-full border-2 border-white flex items-center justify-center text-white shadow-md ${getCompletionColor(getCompletionPercentage(step))}`}>
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <Card className="border border-gray-200 shadow-sm overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">{step.name}</h4>
                                  <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Users className="h-3.5 w-3.5 mr-1" />
                                      {formatNumber(step.usersEntered)} users entered
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Clock className="h-3.5 w-3.5 mr-1" />
                                      {step.timeToComplete} avg. time
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <XCircle className="h-3.5 w-3.5 mr-1" />
                                      {step.dropoffRate}% drop off
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center">
                                  <div className="text-right mr-3">
                                    <div className="text-sm font-medium">{formatNumber(step.usersCompleted)}</div>
                                    <div className="text-xs text-gray-500">completed</div>
                                  </div>
                                  <div className="w-14 text-right">
                                    <div className="text-sm font-medium">{getCompletionPercentage(step).toFixed(1)}%</div>
                                    <div className="text-xs text-gray-500">conversion</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-3">
                                <Progress value={getCompletionPercentage(step)} className="h-1.5 bg-gray-100" />
                              </div>
                            </div>
                            
                            {index < selectedJourney.steps.length - 1 && (
                              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                <div className="flex items-center text-xs text-gray-500">
                                  <ArrowRight className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                                  {formatNumber(step.usersCompleted)} users continued to next step
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                                  {(step.usersCompleted / step.usersEntered * 100).toFixed(1)}% Proceed Rate
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Final conversion indicator */}
                <div className="relative z-10 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0 w-14 flex justify-center">
                      <div className="h-10 w-10 rounded-full border-2 border-white bg-green-500 flex items-center justify-center text-white shadow-md">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="bg-green-50 border border-green-200 rounded-md p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-green-800">Journey Completed</h4>
                            <div className="text-sm text-green-700 mt-1">
                              {formatNumber(selectedJourney.steps[selectedJourney.steps.length - 1].usersCompleted)} users completed the entire journey
                            </div>
                          </div>
                          
                          <Badge className="bg-green-100 text-green-800">
                            {selectedJourney.conversionRate}% Total Conversion
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Path Analytics Tab */}
          <TabsContent value="analytics" className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-500" />
                        Entry Points
                      </h3>
                      <Badge className="bg-emerald-100 text-emerald-700">{formatNumber(selectedJourney.totalUsers)}</Badge>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Direct Campaign</span>
                          <span className="font-medium">68%</span>
                        </div>
                        <Progress value={68} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Email Newsletter</span>
                          <span className="font-medium">22%</span>
                        </div>
                        <Progress value={22} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Website Cross-link</span>
                          <span className="font-medium">7%</span>
                        </div>
                        <Progress value={7} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Other Sources</span>
                          <span className="font-medium">3%</span>
                        </div>
                        <Progress value={3} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        Completion Time
                      </h3>
                      <Badge className="bg-indigo-100 text-indigo-700">{selectedJourney.avgCompletionTime}</Badge>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Under 1 minute</span>
                          <span className="font-medium">12%</span>
                        </div>
                        <Progress value={12} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">1-3 minutes</span>
                          <span className="font-medium">47%</span>
                        </div>
                        <Progress value={47} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">3-5 minutes</span>
                          <span className="font-medium">32%</span>
                        </div>
                        <Progress value={32} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Over 5 minutes</span>
                          <span className="font-medium">9%</span>
                        </div>
                        <Progress value={9} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        User Segments
                      </h3>
                      <Badge className="bg-purple-100 text-purple-700">Breakdown</Badge>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">New Subscribers</span>
                          <span className="font-medium">43%</span>
                        </div>
                        <Progress value={43} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Active Users</span>
                          <span className="font-medium">38%</span>
                        </div>
                        <Progress value={38} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dormant Users</span>
                          <span className="font-medium">15%</span>
                        </div>
                        <Progress value={15} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Unknown</span>
                          <span className="font-medium">4%</span>
                        </div>
                        <Progress value={4} className="h-1.5 mt-1 bg-gray-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border-0 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-base">Dropoff Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-5">
                    {selectedJourney.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium mr-3">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-900">{step.name}</span>
                            <div className="flex items-center">
                              <span className="text-sm mr-3">{formatNumber(step.usersEntered - step.usersCompleted)} users dropped off</span>
                              <Badge className={`${step.dropoffRate > 25 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {step.dropoffRate}% Dropoff
                              </Badge>
                            </div>
                          </div>
                          <Progress value={100 - step.dropoffRate} className="h-2.5 bg-gray-100" />
                          
                          {index < selectedJourney.steps.length - 1 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <ArrowRight className="h-3 w-3" />
                              {formatNumber(step.usersCompleted)} users ({(step.usersCompleted / step.usersEntered * 100).toFixed(1)}%) continued
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium mr-3">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">Journey Completed</span>
                          <div className="flex items-center">
                            <span className="text-sm mr-3">{formatNumber(selectedJourney.steps[selectedJourney.steps.length - 1].usersCompleted)} users completed</span>
                            <Badge className="bg-green-100 text-green-700">
                              {selectedJourney.conversionRate}% Conversion
                            </Badge>
                          </div>
                        </div>
                        <Progress value={selectedJourney.conversionRate} className="h-2.5 bg-gray-100" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Journey Comparison Tab */}
          <TabsContent value="comparison" className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900">Journey Performance Comparison</h3>
              <p className="text-sm text-gray-500 mt-1">Compare conversion rates and user behavior across different journey paths</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {mockJourneyPaths.map(journey => (
                  <Card key={journey.id} className={`border-0 shadow-sm ${journey.id === selectedJourneyId ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900 mr-2">{journey.name}</h3>
                            {journey.id === selectedJourneyId && (
                              <Badge className="bg-emerald-100 text-emerald-700">Selected Journey</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{journey.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Users className="h-3.5 w-3.5 mr-1" />
                              {formatNumber(journey.totalUsers)} users
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              ~{journey.avgCompletionTime} avg. time
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <PieChart className="h-3.5 w-3.5 mr-1" />
                              {journey.steps.length} steps
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="text-3xl font-bold text-gray-900">{journey.conversionRate}%</div>
                          <div className="text-sm text-gray-500">Conversion Rate</div>
                          
                          {journey.id !== selectedJourneyId && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3 h-8 text-xs"
                              onClick={() => setSelectedJourneyId(journey.id)}
                            >
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Progress 
                          value={journey.conversionRate} 
                          className={`h-2 bg-gray-100 ${
                            journey.id === selectedJourneyId 
                              ? 'bg-emerald-100/50'
                              : ''
                          }`} 
                        />
                        
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="border-0 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-base">Step Conversion Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Journey Step</th>
                          {mockJourneyPaths.map(journey => (
                            <th key={journey.id} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {journey.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-3 text-sm text-gray-900">Entry Point</td>
                          {mockJourneyPaths.map(journey => (
                            <td key={journey.id} className="px-3 py-3">
                              <Badge className={`${journey.id === selectedJourneyId ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                                {formatNumber(journey.totalUsers)} users
                              </Badge>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-3 py-3 text-sm text-gray-900">Step 1 Completion</td>
                          {mockJourneyPaths.map(journey => {
                            const step = journey.steps[0];
                            const rate = ((step.usersCompleted / step.usersEntered) * 100).toFixed(1);
                            return (
                              <td key={journey.id} className="px-3 py-3">
                                <Badge className={`${journey.id === selectedJourneyId ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {rate}% ({formatNumber(step.usersCompleted)})
                                </Badge>
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          <td className="px-3 py-3 text-sm text-gray-900">Step 2 Completion</td>
                          {mockJourneyPaths.map(journey => {
                            const step = journey.steps[1];
                            const rate = ((step.usersCompleted / step.usersEntered) * 100).toFixed(1);
                            return (
                              <td key={journey.id} className="px-3 py-3">
                                <Badge className={`${journey.id === selectedJourneyId ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {rate}% ({formatNumber(step.usersCompleted)})
                                </Badge>
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          <td className="px-3 py-3 text-sm text-gray-900">Final Conversion</td>
                          {mockJourneyPaths.map(journey => (
                            <td key={journey.id} className="px-3 py-3">
                              <Badge className={`${
                                journey.id === selectedJourneyId 
                                  ? 'bg-emerald-100 text-emerald-700 font-medium' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {journey.conversionRate}% ({formatNumber(journey.steps[journey.steps.length - 1].usersCompleted)})
                              </Badge>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-3 py-3 text-sm text-gray-900">Avg. Completion Time</td>
                          {mockJourneyPaths.map(journey => (
                            <td key={journey.id} className="px-3 py-3 text-sm text-gray-900">
                              {journey.avgCompletionTime}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserJourneyWidget;