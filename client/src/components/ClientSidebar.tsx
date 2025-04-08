import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { LucideIcon } from 'lucide-react';
import { 
  BarChart, 
  Mail, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Globe,
  Bell,
  List,
  PieChart,
  Clipboard,
  Database
} from 'lucide-react';
import Logo from '@/assets/Logo-white.png';

const MenuItem = ({ icon: Icon, label, to, active, onClick }: { 
  icon: LucideIcon, 
  label: string, 
  to: string, 
  active: boolean,
  onClick?: () => void 
}) => {
  return (
    <Link href={to}>
      <div
        className={`flex items-center px-3 py-2 text-sm rounded-md mb-1 transition-colors ${
          active
            ? 'bg-primary text-white font-medium'
            : 'text-gray-200 hover:text-white hover:bg-primary/20'
        }`}
        onClick={onClick}
      >
        <Icon className="h-5 w-5 mr-2" />
        <span>{label}</span>
      </div>
    </Link>
  );
};

interface ClientSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ClientSidebar = ({ open, setOpen }: ClientSidebarProps) => {
  const [location, setLocation] = useLocation();
  const [clientUser, setClientUser] = useState<any>(null);
  
  // Get client user from session storage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('clientUser');
    if (storedUser) {
      try {
        setClientUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing client user from sessionStorage', error);
      }
    }
  }, []);
  
  const handleLogout = () => {
    sessionStorage.removeItem('clientUser');
    setLocation('/client-login');
  };
  
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-teal-700 to-teal-800 text-white shadow-xl transform lg:translate-x-0 lg:static lg:inset-auto lg:flex-shrink-0 transition-transform duration-200 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo and Close Button */}
        <div className="px-4 py-5 flex items-center justify-between">
          <div className="flex items-center">
            <img src={Logo} alt="InfyMailer Logo" className="h-8" />
            <span className="text-xl font-bold ml-2">Client Portal</span>
          </div>
          <button
            className="text-white/80 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Client Info */}
        {clientUser && (
          <div className="px-4 py-4 border-t border-teal-600 border-b">
            <div className="text-sm font-semibold text-teal-100">{clientUser.clientCompany}</div>
            <div className="text-xs text-teal-200">{clientUser.username}</div>
          </div>
        )}
        
        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <MenuItem 
            icon={BarChart} 
            label="Dashboard" 
            to="/client-dashboard" 
            active={location === '/client-dashboard'} 
          />
          
          {clientUser?.permissions?.campaigns && (
            <MenuItem 
              icon={Mail} 
              label="Campaigns" 
              to="/client-campaigns" 
              active={location === '/client-campaigns'} 
            />
          )}
          
          {clientUser?.permissions?.contacts && (
            <MenuItem 
              icon={Users} 
              label="Contacts" 
              to="/client-contacts" 
              active={location === '/client-contacts'} 
            />
          )}
          
          {clientUser?.permissions?.contacts && (
            <MenuItem 
              icon={List} 
              label="Lists" 
              to="/client-lists" 
              active={location === '/client-lists'} 
            />
          )}
          
          {clientUser?.permissions?.templates && (
            <MenuItem 
              icon={FileText} 
              label="Templates" 
              to="/client-templates" 
              active={location === '/client-templates'} 
            />
          )}
          
          {clientUser?.permissions?.reporting && (
            <MenuItem 
              icon={PieChart} 
              label="Reports" 
              to="/client-reports" 
              active={location === '/client-reports'} 
            />
          )}
          
          {clientUser?.permissions?.domains && (
            <MenuItem 
              icon={Globe} 
              label="Domains" 
              to="/client-domains" 
              active={location === '/client-domains'} 
            />
          )}
          
          {clientUser?.permissions?.emailValidation && (
            <MenuItem 
              icon={Clipboard} 
              label="Email Validation" 
              to="/client-email-validation" 
              active={location === '/client-email-validation'} 
            />
          )}
          
          {clientUser?.permissions?.abTesting && (
            <MenuItem 
              icon={Bell} 
              label="A/B Testing" 
              to="/client-ab-testing" 
              active={location === '/client-ab-testing'} 
            />
          )}
        </div>
        
        {/* Bottom Menu Items */}
        <div className="px-3 py-4 border-t border-teal-600">
          <MenuItem 
            icon={Settings} 
            label="Account Settings" 
            to="/client-settings" 
            active={location === '/client-settings'} 
          />
          
          <a
            className="flex items-center px-3 py-2 text-sm rounded-md text-gray-200 hover:text-white hover:bg-primary/20 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span>Logout</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ClientSidebar;