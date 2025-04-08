import React, { useState, useEffect } from 'react';
import ClientSidebar from '@/components/ClientSidebar';
import ClientDashboard from '@/pages/ClientDashboard';
import { useToast } from '@/hooks/use-toast';
import { Switch, Route, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';
import { Mail, BarChart3, Activity } from 'lucide-react';

// Campaigns component with more complete UI
const ClientCampaigns = () => {
  // State to manage campaign data
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "Monthly Newsletter",
      status: "Active",
      sentDate: "2025-03-15",
      recipients: 2430,
      openRate: 24.8,
      clickRate: 3.6
    },
    {
      id: 2,
      name: "Product Launch",
      status: "Draft",
      sentDate: null,
      recipients: 0,
      openRate: 0,
      clickRate: 0
    },
    {
      id: 3,
      name: "Spring Promotion",
      status: "Scheduled",
      sentDate: "2025-04-15",
      recipients: 0,
      openRate: 0,
      clickRate: 0
    },
    {
      id: 4,
      name: "Customer Feedback Survey",
      status: "Completed",
      sentDate: "2025-02-10",
      recipients: 1850,
      openRate: 22.5,
      clickRate: 4.2
    }
  ]);
  
  const statusColors = {
    Active: "bg-green-100 text-green-800",
    Draft: "bg-gray-100 text-gray-800",
    Scheduled: "bg-blue-100 text-blue-800",
    Completed: "bg-purple-100 text-purple-800",
    Failed: "bg-red-100 text-red-800"
  };
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Email Campaigns</h1>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <span>Create Campaign</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
        </button>
      </div>
      
      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Campaigns</h3>
          <p className="text-2xl font-bold">{campaigns.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Campaigns</h3>
          <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'Active').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Open Rate</h3>
          <p className="text-2xl font-bold">23.6%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Click Rate</h3>
          <p className="text-2xl font-bold">3.9%</p>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
            <select className="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option value="">All Dates</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Recipients</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Open Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Click Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">No campaigns found.</td>
                </tr>
              ) : (
                campaigns.map(campaign => (
                  <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status as keyof typeof statusColors]}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {campaign.sentDate ? new Date(campaign.sentDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {campaign.recipients.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {campaign.openRate > 0 ? `${campaign.openRate}%` : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {campaign.clickRate > 0 ? `${campaign.clickRate}%` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-500 hover:text-primary" title="View Details">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button className="text-gray-500 hover:text-blue-600" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                        </button>
                        <button className="text-gray-500 hover:text-red-600" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{campaigns.length}</span> of{" "}
                <span className="font-medium">{campaigns.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary ring-1 ring-inset ring-gray-300">
                  1
                </button>
                <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
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