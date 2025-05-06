import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Mail, Users, ListChecks, FileText, BarChart3, LineChart,
  Globe, CheckSquare, SplitSquareVertical, Settings, LogOut, Menu, X, CreditCard,
  ShieldAlert, Activity, Building2
} from 'lucide-react';
import Logo from '../assets/infy.png';
import LogoWhite from '@assets/Logo-white.png';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

const MenuItem = ({ href, icon: Icon, label, active }: { 
  href: string; 
  icon: React.ElementType; 
  label: string; 
  active: boolean 
}) => {
  return (
    <Link 
      href={href} 
      className={`group flex items-center px-3 py-2.5 text-sm rounded-md transition-all duration-150 ${
        active 
          ? 'bg-blue-100 text-blue-700 shadow-sm' 
          : 'text-gray-700 hover:bg-blue-50 hover:translate-x-1'
      }`}
    >
      <div className="flex items-center justify-center">
        <Icon 
          size={18} 
          className={`mr-3 transition-all duration-200 ${
            active 
              ? 'text-blue-600 scale-110' 
              : 'text-gray-500 group-hover:text-blue-500 group-hover:scale-110 transform'
          }`} 
        />
      </div>
      <span className={`font-medium transition-all duration-150 ${
        active 
          ? '' 
          : 'group-hover:font-semibold'
      }`}>{label}</span>
      {active && (
        <div className="ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-90 animate-pulse"></div>
        </div>
      )}
    </Link>
  );
};

const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="mb-4">
      <div className="px-4 py-1 text-xs font-medium uppercase tracking-wider text-gray-500 relative group">
        <span className="transition-all duration-300 group-hover:text-blue-600 group-hover:translate-x-0.5 inline-block">
          {title}
        </span>
        <div className="h-px w-0 bg-blue-200 absolute -bottom-0.5 left-4 transition-all duration-300 group-hover:w-12"></div>
      </div>
      <nav className="mt-1 space-y-0.5 px-2">
        {children}
      </nav>
    </div>
  );
};

const ClientSidebar = ({ isOpen = false, onClose, onLogout }: SidebarProps) => {
  const [location] = useLocation();
  const [clientName, setClientName] = useState<string>("My Company");
  
  // Fetch the client name from session storage on component mount
  useEffect(() => {
    try {
      const clientUserStr = sessionStorage.getItem('clientUser') || localStorage.getItem('clientUser');
      if (clientUserStr) {
        const clientUser = JSON.parse(clientUserStr);
        if (clientUser && clientUser.clientName) {
          setClientName(clientUser.clientName);
        }
      }
    } catch (error) {
      console.error("Error retrieving client name:", error);
    }
  }, []);

  // Use the provided onLogout callback or fallback to the internal implementation
  const handleLogout = async () => {
    if (onLogout) {
      // Use the provided logout handler from props
      onLogout();
    } else {
      try {
        // Fallback to internal implementation if no onLogout provided
        // Call client-specific logout API endpoint
        const response = await fetch('/api/client-logout', {
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
          
          // Redirect to client login page
          window.location.href = '/client-login';
        } else {
          console.error('Logout failed:', response.status);
          
          // Fallback - still try to clear session and redirect
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = '/client-login';
        }
      } catch (error) {
        console.error('Error during logout:', error);
        
        // Fallback - still try to clear session and redirect
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/client-login';
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ease-in-out lg:hidden ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => onClose && onClose()}
      ></div>
      
      {/* Mobile menu button */}
      <button
        onClick={() => onClose && onClose()}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-md bg-blue-600 text-white shadow-md transition-all duration-150 hover:bg-blue-700 hover:shadow-lg active:scale-95"
      >
        {isOpen ? (
          <X size={20} className="transition-all duration-200 animate-in fade-in rotate-in" />
        ) : (
          <Menu size={20} className="transition-all duration-200 animate-in fade-in" />
        )}
      </button>
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          isOpen ? 'translate-x-0 opacity-100 shadow-xl' : '-translate-x-full opacity-95 shadow-md'
        } h-full bg-white border-r border-gray-200 text-gray-800 flex flex-col flex-shrink-0`}
      >
        {/* App name and client name header */}
        <div className="flex flex-col items-center justify-center p-4 pt-6 pb-3 bg-white border-b border-gray-100 shadow-sm">
          <div className="w-12 h-12 mb-2 flex items-center justify-center bg-blue-800 rounded-full shadow-inner">
            <img src={LogoWhite} alt="Infinity Tech Logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="text-center">
            <h2 className="font-bold text-xl text-gray-800 mb-1">Infinity Tech</h2>
            <div className="flex items-center justify-center space-x-1.5 mb-1 bg-blue-50 px-2 py-1 rounded-full">
              <Building2 size={14} className="text-blue-500" />
              <p className="text-sm font-medium text-gray-700">{clientName}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          <MenuSection title="Overview">
            <MenuItem 
              href="/client-dashboard" 
              icon={BarChart3} 
              label="Dashboard" 
              active={location === '/client-dashboard'} 
            />
            <MenuItem 
              href="/client-email-performance" 
              icon={LineChart} 
              label="Email Performance" 
              active={location === '/client-email-performance'} 
            />
            {/* Temporarily removed until the reporting feature is fully implemented
            <MenuItem 
              href="/client-reporting" 
              icon={Activity} 
              label="Reporting" 
              active={location === '/client-reporting'} 
            />
            */}
          </MenuSection>
          
          <MenuSection title="Campaigns">
            <MenuItem 
              href="/client-campaigns" 
              icon={Mail} 
              label="Campaigns" 
              active={location === '/client-campaigns'} 
            />
            <MenuItem 
              href="/client-templates" 
              icon={FileText} 
              label="Templates" 
              active={location === '/client-templates'} 
            />
            <MenuItem 
              href="/client-ab-testing" 
              icon={SplitSquareVertical} 
              label="A/B Testing" 
              active={location === '/client-ab-testing'} 
            />
          </MenuSection>
          
          <MenuSection title="Audience">
            <MenuItem 
              href="/client-contacts" 
              icon={Users} 
              label="Contacts" 
              active={location === '/client-contacts'} 
            />
            <MenuItem 
              href="/client-lists" 
              icon={ListChecks} 
              label="Lists" 
              active={location === '/client-lists'} 
            />
          </MenuSection>
          
          <MenuSection title="Infrastructure">
            <MenuItem 
              href="/client-domains" 
              icon={Globe} 
              label="Domains" 
              active={location === '/client-domains'} 
            />
            <MenuItem 
              href="/client-email-validation" 
              icon={CheckSquare} 
              label="Email Validation" 
              active={location === '/client-email-validation'} 
            />
          </MenuSection>
          
          <MenuSection title="System">
            <MenuItem 
              href="/client-security" 
              icon={ShieldAlert} 
              label="Security" 
              active={location === '/client-security'} 
            />
            <MenuItem 
              href="/client-billing" 
              icon={CreditCard} 
              label="Billing & Credits" 
              active={location === '/client-billing'} 
            />
          </MenuSection>
        </div>
        
        {/* Footer actions */}
        <div className="mt-auto border-t border-gray-100">
          <Link
            href="/client-settings"
            className={`group flex items-center px-4 py-3 text-sm transition-all duration-150 ${
              location === '/client-settings' 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm'
            }`}
          >
            <Settings 
              size={18} 
              className={`mr-3 transition-all duration-200 ${
                location === '/client-settings' 
                  ? 'text-blue-500 rotate-90' 
                  : 'text-gray-500 group-hover:text-blue-500 group-hover:rotate-90'
              }`} 
            />
            <span className="font-medium group-hover:font-semibold transition-all duration-150">
              Account Settings
            </span>
            {location === '/client-settings' && (
              <div className="ml-auto">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-90 animate-pulse"></div>
              </div>
            )}
          </Link>
          
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <LogOut 
              size={18} 
              className="mr-3 transition-all duration-200 text-gray-500 group-hover:text-red-500 group-hover:translate-x-0.5" 
            />
            <span className="font-medium group-hover:font-semibold transition-all duration-150">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ClientSidebar;