import React, { useState, useEffect } from 'react';
import ClientSidebar from '@/components/ClientSidebar';
import ClientDashboard from '@/pages/ClientDashboard';
import { useToast } from '@/hooks/use-toast';
import { Switch, Route, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';
import { Mail, BarChart3, Activity } from 'lucide-react';
import CreateCampaignModal from '@/modals/CreateCampaignModal';
import AddContactModal from '@/modals/AddContactModal';
import CreateListModal from '@/modals/CreateListModal';
import CreateTemplateModal from '@/modals/CreateTemplateModal';

// Campaigns component with more complete UI
const ClientCampaigns = ({ onCreateCampaign }: { onCreateCampaign: () => void }) => {
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
        <button 
          onClick={onCreateCampaign}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
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
const ClientContacts = ({ onAddContact }: { onAddContact: () => void }) => {
  // State to manage contacts data
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [contacts, setContacts] = useState([
    {
      id: 1,
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      status: "Active",
      tags: ["Customer", "Newsletter"],
      dateAdded: "2025-01-15"
    },
    {
      id: 2,
      firstName: "Emily",
      lastName: "Johnson",
      email: "emily.johnson@example.com",
      status: "Active",
      tags: ["Lead", "Event"],
      dateAdded: "2025-02-03"
    },
    {
      id: 3,
      firstName: "Michael",
      lastName: "Williams",
      email: "michael.williams@example.com",
      status: "Inactive",
      tags: ["Customer", "Product Launch"],
      dateAdded: "2024-11-20"
    },
    {
      id: 4,
      firstName: "Sarah",
      lastName: "Davis",
      email: "sarah.davis@example.com",
      status: "Bounced",
      tags: ["Lead"],
      dateAdded: "2025-01-25"
    },
    {
      id: 5,
      firstName: "Robert",
      lastName: "Jones",
      email: "robert.jones@example.com",
      status: "Active",
      tags: ["Customer", "VIP"],
      dateAdded: "2024-12-05"
    },
    {
      id: 6,
      firstName: "Jessica",
      lastName: "Brown",
      email: "jessica.brown@example.com",
      status: "Active",
      tags: ["Customer", "Newsletter"],
      dateAdded: "2025-02-15"
    }
  ]);
  
  const statusColors = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-gray-100 text-gray-800",
    Bounced: "bg-red-100 text-red-800",
    Unsubscribed: "bg-yellow-100 text-yellow-800"
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContacts(contacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };
  
  const handleSelectContact = (id: number) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Contacts</h1>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Import</span>
          </button>
          <button 
            onClick={onAddContact}
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            <span>Add Contact</span>
          </button>
        </div>
      </div>
      
      {/* Contact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Contacts</h3>
          <p className="text-2xl font-bold">{contacts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Contacts</h3>
          <p className="text-2xl font-bold">{contacts.filter(c => c.status === 'Active').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Inactive Contacts</h3>
          <p className="text-2xl font-bold">{contacts.filter(c => c.status === 'Inactive').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Bounced Emails</h3>
          <p className="text-2xl font-bold">{contacts.filter(c => c.status === 'Bounced').length}</p>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Bounced">Bounced</option>
              <option value="Unsubscribed">Unsubscribed</option>
            </select>
            <select className="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option value="">All Tags</option>
              <option value="Customer">Customer</option>
              <option value="Lead">Lead</option>
              <option value="VIP">VIP</option>
              <option value="Newsletter">Newsletter</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button className="text-sm px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50">
              Add to List
            </button>
            <button className="text-sm px-3 py-1.5 border border-red-300 rounded bg-white text-red-700 hover:bg-red-50">
              Delete
            </button>
          </div>
        </div>
      )}
      
      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary/25"
                    onChange={handleSelectAll}
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tags</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date Added</th>
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
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">No contacts found.</td>
                </tr>
              ) : (
                contacts.map(contact => (
                  <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-primary focus:ring-primary/25"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {contact.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[contact.status as keyof typeof statusColors]}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(contact.dateAdded).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-500 hover:text-primary" title="View Details">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button className="text-gray-500 hover:text-blue-600" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                          </svg>
                        </button>
                        <button className="text-gray-500 hover:text-red-600" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
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
                Showing <span className="font-medium">1</span> to <span className="font-medium">{contacts.length}</span> of{" "}
                <span className="font-medium">{contacts.length}</span> results
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
const ClientLists = ({ onCreateList }: { onCreateList: () => void }) => {
  // State to manage lists data
  const [isLoading, setIsLoading] = useState(false);
  const [lists, setLists] = useState([
    {
      id: 1,
      name: "Newsletter Subscribers",
      contactCount: 1240,
      description: "All active newsletter subscribers",
      lastUpdated: "2025-03-15",
      tags: ["Active", "Newsletter"]
    },
    {
      id: 2,
      name: "VIP Customers",
      contactCount: 156,
      description: "High-value customers with premium status",
      lastUpdated: "2025-02-20",
      tags: ["VIP", "Customer"]
    },
    {
      id: 3,
      name: "Webinar Attendees - March 2025",
      contactCount: 435,
      description: "People who registered for our March webinar",
      lastUpdated: "2025-03-10",
      tags: ["Event", "Webinar"]
    },
    {
      id: 4,
      name: "Product Launch Interests",
      contactCount: 890,
      description: "Contacts interested in our new product launch",
      lastUpdated: "2025-02-05",
      tags: ["Product Launch", "Marketing"]
    }
  ]);
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <line x1="8" x2="21" y1="6" y2="6"></line>
              <line x1="8" x2="21" y1="12" y2="12"></line>
              <line x1="8" x2="21" y1="18" y2="18"></line>
              <line x1="3" x2="3.01" y1="6" y2="6"></line>
              <line x1="3" x2="3.01" y1="12" y2="12"></line>
              <line x1="3" x2="3.01" y1="18" y2="18"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Contact Lists</h1>
        </div>
        <button 
          onClick={onCreateList}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
          </svg>
          <span>Create List</span>
        </button>
      </div>
      
      {/* List Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Lists</h3>
          <p className="text-2xl font-bold">{lists.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Contacts in Lists</h3>
          <p className="text-2xl font-bold">{lists.reduce((sum, list) => sum + list.contactCount, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average List Size</h3>
          <p className="text-2xl font-bold">{
            lists.length > 0 
              ? Math.round(lists.reduce((sum, list) => sum + list.contactCount, 0) / lists.length).toLocaleString()
              : 0
          }</p>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search lists..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option value="">All Tags</option>
              <option value="Newsletter">Newsletter</option>
              <option value="VIP">VIP</option>
              <option value="Event">Event</option>
              <option value="Marketing">Marketing</option>
            </select>
            <select className="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option value="">Sort By</option>
              <option value="name">Name</option>
              <option value="date">Date Updated</option>
              <option value="contacts">Number of Contacts</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : lists.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Lists Found</h3>
            <p className="text-gray-500 mb-4">You haven't created any contact lists yet.</p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
              Create Your First List
            </button>
          </div>
        ) : (
          lists.map(list => (
            <div key={list.id} className="bg-white rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{list.name}</h3>
                  <div className="dropdown">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{list.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {list.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-500">
                      <span className="font-medium text-gray-900">{list.contactCount.toLocaleString()}</span> contacts
                    </div>
                    <div className="text-gray-500">
                      Updated {new Date(list.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 rounded-b-lg border-t border-gray-100 flex justify-between">
                <button className="text-sm text-gray-700 hover:text-primary">
                  View Contacts
                </button>
                <button className="text-sm text-primary hover:text-primary/80">
                  Edit List
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-center">
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
  );
};
const ClientTemplates = ({ onCreateTemplate }: { onCreateTemplate: () => void }) => {
  // State to manage templates data
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Welcome Email",
      category: "Onboarding",
      thumbnail: "https://img.freepik.com/free-vector/gradient-colorful-newsletter-template_23-2149221900.jpg?w=826&t=st=1685455431~exp=1685456031~hmac=89e4ef6e2fcadbb6ee5a5fdf6b2b4ac5a5eb18efd3f29d83b7e5ed35d19ec523",
      description: "A warm welcome email for new subscribers.",
      lastModified: "2025-03-12",
      tags: ["Welcome", "Onboarding"]
    },
    {
      id: 2,
      name: "Monthly Newsletter",
      category: "Newsletter",
      thumbnail: "https://img.freepik.com/free-vector/gradient-monthly-newsletter-template_23-2149238318.jpg?w=826&t=st=1685455531~exp=1685456131~hmac=02ed0077ae638efad5a39e5b07d701e80b5a8ba0bbb5bbac689a6f1255557cb5",
      description: "Standard monthly newsletter template with sections for news, updates, and promotions.",
      lastModified: "2025-03-05",
      tags: ["Newsletter", "Monthly"]
    },
    {
      id: 3,
      name: "Product Announcement",
      category: "Marketing",
      thumbnail: "https://img.freepik.com/free-vector/flat-product-release-linkedin-post_23-2149373521.jpg?w=826&t=st=1685455571~exp=1685456171~hmac=b48e617e5701055140f1e45b5f36637f49aff32ab7b20216c96e6e4acb0eadd0",
      description: "Template for announcing new products or features.",
      lastModified: "2025-02-18",
      tags: ["Product", "Announcement", "Marketing"]
    },
    {
      id: 4,
      name: "Seasonal Promotion",
      category: "Promotional",
      thumbnail: "https://img.freepik.com/free-vector/flat-sales-instagram-posts-collection_23-2149366697.jpg?w=826&t=st=1685455612~exp=1685456212~hmac=c2b9ed857a739a67f4af14ae2de4a11f9a4a7f9d4a7d3a9f18278495af5d9b56",
      description: "Promotional template for seasonal sales and special offers.",
      lastModified: "2025-02-25",
      tags: ["Promotion", "Sale", "Seasonal"]
    },
    {
      id: 5,
      name: "Event Invitation",
      category: "Events",
      thumbnail: "https://img.freepik.com/free-vector/flat-design-dinner-party-instagram-post_23-2149344509.jpg?w=826&t=st=1685455654~exp=1685456254~hmac=66ec27c3c0c133e094ba8f79690a9ffe3c31b4aafcc75db5f4a9e6d0f42bf69f",
      description: "Template for inviting contacts to events and webinars.",
      lastModified: "2025-01-30",
      tags: ["Event", "Invitation", "Webinar"]
    },
    {
      id: 6,
      name: "Customer Feedback",
      category: "Engagement",
      thumbnail: "https://img.freepik.com/free-vector/hand-drawn-customer-feedback-template_23-2149159915.jpg?w=826&t=st=1685455691~exp=1685456291~hmac=d89ab3c3933a71fb8c5b313cef4ad337c524ddbae1926b91b21acc6aa3ce00fa",
      description: "Template for requesting customer feedback and reviews.",
      lastModified: "2025-03-01",
      tags: ["Feedback", "Survey", "Engagement"]
    }
  ]);
  
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'Onboarding', name: 'Onboarding' },
    { id: 'Newsletter', name: 'Newsletters' },
    { id: 'Marketing', name: 'Marketing' },
    { id: 'Promotional', name: 'Promotional' },
    { id: 'Events', name: 'Events' }, 
    { id: 'Engagement', name: 'Engagement' }
  ];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);
  
  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect width="16" height="20" x="4" y="2" rx="2" />
              <path d="M8 10h8" />
              <path d="M8 14h4" />
              <path d="M8 18h8" />
              <path d="M8 6h8" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Email Templates</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span>Import</span>
          </button>
          <button 
            onClick={onCreateTemplate}
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            <span>Create Template</span>
          </button>
        </div>
      </div>
      
      {/* Category Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex overflow-x-auto hide-scrollbar">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option value="">Sort By</option>
              <option value="name">Name</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect width="16" height="20" x="4" y="2" rx="2" />
                <path d="M8 10h8" />
                <path d="M8 14h4" />
                <path d="M8 18h8" />
                <path d="M8 6h8" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Templates Found</h3>
            <p className="text-gray-500 mb-4">There are no templates in this category yet.</p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
              Create New Template
            </button>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 overflow-hidden bg-gray-100">
                <img 
                  src={template.thumbnail} 
                  alt={template.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{template.name}</h3>
                  <div className="dropdown">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                  </div>
                </div>
                <span className="inline-block px-2.5 py-1 mb-2 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {template.category}
                </span>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Last modified: {new Date(template.lastModified).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between">
                <button className="text-sm text-primary hover:text-primary/80 font-medium">
                  Use Template
                </button>
                <button className="text-sm text-gray-700 hover:text-gray-900">
                  Preview
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-center">
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
  );
};
const ClientReports = () => {
  // State for reports
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('overview');
  
  const overviewStats = {
    totalSent: 45621,
    opens: 28743,
    openRate: 63.0,
    clicks: 9865,
    clickRate: 21.6,
    bounces: 824,
    bounceRate: 1.8,
    unsubscribes: 196,
    unsubscribeRate: 0.4
  };
  
  const monthlyData = [
    { month: 'Jan', sent: 8432, opened: 5376, clicked: 1854 },
    { month: 'Feb', sent: 7865, opened: 4932, clicked: 1689 },
    { month: 'Mar', sent: 9276, opened: 5891, clicked: 2067 },
    { month: 'Apr', sent: 11243, opened: 7187, clicked: 2541 },
    { month: 'May', sent: 8805, opened: 5357, clicked: 1714 }
  ];
  
  const deviceData = [
    { device: 'Mobile', percentage: 61, color: 'bg-blue-500' },
    { device: 'Desktop', percentage: 31, color: 'bg-green-500' },
    { device: 'Tablet', percentage: 8, color: 'bg-purple-500' }
  ];
  
  const geoData = [
    { country: 'United States', percentage: 42, count: 19161 },
    { country: 'United Kingdom', percentage: 15, count: 6843 },
    { country: 'Canada', percentage: 11, count: 5018 },
    { country: 'Australia', percentage: 9, count: 4106 },
    { country: 'Germany', percentage: 6, count: 2737 },
    { country: 'France', percentage: 5, count: 2281 },
    { country: 'Other', percentage: 12, count: 5475 }
  ];
  
  const topCampaigns = [
    { 
      id: 1, 
      name: 'Monthly Newsletter - March', 
      sent: 12450,
      openRate: 68.4,
      clickRate: 24.7
    },
    { 
      id: 2, 
      name: 'Spring Promotion', 
      sent: 8765,
      openRate: 72.1,
      clickRate: 31.5
    },
    { 
      id: 3, 
      name: 'Product Launch - Premium Series', 
      sent: 10234,
      openRate: 64.8,
      clickRate: 27.3
    },
    { 
      id: 4, 
      name: 'Customer Loyalty Program', 
      sent: 6500,
      openRate: 59.6,
      clickRate: 18.9
    }
  ];
  
  const renderReportContent = () => {
    switch(reportType) {
      case 'overview':
        return (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Total Sent</h3>
                  <div className="bg-blue-100 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold">{overviewStats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Open Rate</h3>
                  <div className="bg-green-100 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold">{overviewStats.openRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{overviewStats.opens.toLocaleString()} opens</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Click Rate</h3>
                  <div className="bg-purple-100 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold">{overviewStats.clickRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{overviewStats.clicks.toLocaleString()} clicks</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Bounce Rate</h3>
                  <div className="bg-red-100 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold">{overviewStats.bounceRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{overviewStats.bounces.toLocaleString()} bounces</p>
              </div>
            </div>
            
            {/* Monthly Performance Chart */}
            <div className="bg-white rounded-lg shadow border border-gray-100 mb-6">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium">Monthly Performance</h3>
              </div>
              <div className="p-4 h-64 flex items-end justify-between">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center w-1/6">
                    <div className="relative w-full h-40 flex items-end mb-2">
                      <div className="absolute bottom-0 left-0 right-0 mx-auto w-4 bg-blue-100 rounded-t" style={{ height: `${(data.sent / 12000) * 100}%` }}></div>
                      <div className="absolute bottom-0 left-0 right-0 mx-auto w-4 bg-green-100 rounded-t" style={{ height: `${(data.opened / 12000) * 100}%`, left: '8px' }}></div>
                      <div className="absolute bottom-0 left-0 right-0 mx-auto w-4 bg-purple-100 rounded-t" style={{ height: `${(data.clicked / 12000) * 100}%`, left: '16px' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 flex justify-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">Sent</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">Opened</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-100 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">Clicked</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Campaigns */}
            <div className="bg-white rounded-lg shadow border border-gray-100 mb-6">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium">Top Performing Campaigns</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCampaigns.map((campaign, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="py-3 px-4 text-sm">{campaign.name}</td>
                        <td className="py-3 px-4 text-sm text-right">{campaign.sent.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-right">
                          <span className={`font-medium ${campaign.openRate > 65 ? 'text-green-600' : 'text-gray-900'}`}>
                            {campaign.openRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          <span className={`font-medium ${campaign.clickRate > 25 ? 'text-green-600' : 'text-gray-900'}`}>
                            {campaign.clickRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      case 'devices':
        return (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h3 className="font-medium mb-4">Device Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                {deviceData.map((item, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.device}</span>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-48 w-48 rounded-full bg-gray-200 flex items-center justify-center">
                  <div className="absolute top-0 left-0 right-0 bottom-0">
                    <div className="absolute inset-0 bg-blue-500" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 50% 100%)' }}></div>
                    <div className="absolute inset-0 bg-green-500" style={{ clipPath: 'polygon(50% 50%, 50% 0, 0 0, 0 50%)' }}></div>
                    <div className="absolute inset-0 bg-purple-500" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 100%, 20% 100%)' }}></div>
                  </div>
                  <div className="z-10 bg-white h-32 w-32 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'geography':
        return (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h3 className="font-medium mb-4">Geographic Distribution</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {geoData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">{item.country}</td>
                      <td className="py-3 px-4 text-sm text-right">{item.count.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-right">{item.percentage}%</td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return <div>Select a report type</div>;
    }
  };
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Email Reports</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">Last Year</option>
          </select>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Report Type Navigation */}
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          onClick={() => setReportType('overview')} 
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 ${reportType === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setReportType('devices')} 
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 ${reportType === 'devices' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Devices
        </button>
        <button 
          onClick={() => setReportType('geography')} 
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 ${reportType === 'geography' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Geography
        </button>
      </div>
      
      {/* Report Content */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : renderReportContent()}
    </div>
  );
};
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
const ClientEmailValidation = () => {
  // States for validation forms
  const [singleEmail, setSingleEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [activeTab, setActiveTab] = useState('single');
  const [isLoading, setIsLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<any>(null);
  const [batchResults, setBatchResults] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [showTypoSuggestion, setShowTypoSuggestion] = useState(false);
  const { toast } = useToast();

  // Handle single email validation
  const handleSingleValidation = async () => {
    if (!singleEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address to validate",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setSingleResult(null);
    setShowTypoSuggestion(false);
    
    try {
      const response = await fetch('/api/email-validation/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: singleEmail.trim() })
      });
      
      const data = await response.json();
      setSingleResult(data);
      
      if (data.typo && data.suggestion) {
        setShowTypoSuggestion(true);
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation failed",
        description: "Could not validate the email address. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply suggestion
  const applySuggestion = () => {
    if (singleResult?.suggestion) {
      setSingleEmail(singleResult.suggestion);
      setShowTypoSuggestion(false);
    }
  };

  // Handle bulk email validation
  const handleBulkValidation = async () => {
    if (!bulkEmails.trim()) {
      toast({
        title: "Emails required",
        description: "Please enter email addresses to validate",
        variant: "destructive"
      });
      return;
    }
    
    // Parse emails from textarea
    const emailList = bulkEmails
      .split(/[\n,;]/)
      .map(e => e.trim())
      .filter(e => e);
    
    if (emailList.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please enter valid email addresses separated by commas, semicolons, or new lines",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setBatchResults(null);
    setAnalysisResults(null);
    
    try {
      // Validate and analyze emails
      const [validationResponse, analysisResponse] = await Promise.all([
        fetch('/api/email-validation/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ emails: emailList })
        }),
        fetch('/api/email-validation/analyze-bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ emails: emailList })
        })
      ]);
      
      const validationData = await validationResponse.json();
      const analysisData = await analysisResponse.json();
      
      setBatchResults(validationData);
      setAnalysisResults(analysisData);
    } catch (error) {
      console.error('Bulk validation error:', error);
      toast({
        title: "Validation failed",
        description: "Could not validate the email addresses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Colorize score based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Render badge based on validation result
  const renderBadge = (valid: boolean, disposable: boolean) => {
    if (!valid) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Invalid</span>;
    }
    
    if (disposable) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Disposable</span>;
    }
    
    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Valid</span>;
  };

  const renderSingleResultCard = () => {
    if (!singleResult) return null;
    
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Validation Result</h3>
          <div>
            {renderBadge(singleResult.valid, singleResult.disposable)}
          </div>
        </div>
        
        {showTypoSuggestion && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-800">Possible typo detected!</p>
                <p className="text-sm text-blue-600">Did you mean: <span className="font-semibold">{singleResult.suggestion}</span>?</p>
              </div>
              <button 
                onClick={applySuggestion}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-md transition-colors"
              >
                Apply Suggestion
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Email Quality Score</h4>
            <div className="flex items-end gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(singleResult.score)}`}>{singleResult.score}</span>
              <span className="text-sm text-gray-500">/100</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Format</h4>
            <p className="font-medium">
              {singleResult.valid ? 
                <span className="text-green-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Valid Format
                </span> : 
                <span className="text-red-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Invalid Format
                </span>
              }
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Disposable Email</h4>
            <p className="font-medium">
              {singleResult.disposable ? 
                <span className="text-yellow-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Disposable Domain
                </span> : 
                <span className="text-green-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Regular Domain
                </span>
              }
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Typo Detection</h4>
            <p className="font-medium">
              {singleResult.typo ? 
                <span className="text-yellow-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Possible Typo Detected
                </span> : 
                <span className="text-green-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No Typos Detected
                </span>
              }
            </p>
          </div>
        </div>
        
        {singleResult.reason && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Issues:</h4>
            <p className="text-sm text-gray-600">{singleResult.reason}</p>
          </div>
        )}
      </div>
    );
  };

  const renderBulkResultsCard = () => {
    if (!batchResults || !analysisResults) return null;
    
    return (
      <div className="space-y-6 mt-6">
        {/* Overview Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Validation Overview</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Quality Score</h4>
              <p className={`text-2xl font-bold ${getScoreColor(analysisResults.qualityScore)}`}>
                {analysisResults.qualityScore}%
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Valid Emails</h4>
              <p className="text-2xl font-bold text-green-600">
                {analysisResults.validRate}%
              </p>
              <p className="text-xs text-gray-500">
                {analysisResults.validEmails} of {analysisResults.totalEmails} emails
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Disposable Emails</h4>
              <p className="text-2xl font-bold text-yellow-600">
                {analysisResults.disposableRate}%
              </p>
              <p className="text-xs text-gray-500">
                {analysisResults.disposableEmails} of {analysisResults.totalEmails} emails
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Possible Typos</h4>
              <p className="text-2xl font-bold text-blue-600">
                {analysisResults.typoRate}%
              </p>
              <p className="text-xs text-gray-500">
                {analysisResults.typoEmails} of {analysisResults.totalEmails} emails
              </p>
            </div>
          </div>
          
          {/* Issue Breakdown */}
          <h4 className="text-sm font-semibold mb-2">Issue Breakdown</h4>
          <div className="mb-6">
            {Object.entries(analysisResults.issueBreakdown).map(([issue, count]: [string, any]) => (
              count > 0 ? (
                <div key={issue} className="flex items-center mb-2 last:mb-0">
                  <div className="w-1/3 text-sm">{issue}</div>
                  <div className="w-2/3 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary rounded-full h-2.5" 
                        style={{ width: `${Math.round((count / analysisResults.totalEmails) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 min-w-[60px]">
                      {count} emails ({Math.round((count / analysisResults.totalEmails) * 100)}%)
                    </div>
                  </div>
                </div>
              ) : null
            ))}
          </div>
          
          {/* Domain Breakdown */}
          <h4 className="text-sm font-semibold mb-2">Top Domains</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(analysisResults.domainBreakdown)
                  .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
                  .slice(0, 5)
                  .map(([domain, count]: [string, any]) => (
                    <tr key={domain}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{domain}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round((count / analysisResults.totalEmails) * 100)}%
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Detailed Results Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(batchResults.results).map(([email, result]: [string, any]) => (
                  <tr key={email}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderBadge(result.valid, result.disposable)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${getScoreColor(result.score)}`}>
                        {result.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {!result.valid && 'Invalid format'}
                      {result.valid && result.disposable && 'Disposable email'}
                      {result.valid && result.typo && (
                        <span>
                          Possible typo <span className="text-blue-600">→ {result.suggestion}</span>
                        </span>
                      )}
                      {result.valid && !result.disposable && !result.typo && (
                        <span className="text-green-600">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2 rounded-full">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Email Validation</h1>
      </div>
      
      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Email Validation</h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>Validate your email lists to improve deliverability and engagement. Identify invalid emails, disposable domains, and potential typos.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('single')}
              className={`${
                activeTab === 'single'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-4 px-6 text-sm font-medium border-b-2`}
            >
              Single Email Validation
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`${
                activeTab === 'bulk'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-4 px-6 text-sm font-medium border-b-2`}
            >
              Bulk Validation
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'single' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="flex">
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter an email address to validate"
                    className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                  />
                  <button
                    onClick={handleSingleValidation}
                    disabled={isLoading}
                    className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90 transition-colors disabled:bg-primary/60"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Validating...</span>
                      </div>
                    ) : "Validate"}
                  </button>
                </div>
              </div>
              
              {renderSingleResultCard()}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Addresses
                </label>
                <textarea
                  id="emails"
                  placeholder="Enter multiple email addresses separated by commas, semicolons, or new lines"
                  className="w-full h-40 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">
                  You can paste from Excel, CSV files, or type manually. Separate emails with commas, semicolons, or new lines.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleBulkValidation}
                  disabled={isLoading}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:bg-primary/60"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </div>
                  ) : "Validate Emails"}
                </button>
              </div>
              
              {renderBulkResultsCard()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
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
  
  // States for modals
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  
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
            <ClientCampaigns onCreateCampaign={() => setShowCreateCampaignModal(true)} />
          </Route>
          <Route path="/client-contacts">
            <ClientContacts onAddContact={() => setShowAddContactModal(true)} />
          </Route>
          <Route path="/client-lists">
            <ClientLists onCreateList={() => setShowCreateListModal(true)} />
          </Route>
          <Route path="/client-templates">
            <ClientTemplates onCreateTemplate={() => setShowCreateTemplateModal(true)} />
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
        
        {/* Modals */}
        {showCreateCampaignModal && 
          <CreateCampaignModal isOpen={showCreateCampaignModal} onClose={() => setShowCreateCampaignModal(false)} />
        }
        {showAddContactModal && 
          <AddContactModal isOpen={showAddContactModal} onClose={() => setShowAddContactModal(false)} />
        }
        {showCreateListModal && 
          <CreateListModal isOpen={showCreateListModal} onClose={() => setShowCreateListModal(false)} />
        }
        {showCreateTemplateModal && 
          <CreateTemplateModal isOpen={showCreateTemplateModal} onClose={() => setShowCreateTemplateModal(false)} />
        }
      </main>
    </div>
  );
}