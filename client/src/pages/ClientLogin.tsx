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
import Logo from '../assets/Logo-white.png';

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
      setLocation('/client/dashboard');
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
        clientCompany: userData.clientCompany || 'Company'
      };
      
      sessionStorage.setItem('clientUser', JSON.stringify(userToStore));
      
      // Show success message
      toast({
        title: 'Login successful',
        description: 'Welcome to InfyMailer client portal!'
      });
      
      // Redirect to dashboard
      setLocation('/client-dashboard');
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
    <div className="h-screen flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-primary p-10 text-white flex flex-col justify-between">
        <div>
          <img src={Logo} alt="InfyMailer Logo" className="h-14 mb-6" />
          <h1 className="text-3xl font-bold">Welcome to InfyMailer Client Portal</h1>
          <p className="mt-4 text-lg opacity-80">
            Access your email marketing campaigns, stats, and more in one convenient place.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            <div className="bg-white/20 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">View Campaign Performance</h3>
              <p className="text-sm opacity-80">Track opens, clicks, and conversions in real-time</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-white/20 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Access Reports</h3>
              <p className="text-sm opacity-80">Download detailed reports and analytics</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-white/20 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Secure Access</h3>
              <p className="text-sm opacity-80">Your data is encrypted and securely stored</p>
            </div>
          </div>
        </div>
        
        <div className="text-sm opacity-70">
          &copy; {new Date().getFullYear()} InfyMailer. All rights reserved.
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Client Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your email marketing dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="your_username" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <p>Only authorized users with client credentials can access this portal.</p>
              <p>Contact your InfyMailer account manager if you need access.</p>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              <p className="mb-1">For demonstration purposes:</p>
              <p>Username: <strong>client1</strong> | Password: <strong>client123</strong></p>
            </div>
            <div className="pt-4 text-center text-sm">
              <p>
                <span className="text-muted-foreground">Are you an administrator? </span>
                <a 
                  href="/auth" 
                  className="text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation('/auth');
                  }}
                >
                  Admin Login
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ClientLogin;