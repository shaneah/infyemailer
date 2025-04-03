import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Campaigns from "@/pages/Campaigns";
import Contacts from "@/pages/Contacts";
import Templates from "@/pages/Templates";
import Analytics from "@/pages/Analytics";
import ABTesting from "@/pages/ABTesting";
import Emails from "@/pages/Emails";
import Domains from "@/pages/Domains";
import EmailPerformance from "@/pages/EmailPerformance";
import Clients from "@/pages/Clients";
import Settings from "@/pages/Settings";
import AdminPanel from "@/pages/AdminPanel";
import TemplateBuilder from "@/pages/TemplateBuilder";
import Login from "@/pages/Login";
import AuthPage from "@/pages/auth-page";
import Register from "@/pages/Register";
import ClientLogin from "@/pages/ClientLogin";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Layout component to handle sidebar and navbar
function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-grow p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Router component that uses AuthProvider
function Router() {
  const location = useLocation()[0];
  const isAuthPage = location === "/auth";
  
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/register" component={Register} />
      <Route path="/client-login" component={ClientLogin} />
      
      {/* Protected routes that require authentication */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/campaigns" component={Campaigns} />
      <ProtectedRoute path="/contacts" component={Contacts} />
      <ProtectedRoute path="/templates" component={Templates} />
      <ProtectedRoute path="/template-builder" component={TemplateBuilder} />
      <ProtectedRoute path="/template-builder/:id" component={TemplateBuilder} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/ab-testing" component={ABTesting} />
      <ProtectedRoute path="/ab-testing/:id" component={ABTesting} />
      <ProtectedRoute path="/emails" component={Emails} />
      <ProtectedRoute path="/domains" component={Domains} />
      <ProtectedRoute path="/email-performance" component={EmailPerformance} />
      <ProtectedRoute path="/clients" component={Clients} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/admin" component={AdminPanel} adminOnly />
      
      {/* Client routes */}
      <ProtectedRoute path="/client/dashboard" component={() => <div>Client Dashboard</div>} />
      
      {/* Not found route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const location = useLocation()[0];
  const isAuthPage = location === "/auth" || location === "/register" || location === "/client-login";
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="bg-light min-h-screen">
          {isAuthPage ? (
            <Router />
          ) : (
            <MainLayout>
              <Router />
            </MainLayout>
          )}
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
