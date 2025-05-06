import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
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
  Settings,
  MessagesSquare,
  HandshakeIcon,
  ListOrdered,
  Mail,
  BarChart2
} from 'lucide-react';

// SubMenu Component
interface SubMenuProps {
  title: string;
  icon: React.ReactNode;
  collapsed: boolean;
  isActive: boolean;
  children: React.ReactNode;
  badge?: {
    count?: number;
    variant?: 'default' | 'warning' | 'success' | 'error';
    dot?: boolean;
    pulse?: boolean;
  };
}

const SubMenu: React.FC<SubMenuProps> = ({ 
  title, 
  icon, 
  collapsed, 
  isActive,
  children,
  badge
}) => {
  const [isOpen, setIsOpen] = useState(isActive);
  
  // Badge styling based on variant
  const getBadgeStyles = () => {
    const baseStyles = "flex items-center justify-center text-xs font-bold rounded-full";
    
    if (!badge) return baseStyles;
    
    if (badge.dot) {
      return `${baseStyles} h-2 w-2 ${
        badge.variant === 'warning' ? 'bg-amber-500' : 
        badge.variant === 'success' ? 'bg-emerald-500' : 
        badge.variant === 'error' ? 'bg-red-500' : 
        'bg-[#d4af37]'
      } ${badge.pulse ? 'animate-pulse' : ''}`;
    }
    
    const variant = badge.variant || 'default';
    return `${baseStyles} h-5 min-w-5 px-1 ${
      variant === 'warning' ? 'bg-amber-500' : 
      variant === 'success' ? 'bg-emerald-500' : 
      variant === 'error' ? 'bg-red-500' : 
      'bg-[#d4af37]'
    } text-white`;
  };
  
  return (
    <li>
      <div 
        className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer 
          ${isActive 
            ? 'text-white bg-gradient-to-r from-[#1e293b] to-transparent border-l-4 border-[#d4af37]' 
            : 'text-gray-300 hover:bg-[#1e293b]/50 hover:text-white'}`}
        onClick={() => !collapsed && setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {React.cloneElement(icon as React.ReactElement, { 
            className: `h-5 w-5 mr-3 ${isActive ? 'text-[#d4af37]' : ''}` 
          })}
          {!collapsed && <span>{title}</span>}
          
          {/* Badge - always shown for dots, only shown in expanded view for counters if not collapsed */}
          {badge && (badge.dot || (!collapsed && badge.count !== undefined)) && (
            <div className="relative ml-2">
              {badge.dot ? (
                <span className={getBadgeStyles()}></span>
              ) : (
                <span className={getBadgeStyles()}>
                  {badge.count && badge.count > 99 ? '99+' : badge.count}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          {/* Badge for collapsed view - only show counters */}
          {collapsed && badge && badge.count !== undefined && (
            <span className={getBadgeStyles()}>
              {badge.count && badge.count > 99 ? '99+' : badge.count}
            </span>
          )}
          
          {/* Chevron for expand/collapse */}
          {!collapsed && (
            <div className="text-gray-400 ml-2">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          )}
        </div>
      </div>
      
      {!collapsed && isOpen && (
        <div className="pl-10 mt-1 space-y-1">
          {children}
        </div>
      )}
    </li>
  );
};

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

  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Clear all storage
        sessionStorage.clear();
        localStorage.clear();
        
        // Redirect to login page
        window.location.href = '/auth';
      } else {
        console.error('Logout failed:', response.status);
        
        // Fallback - still try to clear session and redirect
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback - still try to clear session and redirect
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = '/auth';
    }
  };

  return (
    <div 
      className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:z-0`}
    >
      <div className="flex flex-col h-full w-64 bg-[#1e293b] text-gray-100 border-r border-gray-700 shadow-lg">
        <div className="flex flex-col flex-1 h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <div className="flex items-center">
              {!collapsed && (
                <div className="font-bold">
                  <span className="text-xl text-gray-100">Infy</span>
                  <span className="text-xl text-blue-400">Mailer</span>
                </div>
              )}
              {collapsed && (
                <div className="text-xl font-bold text-blue-400">
                  IM
                </div>
              )}
            </div>
          </div>
          
          {/* User Profile */}
          {!collapsed && (
            <div className="px-4 mb-6 mt-4">
              <div className="flex items-center text-gray-100 p-2 rounded-md bg-gray-800 border border-gray-700">
                <div className="relative rounded-full bg-blue-900 w-10 h-10 flex items-center justify-center mr-3 text-sm font-medium">
                  <span className="text-blue-200">AM</span>
                </div>
                <div>
                  <div className="font-medium text-gray-100">Admin</div>
                  <div className="text-xs text-blue-300">System Administrator</div>
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="px-4 mb-6 mt-4 flex justify-center">
              <div className="relative rounded-full bg-blue-900 w-10 h-10 flex items-center justify-center text-sm font-medium">
                <span className="text-blue-200">AM</span>
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
                  ? 'text-white bg-gradient-to-r from-[#1e293b] to-transparent border-l-4 border-[#d4af37]' 
                  : 'text-gray-300 hover:bg-[#1e293b]/50 hover:text-white'}`}
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
                  ? 'text-white bg-gradient-to-r from-[#1e293b] to-transparent border-l-4 border-[#d4af37]' 
                  : 'text-gray-300 hover:bg-[#1e293b]/50 hover:text-white'}`}
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
                  ? 'text-white bg-gradient-to-r from-[#1e293b] to-transparent border-l-4 border-[#d4af37]' 
                  : 'text-gray-300 hover:bg-[#1e293b]/50 hover:text-white'}`}
                title="Templates"
              >
                <FileText className={`h-5 w-5 mr-3 ${location === '/templates' || location.includes('/template-builder') ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Templates</span>}
              </Link>
            </li>
            
            {/* Contacts SubMenu */}
            <SubMenu 
              title="Contacts" 
              icon={<Users />} 
              collapsed={collapsed}
              isActive={location === '/contacts' || location === '/contact-lists'}
              badge={{ count: 2583, variant: 'default' }}
            >
              {/* All Contacts */}
              <Link 
                href="/contacts" 
                className={`block py-2 px-3 rounded-md ${location === '/contacts' 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                All Contacts
              </Link>
              
              {/* Contact Lists */}
              <Link 
                href="/contact-lists" 
                className={`block py-2 px-3 rounded-md ${location === '/contact-lists' 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                Contact Lists
              </Link>
            </SubMenu>
            
            {/* Client Management */}
            <li>
              <Link 
                href="/client-management" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/client-management' 
                  ? 'text-white bg-gradient-to-r from-[#1e293b] to-transparent border-l-4 border-[#d4af37]' 
                  : 'text-gray-300 hover:bg-[#1e293b]/50 hover:text-white'}`}
                title="Client Management"
              >
                <Building2 className={`h-5 w-5 mr-3 ${location === '/client-management' ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Client Management</span>}
              </Link>
            </li>
            
            {/* Analytics & Testing SubMenu */}
            <SubMenu 
              title="Analytics & Testing" 
              icon={<BarChart2 />} 
              collapsed={collapsed}
              isActive={location === '/email-performance' || location.startsWith('/ab-testing')}
              badge={{ count: 8, variant: 'success' }}
            >
              {/* Email Performance */}
              <Link 
                href="/email-performance" 
                className={`block py-2 px-3 rounded-md ${location === '/email-performance' 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                Email Performance
              </Link>
              
              {/* A/B Testing */}
              <Link 
                href="/ab-testing" 
                className={`block py-2 px-3 rounded-md ${location.startsWith('/ab-testing') 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                A/B Testing
              </Link>
            </SubMenu>
            
            {/* Infrastructure SubMenu */}
            <SubMenu 
              title="Infrastructure" 
              icon={<Globe />} 
              collapsed={collapsed}
              isActive={location === '/domains'}
            >
              {/* Domains */}
              <Link 
                href="/domains" 
                className={`block py-2 px-3 rounded-md ${location === '/domains' 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                Domains
              </Link>
            </SubMenu>
            
            {collapsed ? (
              <li className="border-t border-gray-700 my-2 pt-2">
                <div className="h-1"></div>
              </li>
            ) : (
              <li className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider mt-6 mb-2">
                Advanced Features
              </li>
            )}
            
            {/* Advanced Features */}
            {/* Email Tools SubMenu */}
            <SubMenu 
              title="Email Tools" 
              icon={<Mail />} 
              collapsed={collapsed}
              isActive={location === '/email-validation' || location === '/email-providers' || location === '/email-test'}
              badge={{ dot: true, variant: 'error', pulse: true }}
            >
              {/* Email Validation */}
              <Link 
                href="/email-validation" 
                className={`block py-2 px-3 rounded-md ${location === '/email-validation' 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                Email Validation
              </Link>
              
              {/* Email Providers */}
              <Link 
                href="/email-providers" 
                className={`block py-2 px-3 rounded-md ${location === '/email-providers' 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                Email Providers
              </Link>
              
              {/* Email Test */}
              <Link 
                href="/email-test" 
                className={`block py-2 px-3 rounded-md ${location === '/email-test' 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                Email Test
              </Link>
            </SubMenu>
            
            {/* Client Collaboration Portal */}
            <li>
              <Link 
                href="/client-collaboration" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/client-collaboration' || location.includes('/client-collaboration/')
                  ? 'text-white bg-gradient-to-r from-[#1e293b] to-transparent border-l-4 border-[#d4af37]' 
                  : 'text-gray-300 hover:bg-[#1e293b]/50 hover:text-white'}`}
                title="Client Collaboration Portal"
              >
                <HandshakeIcon className={`h-5 w-5 mr-3 ${location === '/client-collaboration' || location.includes('/client-collaboration/') ? 'text-[#d4af37]' : ''}`} />
                {!collapsed && <span>Client Collaboration</span>}
              </Link>
            </li>
            
            {collapsed ? (
              <li className="border-t border-gray-700 my-2 pt-2">
                <div className="h-1"></div>
              </li>
            ) : (
              <li className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider mt-6 mb-2">
                Administration
              </li>
            )}
            
            {/* Admin section */}
            <SubMenu 
              title="Administration" 
              icon={<ShieldCheck />} 
              collapsed={collapsed}
              isActive={location === '/user-management' || location === '/admin' || location === '/settings'}
              badge={{ count: 3, variant: 'warning' }}
            >
              {/* User Management */}
              <Link 
                href="/user-management" 
                className={`block py-2 px-3 rounded-md ${location === '/user-management' 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                User Management
              </Link>
              
              {/* Admin Dashboard */}
              <Link 
                href="/admin-dashboard" 
                className={`block py-2 px-3 rounded-md ${location === '/admin-dashboard' 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                Admin Dashboard
              </Link>
              
              {/* Admin Panel */}
              <Link 
                href="/admin" 
                className={`block py-2 px-3 rounded-md ${location === '/admin' 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                Admin Panel
              </Link>
              
              {/* Settings */}
              <Link 
                href="/settings" 
                className={`block py-2 px-3 rounded-md ${location === '/settings' 
                  ? 'text-[#d4af37] font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                Settings
              </Link>
            </SubMenu>
            
            {/* Client Portal */}
            <li className="mt-6">
              <Link 
                href="/client-dashboard" 
                className={`flex items-center px-3 py-2 rounded-md border border-gray-600 ${location === '/client-dashboard' 
                  ? 'bg-gradient-to-r from-blue-900 to-transparent text-blue-200' 
                  : 'bg-gradient-to-r from-gray-800 to-transparent text-blue-300 hover:from-blue-800/30'}`}
                title="Client Portal"
              >
                <ExternalLink className="h-5 w-5 mr-3 text-blue-400" />
                {!collapsed && (
                  <div className="flex items-center">
                    <span>Client Portal</span>
                    <div className="relative ml-2">
                      <span className="absolute -inset-1 rounded-full bg-blue-600/30 animate-pulse opacity-75"></span>
                      <span className="relative h-1.5 w-1.5 rounded-full bg-blue-400 inline-block"></span>
                    </div>
                  </div>
                )}
              </Link>
            </li>
          </ul>
          
          {/* Logout Button */}
          <div className="px-2 mt-4 mb-6">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-gray-100"
              title="Logout"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-400" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSidebar;