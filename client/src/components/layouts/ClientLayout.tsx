import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { 
  Home,
  Mail,
  Users,
  FileText,
  BarChart2,
  Settings,
  Sparkles,
  MessageSquare,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useClientSession } from '@/hooks/use-client-session';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [location] = useLocation();
  const { clientName, clientId, logout } = useClientSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  useEffect(() => {
    // Close mobile sidebar when navigating
    if (!isDesktop && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location, isDesktop]);

  // Close sidebar when screen resizes to desktop
  useEffect(() => {
    if (isDesktop && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  const navItems = [
    { 
      label: 'Dashboard', 
      path: '/client-dashboard', 
      icon: <Home className="h-5 w-5" /> 
    },
    { 
      label: 'Campaigns', 
      path: '/client-campaigns', 
      icon: <Mail className="h-5 w-5" /> 
    },
    { 
      label: 'Contacts', 
      path: '/client-contacts', 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      label: 'Templates', 
      path: '/client-templates', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      label: 'Reports', 
      path: '/client-reports', 
      icon: <BarChart2 className="h-5 w-5" /> 
    },
    { 
      label: 'AI Tools', 
      path: '/client-ai-tools', 
      icon: <Sparkles className="h-5 w-5" /> 
    },
    { 
      label: 'Support Chat', 
      path: '/client-support', 
      icon: <MessageSquare className="h-5 w-5" /> 
    },
    { 
      label: 'Settings', 
      path: '/client-settings', 
      icon: <Settings className="h-5 w-5" /> 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Client Portal | Email Marketing Platform</title>
      </Helmet>
      
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/client-dashboard">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-indigo-600">Client Portal</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden sm:inline-block mr-2">
              {clientName}
            </span>
            
            <Button
              variant="ghost" 
              size="sm"
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline-block">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside 
          className={cn(
            "bg-white border-r w-64 flex-shrink-0 fixed inset-y-0 pt-16 z-[5] transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="flex flex-col h-full p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start font-medium px-3",
                      location === item.path 
                        ? "bg-indigo-50 text-indigo-900" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {React.cloneElement(item.icon, { 
                      className: cn(
                        "mr-2 h-5 w-5", 
                        location === item.path ? "text-indigo-600" : "text-gray-500"
                      ) 
                    })}
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
            
            <div className="mt-auto pt-4">
              <Separator className="my-4" />
              <div className="px-3 py-2">
                <div className="text-xs font-medium text-gray-400 uppercase">
                  Client Account
                </div>
                <div className="mt-1 text-sm font-medium text-gray-700">
                  {clientName}
                </div>
                {clientId && (
                  <div className="text-xs text-gray-500 mt-1">
                    ID: {clientId}
                  </div>
                )}
              </div>
            </div>
          </nav>
        </aside>
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && !isDesktop && (
          <div 
            className="fixed inset-0 bg-black/20 z-[4]" 
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}