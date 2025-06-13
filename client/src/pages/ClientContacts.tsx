import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientSession } from '@/hooks/use-client-session';

// Define Contact type
type Contact = {
  id: number;
  name: string;
  email: string;
  status: string;
  clientId: number;
  createdAt: string;
  metadata?: any;
  tags?: string[];
  source?: string;
  notes?: string;
  engagement?: number;
  avatar?: string;
  lastActive?: string;
};

// Define Props type
interface ClientContactsProps {
  onAddContact: () => void;
}

const ClientContacts: React.FC<ClientContactsProps> = ({ onAddContact }) => {
  const { clientUser } = useClientSession();
  const clientId = clientUser?.clientId;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [showContactDetails, setShowContactDetails] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch contacts from API on mount
  useEffect(() => {
    const fetchContacts = async () => {
      if (!clientId) {
        console.log('No clientId available');
        return;
      }

      try {
        console.log('Fetching contacts for clientId:', clientId);
        const response = await fetch(`/api/client/contacts?clientId=${clientId}`);
        const data = await response.json();
        console.log('Received contacts:', data);
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch contacts',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [clientId, toast]);

  // All unique tags and statuses for filtering
  const allTags = Array.from(new Set(contacts.flatMap(contact => contact.tags || [])));
  const allStatuses = Array.from(new Set(contacts.map(contact => contact.status)));
  const allSources = Array.from(new Set(contacts.map(contact => contact.source).filter(Boolean)));
  
  // Contact metrics
  const totalContacts = contacts.length;
  const activeContacts = contacts.filter(c => c.status === 'Active').length;
  const inactiveContacts = contacts.filter(c => c.status === 'Inactive').length;
  const bouncedContacts = contacts.filter(c => c.status === 'Bounced').length;
  const unsubscribedContacts = contacts.filter(c => c.status === 'Unsubscribed').length;

  // Custom color mappings for statuses and tags
  const statusColors = {
    Active: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "bg-green-500"
    },
    Inactive: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: "bg-gray-500"
    },
    Bounced: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: "bg-red-500"
    },
    Unsubscribed: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "bg-yellow-500"
    }
  };

  // Generate CSS classes for engagement scores
  const getEngagementColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-emerald-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  // Handle file import function
  const handleFileImport = (file: File) => {
    console.log("Starting import for file:", file.name);
    setIsLoading(true);
    setImportStatus('Importing contacts...');
    
    // Simulate file import process
    setTimeout(() => {
      toast({
        title: "Import Complete",
        description: "Successfully imported 12 contacts. 3 duplicates were skipped.",
        variant: "default"
      });
      setIsLoading(false);
      setImportStatus(null);
    }, 2000);
  };
  
  // Filter and sort contacts based on current filters
  const filteredContacts = contacts.filter(contact => {
    let matchesSearch = true;
    let matchesStatus = true;
    let matchesTag = true;
    let matchesDate = true;
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matchesSearch = 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        (contact.notes ? contact.notes.toLowerCase().includes(searchLower) : false);
    }
    
    // Apply status filter
    if (filterStatus) {
      matchesStatus = contact.status === filterStatus;
    }
    
    // Apply tag filter
    if (filterTag) {
      matchesTag = contact.tags?.includes(filterTag) || false;
    }
    
    // Apply date filter
    if (dateFilter === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const contactDate = new Date(contact.createdAt);
      matchesDate = contactDate >= thirtyDaysAgo;
    }
    
    return matchesSearch && matchesStatus && matchesTag && matchesDate;
  });
  
  // Sort filtered contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="p-8 animate-fadeIn">
      {/* Header with enhanced styling and gradient */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
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
                    ({contacts.filter(c => c.tags?.includes(tag)).length})
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
                        <img src={contact.avatar} alt={`${contact.name}`} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
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
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts by name, email or notes..." 
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-700 appearance-none bg-white pr-8"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="">All Statuses</option>
              {allStatuses.map((status, idx) => (
                <option key={idx} value={status}>{status}</option>
              ))}
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-700 appearance-none bg-white pr-8"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date Added</option>
              <option value="status">Sort by Status</option>
              <option value="engagement">Sort by Engagement</option>
            </select>
            
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2.5 rounded-lg flex items-center gap-2 transition-colors text-sm ${
                showAdvancedFilters 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
          </div>
        </div>
        
        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Added</label>
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="recent">Last 30 Days</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Sources</option>
                  {allSources.map((source, idx) => (
                    <option key={idx} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Level</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Levels</option>
                  <option value="high">High (80-100%)</option>
                  <option value="medium">Medium (40-79%)</option>
                  <option value="low">Low (1-39%)</option>
                  <option value="none">None (0%)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Import Status */}
      {importStatus && (
        <div className="bg-indigo-50 rounded-lg p-3 mb-4 border border-indigo-200 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span className="text-sm text-indigo-700 font-medium">{importStatus}</span>
          </div>
        </div>
      )}
      
      {/* Selection Actions */}
      {contacts.length > 0 && selectedContacts.length === 0 && (
        <div className="bg-white rounded-lg p-3 mb-4 border border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            Showing <span className="font-medium">{sortedContacts.length}</span> of <span className="font-medium">{contacts.length}</span> contacts
          </span>
          <div className="flex gap-2">
            <button 
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedContacts(sortedContacts.map(c => c.id))}
            >
              Select All
            </button>
          </div>
        </div>
      )}
      
      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-3 mb-4 border border-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center">
              <span className="text-xs font-semibold text-indigo-700">{selectedContacts.length}</span>
            </div>
            <span className="text-sm text-indigo-700 font-medium">
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <button className="text-sm px-3 py-1.5 border border-indigo-300 rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 transition-colors">
              Add to List
            </button>
            <button className="text-sm px-3 py-1.5 border border-indigo-300 rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 transition-colors">
              Export
            </button>
            <button className="text-sm px-3 py-1.5 border border-red-300 rounded-lg bg-white text-red-700 hover:bg-red-50 transition-colors">
              Delete
            </button>
          </div>
        </div>
      )}
      
      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse h-48"></div>
              ))}
            </>
          ) : sortedContacts.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mx-auto bg-indigo-50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contacts Found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm || filterStatus || filterTag ? 
                  "No contacts match your current search criteria. Try adjusting your filters or search terms." : 
                  "You haven't added any contacts yet. Import existing contacts or add them manually."}
              </p>
              <button onClick={onAddContact} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Your First Contact
              </button>
            </div>
          ) : (
            sortedContacts.map(contact => {
              const statusStyle = statusColors[contact.status as keyof typeof statusColors] || statusColors.Inactive;
              
              return (
                <div key={contact.id} className="group bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden">
                  <div className="relative">
                    <div className={`h-3 w-full ${statusStyle.icon}`}></div>
                    
                    <div className="absolute right-3 top-6">
                      <div className="flex items-center space-x-1">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => handleSelectContact(contact.id)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-start mb-4">
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-3 border border-gray-200">
                        <img src={contact.avatar} alt={`${contact.name}`} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors duration-200">
                          {contact.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{contact.email}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Engagement</span>
                        <span className="text-xs font-medium text-gray-700">{contact.engagement || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${getEngagementColor(contact.engagement || 0)}`} 
                          style={{ width: `${contact.engagement || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        {contact.status}
                      </span>
                      {contact.tags?.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {contact.tags && contact.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          +{contact.tags.length - 2}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Added: {new Date(contact.createdAt).toLocaleDateString()}
                      </div>
                      {contact.lastActive && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Last active: {new Date(contact.lastActive).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-between">
                    <button 
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      onClick={() => handleViewContact(contact.id)}
                    >
                      View Details
                    </button>
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-800">
                      Edit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      
      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      onChange={handleSelectAll}
                      checked={selectedContacts.length === sortedContacts.length && sortedContacts.length > 0}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Engagement</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tags</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date Added</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : sortedContacts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      <div className="mx-auto bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">No contacts found</p>
                      <p className="text-sm text-gray-500">
                        {searchTerm || filterStatus || filterTag ? 
                          "Try adjusting your search or filters." : 
                          "Get started by adding your first contact."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  sortedContacts.map(contact => {
                    const statusStyle = statusColors[contact.status as keyof typeof statusColors] || statusColors.Inactive;
                    
                    return (
                      <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleSelectContact(contact.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden mr-3 border border-gray-200">
                              <img src={contact.avatar} alt={`${contact.name}`} className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{contact.name}</div>
                              {contact.source && <div className="text-xs text-gray-500">Source: {contact.source}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {contact.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                              <div 
                                className={`h-1.5 rounded-full ${getEngagementColor(contact.engagement || 0)}`} 
                                style={{ width: `${contact.engagement || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{contact.engagement || 0}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {contact.tags?.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                              onClick={() => handleViewContact(contact.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {sortedContacts.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedContacts.length}</span> of{" "}
                    <span className="font-medium">{contacts.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                      1
                    </button>
                    <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Contact Details Modal */}
      {showContactDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20" onClick={() => setShowContactDetails(null)}>
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          
          <div 
            className="relative bg-white rounded-xl shadow-xl max-w-xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {contacts.filter(c => c.id === showContactDetails).map(contact => {
              const statusStyle = statusColors[contact.status as keyof typeof statusColors] || statusColors.Inactive;
              
              return (
                <div key={contact.id} className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-200">
                        <img src={contact.avatar} alt={`${contact.name}`} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {contact.name}
                        </h2>
                        <p className="text-gray-600">{contact.email}</p>
                        <div className="flex mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            {contact.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowContactDetails(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Engagement Score</h3>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: getEngagementColor(contact.engagement || 0) }}></div>
                        <span className="text-lg font-bold text-gray-900">{contact.engagement || 0}%</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Source</h3>
                      <p className="text-gray-900">{contact.source || 'Unknown'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Added On</h3>
                      <p className="text-gray-900">{new Date(contact.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Last Active</h3>
                      <p className="text-gray-900">{contact.lastActive ? new Date(contact.lastActive).toLocaleDateString() : 'Never'}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags?.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {contact.notes && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-md border border-gray-100">{contact.notes}</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-3 rounded-b-xl border-t border-gray-100 flex justify-end gap-3">
                    <button 
                      onClick={() => setShowContactDetails(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
                    >
                      Close
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
                      Edit Contact
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientContacts;