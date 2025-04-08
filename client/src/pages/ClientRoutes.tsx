import React, { useState, useEffect } from 'react';
import ClientSidebar from '@/components/ClientSidebar';
import ClientDashboard from '@/pages/ClientDashboard';
import { useToast } from '@/hooks/use-toast';
import { Switch, Route, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';

// Placeholder components for client routes
const ClientCampaigns = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Client Campaigns</h1><p>This page is under development.</p></div>;
const ClientContacts = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Client Contacts</h1><p>This page is under development.</p></div>;
const ClientLists = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Client Lists</h1><p>This page is under development.</p></div>;
const ClientTemplates = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Client Templates</h1><p>This page is under development.</p></div>;
const ClientReports = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Client Reports</h1><p>This page is under development.</p></div>;
const ClientDomains = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Client Domains</h1><p>This page is under development.</p></div>;
const ClientEmailValidation = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Email Validation</h1><p>This page is under development.</p></div>;
const ClientABTesting = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Client A/B Testing</h1><p>This page is under development.</p></div>;
const ClientSettings = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Client Settings</h1><p>This page is under development.</p></div>;

export default function ClientRoutes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientUser, setClientUser] = useState<any>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check for client user in session storage
    const sessionUser = sessionStorage.getItem('clientUser');
    if (!sessionUser) {
      toast({
        title: "Authentication required",
        description: "Please login to access the client portal",
        variant: "destructive"
      });
      setLocation('/client-login');
      return;
    }
    
    try {
      const userData = JSON.parse(sessionUser);
      setClientUser(userData);
    } catch (error) {
      console.error('Error parsing client user from session storage:', error);
      sessionStorage.removeItem('clientUser');
      toast({
        title: "Session error",
        description: "Please login again",
        variant: "destructive"
      });
      setLocation('/client-login');
    }
  }, [setLocation, toast]);
  
  if (!clientUser) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
    </div>;
  }
  
  return (
    <div className="flex h-screen bg-background">
      <ClientSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-4">
          <Switch>
            <Route path="/client-dashboard" component={ClientDashboard} />
            <Route path="/client-campaigns" component={ClientCampaigns} />
            <Route path="/client-contacts" component={ClientContacts} />
            <Route path="/client-lists" component={ClientLists} />
            <Route path="/client-templates" component={ClientTemplates} />
            <Route path="/client-reports" component={ClientReports} />
            <Route path="/client-domains" component={ClientDomains} />
            <Route path="/client-email-validation" component={ClientEmailValidation} />
            <Route path="/client-ab-testing" component={ClientABTesting} />
            <Route path="/client-settings" component={ClientSettings} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}