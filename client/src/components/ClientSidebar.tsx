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
    <div
      className={`bg-primary text-white h-screen flex flex-col fixed lg:static top-0 left-0 z-40 transition-all duration-300 lg:min-w-[250px] ${
        open ? 'w-64' : 'w-0 lg:w-20 overflow-hidden'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-primary-foreground/10">
        <div className={`flex items-center ${!open && 'lg:hidden'}`}>
          <img src={Logo} alt="InfyMailer Logo" className="h-8" />
        </div>
        <Button
          variant="ghost"
          className="text-white hover:bg-primary-foreground/10 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <ChevronLeft size={20} />
        </Button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {filteredLinks.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
              >
                <div
                  className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                    location === link.href
                      ? 'bg-primary-foreground/10 text-white'
                      : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-white'
                  } cursor-pointer`}
                >
                  <span className="mr-3">{link.icon}</span>
                  <span className={`${!open && 'lg:hidden'}`}>{link.title}</span>
                </div>
              </Link>
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-primary-foreground/10">
        <div className={`text-sm text-primary-foreground/70 mb-2 ${!open && 'lg:hidden'}`}>
          Logged in as: {clientUser.clientName}
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm bg-primary-foreground/10 rounded-md text-white hover:bg-primary-foreground/20 transition-colors"
        >
          {open ? 'Logout' : <span className="lg:block hidden">🚪</span>}
        </button>
      </div>
    </div>
  );
}