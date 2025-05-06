import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import AuthPage from "@/pages/auth-page";
import DashboardV2 from "@/components/DashboardV2";
import MainSidebar from "@/components/MainSidebar";
import ClientSidebar from "@/components/ClientSidebar";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import CampaignsV2 from "@/pages/CampaignsV2";
import TemplatesV2 from "@/pages/TemplatesV2";
import Contacts from "@/pages/Contacts";
import ContactsV2 from "@/pages/ContactsV2";
import ContactsV3 from "@/pages/ContactsV3";
import ContactsV4 from "@/pages/ContactsV4";
import ContactsV6 from "@/pages/ContactsV6";
import ContactsV7 from "@/pages/ContactsV7";
import ContactListsV2 from "@/pages/ContactListsV2";
import ListDetails from "@/pages/ListDetails";
import ABTesting from "@/pages/ABTesting";
import EmailPerformance from "@/pages/EmailPerformance";
import EmailPerformanceV2 from "@/pages/EmailPerformanceV2";
import BasicTemplateBuilder from "@/pages/BasicTemplateBuilder";
import DragAndDropTemplateBuilder from "@/pages/DragAndDropTemplateBuilder";
import DomainsV2 from "@/pages/DomainsV2";

import Clients from "@/pages/Clients";
import Settings from "@/pages/Settings";
import AdminPanel from "@/pages/AdminPanel";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminDashboardV2 from "@/pages/AdminDashboardV2";
import AdminDashboardNew from "@/pages/AdminDashboardNew";
import EmailValidation from "@/pages/EmailValidation";
import EmailChecklist from "@/pages/EmailChecklist";
// Emails import removed
import Reporting from "@/pages/Reporting";
import EmailProvidersV2 from "@/pages/EmailProvidersV2";
import UserManagementV2 from "@/pages/UserManagementV2";
import ClientManagementV2 from "@/pages/ClientManagementV2";
// AudiencePersonas component removed
import EmailPreview from "@/pages/EmailPreview";
import ClientCollaboration from "@/pages/ClientCollaboration";
import CollaborativeTemplateEditor from "@/pages/CollaborativeTemplateEditor";

// Client portal pages
import ClientLogin from "@/pages/ClientLogin";
import SimpleClientLogin from "@/pages/SimpleClientLogin";
import SimpleClientLoginV2 from "@/pages/SimpleClientLoginV2";
import AdvancedClientLogin from "@/pages/AdvancedClientLogin";
import ClientDashboard from "@/pages/ClientDashboard";
import ClientDashboardV2 from "@/pages/ClientDashboardV2";
import ClientDashboardV3 from "@/pages/ClientDashboardV3";
import ClientDashboardV4 from "@/pages/ClientDashboardV4";
import ClientRoutes from "@/pages/ClientRoutes";
import Analytics from "@/pages/Analytics";
import EmailTest from "@/pages/EmailTest";
import Login from "@/pages/Login";
import EmailPerformanceDashboard from "@/pages/EmailPerformanceDashboard";
import ClientPlaceholderPage from "@/pages/ClientPlaceholderPage";
import ClientEmailPerformanceV2 from "@/pages/ClientEmailPerformanceV2";
import ClientEmailPerformanceV3 from "@/pages/ClientEmailPerformanceV3";


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
      <ThemeProvider>
        <AIAssistantProvider>
          <AuthProvider>
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
          <div className="min-h-screen">
            <SimpleClientLoginV2 />
            <Toaster />
          </div>
        </Route>
        
        <Route path="client-dashboard">
          <div className="min-h-screen">
            <ClientDashboardV4 />
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
            <ClientEmailPerformanceV3 />
            <Toaster />
          </div>
        </Route>
        <Route path="client-settings">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        
        {/* New Admin Panel Tab Routes */}
        <Route path="client-overview">
          <div className="bg-background min-h-screen">
            <ClientPlaceholderPage title="System Overview" />
            <Toaster />
          </div>
        </Route>
        <Route path="client-security">
          <div className="bg-background min-h-screen">
            <ClientRoutes />
            <Toaster />
          </div>
        </Route>
        <Route path="client-billing">
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
            <div className="bg-background min-h-screen">
              <AuthPage />
              <Toaster />
            </div>
        </Route>
        
        {/* Main App Routes */}
        <Route>
            <div className="flex h-screen bg-background">
              <MainSidebar 
                open={sidebarOpen} 
                setOpen={setSidebarOpen} 
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
              />
              
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar 
                  sidebarOpen={sidebarOpen} 
                  setSidebarOpen={setSidebarOpen}
                  sidebarCollapsed={sidebarCollapsed}
                  setSidebarCollapsed={setSidebarCollapsed}
                />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 min-h-screen">
                  <div className="max-w-[1920px] mx-auto">
                    <Switch>
                      <ProtectedRoute path="/" component={DashboardV2} />
                      <ProtectedRoute path="dashboard" component={DashboardV2} />
                      <ProtectedRoute path="campaigns" component={CampaignsV2} />
                      <ProtectedRoute path="templates" component={TemplatesV2} />
                      <ProtectedRoute path="contacts" component={ContactsV7} />
                      <ProtectedRoute path="contact-lists" component={ContactListsV2} />
                      <ProtectedRoute path="lists/:id" component={ListDetails} />
                      <ProtectedRoute path="ab-testing" component={ABTesting} />
                      <ProtectedRoute path="ab-testing/:id" component={ABTesting} />
                      <ProtectedRoute path="email-performance" component={EmailPerformanceV2} />
                      <ProtectedRoute path="template-builder" component={BasicTemplateBuilder} />
                      <ProtectedRoute path="template-builder/:id" component={BasicTemplateBuilder} />
                      <ProtectedRoute path="drag-drop-builder" component={DragAndDropTemplateBuilder} />
                      <ProtectedRoute path="drag-drop-builder/:id" component={DragAndDropTemplateBuilder} />
                      <ProtectedRoute path="domains" component={DomainsV2} />
                      <ProtectedRoute path="clients" component={Clients} />
                      <ProtectedRoute path="user-management" component={UserManagementV2} />
                      <ProtectedRoute path="settings" component={Settings} />
                      <ProtectedRoute path="profile" component={Settings} />
                      <ProtectedRoute path="admin" component={AdminPanel} />
                      <ProtectedRoute path="admin-dashboard" component={AdminDashboardNew} />
                      <ProtectedRoute path="email-validation" component={EmailValidation} />
                      <ProtectedRoute path="email-checklist" component={EmailChecklist} />
                      {/* Emails route removed */}
                      <ProtectedRoute path="reporting" component={Reporting} />
                      <ProtectedRoute path="email-providers" component={EmailProvidersV2} />
                      <ProtectedRoute path="client-management" component={ClientManagementV2} />
                      {/* Audience Personas route removed */}
                      <ProtectedRoute path="analytics" component={Analytics} />
                      <ProtectedRoute path="email-test" component={EmailTest} />
                      <ProtectedRoute path="email-preview" component={EmailPreview} />
                      <ProtectedRoute path="email-preview/:id" component={EmailPreview} />
                      <ProtectedRoute path="email-performance-dashboard" component={EmailPerformanceDashboard} />
                      <ProtectedRoute path="client-collaboration" component={ClientCollaboration} />
                      <ProtectedRoute path="collaborative-template-editor" component={CollaborativeTemplateEditor} />
                      <ProtectedRoute path="collaborative-template-editor/:id" component={CollaborativeTemplateEditor} />

                      <Route component={NotFound} />
                    </Switch>
                  </div>
                </main>
              </div>
              
              <Toaster />
            </div>
        </Route>
      </Switch>
      </AuthProvider>
      </AIAssistantProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
