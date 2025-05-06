import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart3, 
  Users, 
  Mail, 
  Settings, 
  LayoutDashboard,
  FileText,
  Box,
  LucideIcon,
  LogOut,
  Shield,
  Database,
  Activity
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, label, icon: Icon, isActive }) => {
  return (
    <Link href={href}>
      <a className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${isActive ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground'}`}>
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
  const { toast } = useToast();
  
  const { data: user } = useQuery<any>({
    queryKey: ['/api/user'],
  });
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/logout');
      return res;
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      window.location.href = '/auth';
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-background">
        <div className="p-6 border-b">
          <Link href="/admin">
            <a className="flex items-center gap-2 font-bold text-xl">
              <Shield className="h-6 w-6" />
              <span>Admin Portal</span>
            </a>
          </Link>
        </div>
        
        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-1 px-2">
            <NavItem 
              href="/admin" 
              label="Dashboard" 
              icon={LayoutDashboard} 
              isActive={location === '/admin'} 
            />
            
            <div className="px-3 py-2">
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">Monitoring</h3>
              <div className="grid gap-1">
                <NavItem 
                  href="/admin-monitoring" 
                  label="Client Activities" 
                  icon={Activity} 
                  isActive={location === '/admin-monitoring'} 
                />
                <NavItem 
                  href="/admin-analytics" 
                  label="Analytics" 
                  icon={BarChart3} 
                  isActive={location === '/admin-analytics'} 
                />
              </div>
            </div>
            
            <div className="px-3 py-2">
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">Management</h3>
              <div className="grid gap-1">
                <NavItem 
                  href="/admin-users" 
                  label="Users" 
                  icon={Users} 
                  isActive={location === '/admin-users'} 
                />
                <NavItem 
                  href="/admin-clients" 
                  label="Clients" 
                  icon={Users} 
                  isActive={location === '/admin-clients'} 
                />
                <NavItem 
                  href="/admin-campaigns" 
                  label="Campaigns" 
                  icon={Mail} 
                  isActive={location === '/admin-campaigns'} 
                />
                <NavItem 
                  href="/admin-templates" 
                  label="Templates" 
                  icon={FileText} 
                  isActive={location === '/admin-templates'} 
                />
                <NavItem 
                  href="/admin-database" 
                  label="Database" 
                  icon={Database} 
                  isActive={location === '/admin-database'} 
                />
              </div>
            </div>
            
            <div className="px-3 py-2">
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">System</h3>
              <div className="grid gap-1">
                <NavItem 
                  href="/admin-settings" 
                  label="Settings" 
                  icon={Settings} 
                  isActive={location === '/admin-settings'} 
                />
              </div>
            </div>
          </nav>
        </ScrollArea>
        
        <div className="sticky bottom-0 mt-auto border-t p-4 flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl} alt={user?.username} />
              <AvatarFallback>{user?.username ? getInitials(user.username) : 'U'}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{user?.username || 'Admin User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;