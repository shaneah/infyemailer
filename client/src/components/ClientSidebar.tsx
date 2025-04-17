import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Mail, Users, ListChecks, FileText, BarChart3, LineChart,
  Globe, CheckSquare, SplitSquareVertical, Settings, LogOut, Menu, X, CreditCard
} from 'lucide-react';
import LogoWhite from '../assets/Logo-white.png';

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
      className={`group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-primary/20 text-white shadow-sm' 
          : 'text-blue-50 hover:bg-primary/10'
      }`}
    >
      <div className="flex items-center justify-center">
        <Icon size={19} className={`mr-3 transition-all ${active ? 'text-white' : 'text-blue-200 group-hover:text-white'}`} />
      </div>
      <span className={`font-medium ${active ? 'translate-x-0.5 transition-transform duration-200' : ''}`}>{label}</span>
      {active && <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full ml-0.5"></div>}
    </Link>
  );
};

const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="mb-5">
      <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/75">
        {title}
      </div>
      <nav className="mt-1.5 space-y-1 px-2">
        {children}
      </nav>
    </div>
  );
};

const ClientSidebar = ({ open, setOpen }: SidebarProps) => {
  const [location] = useLocation();
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
  
  useEffect(() => {
    // Get client info from session storage
    const clientUser = sessionStorage.getItem('clientUser');
    if (clientUser) {
      try {
        const userData = JSON.parse(clientUser);
        setClientName(userData.company || "");
        setClientId(userData.id || "");
      } catch (error) {
        console.error("Error parsing client user data", error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('clientUser');
    
    // Redirect to login
    window.location.href = '/client-login';
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
      
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-md bg-blue-900 text-white"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:h-screen lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        } h-full bg-gradient-to-b from-blue-950 to-blue-900 text-white flex flex-col shadow-xl`}
      >
        {/* Logo area */}
        <div className="p-5 flex flex-col items-center border-b border-blue-800/30">
          <div className="w-full flex items-center justify-center">
            <img 
              src={LogoWhite} 
              alt="InfyMailer Logo" 
              className="h-8" 
            />
          </div>
          <div className="mt-1.5 text-sm font-medium text-white/80 tracking-wide">Client Portal</div>
        </div>
        
        {/* Spacer */}
        <div className="p-1 border-b border-blue-800/30 bg-gradient-to-r from-blue-800/5 via-blue-700/10 to-blue-800/5">
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-1 min-h-0 h-0">
          <MenuSection title="Overview">
            <MenuItem 
              href="/client-dashboard" 
              icon={BarChart3} 
              label="Dashboard" 
              active={location === '/client-dashboard'} 
            />
            <MenuItem 
              href="/client-reports" 
              icon={BarChart3} 
              label="Reporting" 
              active={location === '/client-reports'} 
            />
            <MenuItem 
              href="/client-email-performance" 
              icon={LineChart} 
              label="Email Performance" 
              active={location === '/client-email-performance'} 
            />
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
        </div>
        
        {/* Footer actions */}
        <div className="mt-auto border-t border-blue-800/50">
          <Link
            href="/client-settings"
            className={`flex items-center px-4 py-3 text-sm transition-colors ${
              location === '/client-settings' 
                ? 'bg-blue-800 text-white' 
                : 'text-blue-100 hover:bg-blue-800/40'
            }`}
          >
            <Settings size={18} className={`mr-3 ${location === '/client-settings' ? 'text-amber-300' : ''}`} />
            <span>Account Settings</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm text-blue-100 hover:bg-blue-800/40 transition-colors group"
          >
            <LogOut size={18} className="mr-3 group-hover:text-amber-300" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ClientSidebar;