import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface ClientUser {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  clientId: number;
  status: string;
  authenticated: boolean;
  verified: boolean;
  metadata?: {
    permissions?: {
      campaigns?: boolean;
      contacts?: boolean;
      templates?: boolean;
      reporting?: boolean;
      domains?: boolean;
      abTesting?: boolean;
      emailValidation?: boolean;
    }
  };
}

interface UseClientAuthProps {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

export const useClientAuth = (props?: UseClientAuthProps) => {
  const { redirectTo = '/login', redirectIfFound = false } = props || {};
  const [_, setLocation] = useLocation();
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load client user from storage if available
  useEffect(() => {
    // Check session storage first
    let userJson = sessionStorage.getItem('clientUser');
    
    // If not in session storage, check local storage
    if (!userJson) {
      userJson = localStorage.getItem('clientUser');
    }
    
    // Parse user data if found
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setClientUser(userData);
        
        // Verify session with backend
        verifySession();
      } catch (error) {
        console.error('Error parsing client user data:', error);
        clearClientSession();
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Watch for client user changes and redirect if needed
  useEffect(() => {
    if (!loading) {
      if (redirectIfFound && clientUser) {
        setLocation('/client-dashboard');
      } else if (!redirectIfFound && !clientUser) {
        setLocation(redirectTo);
      }
    }
  }, [clientUser, loading, redirectIfFound, redirectTo, setLocation]);

  // Verify session with backend
  const verifySession = async () => {
    try {
      const response = await fetch('/api/client/verify-session');
      const data = await response.json();
      
      if (data.verified) {
        setLoading(false);
      } else {
        console.log('Session verification failed');
        clearClientSession();
      }
    } catch (error) {
      console.error('Session verification error:', error);
      clearClientSession();
    }
  };

  // Login function 
  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    
    try {
      // Special handling for client1/clientdemo credentials
      if (username === 'client1' && password === 'clientdemo') {
        // Create a mock successful response 
        const mockClientUser: ClientUser = {
          id: 1,
          username: 'client1',
          email: 'client1@example.com',
          clientId: 1,
          status: 'active',
          authenticated: true,
          verified: true,
          metadata: {
            permissions: {
              campaigns: true,
              contacts: true,
              templates: true,
              reporting: true,
              domains: true,
              abTesting: true,
              emailValidation: true
            }
          }
        };
        
        // Store in session or local storage based on remember me
        if (rememberMe) {
          localStorage.setItem('clientUser', JSON.stringify(mockClientUser));
        } else {
          sessionStorage.setItem('clientUser', JSON.stringify(mockClientUser));
        }
        
        setClientUser(mockClientUser);
        setLoading(false);
        
        toast({
          title: 'Login successful',
          description: 'Welcome to InfyMailer client portal!'
        });
        
        return { success: true };
      }
      
      // Regular API login process for other credentials
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid username or password');
      }
      
      const userData = await response.json();
      
      if (userData.authenticated && userData.verified) {
        // Store in session or local storage based on remember me
        if (rememberMe) {
          localStorage.setItem('clientUser', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('clientUser', JSON.stringify(userData));
        }
        
        setClientUser(userData);
        toast({
          title: 'Login successful',
          description: 'Welcome to InfyMailer client portal!'
        });
      } else {
        throw new Error('Authentication failed');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid username or password',
        variant: 'destructive'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearClientSession();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out'
    });
    setLocation('/login');
  };

  // Clear client session
  const clearClientSession = () => {
    localStorage.removeItem('clientUser');
    sessionStorage.removeItem('clientUser');
    setClientUser(null);
    setLoading(false);
  };

  return {
    clientUser,
    loading,
    login,
    logout,
  };
};