import React, { useState, useEffect } from 'react';
import ClientSidebar from '@/components/ClientSidebar';
import ClientDashboard from '@/pages/ClientDashboard';
import { useToast } from '@/hooks/use-toast';
import { Switch, Route, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';
import { Mail, BarChart3, Activity } from 'lucide-react';

// Placeholder components for client routes
const ClientCampaigns = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-primary/10 p-2 rounded-full">
        <Mail className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Client Campaigns</h1>
    </div>
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </div>
);
const ClientContacts = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-primary/10 p-2 rounded-full">
        <BarChart3 className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Client Contacts</h1>
    </div>
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </div>
);
const ClientLists = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-primary/10 p-2 rounded-full">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Client Lists</h1>
    </div>
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </div>
);
const ClientTemplates = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-primary/10 p-2 rounded-full">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Client Templates</h1>
    </div>
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </div>
);
const ClientReports = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-primary/10 p-2 rounded-full">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Client Reports</h1>
    </div>
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </div>
);
const ClientDomains = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-primary/10 p-2 rounded-full">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Client Domains</h1>
    </div>
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </div>
);
const ClientEmailValidation = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-primary/10 p-2 rounded-full">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Email Validation</h1>
    </div>
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </div>
);
const ClientABTesting = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-primary/10 p-2 rounded-full">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Client A/B Testing</h1>
    </div>
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </div>
);
const ClientSettings = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-primary/10 p-2 rounded-full">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">Client Settings</h1>
    </div>
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </div>
);

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
        <Switch>
          <Route path="/client-dashboard">
            <ClientDashboard />
          </Route>
          <Route path="/client-campaigns">
            <ClientCampaigns />
          </Route>
          <Route path="/client-contacts">
            <ClientContacts />
          </Route>
          <Route path="/client-lists">
            <ClientLists />
          </Route>
          <Route path="/client-templates">
            <ClientTemplates />
          </Route>
          <Route path="/client-reports">
            <ClientReports />
          </Route>
          <Route path="/client-domains">
            <ClientDomains />
          </Route>
          <Route path="/client-email-validation">
            <ClientEmailValidation />
          </Route>
          <Route path="/client-ab-testing">
            <ClientABTesting />
          </Route>
          <Route path="/client-settings">
            <ClientSettings />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </main>
    </div>
  );
}