import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Types
interface ClientUser {
  id: number;
  username: string;
  clientId: number;
  status: string;
  clientName?: string;
  clientCompany?: string;
  permissions?: {
    [key: string]: boolean;
  };
  lastLogin?: string;
}

interface ClientStats {
  contactsCount: number;
  contactsGrowth: number;
  listsCount: number;
  activeCampaigns: number;
  totalEmails: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface ClientContextType {
  user: ClientUser | null;
  clientId: number | null;
  clientName: string;
  clientData: any | null;
  clientStats: ClientStats | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  logout: () => Promise<void>;
}

// Create the context
const ClientContext = createContext<ClientContextType | null>(null);

// Provider component
export const ClientSessionProvider = ({ children }: { children: ReactNode }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientName, setClientName] = useState<string>("");
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [clientData, setClientData] = useState<any | null>(null);

  // Verify client session
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ["/api/client/verify-session"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/client/verify-session");
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Session verification error:", error);
        return { verified: false, user: null };
      }
    },
    retry: false,
    refetchInterval: 5 * 60 * 1000, // Refresh session every 5 minutes
  });

  // Get client data
  const { data: clientDataResponse, isLoading: isClientDataLoading } = useQuery({
    queryKey: ["/api/client-stats"],
    queryFn: async () => {
      try {
        if (!clientId) return null;
        const res = await apiRequest("GET", "/api/client-stats");
        return await res.json();
      } catch (error) {
        console.error("Client data fetch error:", error);
        return null;
      }
    },
    enabled: !!clientId,
  });

  // Fetch campaigns
  const { data: campaignsData, isLoading: isCampaignsLoading } = useQuery({
    queryKey: ["/api/client-campaigns"],
    queryFn: async () => {
      try {
        if (!clientId) return [];
        const res = await apiRequest("GET", "/api/client-campaigns");
        return await res.json();
      } catch (error) {
        console.error("Error loading campaigns:", error);
        return [];
      }
    },
    enabled: !!clientId,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/client/logout");
      return true;
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      navigate("/client/login");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Update state based on session data
  useEffect(() => {
    if (sessionData?.verified && sessionData?.user) {
      setClientId(sessionData.user.clientId);
      setClientName(sessionData.user.clientName || "Client Portal");
    } else if (!isSessionLoading) {
      // If not authenticated and not loading, redirect to login
      const isLoginPath = window.location.pathname === "/client/login";
      if (!isLoginPath) {
        navigate("/client/login");
      }
    }
  }, [sessionData, isSessionLoading, navigate]);

  // Update client data
  useEffect(() => {
    if (clientDataResponse) {
      setClientStats(clientDataResponse);
    }
  }, [clientDataResponse]);

  // Combine all client data
  useEffect(() => {
    if (clientId && sessionData?.user && clientDataResponse) {
      setClientData({
        clientId,
        clientName: sessionData.user.clientName,
        clientCompany: sessionData.user.clientCompany,
        clientEmail: sessionData.user.email,
        stats: clientDataResponse,
        campaigns: campaignsData || [],
      });
      console.log("Loaded client data:", {
        clientId,
        clientName: sessionData.user.clientName,
        stats: clientDataResponse,
        campaigns: campaignsData || [],
      });
    }
  }, [clientId, sessionData, clientDataResponse, campaignsData]);

  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!sessionData?.user?.permissions) return false;
    return !!sessionData.user.permissions[permission];
  };

  // Logout function
  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  const value = {
    user: sessionData?.user || null,
    clientId,
    clientName,
    clientData,
    clientStats,
    isLoading: isSessionLoading || isClientDataLoading,
    hasPermission,
    logout,
  };

  return (
    <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
  );
};

// Hook to use the client session context
export const useClientSession = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error(
      "useClientSession must be used within a ClientSessionProvider"
    );
  }
  return context;
};