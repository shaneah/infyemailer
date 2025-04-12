import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { DoorOpen, Bell, HelpCircle, Settings, LogOut, Mail, Users, BarChart2, FileText, Plus, Search, Menu, MenuSquare, LayoutSidebarIcon, PanelLeftClose, PanelLeftOpen, Sidebar as SidebarIcon } from 'lucide-react';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (collapsed: boolean) => void;
}

const Navbar = ({ 
  sidebarOpen, 
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed
}: NavbarProps) => {
  const [_, setLocation] = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  
  // Refs for dropdown containers
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user menu if click is outside
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      
      // Close notifications if click is outside
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      
      // Close help menu if click is outside
      if (showHelpMenu && helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setShowHelpMenu(false);
      }
      
      // Close create menu if click is outside
      if (showCreateMenu && createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications, showHelpMenu, showCreateMenu]);

  const toggleSidebarCollapse = () => {
    if (setSidebarCollapsed && sidebarCollapsed !== undefined) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <header className="sticky top-0 bg-white z-30 border-b border-gray-200 shadow-gold-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Hamburger menu for mobile and logo */}
          <div className="flex items-center">
            {/* Mobile hamburger menu */}
            <button
              className="text-[#1a3a5f] hover:text-[#d4af37] lg:hidden mr-3"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Desktop sidebar collapse toggle */}
            {setSidebarCollapsed && sidebarCollapsed !== undefined && (
              <button
                className="hidden lg:flex text-[#1a3a5f] hover:text-[#d4af37] mr-3"
                onClick={toggleSidebarCollapse}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <span className="sr-only">{sidebarCollapsed ? "Expand" : "Collapse"} sidebar</span>
                {sidebarCollapsed ? <PanelLeftOpen className="w-6 h-6" /> : <PanelLeftClose className="w-6 h-6" />}
              </button>
            )}
            
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-[#1a3a5f] to-[#d4af37] bg-clip-text text-transparent">InfyMailer</span>
            </div>
          </div>

          {/* Center - Main navigation menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="flex items-center text-[#1a3a5f] hover:text-[#d4af37] font-medium text-sm px-2 py-1">
              Dashboard
            </a>
            <a href="/campaigns" className="flex items-center text-[#1a3a5f] hover:text-[#d4af37] font-medium text-sm px-2 py-1">
              Campaigns
            </a>
            <a href="/templates" className="flex items-center text-[#1a3a5f] hover:text-[#d4af37] font-medium text-sm px-2 py-1">
              Templates
            </a>
            <a href="/contacts" className="flex items-center text-[#1a3a5f] hover:text-[#d4af37] font-medium text-sm px-2 py-1">
              Contacts
            </a>
            <a href="/analytics" className="flex items-center text-[#1a3a5f] hover:text-[#d4af37] font-medium text-sm px-2 py-1">
              Analytics
            </a>
          </nav>

          {/* Right side - User menu, notifications, create button, and client login */}
          <div className="flex items-center space-x-3">
            {/* Create button with dropdown */}
            <div className="relative" ref={createMenuRef}>
              <button 
                className="btn-blue-luxury rounded-full p-2 flex items-center"
                onClick={() => setShowCreateMenu(!showCreateMenu)}
              >
                <Plus size={18} className="text-white" />
              </button>
              
              {showCreateMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-gold-lg border border-gray-100 z-20">
                  <div className="py-1">
                    <a href="/campaigns/new" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Mail className="h-4 w-4 mr-2 text-[#1a3a5f]" />
                      <span>New Campaign</span>
                    </a>
                    <a href="/contacts/new" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Users className="h-4 w-4 mr-2 text-[#1a3a5f]" />
                      <span>New Contact</span>
                    </a>
                    <a href="/templates/new" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FileText className="h-4 w-4 mr-2 text-[#1a3a5f]" />
                      <span>New Template</span>
                    </a>
                    <a href="/reports/new" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <BarChart2 className="h-4 w-4 mr-2 text-[#1a3a5f]" />
                      <span>New Report</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="form-control-luxury py-1 pl-8 pr-4 rounded-full text-sm w-36 focus:w-48 transition-all"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Help button */}
            <div className="relative" ref={helpMenuRef}>
              <button 
                className="p-1.5 rounded-full text-[#1a3a5f] hover:bg-gray-100"
                onClick={() => setShowHelpMenu(!showHelpMenu)}
              >
                <HelpCircle size={20} />
              </button>
              
              {showHelpMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-gold-lg border border-gray-100 z-20">
                  <div className="py-1">
                    <a href="/support" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Help Center
                    </a>
                    <a href="/documentation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Documentation
                    </a>
                    <a href="/contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Contact Support
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button 
                className="p-1.5 rounded-full text-[#1a3a5f] hover:bg-gray-100 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-gold-lg border border-gray-100 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    <div className="px-4 py-3 bg-blue-50 border-l-4 border-blue-500">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-blue-600 font-medium">Campaign "Spring Newsletter" finished sending</p>
                          <p className="text-xs text-gray-500">5 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-700">New subscriber added to "VIP Customers"</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <BarChart2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-700">Weekly report is now available</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <a href="/notifications" className="text-xs text-[#1a3a5f] font-medium hover:text-[#d4af37]">
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Client Portal Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden md:flex items-center gap-2 border-[#d4af37] text-[#1a3a5f] hover:bg-[rgba(212,175,55,0.1)] hover:text-[#d4af37]"
              onClick={(e) => {
                e.preventDefault();
                setLocation('/client-login');
              }}
            >
              <DoorOpen size={16} />
              Client Portal
            </Button>
            
            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button 
                className="inline-flex justify-center items-center group"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#1a3a5f] to-[#d4af37] flex items-center justify-center text-white font-medium text-sm">
                    AM
                  </div>
                  <span className="hidden md:block truncate ml-2 text-sm font-medium text-[#1a3a5f] group-hover:text-[#d4af37]">Aadi Mughal</span>
                  <svg className="hidden md:block w-3 h-3 shrink-0 ml-1 fill-current text-gray-400" viewBox="0 0 12 12">
                    <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                  </svg>
                </div>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-gold-lg border border-gray-100 z-20">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Aadi Mughal</p>
                      <p className="text-xs text-gray-500">admin@infymailer.com</p>
                    </div>
                    <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Your Profile
                    </a>
                    <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Settings</span>
                    </a>
                    <a href="/logout" className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      <LogOut className="h-4 w-4 mr-2 text-red-500" />
                      <span>Sign out</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
