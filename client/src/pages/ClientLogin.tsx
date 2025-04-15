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
import { Lock, Mail, Eye, EyeOff, ChevronRight } from 'lucide-react';
import LogoWhite from '@/assets/infinity-logo-white.png';
import LogoColor from '@/assets/infinity-logo-color.png';

// Form schema
const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type FormValues = z.infer<typeof formSchema>;

const ClientLogin = () => {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    toast({
      title: 'Attempting login',
      description: `Logging in as ${data.username}...`
    });
    
    try {
      console.log("Login data:", data);
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      // Log the raw response
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      // Clone the response to read it twice (for error and success cases)
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      console.log("Raw response body:", responseText);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }

      let userData;
      try {
        userData = JSON.parse(responseText);

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
      } catch (err) {
        console.error("Error parsing success response:", err);
        throw new Error('Failed to parse server response');
      }
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-[#1a3a5f]/90 via-[#1a3a5f] to-[#0d2137]">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {/* Gold shimmer effect */}
        <div className="absolute top-[-10%] left-[20%] w-[70%] h-[40%] rounded-full bg-gradient-to-br from-[#d4af37]/20 to-transparent blur-3xl opacity-70"></div>
        <div className="absolute bottom-[-5%] right-[10%] w-[50%] h-[40%] rounded-full bg-gradient-to-tl from-[#d4af37]/15 to-transparent blur-3xl opacity-60"></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" 
             style={{
               backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23d4af37\' fill-opacity=\'0.4\'%3E%3Cpolygon points=\'0 0 10 0 0 10\'/%3E%3Cpolygon points=\'20 0 20 10 10 0\'/%3E%3Cpolygon points=\'0 20 0 10 10 20\'/%3E%3Cpolygon points=\'10 20 20 20 20 10\'/%3E%3C/g%3E%3C/svg%3E")',
               backgroundSize: '20px 20px'
             }}
        ></div>
        
        {/* Gold particle effects */}
        <div className="absolute top-1/4 left-1/3 w-1 h-1 rounded-full bg-[#d4af37]/70 animate-pulse" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-2/3 left-1/5 w-2 h-2 rounded-full bg-[#d4af37]/50 animate-pulse" style={{animationDuration: '5s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-[#d4af37]/60 animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 rounded-full bg-[#d4af37]/50 animate-pulse" style={{animationDuration: '6s'}}></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl w-full space-y-8 flex flex-col lg:flex-row gap-8">
          {/* Left side - Card with form */}
          <div className="flex-1 bg-[#f5f0e1] rounded-2xl shadow-2xl overflow-hidden border border-[#d4af37]/20">
            <div className="px-6 py-8 sm:px-10">
              <div className="mb-8 text-center">
                <img src={LogoColor} alt="InfyMailer Logo" className="h-16 mx-auto mb-6" />
                <h2 className="text-3xl font-extrabold text-[#1a3a5f] mb-1">
                  Client Portal
                </h2>
                <p className="text-sm text-[#1a3a5f]/70">
                  Sign in to access your premium email marketing dashboard
                </p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1a3a5f] font-medium">Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1a3a5f]/60">
                              <Mail className="h-4 w-4" />
                            </span>
                            <Input 
                              placeholder="Enter your username" 
                              {...field} 
                              className="pl-10 rounded-lg bg-white border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 text-[#1a3a5f]" 
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1a3a5f] font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1a3a5f]/60">
                              <Lock className="h-4 w-4" />
                            </span>
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password" 
                              {...field} 
                              className="pl-10 pr-10 rounded-lg bg-white border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 text-[#1a3a5f]" 
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1a3a5f]/60 hover:text-[#1a3a5f]"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8860b] hover:from-[#b8860b] hover:to-[#d4af37] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center border border-[#d4af37]/50"
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
                    ) : (
                      <span className="flex items-center">
                        Sign In <ChevronRight className="ml-1 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                  
                  <div className="bg-[#d4af37]/10 rounded-lg p-4 text-xs text-[#1a3a5f]/80 text-center border border-[#d4af37]/20">
                    <p className="mb-1 font-medium text-[#1a3a5f]">For demonstration purposes:</p>
                    <p>Username: <strong>client1</strong> | Password: <strong>clientdemo</strong></p>
                  </div>
                </form>
              </Form>
              
              <div className="mt-6 text-sm text-center">
                <p className="text-[#1a3a5f]/70 mb-2">
                  Only authorized users with client credentials can access this portal.
                  <br />Contact your account manager if you need assistance.
                </p>
                <a 
                  href="/auth" 
                  className="font-medium text-[#1a3a5f] hover:text-[#d4af37] transition-colors duration-200"
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
          <div className="hidden lg:flex lg:flex-col lg:justify-between lg:flex-1 bg-gradient-to-br from-[#1a3a5f] to-[#0d2137] rounded-2xl shadow-2xl p-10 text-white relative overflow-hidden border border-[#d4af37]/20">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5" 
                 style={{
                   backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4af37\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                 }}
            ></div>

            <div className="relative z-10 pt-4">
              <img src={LogoWhite} alt="InfyMailer Logo" className="h-14 mb-6" />
              <h1 className="text-3xl font-extrabold leading-tight mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d4af37] to-[#f5f0e1]">
                  Premium Email Marketing
                </span>
              </h1>
              <p className="text-lg text-white/90">
                Access your campaigns, analytics, and premium features in one elegant dashboard
              </p>
            </div>
            
            <div className="space-y-6 my-8 relative z-10">
              <div className="flex items-start p-4 rounded-lg border border-[#d4af37]/20 bg-[#1a3a5f]/50 backdrop-blur-sm hover:bg-[#1a3a5f]/70 transition-all duration-200">
                <div className="bg-gradient-to-br from-[#d4af37] to-[#b8860b] p-2.5 rounded-full mr-4 text-white shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#d4af37]">Real-Time Analytics</h3>
                  <p className="text-white/90">Track performance metrics with sophisticated dashboards</p>
                </div>
              </div>
              
              <div className="flex items-start p-4 rounded-lg border border-[#d4af37]/20 bg-[#1a3a5f]/50 backdrop-blur-sm hover:bg-[#1a3a5f]/70 transition-all duration-200">
                <div className="bg-gradient-to-br from-[#d4af37] to-[#b8860b] p-2.5 rounded-full mr-4 text-white shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#d4af37]">Advanced Reporting</h3>
                  <p className="text-white/90">Detailed insights and exportable custom reports</p>
                </div>
              </div>
              
              <div className="flex items-start p-4 rounded-lg border border-[#d4af37]/20 bg-[#1a3a5f]/50 backdrop-blur-sm hover:bg-[#1a3a5f]/70 transition-all duration-200">
                <div className="bg-gradient-to-br from-[#d4af37] to-[#b8860b] p-2.5 rounded-full mr-4 text-white shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#d4af37]">Enterprise Security</h3>
                  <p className="text-white/90">Bank-level encryption and secure access controls</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-[#d4af37]/20 text-sm text-white/70 relative z-10">
              <div className="flex justify-between items-center">
                <span>&copy; {new Date().getFullYear()} InfyMailer. All rights reserved.</span>
                <span className="text-[#d4af37]">Premium Client Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;