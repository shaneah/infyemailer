import React from 'react';
import { Link, useLocation } from "wouter";
import { Mail, LayoutDashboard, Megaphone, FileText, Users, Building, BarChart2, Activity, Split, Globe, Settings as SettingsIcon, ShieldCheck, LogOut, CheckCircle2, ServerCog, Building2, UserRound, Users as UsersIcon, UserPlus, SendHorizonal, MailOpen, ChevronsLeft, ChevronsRight } from "lucide-react";
import infyLogo from "../assets/Logo-white.png";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed?: boolean;
  setCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ open, setOpen, collapsed = false, setCollapsed }: SidebarProps) => {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleCollapse = () => {
    if (setCollapsed) {
      setCollapsed(!collapsed);
    }
  };
  
  return (
    <div
      id="sidebar"
      className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-300 transform fixed z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto ${collapsed ? 'lg:w-16' : 'lg:w-64'} h-screen bg-[#0c2f6c] overflow-y-auto no-scrollbar shrink-0`}
    >
      <div className="h-full flex flex-col">
        {/* Logo and Collapse Toggle */}
        <div className="px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-white font-bold text-lg flex flex-col items-center">
            <img src={infyLogo} alt="Infinity Tech Logo" className="h-16 mb-2" />
            {!collapsed && <span className="text-center">InfyMailer</span>}
          </Link>
          {!collapsed && setCollapsed && (
            <button 
              onClick={toggleCollapse}
              className="p-1 rounded-full text-white hover:bg-white/10"
              title="Collapse sidebar"
            >
              <ChevronsLeft className="h-5 w-5" />
            </button>
          )}
          {collapsed && setCollapsed && (
            <button 
              onClick={toggleCollapse}
              className="p-1 rounded-full text-white hover:bg-white/10"
              title="Expand sidebar"
            >
              <ChevronsRight className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* User Profile */}
        {!collapsed && (
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
        )}
        {collapsed && (
          <div className="px-4 mb-4 flex justify-center">
            <div className="rounded-full bg-gray-500 w-9 h-9 flex items-center justify-center text-sm font-medium text-white">
              AM
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <ul className="space-y-1 px-2 flex-grow">
          <li>
            <Link 
              href="/" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Dashboard"
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              {!collapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/campaigns" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/campaigns' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Campaigns"
            >
              <Megaphone className="h-5 w-5 mr-3" />
              {!collapsed && <span>Campaigns</span>}
            </Link>
          </li>

          <li>
            <Link 
              href="/templates" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/templates' || location.includes('/template-builder')
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Templates"
            >
              <FileText className="h-5 w-5 mr-3" />
              {!collapsed && <span>Templates</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/contacts" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/contacts' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Contacts"
            >
              <Users className="h-5 w-5 mr-3" />
              {!collapsed && <span>Contacts</span>}
            </Link>
          </li>

          <li>
            <Link 
              href="/client-users" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/client-users' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Client Users"
            >
              <Users className="h-5 w-5 mr-3" />
              {!collapsed && <span>Client Users</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/client-management" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/client-management' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Client Management"
            >
              <Building2 className="h-5 w-5 mr-3" />
              {!collapsed && <span>Client Management</span>}
            </Link>
          </li>

          <li>
            <Link 
              href="/reporting" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/reporting' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Reporting"
            >
              <FileText className="h-5 w-5 mr-3" />
              {!collapsed && <span>Reporting</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/email-performance" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/email-performance' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Email Performance"
            >
              <Activity className="h-5 w-5 mr-3" />
              {!collapsed && <span className="flex-wrap">Email Performance</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/ab-testing" 
              className={`flex items-center px-2 py-2 rounded-md ${location.startsWith('/ab-testing') 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="A/B Testing"
            >
              <Split className="h-5 w-5 mr-3" />
              {!collapsed && <span>A/B Testing</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/domains" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/domains' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Domains"
            >
              <Globe className="h-5 w-5 mr-3" />
              {!collapsed && <span>Domains</span>}
            </Link>
          </li>

          {/* Audience Personas removed as requested */}
          <li>
            <Link 
              href="/email-validation" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/email-validation' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Email Validation"
            >
              <CheckCircle2 className="h-5 w-5 mr-3" />
              {!collapsed && <span>Email Validation</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/email-providers" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/email-providers' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Email Providers"
            >
              <ServerCog className="h-5 w-5 mr-3" />
              {!collapsed && <span>Email Providers</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/emails" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/emails' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Emails"
            >
              <MailOpen className="h-5 w-5 mr-3" />
              {!collapsed && <span>Emails</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/email-test" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/email-test' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Email Test"
            >
              <SendHorizonal className="h-5 w-5 mr-3" />
              {!collapsed && <span>Email Test</span>}
            </Link>
          </li>

          <li>
            <Link 
              href="/admin" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/admin' 
                ? 'text-white border-l-4 border-white bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Admin Panel"
            >
              <ShieldCheck className="h-5 w-5 mr-3" />
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          </li>
        </ul>
        
        {/* Logout Button */}
        <div className="px-2 mt-4 mb-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-2 py-2 rounded-md text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-300" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;