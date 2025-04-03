import { useEffect, useState } from 'react';
import { Redirect, Route } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requiredPermission?: string | null;
}

export function ClientProtectedRoute({ path, component: Component, requiredPermission }: ClientProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if client user is logged in and has required permissions
    const checkAccess = () => {
      const userData = sessionStorage.getItem('clientUser') || localStorage.getItem('clientUser');
      
      if (!userData) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      
      // If no specific permission is required or it's null, allow access
      if (!requiredPermission) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }
      
      // Check if user has the required permission
      if (user.permissions && user.permissions[requiredPermission]) {
        setHasAccess(true);
      } else {
        toast({
          title: "Access denied",
          description: `You don't have permission to access this feature. Please contact your administrator.`,
          variant: "destructive"
        });
        setHasAccess(false);
      }
      
      setIsLoading(false);
    };
    
    checkAccess();
  }, [path, requiredPermission, toast]);

  return (
    <Route
      path={path}
      component={props => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        if (!hasAccess) {
          return <Redirect to="/client-dashboard" />;
        }

        return <Component {...props} />;
      }}
    />
  );
}