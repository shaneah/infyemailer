import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/Dashboard";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Campaigns from "@/pages/Campaigns";
import Templates from "@/pages/Templates";
import Contacts from "@/pages/Contacts";
import ListDetails from "@/pages/ListDetails";
import ABTesting from "@/pages/ABTesting";
import EmailPerformance from "@/pages/EmailPerformance";
import TemplateBuilder from "@/pages/TemplateBuilder";
import Domains from "@/pages/Domains";

import Clients from "@/pages/Clients";
import ClientUsers from "@/pages/ClientUsers";
import Settings from "@/pages/Settings";
import AdminPanel from "@/pages/AdminPanel";
import EmailValidation from "@/pages/EmailValidation";
import Emails from "@/pages/Emails";
import Reporting from "@/pages/Reporting";

import ClientManagement from "@/pages/ClientManagement";
import AudiencePersonas from "@/pages/AudiencePersonas";

// Client portal pages
import ClientLogin from "@/pages/ClientLogin";
import SimpleClientLogin from "@/pages/SimpleClientLogin";
import ClientDashboard from "@/pages/ClientDashboard";
import ClientRoutes from "@/pages/ClientRoutes";
import Analytics from "@/pages/Analytics";


function App() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
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
        <Route path="client-settings">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
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
              <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
              
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                
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
                    <ProtectedRoute path="template-builder" component={TemplateBuilder} />
                    <ProtectedRoute path="template-builder/:id" component={TemplateBuilder} />
                    <ProtectedRoute path="domains" component={Domains} />
                    <ProtectedRoute path="clients" component={Clients} />
                    <ProtectedRoute path="client-users" component={ClientUsers} />
                    <Route path="settings">
                      {() => {
                        if (typeof window !== 'undefined') {
                          window.location.replace('admin');
                        }
                        return (
                          <div className="redirect-settings">
                            <div className="flex items-center justify-center h-full">
                              <p>Redirecting to Admin Panel...</p>
                            </div>
                          </div>
                        );
                      }}
                    </Route>
                    <ProtectedRoute path="admin" component={AdminPanel} />
                    <ProtectedRoute path="email-validation" component={EmailValidation} />
                    <ProtectedRoute path="emails" component={Emails} />
                    <ProtectedRoute path="reporting" component={Reporting} />
                    <ProtectedRoute path="client-management" component={ClientManagement} />
                    <ProtectedRoute path="audience-personas" component={AudiencePersonas} />
                    <ProtectedRoute path="analytics" component={Analytics} />

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
