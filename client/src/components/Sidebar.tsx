import { Link, useLocation } from "wouter";
import { Mail, LayoutDashboard, Megaphone, FileText, Users, Building, BarChart2, Activity, Split, Globe, Settings as SettingsIcon, ShieldCheck, LogOut } from "lucide-react";
import infyLogo from "../assets/Logo-white.png";
import { apiRequest } from "../lib/queryClient";

interface SidebarProps {
  open: boolean;
}

const Sidebar = ({ open }: SidebarProps) => {
  const [location, setLocation] = useLocation();
  
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout');
      // Clear any stored user data
      localStorage.removeItem('user');
      // Redirect to login page
      setLocation('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <nav id="sidebar" className={`col-md-3 col-lg-2 d-md-block bg-[#2c2f33] sidebar ${open ? 'show' : ''}`} style={{ width: '205px', fontSize: '14px' }}>
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4">
          <Link href="/" className="text-white font-bold text-lg flex flex-col items-center">
            <img src={infyLogo} alt="Infinity Tech Logo" className="h-16 mb-2" />
            <span className="text-center">InfyMailer</span>
          </Link>
        </div>
        
        {/* User Profile */}
        <div className="px-4 mb-4">
          <div className="flex items-center text-white">
            <div className="rounded-full bg-gray-500 w-9 h-9 flex items-center justify-center mr-3 text-sm font-medium">
              AM
            </div>
            <div>
              <div className="font-medium">Aadi Mughal</div>
              <div className="text-xs text-gray-400">Pro Plan</div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <ul className="space-y-1 px-2 flex-grow">
          <li>
            <Link 
              href="/" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/' 
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              href="/campaigns" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/campaigns' 
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <Megaphone className="h-5 w-5 mr-3" />
              Campaigns
            </Link>
          </li>
          <li>
            <Link 
              href="/emails" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/emails' 
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <Mail className="h-5 w-5 mr-3" />
              Emails
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Link>
          </li>
          <li>
            <Link 
              href="/templates" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/templates' || location.includes('/template-builder')
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <FileText className="h-5 w-5 mr-3" />
              Templates
            </Link>
          </li>
          <li>
            <Link 
              href="/contacts" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/contacts' 
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <Users className="h-5 w-5 mr-3" />
              Contacts
            </Link>
          </li>
          <li>
            <Link 
              href="/clients" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/clients' 
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <Building className="h-5 w-5 mr-3" />
              Clients
            </Link>
          </li>
          <li>
            <Link 
              href="/analytics" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/analytics' 
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <BarChart2 className="h-5 w-5 mr-3" />
              Analytics
            </Link>
          </li>
          <li>
            <Link 
              href="/email-performance" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/email-performance' 
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <Activity className="h-5 w-5 mr-3" />
              <span className="flex-wrap">Email Performance</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/ab-testing" 
              className={`flex items-center px-2 py-2 rounded-md ${location.startsWith('/ab-testing') 
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <Split className="h-5 w-5 mr-3" />
              A/B Testing
            </Link>
          </li>
          <li>
            <Link 
              href="/domains" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/domains' 
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <Globe className="h-5 w-5 mr-3" />
              Domains
            </Link>
          </li>
          <li>
            <Link 
              href="/settings" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/settings' 
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <SettingsIcon className="h-5 w-5 mr-3" />
              Settings
            </Link>
          </li>
          <li>
            <Link 
              href="/admin" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/admin' 
                ? 'text-white border-l-4 border-primary bg-primary/10' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
            >
              <ShieldCheck className="h-5 w-5 mr-3" />
              Admin Panel
            </Link>
          </li>
        </ul>
        
        {/* Storage */}
        <div className="px-4 mb-4 mt-4">
          <div className="bg-primary/20 rounded-md p-4">
            <div className="text-white font-medium mb-2">Storage</div>
            <div className="bg-white/20 h-1.5 rounded-full mb-2">
              <div className="bg-white h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="text-gray-300 text-xs">65% of 10GB used</div>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="px-4 mb-6">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
