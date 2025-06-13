import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface ClientUser {
  id: number;
  clientId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
}

interface ClientSessionContextType {
  clientUser: ClientUser | null;
  clientId: number | null;
  clientName: string;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

const ClientSessionContext = createContext<ClientSessionContextType | null>(null);

interface ClientSessionProviderProps {
  children: ReactNode;
}

export function ClientSessionProvider({ children }: ClientSessionProviderProps) {
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check for existing client session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking client session...');
        const res = await fetch('/api/client/session', {
          credentials: 'include'
        });

        console.log('Session check response:', {
          status: res.status,
          ok: res.ok
        });

        if (res.ok) {
          const data = await res.json();
          console.log('Session data received:', data);
          
          // Extract user data from the nested structure
          const userData = data.user;
          if (!userData) {
            console.log('No user data in session response');
            setClientUser(null);
            return;
          }
          
          console.log('Setting client user from session:', userData);
          setClientUser(userData);
        } else {
          console.log('No valid session found');
          setClientUser(null);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setClientUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Client login function
  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting client login...');
      const res = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      console.log('Login response:', {
        status: res.status,
        ok: res.ok
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const response = await res.json();
      console.log('Login successful, response:', response);
      
      // Extract user data from the nested structure
      const userData = response.user;
      if (!userData) {
        throw new Error('Invalid response format: missing user data');
      }
      
      console.log('Setting client user data:', userData);
      setClientUser(userData);
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.firstName || userData.username}!`,
      });
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err : new Error('Login failed'));
      
      toast({
        title: 'Login failed',
        description: err instanceof Error ? err.message : 'Invalid credentials',
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Client logout function
  const logout = async () => {
    try {
      await fetch('/api/client-logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear client user state
      setClientUser(null);
      
      // Redirect to login page
      setLocation('/client-login');
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (err) {
      console.error('Logout error:', err);
      
      toast({
        title: 'Logout failed',
        description: 'There was an issue logging out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // For demo purposes - mock client name
  const clientName = clientUser?.firstName && clientUser?.lastName 
    ? `${clientUser.firstName} ${clientUser.lastName}` 
    : clientUser?.username 
      ? clientUser.username 
      : 'Client Portal';

  return (
    <ClientSessionContext.Provider
      value={{
        clientUser,
        clientId: clientUser?.clientId || null,
        clientName,
        isLoading,
        error,
        login,
        logout
      }}
    >
      {children}
    </ClientSessionContext.Provider>
  );
}

export function useClientSession() {
  const context = useContext(ClientSessionContext);
  
  if (!context) {
    throw new Error('useClientSession must be used within a ClientSessionProvider');
  }
  
  return context;
}