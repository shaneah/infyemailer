import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define Contact type
type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  tags: string[];
  dateAdded: string;
  engagement?: number;
  lastActive?: string;
  source?: string;
  avatar?: string;
  notes?: string;
};

// Define Props type
interface ClientContactsProps {
  onAddContact: () => void;
}

const ClientContacts: React.FC<ClientContactsProps> = ({ onAddContact }) => {
  // Enhanced state management
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'engagement'>('date');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showContactDetails, setShowContactDetails] = useState<number | null>(null);
  const [filterDate, setFilterDate] = useState<'all' | 'last30days'>('all');
  const { toast } = useToast();

  // Sample contacts data with enhanced engagement metrics
  const contacts: Contact[] = [
    {
      id: 1,
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@example.com',
      status: 'Active',
      tags: ['VIP', 'Customer'],
      dateAdded: '2025-03-01',
      engagement: 82,
      lastActive: '2025-04-18',
      source: 'Website',
      avatar: 'https://i.pravatar.cc/150?img=1',
      notes: 'Regular customer, interested in premium features.'
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.w@example.com',
      status: 'Active',
      tags: ['Prospect'],
      dateAdded: '2025-03-10',
      engagement: 45,
      lastActive: '2025-04-15',
      source: 'Referral',
      avatar: 'https://i.pravatar.cc/150?img=5',
      notes: 'Follow up about enterprise plan.'
    },
    {
      id: 3,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@example.com',
      status: 'Inactive',
      tags: ['Customer'],
      dateAdded: '2025-02-15',
      engagement: 12,
      lastActive: '2025-03-01',
      source: 'Trade Show',
      avatar: 'https://i.pravatar.cc/150?img=3',
      notes: 'Last purchase 6 months ago.'
    },
    {
      id: 4,
      firstName: 'Jessica',
      lastName: 'Brown',
      email: 'jessica.b@example.com',
      status: 'Unsubscribed',
      tags: ['Former Customer'],
      dateAdded: '2025-01-15',
      engagement: 0,
      lastActive: '2025-02-10',
      source: 'Website',
      avatar: 'https://i.pravatar.cc/150?img=9',
      notes: 'Unsubscribed after 1 year.'
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.miller@example.com',
      status: 'Active',
      tags: ['VIP', 'Early Adopter'],
      dateAdded: '2025-04-01',
      engagement: 95,
      lastActive: '2025-04-18',
      source: 'Partner Referral',
      avatar: 'https://i.pravatar.cc/150?img=4',
      notes: 'Provided detailed product feedback.'
    },
    {
      id: 6,
      firstName: 'Emily',
      lastName: 'Wilson',
      email: 'emily.w@example.com',
      status: 'Active',
      tags: ['Newsletter'],
      dateAdded: '2025-03-28',
      engagement: 38,
      lastActive: '2025-04-10',
      source: 'Blog Signup',
      avatar: 'https://i.pravatar.cc/150?img=7',
      notes: 'Interested in content marketing.'
    },
    {
      id: 7,
      firstName: 'Robert',
      lastName: 'Taylor',
      email: 'robert.t@example.com',
      status: 'Bounced',
      tags: ['Lead'],
      dateAdded: '2025-02-20',
      engagement: 0,
      lastActive: undefined,
      source: 'LinkedIn',
      avatar: 'https://i.pravatar.cc/150?img=12',
      notes: 'Email invalid.'
    },
    {
      id: 8,
      firstName: 'Jennifer',
      lastName: 'Garcia',
      email: 'jennifer.g@example.com',
      status: 'Active',
      tags: ['Customer', 'Technical'],
      dateAdded: '2025-03-15',
      engagement: 76,
      lastActive: '2025-04-17',
      source: 'Webinar',
      avatar: 'https://i.pravatar.cc/150?img=6',
      notes: 'Developer at ABC Corp.'
    },
  ];

  // Contact statistics
  const totalContacts = contacts.length;
  const activeContacts = contacts.filter(c => c.status === 'Active').length;
  const inactiveContacts = contacts.filter(c => c.status === 'Inactive').length;
  const unsubscribedContacts = contacts.filter(c => c.status === 'Unsubscribed').length;
  const bouncedContacts = contacts.filter(c => c.status === 'Bounced').length;

  // Generate all unique tags
  const allTags = Array.from(new Set(contacts.flatMap(contact => contact.tags)));
  
  // Helper function to get engagement color based on engagement score
  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-emerald-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Helper function to format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Handle file import
  const handleFileImport = (file: File) => {
    setIsLoading(true);
    setImportStatus('Importing...');
    
    // Mock file import process
    setTimeout(() => {
      setIsLoading(false);
      setImportStatus('Import completed: ' + file.name);
      toast({
        title: "Import successful",
        description: `Imported ${Math.floor(Math.random() * 50) + 10} contacts from ${file.name}`,
      });
    }, 1500);
  };
  
  // Filter contacts based on search and filters
  const filteredContacts = contacts.filter(contact => {
    // Search in name, email, and notes
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchTerm.toLowerCase()) || 
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.notes && contact.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by status
    const matchesStatus = filterStatus === '' || contact.status === filterStatus;
    
    // Filter by tag
    const matchesTag = filterTag === '' || contact.tags.includes(filterTag);
    
    // Filter by date
    let matchesDate = true;
    if (filterDate === 'last30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const contactDate = new Date(contact.dateAdded);
      matchesDate = contactDate >= thirtyDaysAgo;
    }
    
    return matchesSearch && matchesStatus && matchesTag && matchesDate;
  });
  
  // Sort filtered contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'date':
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      case 'engagement':
        return (b.engagement || 0) - (a.engagement || 0);
      default:
        return 0;
    }
  });
  
  // Handle select all contacts
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContacts(sortedContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };
  
  // Handle select individual contact
  const handleSelectContact = (id: number) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };
  
  // Handle view contact details
  const handleViewContact = (id: number) => {
    setShowContactDetails(id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with blue gradient styling to match other client pages */}
      <div className="w-full bg-gradient-to-r from-blue-500 to-blue-700">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Contacts</h1>
              <p className="text-blue-100 text-sm">Manage your contact lists and audiences</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 animate-fadeIn">
        {/* Main content with enhanced styling and gradient */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Contacts
            </h1>
            <p className="text-gray-500 text-sm">Manage your audience and track engagement</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
                viewMode === 'table' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
                viewMode === 'card' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="file"
                id="contactsImport"
                accept=".csv,.xlsx,.xls"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileImport(e.target.files[0]);
                  }
                }}
              />
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Import</span>
              </button>
            </div>
            
            <button 
              onClick={onAddContact}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
              </svg>
              <span>Add Contact</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Contact Analytics Dashboard */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 mb-6 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Contact Stats */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Contact Analytics</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className="flex justify-between">
                  <p className="text-xs font-medium text-indigo-600 uppercase">Total Contacts</p>
                </div>
                <div className="mt-2 flex items-baseline">
                  <p className="text-2xl font-bold text-gray-800">{totalContacts}</p>
                  <p className="ml-2 text-xs text-gray-500">contacts</p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex justify-between">
                  <p className="text-xs font-medium text-green-600 uppercase">Active</p>
                  <span className="bg-green-100 text-green-600 text-xs px-2 rounded-full">
                    {Math.round((activeContacts / totalContacts) * 100)}%
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-800">{activeContacts}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="flex justify-between">
                  <p className="text-xs font-medium text-yellow-600 uppercase">Inactive</p>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-800">{inactiveContacts + unsubscribedContacts}</p>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-3">
                <div className="flex justify-between">
                  <p className="text-xs font-medium text-red-600 uppercase">Bounced</p>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-800">{bouncedContacts}</p>
                </div>
              </div>
            </div>
            
            {/* Engagement Overview */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Engagement Distribution</h4>
                <span className="text-xs text-gray-500">Based on open rates, clicks and activity</span>
              </div>
              
              <div className="bg-gray-100 h-7 rounded-full overflow-hidden flex">
                <div className="h-full bg-green-500" style={{ width: '45%' }}></div>
                <div className="h-full bg-emerald-500" style={{ width: '20%' }}></div>
                <div className="h-full bg-yellow-500" style={{ width: '15%' }}></div>
                <div className="h-full bg-orange-500" style={{ width: '10%' }}></div>
                <div className="h-full bg-red-500" style={{ width: '10%' }}></div>
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>High (45%)</span>
                <span>Medium (35%)</span>
                <span>Low (20%)</span>
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="md:w-1/3 border-l border-gray-100 pl-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Tag Overview</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {allTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all 
                    ${filterTag === tag 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {tag}
                  <span className="ml-1 text-xs opacity-70">
                    ({contacts.filter(c => c.tags.includes(tag)).length})
                  </span>
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">Top Engaged Contacts</h3>
              <div className="space-y-2">
                {[...contacts]
                  .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
                  .slice(0, 3)
                  .map(contact => (
                    <div key={`top-${contact.id}`} className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full overflow-hidden">
                        <img src={contact.avatar} alt={`${contact.firstName} ${contact.lastName}`} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{contact.firstName} {contact.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                      </div>
                      <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${getEngagementColor(contact.engagement || 0)}`} style={{ width: `${contact.engagement}%` }}></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="searchContacts" className="block text-sm font-medium text-gray-700 mb-1">Search Contacts</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                id="searchContacts"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts by name, email or notes..." 
                className="pl-10 w-full rounded-lg border border-gray-300 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Unsubscribed">Unsubscribed</option>
                <option value="Bounced">Bounced</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Date Added</label>
              <select
                id="dateFilter"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value as 'all' | 'last30days')}
                className="w-full rounded-lg border border-gray-300 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Time</option>
                <option value="last30days">Last 30 Days</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'status' | 'engagement')}
                className="w-full rounded-lg border border-gray-300 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="name">Name</option>
                <option value="date">Date Added</option>
                <option value="status">Status</option>
                <option value="engagement">Engagement</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Selected count and actions */}
        {selectedContacts.length > 0 && (
          <div className="bg-indigo-50 rounded-lg p-3 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-indigo-700 font-medium">{selectedContacts.length} contacts selected</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-white text-gray-700 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50">
                Add to List
              </button>
              <button className="px-3 py-1.5 bg-white text-gray-700 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50">
                Export
              </button>
              <button className="px-3 py-1.5 bg-white text-red-600 rounded border border-gray-300 text-sm font-medium hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        )}
        
        {/* Results count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{sortedContacts.length}</span> {sortedContacts.length === 1 ? 'contact' : 'contacts'}
            {(filterStatus || searchTerm || filterTag || filterDate !== 'all') && ' with applied filters'}
          </p>
          
          {(filterStatus || searchTerm || filterTag || filterDate !== 'all') && (
            <button 
              onClick={() => {
                setFilterStatus('');
                setSearchTerm('');
                setFilterTag('');
                setFilterDate('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
        
        {/* Table View */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left">
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        checked={selectedContacts.length === sortedContacts.length && sortedContacts.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 rounded"
                      />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedContacts.map(contact => (
                  <tr 
                    key={contact.id} 
                    className={`hover:bg-gray-50 ${selectedContacts.includes(contact.id) ? 'bg-indigo-50/40' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <input 
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                        className="h-4 w-4 text-indigo-600 rounded"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                          <img src={contact.avatar} alt={`${contact.firstName} ${contact.lastName}`} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${contact.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          contact.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' : 
                          contact.status === 'Unsubscribed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'}`}
                      >
                        {contact.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden mr-2">
                          <div className={`h-full ${getEngagementColor(contact.engagement || 0)}`} style={{ width: `${contact.engagement}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{contact.engagement}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contact.dateAdded)}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewContact(contact.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Card View */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedContacts.map(contact => (
              <div 
                key={contact.id} 
                className={`bg-white rounded-lg overflow-hidden border transition-all ${
                  selectedContacts.includes(contact.id) 
                    ? 'border-indigo-300 ring-2 ring-indigo-100 shadow-md' 
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="px-4 pt-4 pb-2 flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <input 
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                      className="h-4 w-4 text-indigo-600 rounded mt-1"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</h3>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${contact.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      contact.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' : 
                      contact.status === 'Unsubscribed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'}`}
                  >
                    {contact.status}
                  </span>
                </div>
                
                <div className="px-4 py-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Engagement</span>
                    <span className="text-xs font-medium">{contact.engagement}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getEngagementColor(contact.engagement || 0)}`} 
                      style={{ width: `${contact.engagement}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="px-4 py-2">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {contact.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-1 flex items-center justify-between">
                    <div>Added: {formatDate(contact.dateAdded)}</div>
                    <div>{contact.source}</div>
                  </div>
                  
                  {contact.lastActive && (
                    <div className="text-xs text-gray-500 mb-2">
                      Last active: {formatDate(contact.lastActive)}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex justify-between">
                  <button 
                    onClick={() => handleViewContact(contact.id)}
                    className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
                  >
                    View Details
                  </button>
                  <button className="text-gray-600 text-sm font-medium hover:text-gray-800">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Contact Detail Drawer */}
      {showContactDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-screen overflow-y-auto shadow-xl transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">Contact Details</h2>
                <button 
                  onClick={() => setShowContactDetails(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {contacts.filter(c => c.id === showContactDetails).map(contact => (
                <div key={contact.id}>
                  <div className="flex items-center mb-6">
                    <div className="h-16 w-16 rounded-full overflow-hidden mr-4">
                      <img src={contact.avatar} alt={`${contact.firstName} ${contact.lastName}`} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{contact.firstName} {contact.lastName}</h3>
                      <p className="text-gray-600">{contact.email}</p>
                      <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${contact.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          contact.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' : 
                          contact.status === 'Unsubscribed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'}`}
                      >
                        {contact.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-indigo-700 uppercase">Engagement Score</p>
                      <div className="mt-1 flex items-center">
                        <span className="text-2xl font-bold text-gray-900">{contact.engagement}%</span>
                        <div className="ml-2 h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${getEngagementColor(contact.engagement || 0)}`} style={{ width: `${contact.engagement}%` }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-700 uppercase">Last Active</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{formatDate(contact.lastActive || null)}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 py-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 py-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Email Address</p>
                        <p className="text-sm text-gray-900">{contact.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Source</p>
                        <p className="text-sm text-gray-900">{contact.source || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date Added</p>
                        <p className="text-sm text-gray-900">{formatDate(contact.dateAdded)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {contact.notes && (
                    <div className="border-t border-gray-200 py-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{contact.notes}</p>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-6 flex gap-3">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
                      Edit Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ClientContacts;