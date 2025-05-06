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
            ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-600' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
        onClick={() => !collapsed && setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {React.cloneElement(icon as React.ReactElement, { 
            className: `h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}` 
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
            <div className="text-gray-500 ml-2">
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
      <div className="flex flex-col h-full w-64 bg-white text-gray-800 border-r border-gray-200 shadow-lg">
        <div className="flex flex-col flex-1 h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center">
              {!collapsed && (
                <div className="font-bold">
                  <span className="text-xl text-gray-900">Infy</span>
                  <span className="text-xl text-blue-600">Mailer</span>
                </div>
              )}
              {collapsed && (
                <div className="text-xl font-bold text-blue-600">
                  IM
                </div>
              )}
            </div>
          </div>
          
          {/* User Profile */}
          {!collapsed && (
            <div className="px-4 mb-6 mt-4">
              <div className="flex items-center text-gray-900 p-2 rounded-md bg-gray-100 border border-gray-200">
                <div className="relative rounded-full bg-blue-100 w-10 h-10 flex items-center justify-center mr-3 text-sm font-medium">
                  <span className="text-blue-600">AM</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Admin</div>
                  <div className="text-xs text-blue-600">System Administrator</div>
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="px-4 mb-6 mt-4 flex justify-center">
              <div className="relative rounded-full bg-blue-100 w-10 h-10 flex items-center justify-center text-sm font-medium">
                <span className="text-blue-600">AM</span>
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
                  ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                title="Dashboard"
              >
                <LayoutDashboard className={`h-5 w-5 mr-3 ${location === '/' || location === '/dashboard' ? 'text-blue-600' : 'text-gray-500'}`} />
                {!collapsed && <span>Dashboard</span>}
              </Link>
            </li>
            
            {/* Campaigns */}
            <li>
              <Link 
                href="/campaigns" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/campaigns' 
                  ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                title="Campaigns"
              >
                <Megaphone className={`h-5 w-5 mr-3 ${location === '/campaigns' ? 'text-blue-600' : 'text-gray-500'}`} />
                {!collapsed && <span>Campaigns</span>}
              </Link>
            </li>
            
            {/* Templates */}
            <li>
              <Link 
                href="/templates" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/templates' || location.includes('/template-builder')
                  ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                title="Templates"
              >
                <FileText className={`h-5 w-5 mr-3 ${location === '/templates' || location.includes('/template-builder') ? 'text-blue-600' : 'text-gray-500'}`} />
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
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                All Contacts
              </Link>
              
              {/* Contact Lists */}
              <Link 
                href="/contact-lists" 
                className={`block py-2 px-3 rounded-md ${location === '/contact-lists' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Contact Lists
              </Link>
            </SubMenu>
            
            {/* Client Management */}
            <li>
              <Link 
                href="/client-management" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/client-management' 
                  ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                title="Client Management"
              >
                <Building2 className={`h-5 w-5 mr-3 ${location === '/client-management' ? 'text-blue-600' : 'text-gray-500'}`} />
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
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Email Performance
              </Link>
              
              {/* A/B Testing */}
              <Link 
                href="/ab-testing" 
                className={`block py-2 px-3 rounded-md ${location.startsWith('/ab-testing') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
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
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Domains
              </Link>
            </SubMenu>
            
            {collapsed ? (
              <li className="border-t border-gray-200 my-2 pt-2">
                <div className="h-1"></div>
              </li>
            ) : (
              <li className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider mt-6 mb-2">
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
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Email Validation
              </Link>
              
              {/* Email Providers */}
              <Link 
                href="/email-providers" 
                className={`block py-2 px-3 rounded-md ${location === '/email-providers' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Email Providers
              </Link>
              
              {/* Email Test */}
              <Link 
                href="/email-test" 
                className={`block py-2 px-3 rounded-md ${location === '/email-test' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Email Test
              </Link>
            </SubMenu>
            
            {/* Client Collaboration Portal */}
            <li>
              <Link 
                href="/client-collaboration" 
                className={`flex items-center px-3 py-2 rounded-md ${location === '/client-collaboration' || location.includes('/client-collaboration/')
                  ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                title="Client Collaboration Portal"
              >
                <HandshakeIcon className={`h-5 w-5 mr-3 ${location === '/client-collaboration' || location.includes('/client-collaboration/') ? 'text-blue-600' : 'text-gray-500'}`} />
                {!collapsed && <span>Client Collaboration</span>}
              </Link>
            </li>
            
            {collapsed ? (
              <li className="border-t border-gray-200 my-2 pt-2">
                <div className="h-1"></div>
              </li>
            ) : (
              <li className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Administration
              </li>
            )}
            
            {/* Admin section */}
            <SubMenu 
              title="Administration" 
              icon={<ShieldCheck />} 
              collapsed={collapsed}
              isActive={location === '/user-management' || location === '/admin' || location === '/settings' || location === '/admin-monitoring' || location === '/admin-clients'}
              badge={{ count: 3, variant: 'warning' }}
            >
              {/* User Management */}
              <Link 
                href="/user-management" 
                className={`block py-2 px-3 rounded-md ${location === '/user-management' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                User Management
              </Link>
              
              {/* Admin Panel */}
              <Link 
                href="/admin" 
                className={`block py-2 px-3 rounded-md ${location === '/admin' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Admin Panel
              </Link>
              
              {/* Settings */}
              <Link 
                href="/settings" 
                className={`block py-2 px-3 rounded-md ${location === '/settings' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Settings
              </Link>
              
              {/* Admin Monitoring */}
              <Link 
                href="/admin-monitoring" 
                className={`block py-2 px-3 rounded-md ${location === '/admin-monitoring' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Activity Monitoring
              </Link>
              
              {/* Admin Clients */}
              <Link 
                href="/admin-clients" 
                className={`block py-2 px-3 rounded-md ${location === '/admin-clients' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Client Management
              </Link>
            </SubMenu>
            
            {/* Client Portal */}
            <li className="mt-6">
              <Link 
                href="/client-dashboard" 
                className={`flex items-center px-3 py-2 rounded-md border border-blue-200 ${location === '/client-dashboard' 
                  ? 'bg-gradient-to-r from-blue-50 to-white text-blue-600' 
                  : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                title="Client Portal"
              >
                <ExternalLink className="h-5 w-5 mr-3 text-blue-500" />
                {!collapsed && (
                  <div className="flex items-center">
                    <span>Client Portal</span>
                    <div className="relative ml-2">
                      <span className="absolute -inset-1 rounded-full bg-blue-100 animate-pulse opacity-75"></span>
                      <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500 inline-block"></span>
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
              className="flex items-center w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              title="Logout"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSidebar;