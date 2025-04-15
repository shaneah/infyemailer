import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  ChevronLeft, 
  ChevronRight, 
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
  LogOut
} from 'lucide-react';
import { Link } from 'wouter';

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed?: boolean;
  setCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewSidebar = ({ open, setOpen, collapsed = false, setCollapsed }: SidebarProps) => {
  const [location] = useLocation();

  const handleToggleCollapsed = () => {
    if (setCollapsed) {
      setCollapsed(!collapsed);
    }
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('token');
    
    // Redirect to login
    window.location.href = '/auth';
  };

  const NavItem = ({ 
    href, 
    icon: Icon, 
    label, 
    special = false, 
    animated = false
  }: { 
    href: string; 
    icon: any; 
    label: string; 
    special?: boolean;
    animated?: boolean;
  }) => {
    const active = location === href || 
      (href !== '/' && location.includes(href)) ||
      (href === '/template-builder' && location.includes('/template-builder'));

    if (special) {
      // Special styled item (like Client Portal)
      return (
        <li>
          <Link 
            href={href} 
            className={`flex items-center px-3 py-2 mt-4 rounded-md border bg-gradient-to-r from-[#d4af37]/20 to-transparent backdrop-blur-sm shadow-md ${active 
              ? 'text-white border-[#d4af37] border-l-4' 
              : 'text-[#d4af37] border-[#d4af37]/30 hover:shadow-[#d4af37]/10 hover:shadow-lg transition-all duration-300'}`}
            title={label}
          >
            <div className="relative mr-3">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4af37] to-white/40 rounded-full opacity-50 blur-sm"></div>
              <Icon className="h-5 w-5 text-[#d4af37] relative" />
            </div>
            {!collapsed && (
              <div className="flex items-center">
                <span className="font-medium">{label}</span>
                {animated && (
                  <div className="relative ml-1.5">
                    <span className="absolute -inset-1 rounded-full bg-[#d4af37]/30 animate-pulse opacity-75"></span>
                    <span className="relative h-1.5 w-1.5 rounded-full bg-[#d4af37] inline-block"></span>
                  </div>
                )}
              </div>
            )}
          </Link>
        </li>
      );
    }

    // Standard nav item
    return (
      <li>
        <Link 
          href={href} 
          className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 ${active 
            ? 'text-white border-l-4 border-[#d4af37] bg-gradient-to-r from-[#d4af37]/20 to-transparent backdrop-blur-sm shadow-sm' 
            : 'text-gray-200 hover:bg-white/5 hover:backdrop-blur-sm border-l-4 border-transparent hover:border-white/20'}`}
          title={label}
        >
          <div className={`${active ? 'text-[#d4af37]' : 'text-gray-300'} mr-3`}>
            <Icon className="h-5 w-5" />
          </div>
          {!collapsed && <span className="font-medium">{label}</span>}
        </Link>
      </li>
    );
  };

  return (
    <div 
      className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:z-0`}
    >
      <div className="flex flex-col h-full w-64 bg-gray-900 text-white border-r border-gray-800 shadow-lg">
        <div className="flex flex-col flex-1 h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center">
              {!collapsed && (
                <div className="text-xl font-bold bg-gradient-to-r from-[#d4af37] to-white bg-clip-text text-transparent">
                  InfyMailer Pro
                </div>
              )}
              {collapsed && (
                <div className="text-xl font-bold text-[#d4af37]">
                  IM
                </div>
              )}
            </div>
            {/* Toggle Button */}
            <button
              onClick={handleToggleCollapsed}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
          
          {/* User Profile */}
          {!collapsed && (
            <div className="px-4 mb-6 mt-4">
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
            <div className="px-4 mb-6 mt-4 flex justify-center">
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
            <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem href="/campaigns" icon={Megaphone} label="Campaigns" />
            <NavItem href="/templates" icon={FileText} label="Templates" />
            <NavItem href="/contacts" icon={Users} label="Contacts" />
            <NavItem href="/client-management" icon={Building2} label="Client Management" />
            <NavItem href="/reporting" icon={FileText} label="Reporting" />
            <NavItem href="/email-performance" icon={Activity} label="Email Performance" />
            <NavItem href="/ab-testing" icon={Split} label="A/B Testing" />
            <NavItem href="/domains" icon={Globe} label="Domains" />
            <NavItem href="/audience-personas" icon={UserCircle2} label="Audience Personas" />
            <NavItem href="/email-validation" icon={CheckCircle2} label="Email Validation" />
            <NavItem href="/email-providers" icon={ServerCog} label="Email Providers" />
            <NavItem href="/email-test" icon={SendHorizonal} label="Email Test" />
            <NavItem href="/user-management" icon={UserRound} label="User Management" />
            <NavItem href="/admin" icon={ShieldCheck} label="Admin Panel" />
            
            <NavItem 
              href="/client-dashboard" 
              icon={ExternalLink} 
              label="Client Portal" 
              special={true}
              animated={true}
            />
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
    </div>
  );
};

export default NewSidebar;