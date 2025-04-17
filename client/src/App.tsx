import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/Dashboard";
import MainSidebar from "@/components/MainSidebar";
import ClientSidebar from "@/components/ClientSidebar";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Campaigns from "@/pages/Campaigns";
import Templates from "@/pages/Templates";
import Contacts from "@/pages/Contacts";
import ListDetails from "@/pages/ListDetails";
import ABTesting from "@/pages/ABTesting";
import EmailPerformance from "@/pages/EmailPerformance";
import BasicTemplateBuilder from "@/pages/BasicTemplateBuilder";
import DragAndDropTemplateBuilder from "@/pages/DragAndDropTemplateBuilder";
import TemplateBuilder from "@/pages/TemplateBuilder";
import TemplateTest from "@/pages/TemplateTest";
import Domains from "@/pages/Domains";

import Clients from "@/pages/Clients";
import Settings from "@/pages/Settings";
import AdminPanel from "@/pages/AdminPanel";
import EmailValidation from "@/pages/EmailValidation";
import EmailChecklist from "@/pages/EmailChecklist";
// Emails import removed
import Reporting from "@/pages/Reporting";
import EmailProviders from "@/pages/EmailProviders";
import UserManagement from "@/pages/UserManagement";
import ClientManagement from "@/pages/ClientManagement";
import AudiencePersonas from "@/pages/AudiencePersonas";
import EmailPreview from "@/pages/EmailPreview";

// Client portal pages
import ClientLogin from "@/pages/ClientLogin";
import SimpleClientLogin from "@/pages/SimpleClientLogin";
import ClientDashboard from "@/pages/ClientDashboard";
import ClientRoutes from "@/pages/ClientRoutes";
import Analytics from "@/pages/Analytics";
import EmailTest from "@/pages/EmailTest";
import Login from "@/pages/Login";
import EmailPerformanceDashboard from "@/pages/EmailPerformanceDashboard";


function App() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState !== null) {
      setSidebarCollapsed(savedCollapsedState === 'true');
    }
  }, []);

  // Save sidebar collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        {/* Authentication Routes */}
        <Route path="login">
          <div className="bg-background min-h-screen">
            <Login />
            <Toaster />
          </div>
        </Route>
        
        {/* Client Portal Routes */}
        <Route path="client-login">
          <div className="bg-background min-h-screen">
            <SimpleClientLogin />
            <Toaster />
          </div>
        </Route>
        
        <Route path="client-dashboard">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        
        {/* Client Portal Sub-routes */}
        <Route path="client-campaigns">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="client-contacts">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="client-lists">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="client-templates">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="client-template-builder">
          <div className="bg-background min-h-screen">
            <BasicTemplateBuilder isClientPortal={true} />
            <Toaster />
          </div>
        </Route>
        <Route path="client-template-builder/:id">
          <div className="bg-background min-h-screen">
            <BasicTemplateBuilder isClientPortal={true} />
            <Toaster />
          </div>
        </Route>
        <Route path="client-reports">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="client-domains">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="client-email-validation">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="client-ab-testing">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="client-ab-testing/:id">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="client-email-performance">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="client-settings">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="email-performance-dashboard">
          <div className="bg-background min-h-screen">
            <EmailPerformanceDashboard />
            <Toaster />
          </div>
        </Route>
        
        {/* Auth Route */}
        <Route path="auth">
          <AuthProvider>
            <div className="bg-background min-h-screen">
              <AuthPage />
              <Toaster />
            </div>
          </AuthProvider>
        </Route>
        
        {/* Main App Routes */}
        <Route>
          <AuthProvider>
            <div className="flex h-screen bg-background">
              <MainSidebar 
                open={sidebarOpen} 
                setOpen={setSidebarOpen} 
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
              />
              
              <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4">
                  <Switch>
                    <ProtectedRoute path="/" component={Dashboard} />
                    <ProtectedRoute path="dashboard" component={Dashboard} />
                    <ProtectedRoute path="campaigns" component={Campaigns} />
                    <ProtectedRoute path="templates" component={Templates} />
                    <ProtectedRoute path="contacts" component={Contacts} />
                    <ProtectedRoute path="lists/:id" component={ListDetails} />
                    <ProtectedRoute path="ab-testing" component={ABTesting} />
                    <ProtectedRoute path="ab-testing/:id" component={ABTesting} />
                    <ProtectedRoute path="email-performance" component={EmailPerformance} />
                    {/* Template builder gets full-width layout without default padding */}
                    <Route path="template-builder">
                      <TemplateBuilder />
                    </Route>
                    <Route path="template-builder/:id">
                      <TemplateBuilder />
                    </Route>
                    {/* Route for creating new templates */}
                    <Route path="templates/new">
                      <TemplateBuilder />
                    </Route>
                    <ProtectedRoute path="drag-drop-builder" component={DragAndDropTemplateBuilder} />
                    <ProtectedRoute path="drag-drop-builder/:id" component={DragAndDropTemplateBuilder} />
                    <ProtectedRoute path="domains" component={Domains} />
                    <ProtectedRoute path="clients" component={Clients} />
                    <ProtectedRoute path="user-management" component={UserManagement} />
                    <ProtectedRoute path="settings" component={Settings} />
                    <ProtectedRoute path="profile" component={Settings} />
                    <ProtectedRoute path="admin" component={AdminPanel} />
                    <ProtectedRoute path="email-validation" component={EmailValidation} />
                    <ProtectedRoute path="email-checklist" component={EmailChecklist} />
                    {/* Emails route removed */}
                    <ProtectedRoute path="reporting" component={Reporting} />
                    <ProtectedRoute path="email-providers" component={EmailProviders} />
                    <ProtectedRoute path="client-management" component={ClientManagement} />
                    <ProtectedRoute path="audience-personas" component={AudiencePersonas} />
                    <ProtectedRoute path="analytics" component={Analytics} />
                    <ProtectedRoute path="email-test" component={EmailTest} />
                    <ProtectedRoute path="email-preview" component={EmailPreview} />
                    <ProtectedRoute path="email-preview/:id" component={EmailPreview} />
                    <ProtectedRoute path="email-performance-dashboard" component={EmailPerformanceDashboard} />
                    
                    {/* Test route - No authentication required */}
                    <Route path="template-test" component={TemplateTest} />

                    <Route component={NotFound} />
                  </Switch>
                </main>
              </div>
              
              <Toaster />
            </div>
          </AuthProvider>
        </Route>
      </Switch>
    </QueryClientProvider>
  );
}

export default App;
