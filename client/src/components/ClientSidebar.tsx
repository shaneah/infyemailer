import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { LayoutDashboard, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ClientSidebar = ({ collapsed = false, setCollapsed }: SidebarProps) => {
  const [location] = useLocation();

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('token');
    
    // Redirect to login
    window.location.href = '/client-login';
  };

  return (
    <div className="h-full bg-gradient-to-b from-teal-700 to-teal-800 text-white w-[190px] flex flex-col">
      {/* Logo area */}
      <div className="p-4 flex items-center border-b border-teal-600">
        <img 
          src="/client/src/assets/Logo-white.png" 
          alt="InfyMailer Logo" 
          className="h-6 mr-2" 
        />
        <div className="font-semibold text-white">Client Portal</div>
      </div>
      
      {/* Client ID */}
      <div className="px-4 py-2 text-xs text-teal-200 border-b border-teal-600">
        client1
      </div>
      
      {/* Navigation */}
      <div className="flex-1">
        <nav className="space-y-1 p-2">
          <Link 
            href="/client-dashboard" 
            className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${location === '/client-dashboard' 
              ? 'bg-teal-600 text-white' 
              : 'text-teal-100 hover:bg-teal-600/50'}`}
          >
            <LayoutDashboard size={18} className="mr-2" />
            <span>Dashboard</span>
          </Link>
          
          {/* Add more menu items as needed */}
        </nav>
      </div>
      
      {/* Footer actions */}
      <div className="mt-auto border-t border-teal-600">
        <Link
          href="/client-settings"
          className={`flex items-center px-4 py-3 text-sm transition-colors ${location === '/client-settings' 
            ? 'bg-teal-600 text-white' 
            : 'text-teal-100 hover:bg-teal-600/50'}`}
        >
          <Settings size={18} className="mr-2" />
          <span>Account Settings</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm text-teal-100 hover:bg-teal-600/50 transition-colors"
        >
          <LogOut size={18} className="mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ClientSidebar;