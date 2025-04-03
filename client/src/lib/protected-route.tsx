import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteProps } from "wouter";

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  adminOnly?: boolean;
}

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
  ...rest
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path} {...rest}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !user ? (
        <Redirect to="/auth" />
      ) : (adminOnly && user.role !== 'admin') ? (
        <Redirect to="/" />
      ) : (
        <Component />
      )}
    </Route>
  );
}