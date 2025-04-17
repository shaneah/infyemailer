import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Info, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ClientSidebar from '@/components/ClientSidebar';

interface PlaceholderProps {
  title: string;
}

const ClientPlaceholderPage: React.FC<PlaceholderProps> = ({ title }) => {
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <ClientSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">
              This feature will be available soon
            </p>
          </div>
          
          <Card className="shadow-md border-t-4 border-t-blue-600">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                <CardTitle>Coming Soon</CardTitle>
              </div>
              <CardDescription>
                We're working on this feature and it will be available in a future update.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-10">
                <div className="text-center">
                  <Clock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Page Under Development</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Our team is actively working on this feature. Please check back later for updates.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/client-dashboard')}>
                Return to Dashboard
              </Button>
              <Button onClick={() => navigate('/client-templates')}>
                Browse Templates
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientPlaceholderPage;