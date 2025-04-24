import React from 'react';
import { Link, useLocation } from "wouter";
import { Mail, LayoutDashboard, Megaphone, FileText, Users, Building, BarChart2, Activity, Split, Globe, Settings as SettingsIcon, ShieldCheck, LogOut, CheckCircle2, ServerCog, Building2, UserRound, Users as UsersIcon, UserPlus, SendHorizonal, ChevronsLeft, ChevronsRight, UserCircle2, ExternalLink } from "lucide-react";
import infyLogo from "@assets/Infinity Tech Logo-04.png";
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
      className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-300 transform fixed z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto ${collapsed ? 'lg:w-16' : 'lg:w-64'} h-screen bg-[#1a3a5f]/95 backdrop-blur-md overflow-y-auto no-scrollbar shrink-0 shadow-xl border-r border-[#d4af37]/10`}
    >
      <div className="h-full flex flex-col">
        {/* Logo and Collapse Toggle */}
        <div className="px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-white font-bold text-lg flex flex-col items-center">
            <div className="w-full flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37] to-[#f5f0e1] rounded-full opacity-30 group-hover:opacity-50 blur-sm transition-all duration-300"></div>
                <div className="relative">
                  <img src={infyLogo} alt="InfyMailer Logo" className="h-12 w-auto object-contain" />
                </div>
              </div>
            </div>
            {!collapsed && <span className="text-center text-xl bg-gradient-to-r from-[#d4af37] to-[#f5f0e1] bg-clip-text text-transparent font-semibold mt-2">InfyMailer</span>}
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
          <div className="px-4 mb-6">
            <div className="flex items-center text-white p-2 rounded-md bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#d4af37]/20 transition-colors shadow-inner">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4af37] to-white/40 rounded-full opacity-70 blur-sm"></div>
                <div className="relative rounded-full bg-[#1a3a5f] w-10 h-10 flex items-center justify-center mr-3 text-sm font-medium border border-[#d4af37]/30">
                  <span className="text-[#d4af37]">AM</span>
                </div>
              </div>
              <div>
                <div className="font-medium text-white">Aadi Mughal</div>
                <div className="text-xs flex items-center">
                  <span className="text-[#d4af37] mr-1.5">Pro Plan</span>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d4af37]"></span>
                </div>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="px-4 mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4af37] to-white/40 rounded-full opacity-70 blur-sm"></div>
              <div className="relative rounded-full bg-[#1a3a5f] w-10 h-10 flex items-center justify-center text-sm font-medium border border-[#d4af37]/30">
                <span className="text-[#d4af37]">AM</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <ul className="space-y-1 px-2 flex-grow">
          <li>
            <Link 
              href="/" 
              className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 ${location === '/' 
                ? 'text-white border-l-4 border-[#d4af37] bg-gradient-to-r from-[#d4af37]/20 to-transparent backdrop-blur-sm shadow-sm' 
                : 'text-gray-200 hover:bg-white/5 hover:backdrop-blur-sm border-l-4 border-transparent hover:border-white/20'}`}
              title="Dashboard"
            >
              <div className={`${location === '/' ? 'text-[#d4af37]' : 'text-gray-300'} mr-3`}>
                <LayoutDashboard className="h-5 w-5" />
              </div>
              {!collapsed && <span className="font-medium">Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/campaigns" 
              className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 ${location === '/campaigns' 
                ? 'text-white border-l-4 border-[#d4af37] bg-gradient-to-r from-[#d4af37]/20 to-transparent backdrop-blur-sm shadow-sm' 
                : 'text-gray-200 hover:bg-white/5 hover:backdrop-blur-sm border-l-4 border-transparent hover:border-white/20'}`}
              title="Campaigns"
            >
              <div className={`${location === '/campaigns' ? 'text-[#d4af37]' : 'text-gray-300'} mr-3`}>
                <Megaphone className="h-5 w-5" />
              </div>
              {!collapsed && <span className="font-medium">Campaigns</span>}
            </Link>
          </li>

          <li>
            <Link 
              href="/templates" 
              className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 ${location === '/templates' || location.includes('/template-builder')
                ? 'text-white border-l-4 border-[#d4af37] bg-gradient-to-r from-[#d4af37]/20 to-transparent backdrop-blur-sm shadow-sm' 
                : 'text-gray-200 hover:bg-white/5 hover:backdrop-blur-sm border-l-4 border-transparent hover:border-white/20'}`}
              title="Templates"
            >
              <div className={`${location === '/templates' || location.includes('/template-builder') ? 'text-[#d4af37]' : 'text-gray-300'} mr-3`}>
                <FileText className="h-5 w-5" />
              </div>
              {!collapsed && <span className="font-medium">Templates</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/contacts" 
              className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 ${location === '/contacts' 
                ? 'text-white border-l-4 border-[#d4af37] bg-gradient-to-r from-[#d4af37]/20 to-transparent backdrop-blur-sm shadow-sm' 
                : 'text-gray-200 hover:bg-white/5 hover:backdrop-blur-sm border-l-4 border-transparent hover:border-white/20'}`}
              title="Contacts"
            >
              <div className={`${location === '/contacts' ? 'text-[#d4af37]' : 'text-gray-300'} mr-3`}>
                <Users className="h-5 w-5" />
              </div>
              {!collapsed && <span className="font-medium">Contacts</span>}
            </Link>
          </li>

          <li>
            <Link 
              href="/client-management" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/client-management' 
                ? 'text-white border-l-4 border-[#d4af37] bg-white/10' 
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
                ? 'text-white border-l-4 border-[#d4af37] bg-white/10' 
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
                ? 'text-white border-l-4 border-[#d4af37] bg-white/10' 
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
                ? 'text-white border-l-4 border-[#d4af37] bg-white/10' 
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
                ? 'text-white border-l-4 border-[#d4af37] bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Domains"
            >
              <Globe className="h-5 w-5 mr-3" />
              {!collapsed && <span>Domains</span>}
            </Link>
          </li>

          {/* Audience Personas link removed */}
          <li>
            <Link 
              href="/email-validation" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/email-validation' 
                ? 'text-white border-l-4 border-[#d4af37] bg-white/10' 
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
                ? 'text-white border-l-4 border-[#d4af37] bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Email Providers"
            >
              <ServerCog className="h-5 w-5 mr-3" />
              {!collapsed && <span>Email Providers</span>}
            </Link>
          </li>
          {/* Emails link removed */}
          <li>
            <Link 
              href="/email-test" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/email-test' 
                ? 'text-white border-l-4 border-[#d4af37] bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Email Test"
            >
              <SendHorizonal className="h-5 w-5 mr-3" />
              {!collapsed && <span>Email Test</span>}
            </Link>
          </li>

          <li>
            <Link 
              href="/user-management" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/user-management' 
                ? 'text-white border-l-4 border-[#d4af37] bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="User Management"
            >
              <UserRound className="h-5 w-5 mr-3" />
              {!collapsed && <span>User Management</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/admin" 
              className={`flex items-center px-2 py-2 rounded-md ${location === '/admin' 
                ? 'text-white border-l-4 border-[#d4af37] bg-white/10' 
                : 'text-gray-300 hover:bg-white/5'}`}
              title="Admin Panel"
            >
              <ShieldCheck className="h-5 w-5 mr-3" />
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          </li>
          
          <li>
            <Link 
              href="/client-dashboard" 
              className={`flex items-center px-3 py-2 mt-4 rounded-md border bg-gradient-to-r from-[#d4af37]/20 to-transparent backdrop-blur-sm shadow-md ${location === '/client-dashboard' 
                ? 'text-white border-[#d4af37] border-l-4' 
                : 'text-[#d4af37] border-[#d4af37]/30 hover:shadow-[#d4af37]/10 hover:shadow-lg transition-all duration-300'}`}
              title="Client Portal"
            >
              <div className="relative mr-3">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4af37] to-white/40 rounded-full opacity-50 blur-sm"></div>
                <ExternalLink className="h-5 w-5 text-[#d4af37] relative" />
              </div>
              {!collapsed && (
                <div className="flex items-center">
                  <span className="font-medium">Client Portal</span>
                  <div className="relative ml-1.5">
                    <span className="absolute -inset-1 rounded-full bg-[#d4af37]/30 animate-pulse opacity-75"></span>
                    <span className="relative h-1.5 w-1.5 rounded-full bg-[#d4af37] inline-block"></span>
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
            className="group flex items-center w-full px-3 py-2 rounded-md text-gray-200 hover:bg-white/5 hover:text-white transition-all duration-200 border-l-4 border-transparent hover:border-red-500/30"
            title="Logout"
          >
            <div className="relative mr-3 text-gray-400 group-hover:text-red-400 transition-colors">
              <LogOut className="h-5 w-5" />
            </div>
            {!collapsed && <span className="font-medium group-hover:text-red-300">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;