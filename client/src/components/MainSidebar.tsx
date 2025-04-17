import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Megaphone, 
  FileText, 
  Users, 
  Building2, 
  Activity, 
  Split, 
  Globe,
  UserCircle2,
  CheckCircle2,
  ServerCog,
  SendHorizonal,
  ShieldCheck,
  UserRound,
  ExternalLink,
  LogOut,
  Settings
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed?: boolean;
  setCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}

const MainSidebar = ({ open, setOpen, collapsed = false, setCollapsed }: SidebarProps) => {
  const [location] = useLocation();

  const handleToggleCollapsed = () => {
    if (setCollapsed) {
      setCollapsed(!collapsed);
    }
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('token');
    
    // Redirect to login
    window.location.href = '/auth';
  };

  return (
    <div 
      className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:z-0`}
    >
      <div className="flex flex-col h-full w-64 bg-gradient-to-b from-[#3a86ff] to-[#38b2ac] text-white border-r border-[#4299e1] shadow-lg">
        <div className="flex flex-col flex-1 h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]">
            <div className="flex items-center">
              {!collapsed && (
                <div className="font-bold">
                  <span className="text-xl text-white">Infy</span>
                  <span className="text-xl text-[#d4af37]">Mailer</span>
                </div>
              )}
              {collapsed && (
                <div className="text-xl font-bold text-[#d4af37]">
                  IM
                </div>
              )}
            </div>
            {/* Toggle Button */}
            <button
              onClick={handleToggleCollapsed}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#1e293b] focus:outline-none"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
          
          {/* User Profile */}
          {!collapsed && (
            <div className="px-4 mb-6 mt-4">
              <div className="flex items-center text-white p-2 rounded-md bg-[#1e293b]/50 backdrop-blur-sm border border-[#334155]/50">
                <div className="relative rounded-full bg-[#1a3a5f] w-10 h-10 flex items-center justify-center mr-3 text-sm font-medium">
                  <span className="text-[#d4af37]">AM</span>
                </div>
                <div>
                  <div className="font-medium text-white">Admin</div>
                  <div className="text-xs text-[#d4af37]">System Administrator</div>
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="px-4 mb-6 mt-4 flex justify-center">
              <div className="relative rounded-full bg-[#1a3a5f] w-10 h-10 flex items-center justify-center text-sm font-medium">
                <span className="text-[#d4af37]">AM</span>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <ul className="space-y-1 px-2 flex-grow">
            {/* Dashboard */}
            <li>
              <Link 
                href="/" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/' || location === '/dashboard' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Dashboard"
              >
                <LayoutDashboard className={`h-5 w-5 mr-3 ${location === '/' || location === '/dashboard' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Dashboard</span>}
              </Link>
            </li>
            
            {/* Campaigns */}
            <li>
              <Link 
                href="/campaigns" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/campaigns' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Campaigns"
              >
                <Megaphone className={`h-5 w-5 mr-3 ${location === '/campaigns' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Campaigns</span>}
              </Link>
            </li>
            
            {/* Templates */}
            <li>
              <Link 
                href="/templates" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/templates' || location.includes('/template-builder')
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Templates"
              >
                <FileText className={`h-5 w-5 mr-3 ${location === '/templates' || location.includes('/template-builder') ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Templates</span>}
              </Link>
            </li>
            
            {/* Contacts */}
            <li>
              <Link 
                href="/contacts" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/contacts' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Contacts"
              >
                <Users className={`h-5 w-5 mr-3 ${location === '/contacts' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Contacts</span>}
              </Link>
            </li>
            
            {/* Client Management */}
            <li>
              <Link 
                href="/client-management" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/client-management' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Client Management"
              >
                <Building2 className={`h-5 w-5 mr-3 ${location === '/client-management' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Client Management</span>}
              </Link>
            </li>
            
            {/* Email Performance */}
            <li>
              <Link 
                href="/email-performance" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/email-performance' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Email Performance"
              >
                <Activity className={`h-5 w-5 mr-3 ${location === '/email-performance' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Email Performance</span>}
              </Link>
            </li>
            
            {/* A/B Testing */}
            <li>
              <Link 
                href="/ab-testing" 
                className={`flex items-center px-3 py-2 rounded-md ${location.startsWith('/ab-testing') 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="A/B Testing"
              >
                <Split className={`h-5 w-5 mr-3 ${location.startsWith('/ab-testing') ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>A/B Testing</span>}
              </Link>
            </li>
            
            {/* Domains */}
            <li>
              <Link 
                href="/domains" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/domains' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Domains"
              >
                <Globe className={`h-5 w-5 mr-3 ${location === '/domains' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Domains</span>}
              </Link>
            </li>
            
            {collapsed ? (
              <li className="border-t border-[#1e293b] my-2 pt-2">
                <div className="h-1"></div>
              </li>
            ) : (
              <li className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Advanced Features
              </li>
            )}
            
            {/* Advanced Features */}
            
            {/* Audience Personas */}
            <li>
              <Link 
                href="/audience-personas" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/audience-personas' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Audience Personas"
              >
                <UserCircle2 className={`h-5 w-5 mr-3 ${location === '/audience-personas' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Audience Personas</span>}
              </Link>
            </li>
            
            {/* Email Validation */}
            <li>
              <Link 
                href="/email-validation" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/email-validation' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Email Validation"
              >
                <CheckCircle2 className={`h-5 w-5 mr-3 ${location === '/email-validation' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Email Validation</span>}
              </Link>
            </li>
            
            {/* Email Providers */}
            <li>
              <Link 
                href="/email-providers" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/email-providers' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Email Providers"
              >
                <ServerCog className={`h-5 w-5 mr-3 ${location === '/email-providers' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Email Providers</span>}
              </Link>
            </li>
            
            {/* Email Test */}
            <li>
              <Link 
                href="/email-test" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/email-test' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Email Test"
              >
                <SendHorizonal className={`h-5 w-5 mr-3 ${location === '/email-test' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Email Test</span>}
              </Link>
            </li>
            
            {collapsed ? (
              <li className="border-t border-[#1e293b] my-2 pt-2">
                <div className="h-1"></div>
              </li>
            ) : (
              <li className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Administration
              </li>
            )}
            
            {/* Admin section */}
            
            {/* User Management */}
            <li>
              <Link 
                href="/user-management" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/user-management' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="User Management"
              >
                <UserRound className={`h-5 w-5 mr-3 ${location === '/user-management' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>User Management</span>}
              </Link>
            </li>
            
            {/* Admin Clients link removed - using Client Management instead */}
            
            {/* Admin Panel */}
            <li>
              <Link 
                href="/admin" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/admin' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Admin Panel"
              >
                <ShieldCheck className={`h-5 w-5 mr-3 ${location === '/admin' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Admin Panel</span>}
              </Link>
            </li>
            
            {/* Settings */}
            <li>
              <Link 
                href="/settings" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/settings' 
                  ? 'text-white bg-gradient-to-r from-white/20 to-transparent border-l-4 border-white' 
                  : 'text-white hover:bg-white/10 hover:text-white'}`}
                title="Settings"
              >
                <Settings className={`h-5 w-5 mr-3 ${location === '/settings' ? 'text-white' : 'text-white/70'}`} />
                {!collapsed && <span>Settings</span>}
              </Link>
            </li>
            
            {/* Client Portal removed */}
          </ul>
          
          {/* Logout Button */}
          <div className="px-2 mt-4 mb-6">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 rounded-md text-white hover:bg-white/10 hover:text-white"
              title="Logout"
            >
              <LogOut className="h-5 w-5 mr-3 text-white/70" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSidebar;