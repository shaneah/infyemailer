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
import Register from "@/pages/Register";
import ClientLogin from "@/pages/ClientLogin";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClientUser, setIsClientUser] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  // Check if we're on a login or register page
  const isLoginPage = location === "/login" || location === "/client-login" || location === "/register";
  
  // Check for user authentication on component mount and route changes
  useEffect(() => {
    const adminUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const clientUser = localStorage.getItem('clientUser') || sessionStorage.getItem('clientUser');
    
    setIsAdminUser(!!adminUser);
    setIsClientUser(!!clientUser);
    setIsAuthenticated(!!adminUser || !!clientUser);
    
    // Redirect unauthenticated users to login if they're not already on a login page
    if (!adminUser && !clientUser && !isLoginPage && location !== '/') {
      setLocation('/login');
    }
    
    // Redirect to appropriate dashboard based on user type
    if (location === '/' && (adminUser || clientUser)) {
      if (adminUser) {
        setLocation('/dashboard');
      } else if (clientUser) {
        setLocation('/client/dashboard');
      }
    }
  }, [location, isLoginPage, setLocation]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-light min-h-screen">
        {/* Only show navigation when not on login pages */}
        {!isLoginPage && (
          <>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="container-fluid">
              <div className="row">
                <Sidebar open={sidebarOpen} />
                <main className={`col-md-9 ms-sm-auto col-lg-10 px-md-4 content-wrapper ${!sidebarOpen ? 'w-100' : ''}`}>
                  <Switch>
                    {/* Admin routes - for admin users only */}
                    <Route path="/dashboard">
                      {isAuthenticated && isAdminUser ? <Dashboard /> : <Login />}
                    </Route>
                    <Route path="/campaigns">
                      {isAuthenticated && isAdminUser ? <Campaigns /> : <Login />}
                    </Route>
                    <Route path="/contacts">
                      {isAuthenticated && isAdminUser ? <Contacts /> : <Login />}
                    </Route>
                    <Route path="/templates">
                      {isAuthenticated && isAdminUser ? <Templates /> : <Login />}
                    </Route>
                    <Route path="/template-builder">
                      {isAuthenticated && isAdminUser ? <TemplateBuilder /> : <Login />}
                    </Route>
                    <Route path="/template-builder/:id">
                      {isAuthenticated && isAdminUser ? <TemplateBuilder /> : <Login />}
                    </Route>
                    <Route path="/analytics">
                      {isAuthenticated && isAdminUser ? <Analytics /> : <Login />}
                    </Route>
                    <Route path="/ab-testing">
                      {isAuthenticated && isAdminUser ? <ABTesting /> : <Login />}
                    </Route>
                    <Route path="/ab-testing/:id">
                      {isAuthenticated && isAdminUser ? <ABTesting /> : <Login />}
                    </Route>
                    <Route path="/emails">
                      {isAuthenticated && isAdminUser ? <Emails /> : <Login />}
                    </Route>
                    <Route path="/domains">
                      {isAuthenticated && isAdminUser ? <Domains /> : <Login />}
                    </Route>
                    <Route path="/email-performance">
                      {isAuthenticated && isAdminUser ? <EmailPerformance /> : <Login />}
                    </Route>
                    <Route path="/clients">
                      {isAuthenticated && isAdminUser ? <Clients /> : <Login />}
                    </Route>
                    <Route path="/settings">
                      {isAuthenticated && isAdminUser ? <Settings /> : <Login />}
                    </Route>
                    <Route path="/admin">
                      {isAuthenticated && isAdminUser ? <AdminPanel /> : <Login />}
                    </Route>
                    
                    {/* Client routes (to be implemented) */}
                    <Route path="/client/dashboard">
                      {isAuthenticated && isClientUser ? <div>Client Dashboard</div> : <ClientLogin />}
                    </Route>
                    
                    {/* Handle root and not found */}
                    <Route path="/" component={isAuthenticated ? (isAdminUser ? Dashboard : null) : Login} />
                    <Route path="/:rest*" component={NotFound} />
                  </Switch>
                </main>
              </div>
            </div>
          </>
        )}
        
        {/* Login and Register routes */}
        {isLoginPage && (
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/client-login" component={ClientLogin} />
          </Switch>
        )}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
