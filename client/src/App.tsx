import { Switch, Route } from "wouter";
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
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useState } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-light">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="container-fluid">
          <div className="row">
            <Sidebar open={sidebarOpen} />
            <main className={`col-md-9 ms-sm-auto col-lg-10 px-md-4 content-wrapper ${!sidebarOpen ? 'w-100' : ''}`}>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/campaigns" component={Campaigns} />
                <Route path="/contacts" component={Contacts} />
                <Route path="/templates" component={Templates} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/ab-testing" component={ABTesting} />
                <Route path="/ab-testing/:id" component={ABTesting} />
                <Route path="/emails" component={Emails} />
                <Route path="/domains" component={Domains} />
                <Route path="/email-performance" component={EmailPerformance} />
                <Route path="/clients" component={Clients} />
                <Route path="/settings" component={() => (
                  <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
                    <p>Settings page is currently under development. This section will include account management, user preferences, and platform configurations.</p>
                  </div>
                )} />
                <Route path="/:rest*" component={NotFound} />
              </Switch>
            </main>
          </div>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
