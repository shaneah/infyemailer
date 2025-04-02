import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';

interface AuthWrapperProps {
  children: ReactNode;
  redirectTo?: string;
  clientOnly?: boolean;
  adminOnly?: boolean;
}

const AuthWrapper = ({ 
  children, 
  redirectTo = '/login',
  clientOnly = false, 
  adminOnly = false 
}: AuthWrapperProps) => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const clientUser = localStorage.getItem('clientUser') || sessionStorage.getItem('clientUser');
    const adminUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    const isClient = !!clientUser;
    const isAdmin = !!adminUser;
    
    // Redirect logic based on auth state and page requirements
    if (!isClient && !isAdmin) {
      // Not logged in at all, redirect to login
      setLocation(redirectTo);
    } else if (clientOnly && !isClient) {
      // Client-only page but not logged in as client
      setLocation('/login');
    } else if (adminOnly && !isAdmin) {
      // Admin-only page but not logged in as admin
      setLocation('/login');
    }
  }, [redirectTo, clientOnly, adminOnly, setLocation]);

  return <>{children}</>;
};

export default AuthWrapper;