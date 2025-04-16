import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Activity, Bell, ChevronRight, CircleUser, 
  Download, Home, LogOut, Menu, RefreshCw
} from "lucide-react";

interface ClientHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  companyName?: string;
  onSidebarOpen?: () => void;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({
  title,
  subtitle,
  userName = "User",
  companyName = "Acme Corporation",
  onSidebarOpen
}) => {
  const [location, setLocation] = useLocation();
  
  const handleLogout = () => {
    // Clear session storage and localStorage
    sessionStorage.removeItem('clientUser');
    localStorage.removeItem('clientUser');
    
    // Redirect to login page
    setLocation('/client-login');
  };
  
  // Generate breadcrumb path based on current location
  const generateBreadcrumb = () => {
    // Strip leading/trailing slashes and split by '/'
    const path = location.replace(/^\/|\/$/g, '').split('/');
    
    // Format path segments (replace dashes with spaces, capitalize)
    const formattedPath = path.map(segment => 
      segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    );
    
    return formattedPath;
  };
  
  const breadcrumbs = generateBreadcrumb();
  
  return (
    <header className="relative z-20">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b border-blue-700">
        <div className="container mx-auto py-4 px-6 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl -mt-48 -mr-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400 rounded-full opacity-10 blur-3xl -mb-32 -ml-32"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="lg"
                className="lg:hidden text-white hover:bg-blue-800/50"
                onClick={onSidebarOpen}
              >
                <Menu size={24} />
              </Button>
              <div>
                <div className="flex items-end gap-2">
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-amber-200 inline-block text-transparent bg-clip-text">
                    InfyMailer
                  </h1>
                  <div className="bg-amber-500 h-6 w-1.5 rounded-full mb-1 blur-[0.5px]"></div>
                  <span className="text-lg font-medium text-blue-100 tracking-wide">{title}</span>
                </div>
                {subtitle && (
                  <p className="text-sm text-blue-200 mt-0.5">{subtitle}</p>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <p className="text-sm font-medium text-blue-200">{companyName}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex px-4 py-1.5 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20 text-white shadow-lg">
                <div className="relative">
                  <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                    <CircleUser className="h-3.5 w-3.5 text-blue-900" />
                  </div>
                  <div className="flex items-center pl-0.5">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold opacity-70">Welcome back</span>
                      <span className="text-sm font-bold">{userName}</span>
                    </div>
                    <Bell className="h-4 w-4 ml-5 text-amber-300" />
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="text-white border-white/20 hover:bg-white/10 font-medium px-4 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2 text-amber-300" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sub header with breadcrumbs and quick actions */}
      <div className="bg-gradient-to-r from-blue-100/80 via-white to-blue-50/80 border-b border-blue-200 py-2 px-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center text-sm text-slate-600">
            <Home className="h-3.5 w-3.5 mr-2 text-blue-600" />
            <span 
              className="text-blue-600 font-medium cursor-pointer hover:underline"
              onClick={() => setLocation('/client-dashboard')}
            >
              Home
            </span>
            
            {breadcrumbs.filter(b => b !== 'Client-dashboard').map((crumb, i) => (
              <React.Fragment key={i}>
                <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-slate-400" />
                <span className="font-medium">{crumb}</span>
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-slate-600 hover:text-blue-700 hover:bg-blue-100/50"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
            </Button>
            <div className="h-4 border-r border-slate-300 mx-1"></div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-slate-600 hover:text-blue-700 hover:bg-blue-100/50"
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;