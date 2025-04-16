import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  LayoutDashboard, Mail, Users, ListChecks, FileText, BarChart3, 
  Globe, CheckSquare, SplitSquareVertical, Settings, LogOut, Menu, X, CreditCard,
  ChevronLeft, ChevronRight
} from 'lucide-react';

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
      className={`group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors ${
        active 
          ? 'bg-teal-600 text-white' 
          : 'text-teal-100 hover:bg-teal-600/40'
      }`}
    >
      <div className="flex items-center justify-center">
        <Icon size={18} className={`mr-3 transition-all ${active ? 'text-white' : 'text-teal-200 group-hover:text-white'}`} />
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="mb-4">
      <div className="px-4 py-1 text-xs font-medium uppercase tracking-wider text-teal-300/80">
        {title}
      </div>
      <nav className="mt-1 space-y-0.5 px-2">
        {children}
      </nav>
    </div>
  );
};

const ClientSidebar = ({ open, setOpen }: SidebarProps) => {
  const [location] = useLocation();
  const [clientName, setClientName] = useState("TechSolutions");
  const [clientId, setClientId] = useState("tech1");
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mouseLeaveTimerRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Get client info from session storage
    const clientUser = sessionStorage.getItem('clientUser');
    if (clientUser) {
      try {
        const userData = JSON.parse(clientUser);
        setClientName(userData.company || "TechSolutions");
        setClientId(userData.id || "tech1");
      } catch (error) {
        console.error("Error parsing client user data", error);
      }
    }
  }, []);
  
  useEffect(() => {
    // Initialize sidebar collapsed state for desktop view
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(true); // Start with collapsed sidebar on desktop
        setIsExpanded(false); // Ensure sidebar starts collapsed
      } else {
        setIsCollapsed(false); // Mobile uses the default behavior
        setIsExpanded(false); // Reset expanded state
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsExpanded(true);
    
    // Clear any existing timer
    if (mouseLeaveTimerRef.current !== null) {
      window.clearTimeout(mouseLeaveTimerRef.current);
      mouseLeaveTimerRef.current = null;
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    
    // Add a small delay before collapsing
    mouseLeaveTimerRef.current = window.setTimeout(() => {
      setIsExpanded(false);
      mouseLeaveTimerRef.current = null;
    }, 300);
  };
  
  const toggleCollapse = () => {
    setIsExpanded(!isExpanded);
  };

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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
      
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-md bg-teal-700 text-white"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Sidebar trigger area - thin strip that's always visible */}
      <div 
        className="fixed inset-y-0 left-0 w-5 z-30 bg-gradient-to-r from-teal-700/20 to-transparent cursor-pointer hidden lg:block"
        onMouseEnter={handleMouseEnter}
      />
      
      {/* Collapsed state indicator */}
      {!isExpanded && isCollapsed && (
        <div className="fixed inset-y-0 left-5 z-30 flex items-center hidden lg:block pointer-events-none">
          <div className="w-1 h-10 bg-teal-500/50 rounded-r"></div>
          <ChevronRight size={16} className="text-teal-600/80 absolute -left-[5px]" />
        </div>
      )}
      
      {/* Collapse toggle button */}
      {isExpanded && (
        <button 
          onClick={toggleCollapse}
          className="fixed left-[252px] top-4 z-50 hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-teal-600/80 hover:bg-teal-500 text-white shadow-md transition-all"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out 
          ${!isCollapsed ? 'lg:translate-x-0' : isExpanded ? 'lg:translate-x-0' : 'lg:-translate-x-60'}
          ${open ? 'translate-x-0' : '-translate-x-full'}
          h-full bg-gradient-to-b from-teal-700 to-teal-800 text-white flex flex-col flex-shrink-0 shadow-xl`}
      >
        {/* Logo area */}
        <div className="p-4 flex flex-col items-center border-b border-teal-600/50">
          <div className="w-full flex items-center justify-center mt-1 mb-2">
            <img 
              src="/client/src/assets/Logo-white.png" 
              alt="InfyMailer Logo" 
              className="h-7" 
            />
          </div>
          <div className="font-semibold text-white">Client Portal</div>
        </div>
        
        {/* Client ID */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-teal-600/50 bg-teal-750/50">
          <div className="flex flex-col">
            <span className="text-teal-100 font-medium">{clientName}</span>
            <span className="text-xs text-teal-300/80">ID: {clientId}</span>
          </div>
          <div className="flex items-center bg-teal-600/30 px-2 py-1 rounded-md">
            <CreditCard size={14} className="text-teal-200 mr-1" />
            <span className="text-xs text-teal-100">Credits: 1,500</span>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          <MenuSection title="Overview">
            <MenuItem 
              href="/client-dashboard" 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={location === '/client-dashboard'} 
            />
            <MenuItem 
              href="/client-reports" 
              icon={BarChart3} 
              label="Reporting" 
              active={location === '/client-reports'} 
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
        <div className="mt-auto border-t border-teal-600/50">
          <Link
            href="/client-settings"
            className={`flex items-center px-4 py-3 text-sm transition-colors ${
              location === '/client-settings' 
                ? 'bg-teal-600 text-white' 
                : 'text-teal-100 hover:bg-teal-600/40'
            }`}
          >
            <Settings size={18} className="mr-3" />
            <span>Account Settings</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm text-teal-100 hover:bg-teal-600/40 transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ClientSidebar;