import React from 'react';
import DynamicWelcomeMessage from '@/components/DynamicWelcomeMessage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * A simple test page to check if our DynamicWelcomeMessage component is working properly
 */
const WelcomeMessageTest: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Welcome Message Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-white">
            <h2 className="text-lg font-medium mb-4">Default Welcome Message:</h2>
            <DynamicWelcomeMessage />
          </div>
          
          <div className="p-4 border rounded-lg bg-blue-50">
            <h2 className="text-lg font-medium mb-4">Welcome Message with Name:</h2>
            <DynamicWelcomeMessage clientName="John Doe" />
          </div>
          
          <div className="p-4 border rounded-lg bg-purple-50">
            <h2 className="text-lg font-medium mb-4">Welcome Message with Custom Styling:</h2>
            <DynamicWelcomeMessage 
              clientName="Sarah Smith" 
              className="text-purple-700 font-medium"
            />
          </div>
          
          <div className="p-4 border rounded-lg bg-amber-50">
            <h2 className="text-lg font-medium mb-4">Compact Welcome Message:</h2>
            <DynamicWelcomeMessage 
              clientName="Mike Johnson" 
              compact={true}
              className="text-amber-700"
            />
          </div>
          
          <div className="p-4 border rounded-lg bg-green-50">
            <h2 className="text-lg font-medium mb-4">Welcome Message without Time:</h2>
            <DynamicWelcomeMessage 
              clientName="Emma Davis" 
              showTime={false}
              className="text-green-700"
            />
          </div>
          
          <div className="p-4 border rounded-lg bg-red-50">
            <h2 className="text-lg font-medium mb-4">Welcome Message without Icon:</h2>
            <DynamicWelcomeMessage 
              clientName="Alex Brown" 
              showIcon={false}
              className="text-red-700"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeMessageTest;