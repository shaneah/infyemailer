import React from 'react';
import { useLocation, Link } from 'wouter';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserNav } from '@/components/UserNav';
import { LucideIcon, Menu, BarChart2, Calendar, Users, Mail, Settings, FileText, LayoutDashboard, Database } from 'lucide-react';

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
}

const NavItem = ({ href, label, icon: Icon, isActive }: NavItemProps) => {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </a>
    </Link>
  );
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [open, setOpen] = React.useState(false);

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/clients', label: 'Clients', icon: Users },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/campaigns', label: 'Campaigns', icon: Mail },
    { href: '/admin/templates', label: 'Templates', icon: FileText },
    { href: '/admin/monitoring', label: 'Monitoring', icon: BarChart2 },
    { href: '/admin/schedule', label: 'Schedule', icon: Calendar },
    { href: '/admin/database', label: 'Database', icon: Database },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const renderNavItems = () => {
    return navigationItems.map((item) => (
      <NavItem
        key={item.href}
        href={item.href}
        label={item.label}
        icon={item.icon}
        isActive={location === item.href}
      />
    ));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex flex-1 items-center gap-4">
          {isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 pr-0">
                <SheetHeader>
                  <SheetTitle className="text-left">Admin Panel</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 pt-6">
                  {renderNavItems()}
                </nav>
              </SheetContent>
            </Sheet>
          )}
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <div className="flex items-center gap-2 font-semibold">
                <span className="hidden md:inline-flex">Admin Panel</span>
              </div>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <UserNav />
        </div>
      </header>
      <div className="flex flex-1">
        {!isMobile && (
          <aside className="fixed inset-y-0 left-0 top-16 z-20 w-64 border-r bg-background">
            <nav className="flex flex-col gap-2 p-4 pt-6">
              {renderNavItems()}
            </nav>
          </aside>
        )}
        <main className={cn("flex-1 p-4 pt-6 sm:p-6", 
          !isMobile && "ml-64"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;