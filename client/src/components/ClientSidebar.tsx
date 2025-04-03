import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BarChart, Users, MailCheck, Settings, LayoutGrid, Database, Mail, Globe, Laptop } from 'lucide-react';
import Logo from '../assets/Logo-white.png';

type ClientSidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function ClientSidebar({ open, setOpen }: ClientSidebarProps) {
  const [location] = useLocation();
  const [clientUser, setClientUser] = useState<any>(null);

  useEffect(() => {
    // Get client user info
    const sessionUser = sessionStorage.getItem('clientUser');
    if (sessionUser) {
      setClientUser(JSON.parse(sessionUser));
    }
  }, []);

  // If no client user, show nothing
  if (!clientUser) {
    return null;
  }

  const links = [
    {
      title: 'Dashboard',
      href: '/client-dashboard',
      icon: <LayoutGrid size={20} />,
      requiresPermission: null // Accessible to all client users
    },
    {
      title: 'Email Validation',
      href: '/client-email-validation',
      icon: <MailCheck size={20} />,
      requiresPermission: 'emailValidation'
    },
    {
      title: 'Campaigns',
      href: '/client-campaigns',
      icon: <Mail size={20} />,
      requiresPermission: 'campaigns'
    },
    {
      title: 'Contacts',
      href: '/client-contacts',
      icon: <Users size={20} />,
      requiresPermission: 'contacts'
    },
    {
      title: 'Templates',
      href: '/client-templates',
      icon: <Laptop size={20} />,
      requiresPermission: 'templates'
    },
    {
      title: 'Reporting',
      href: '/client-reporting',
      icon: <BarChart size={20} />,
      requiresPermission: 'reporting'
    },
    {
      title: 'Domains',
      href: '/client-domains',
      icon: <Globe size={20} />,
      requiresPermission: 'domains'
    },
    {
      title: 'A/B Testing',
      href: '/client-ab-testing',
      icon: <Database size={20} />,
      requiresPermission: 'abTesting'
    },
    {
      title: 'Settings',
      href: '/client-settings',
      icon: <Settings size={20} />,
      requiresPermission: null // Accessible to all client users
    }
  ];

  const handleLogout = () => {
    // Clear session storage and localStorage
    sessionStorage.removeItem('clientUser');
    localStorage.removeItem('clientUser');
    
    // Redirect to login page
    window.location.href = '/client-login';
  };

  // Filter links based on user permissions
  const filteredLinks = links.filter(link => 
    link.requiresPermission === null || 
    (clientUser.permissions && clientUser.permissions[link.requiresPermission])
  );

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
      
      <aside
        className={`bg-[#1E0A46] text-white h-screen flex flex-col fixed lg:static top-0 left-0 z-40 transition-all duration-300 shadow-xl ${
          open ? 'w-[280px]' : 'w-0 lg:w-[70px] overflow-hidden'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/30 bg-[#2D1164]">
          <div className={`flex items-center ${!open && 'lg:hidden'}`}>
            <img src={Logo} alt="InfyMailer Logo" className="h-8" />
            {open && <span className="ml-3 font-bold text-lg text-white">InfyMailer</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/30 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <ChevronLeft size={20} />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-3 space-y-2">
            {filteredLinks.map((link) => (
              <div key={link.href}>
                <Link href={link.href}>
                  <div
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer font-medium ${
                      location === link.href
                        ? 'bg-[#4A1DAE] text-white'
                        : 'text-white hover:bg-[#341788]/70 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className={`ml-4 text-[15px] ${!open && 'lg:hidden'}`}>{link.title}</span>
                  </div>
                </Link>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/30 bg-[#2D1164]">
          <div className={`text-white mb-3 ${!open && 'lg:hidden'}`}>
            <div className="font-medium">{clientUser.clientName}</div>
            <div className="text-xs text-white/90">{clientUser.clientCompany}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm bg-[#4A1DAE] rounded-lg text-white hover:bg-[#5F30CF] transition-colors font-medium"
          >
            {open ? 'Logout' : <span className="lg:block hidden">🚪</span>}
          </button>
        </div>
      </aside>
    </>
  );
}