import React from 'react';
import { Link, useLocation } from "wouter";
import { Mail, LayoutDashboard, Megaphone, FileText, Users, Building, BarChart2, Activity, Split, Globe, Settings as SettingsIcon, ShieldCheck, LogOut, CheckCircle2, ServerCog } from "lucide-react";
import infyLogo from "../assets/Logo-white.png";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div
      id="sidebar"
      className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 transform fixed z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:w-64 h-screen bg-[#0c2f6c] overflow-y-auto no-scrollbar shrink-0`}
    >
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
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              href="/campaigns" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/campaigns' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <Megaphone className="h-5 w-5 mr-3" />
              Campaigns
            </Link>
          </li>

          <li>
            <Link 
              href="/templates" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/templates' || location.includes('/template-builder')
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <FileText className="h-5 w-5 mr-3" />
              Templates
            </Link>
          </li>
          <li>
            <Link 
              href="/contacts" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/contacts' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <Users className="h-5 w-5 mr-3" />
              Contacts
            </Link>
          </li>

          <li>
            <Link 
              href="/client-users" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/client-users' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <Users className="h-5 w-5 mr-3" />
              Client Users
            </Link>
          </li>
          <li>
            <Link 
              href="/analytics" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/analytics' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <BarChart2 className="h-5 w-5 mr-3" />
              Analytics
            </Link>
          </li>
          <li>
            <Link 
              href="/reporting" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/reporting' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <FileText className="h-5 w-5 mr-3" />
              Reporting
            </Link>
          </li>
          <li>
            <Link 
              href="/email-performance" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/email-performance' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <Activity className="h-5 w-5 mr-3" />
              <span className="flex-wrap">Email Performance</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/ab-testing" 
              className={`flex items-center px-2 py-2 rounded-md ${location.startsWith('/ab-testing') 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <Split className="h-5 w-5 mr-3" />
              A/B Testing
            </Link>
          </li>
          <li>
            <Link 
              href="/domains" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/domains' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <Globe className="h-5 w-5 mr-3" />
              Domains
            </Link>
          </li>
          <li>
            <Link 
              href="/settings" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/settings' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <SettingsIcon className="h-5 w-5 mr-3" />
              Settings
            </Link>
          </li>
          <li>
            <Link 
              href="/email-validation" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/email-validation' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <CheckCircle2 className="h-5 w-5 mr-3" />
              Email Validation
            </Link>
          </li>
          <li>
            <Link 
              href="/email-providers" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/email-providers' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <ServerCog className="h-5 w-5 mr-3" />
              Email Providers
            </Link>
          </li>
          <li>
            <Link 
              href="/admin" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/admin' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
            >
              <ShieldCheck className="h-5 w-5 mr-3" />
              Admin Panel
            </Link>
          </li>
        </ul>
        

        
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
    </div>
  );
};

export default Sidebar;
