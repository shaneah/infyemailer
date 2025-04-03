import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/assets/Logo-white.png';

// Form schema
const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type FormValues = z.infer<typeof formSchema>;

const ClientLogin = () => {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if user is already logged in
  React.useEffect(() => {
    const clientUser = sessionStorage.getItem('clientUser') || localStorage.getItem('clientUser');
    if (clientUser) {
      setLocation('client-dashboard');
    }
  }, [setLocation]);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  // Handle login submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      console.log("Login data:", data);
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const userData = await response.json();
      
      // Store user data in sessionStorage
      const userToStore = {
        id: userData.id,
        username: userData.username,
        clientId: userData.clientId,
        clientName: userData.clientName || 'Client User',
        clientCompany: userData.clientCompany || 'Company',
        permissions: userData.permissions || {
          emailValidation: false,
          campaigns: false,
          contacts: false,
          templates: false,
          reporting: false,
          domains: false,
          abTesting: false
        }
      };
      
      sessionStorage.setItem('clientUser', JSON.stringify(userToStore));
      
      // Show success message
      toast({
        title: 'Login successful',
        description: 'Welcome to InfyMailer client portal!'
      });
      
      // Redirect to dashboard - without leading slash to match the route in App.tsx
      setLocation('client-dashboard');
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid username or password',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-primary/5 to-white/80 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[40%] rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-primary/20 to-primary/5 blur-3xl"></div>
        <div className="absolute top-[20%] right-[15%] w-[30%] h-[25%] rounded-full bg-gradient-to-bl from-primary/10 to-primary/5 blur-3xl"></div>
        
        {/* Subtle animated floating particles */}
        <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-primary/30 animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-3/4 left-1/6 w-3 h-3 rounded-full bg-primary/20 animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute top-2/5 right-1/3 w-2 h-2 rounded-full bg-primary/30 animate-pulse" style={{animationDuration: '5s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 rounded-full bg-primary/30 animate-pulse" style={{animationDuration: '7s'}}></div>
      </div>
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full space-y-8 flex flex-col lg:flex-row gap-8">
          {/* Left side - Card with form */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-8 sm:px-10">
              <div className="mb-8 text-center">
                <img src={Logo} alt="InfyMailer Logo" className="h-14 mx-auto mb-6" />
                <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                  Client Login
                </h2>
                <p className="text-sm text-gray-600">
                  Sign in to access your email marketing dashboard
                </p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your_username" 
                            {...field} 
                            className="rounded-lg border-gray-300 focus:ring-2 focus:ring-primary/50" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="rounded-lg border-gray-300 focus:ring-2 focus:ring-primary/50" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </>
                    ) : "Log in"}
                  </Button>
                  
                  <div className="bg-primary/5 rounded-lg p-3 text-xs text-gray-700 text-center">
                    <p className="mb-1 font-medium">For demonstration purposes:</p>
                    <p>Username: <strong>client1</strong> | Password: <strong>client123</strong></p>
                  </div>
                </form>
              </Form>
              
              <div className="mt-6 text-sm text-center">
                <p className="text-gray-600 mb-2">
                  Only authorized users with client credentials can access this portal.
                  <br />Contact your InfyMailer account manager if you need access.
                </p>
                <a 
                  href="/auth" 
                  className="font-medium text-primary hover:text-primary-dark"
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation('auth');
                  }}
                >
                  Switch to Admin Login
                </a>
              </div>
            </div>
          </div>
          
          {/* Right side - Features/Marketing */}
          <div className="hidden lg:flex lg:flex-col lg:justify-between lg:flex-1 bg-primary rounded-2xl shadow-xl p-10 text-white">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight">
                InfyMailer Client Portal
              </h1>
              <p className="mt-3 text-lg text-white/80">
                Access your email marketing campaigns, stats, and more in one convenient place
              </p>
            </div>
            
            <div className="space-y-6 my-8">
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">View Campaign Performance</h3>
                  <p className="text-white/80">Track opens, clicks, and conversions in real-time</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Access Reports</h3>
                  <p className="text-white/80">Download detailed reports and analytics</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Secure Access</h3>
                  <p className="text-white/80">Your data is encrypted and securely stored</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/20 text-sm text-white/60">
              &copy; {new Date().getFullYear()} InfyMailer. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;