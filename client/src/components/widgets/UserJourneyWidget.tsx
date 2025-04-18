import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowRight, Users, Clock, BarChart2, AlertCircle } from 'lucide-react';
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

const UserJourneyWidget: React.FC<UserJourneyWidgetProps> = ({ widget, onRemove }) => {
  // Sample user journey data
  const [journeyPaths, setJourneyPaths] = useState<JourneyPath[]>([
    {
      id: "welcome-series",
      name: "Welcome Series",
      description: "3-part onboarding email sequence for new subscribers",
      totalUsers: 1250,
      conversionRate: 32.4,
      avgCompletionTime: "8 days",
      steps: [
        {
          id: "welcome-email",
          name: "Welcome Email",
          usersEntered: 1250,
          usersCompleted: 1142,
          timeToComplete: "1 hour",
          dropoffRate: 8.6
        },
        {
          id: "product-intro",
          name: "Product Introduction",
          usersEntered: 1142,
          usersCompleted: 986,
          timeToComplete: "2 days",
          dropoffRate: 13.7
        },
        {
          id: "special-offer",
          name: "Special Offer",
          usersEntered: 986,
          usersCompleted: 405,
          timeToComplete: "5 days",
          dropoffRate: 58.9
        }
      ]
    },
    {
      id: "abandoned-cart",
      name: "Abandoned Cart Recovery",
      description: "Series to recover abandoned shopping carts",
      totalUsers: 782,
      conversionRate: 18.5,
      avgCompletionTime: "36 hours",
      steps: [
        {
          id: "cart-reminder",
          name: "Cart Reminder",
          usersEntered: 782,
          usersCompleted: 712,
          timeToComplete: "4 hours",
          dropoffRate: 8.9
        },
        {
          id: "discount-offer",
          name: "10% Discount Offer",
          usersEntered: 712,
          usersCompleted: 523,
          timeToComplete: "12 hours",
          dropoffRate: 26.5
        },
        {
          id: "final-reminder",
          name: "Final Reminder",
          usersEntered: 523,
          usersCompleted: 145,
          timeToComplete: "20 hours",
          dropoffRate: 72.3
        }
      ]
    }
  ]);

  const [activeJourney, setActiveJourney] = useState<string>(journeyPaths[0].id);
  
  const currentJourney = journeyPaths.find(journey => journey.id === activeJourney) || journeyPaths[0];

  // Function to calculate completion percentage for visualization
  const getCompletionPercentage = (step: JourneyStep) => {
    return (step.usersCompleted / step.usersEntered) * 100;
  };

  // Function to get color class based on dropoff rate
  const getDropoffColor = (dropoffRate: number) => {
    if (dropoffRate < 15) return 'text-green-600';
    if (dropoffRate < 30) return 'text-amber-500';
    return 'text-red-500';
  };

  // Function to get badge color based on conversion rate
  const getConversionBadgeColor = (rate: number) => {
    if (rate >= 30) return 'bg-green-100 text-green-800 hover:bg-green-200';
    if (rate >= 15) return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-500" />
            <CardTitle>{widget.title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onRemove(widget.id)}>
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
        <CardDescription>
          Track user progression through email sequences and automation paths
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeJourney} className="w-full" onValueChange={setActiveJourney}>
          <TabsList className="grid grid-cols-2 mb-4">
            {journeyPaths.map(journey => (
              <TabsTrigger key={journey.id} value={journey.id}>
                {journey.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeJourney} className="mt-0 space-y-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-indigo-800">{currentJourney.name}</h3>
                  <p className="text-sm text-indigo-700">{currentJourney.description}</p>
                </div>
                <div className="text-right">
                  <Badge className={getConversionBadgeColor(currentJourney.conversionRate)}>
                    {currentJourney.conversionRate}% Conversion
                  </Badge>
                  <div className="text-xs text-indigo-700 mt-1">
                    Avg. completion time: {currentJourney.avgCompletionTime}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {currentJourney.steps.map((step, index) => (
                <div key={step.id} className="border rounded-lg">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          Step {index + 1}: {step.name}
                        </h4>
                        <div className="flex items-center space-x-6 mt-1">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{step.usersEntered.toLocaleString()} users entered</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Avg. {step.timeToComplete} to complete</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getDropoffColor(step.dropoffRate)}`}>
                          {step.dropoffRate}% Dropoff
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {step.usersCompleted.toLocaleString()} completed
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${getCompletionPercentage(step)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>{getCompletionPercentage(step).toFixed(1)}% completion</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  
                  {index < currentJourney.steps.length - 1 && (
                    <div className="py-2 flex justify-center">
                      <ArrowDown className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
              
              <div className="p-4 rounded-lg border-l-4 border-amber-500 bg-amber-50">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Critical Dropoff Point</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      {currentJourney.steps.sort((a, b) => b.dropoffRate - a.dropoffRate)[0].name} has the highest dropoff rate ({currentJourney.steps.sort((a, b) => b.dropoffRate - a.dropoffRate)[0].dropoffRate}%). 
                      Consider revising this step to improve overall conversion.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50">
                <h4 className="font-medium text-indigo-800">Journey Optimization Suggestions</h4>
                <ul className="mt-2 space-y-2">
                  <li className="text-sm text-indigo-700 flex items-start">
                    <ArrowRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    {currentJourney.id === "welcome-series" ? 
                      "Reduce time between Product Introduction and Special Offer to capture more interest" :
                      "Increase discount in the second email to improve conversion to the final step"
                    }
                  </li>
                  <li className="text-sm text-indigo-700 flex items-start">
                    <ArrowRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    {currentJourney.id === "welcome-series" ? 
                      "Test alternative offers in the final email as 58.9% currently drop off at this point" :
                      "The 72.3% dropoff in the final reminder suggests urgency messaging needs improvement"
                    }
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserJourneyWidget;