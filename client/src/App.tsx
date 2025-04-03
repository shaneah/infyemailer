import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/Dashboard";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { AuthProvider } from "@/hooks/use-auth";

// Simple App function that redirects to auth page
function App() {
  const [location] = useLocation();
  
  // For demo purposes, show a direct auth page
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="bg-light min-h-screen">
          <AuthPage />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
