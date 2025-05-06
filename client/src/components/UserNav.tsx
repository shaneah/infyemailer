import React from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Settings, User as UserIcon, Shield, UserCheck } from 'lucide-react';
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";

export function UserNav() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout');
      queryClient.setQueryData(['/api/user'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setLocation('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'Please try again later.',
      });
    }
  };

  const getInitials = (name: string = '') => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`;
    }
    return names[0].charAt(0);
  };

  const getNameFromUser = () => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || 'User';
  };

  const getRoleLabel = () => {
    if (!user?.role) return 'User';
    
    switch (user.role) {
      case 'admin':
        return 'Administrator';
      case 'staff':
        return 'Staff Member';
      case 'client':
        return 'Client User';
      default:
        return user.role;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl || undefined} alt={getNameFromUser()} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user ? getInitials(getNameFromUser()) : '?'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getNameFromUser()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'user@example.com'}
            </p>
            <div className="mt-1 flex items-center">
              <Shield className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{getRoleLabel()}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}