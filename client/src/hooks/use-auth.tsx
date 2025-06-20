import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
  isAuthenticated: boolean;
  isAdminUser: boolean;
  isClientUser: boolean;
  pending2FAUserId: number | null;
  setPending2FAUserId: React.Dispatch<React.SetStateAction<number | null>>;
  show2FAPrompt: boolean;
  setShow2FAPrompt: React.Dispatch<React.SetStateAction<boolean>>;
};

interface LoginData {
  usernameOrEmail: string;
  password: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [isClientUser, setIsClientUser] = useState<boolean>(false);
  // 2FA states
  const [pending2FAUserId, setPending2FAUserId] = useState<number|null>(null);
  const [show2FAPrompt, setShow2FAPrompt] = useState(false);

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: "include", // Include credentials to pass cookies for authentication
        });
        if (response.status === 401) {
          return null;
        }
        return await response.json();
      } catch (error) {
        return null;
      }
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      setIsAdminUser(user.role === 'admin');
      setIsClientUser(user.role === 'client');
    } else {
      setIsAuthenticated(false);
      setIsAdminUser(false);
      setIsClientUser(false);
    }
  }, [user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        // Don't use apiRequest helper here since we need to handle the response carefully
        const res = await fetch("/api/login", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          credentials: "include",
        });
        
        // Check if response is OK
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Login failed");
        }
        
        // Parse the response only once
        return await res.json();
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      if (data.require2fa) {
        setPending2FAUserId(data.userId);
        setShow2FAPrompt(true);
        toast({
          title: "Two-Factor Authentication Required",
          description: "Please enter your 2FA code.",
        });
        return;
      }
      // Normal login flow
      queryClient.setQueryData(["/api/user"], data.user || data);
      setIsAuthenticated(true);
      setIsAdminUser((data.user || data).role === 'admin');
      setIsClientUser((data.user || data).role === 'client');
      toast({
        title: "Login successful",
        description: `Welcome back, ${(data.user || data).username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      try {
        // Don't use apiRequest helper here since we need to handle the response carefully
        const res = await fetch("/api/register", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          credentials: "include",
        });
        
        // Check if response is OK
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Registration failed");
        }
        
        // Parse the response only once
        return await res.json();
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      setIsAuthenticated(true);
      setIsAdminUser(user.role === 'admin');
      setIsClientUser(user.role === 'client');
      // Don't auto-redirect here - let the component handle navigation
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Explicitly use fetch with credentials instead of apiRequest helper
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      setIsAuthenticated(false);
      setIsAdminUser(false);
      setIsClientUser(false);
      setLocation('/auth');
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        isAuthenticated,
        isAdminUser,
        isClientUser,
        // 2FA
        pending2FAUserId,
        setPending2FAUserId,
        show2FAPrompt,
        setShow2FAPrompt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}