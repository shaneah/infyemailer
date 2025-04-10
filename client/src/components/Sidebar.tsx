import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Megaphone, 
  FileText, 
  Users, 
  BarChart2, 
  Activity, 
  Split, 
  Globe, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  Building2, 
  UserPlus, 
  ArrowLeftCircle, 
  ArrowRightCircle 
} from "lucide-react";
import infyLogo from "../assets/Logo-white.png";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [isCollapseHovered, setIsCollapseHovered] = useState(false);
  
  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // On large screens, always show sidebar
        setOpen(true);
      }
    };

    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [setOpen]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebarEl = document.getElementById('sidebar');
      const toggleBtn = document.getElementById('sidebar-toggle');
      
      if (
        window.innerWidth < 1024 && 
        open && 
        sidebarEl && 
        !sidebarEl.contains(e.target as Node) && 
        toggleBtn && 
        !toggleBtn.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setOpen]);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <>
      {/* Overlay backdrop for mobile */}
      {open && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}
      
      <div
        id="sidebar"
        className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-300 ease-in-out transform fixed z-40 left-0 top-0 lg:sticky h-screen bg-[#0c2f6c] overflow-hidden shadow-xl shrink-0`}
        style={{ width: open ? '256px' : '0' }}
      >
        <div className="h-full flex flex-col relative min-w-64">
          {/* Collapse button (visible on large screens) */}
          <button
            className="hidden lg:flex absolute -right-3 top-20 z-40 bg-white rounded-full shadow-md p-1 cursor-pointer border border-gray-200"
            onClick={() => setOpen(!open)}
            onMouseEnter={() => setIsCollapseHovered(true)}
            onMouseLeave={() => setIsCollapseHovered(false)}
          >
            {open ? (
              <ArrowLeftCircle size={20} className={`text-[#0c2f6c] ${isCollapseHovered ? 'text-[#d4af37]' : ''}`} />
            ) : (
              <ArrowRightCircle size={20} className={`text-[#0c2f6c] ${isCollapseHovered ? 'text-[#d4af37]' : ''}`} />
            )}
          </button>
          
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
                href="/client-management" 
                className={`flex items-center px-2 py-2 rounded-md ${location === '/client-management' 
                  ? 'text-white border-l-4 border-white bg-white/10' 
                  : 'text-gray-300 hover:bg-white/5'}`}
              >
                <Building2 className="h-5 w-5 mr-3" />
                Client Management
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
                <span>Email Performance</span>
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
                href="/audience-personas" 
                className={`flex items-center px-2 py-2 rounded-md ${location === '/audience-personas' 
                  ? 'text-white border-l-4 border-white bg-white/10' 
                  : 'text-gray-300 hover:bg-white/5'}`}
              >
                <UserPlus className="h-5 w-5 mr-3" />
                Audience Personas
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
          <div className="px-2 mt-4 mb-6">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 rounded-md text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-300" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
