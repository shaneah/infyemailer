import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import LogoWhite from '@assets/Logo-white.png';
import infinityLogo from '@assets/Infinity Tech Logo-06.png';

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
      setLocation('client-campaigns');
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
      title: 'Authenticating',
      description: `Verifying credentials...`
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
          title: 'Welcome back!',
          description: `Signed in as ${userData.clientName || data.username}`,
          variant: 'default'
        });
        
        // Redirect to campaigns - without leading slash to match the route in App.tsx
        setLocation('client-campaigns');
      } catch (err) {
        console.error("Error parsing success response:", err);
        throw new Error('Failed to parse server response');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: 'Authentication failed',
        description: error instanceof Error ? error.message : 'Invalid username or password',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#1e293b]">
      {/* Meta tag for proper mobile viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-20">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo only shown on small screens */}
          <div className="md:hidden flex flex-col items-center justify-center mb-8">
            <img 
              src={infinityLogo} 
              alt="Infinity Tech Logo" 
              className="h-16 mb-4" 
            />
            <h2 className="text-2xl font-bold text-white">Client Portal</h2>
            <p className="text-slate-300 text-sm">Access your email marketing dashboard</p>
          </div>
          
          <div className="space-y-2 hidden md:block">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-slate-400">
              Please sign in to your client account
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 text-sm font-medium">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-slate-400" />
                          </div>
                          <Input 
                            placeholder="Enter your username" 
                            className="pl-10 bg-slate-900/50 border-slate-600 focus:border-blue-500 text-white rounded-lg text-sm" 
                            {...field}
                            autoCapitalize="none"
                            autoCorrect="off"
                            autoComplete="username"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-300 text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-1">
                        <FormLabel className="text-slate-200 text-sm font-medium">Password</FormLabel>
                        <a href="#" className="text-xs text-blue-400 hover:text-blue-300">
                          Forgot password?
                        </a>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-slate-400" />
                          </div>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••" 
                            className="pl-10 bg-slate-900/50 border-slate-600 focus:border-blue-500 text-white rounded-lg pr-10 text-sm" 
                            {...field}
                            autoComplete="current-password"
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-300 text-xs" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-11 rounded-lg py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-900/20 hover:shadow-lg hover:shadow-blue-900/30 transition duration-200 text-sm font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-700"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800/50 px-2 text-slate-400">Demo Account</span>
                  </div>
                </div>
                
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-700 text-xs">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex flex-col items-start md:items-center md:flex-row">
                      <span className="text-slate-400">Username:</span>
                      <span className="font-mono font-medium text-blue-400 ml-0 md:ml-2">client1</span>
                    </div>
                    <div className="flex flex-col items-start md:items-center md:flex-row mt-2 md:mt-0">
                      <span className="text-slate-400">Password:</span>
                      <span className="font-mono font-medium text-blue-400 ml-0 md:ml-2">clientdemo</span>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
            
            <div className="mt-8 text-center text-xs">
              <div className="flex justify-center items-center space-x-1 text-slate-400">
                <a href="#" onClick={(e) => { e.preventDefault(); setLocation('auth'); }} 
                  className="text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline">
                  Switch to Admin Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Brand imagery and features */}
      <div className="w-full md:w-1/2 hidden md:block relative bg-gradient-to-tr from-blue-900 to-indigo-800 overflow-hidden">
        {/* Abstract glow effects */}
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-indigo-600 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12">
          <img src={infinityLogo} alt="Infinity Tech Logo" className="h-28 mb-10" />
          
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Premium Email Marketing Platform
          </h2>
          
          <div className="max-w-md">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-white">Campaign Analytics</h3>
                  <p className="text-slate-300 text-sm">Access real-time performance metrics for all your email campaigns</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-white">AI-Powered Templates</h3>
                  <p className="text-slate-300 text-sm">Create stunning emails with our intelligent design assistant</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-white">Contact Management</h3>
                  <p className="text-slate-300 text-sm">Organize and segment your audience with powerful list management tools</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-4">
            <div className="h-16 w-16 bg-white/10 backdrop-filter backdrop-blur-md rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12L3 9H21L22 12" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3.5 9L5.5 5H18.5L20.5 9" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="2" y="12" width="20" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 15V16H15V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="h-16 w-16 bg-white/10 backdrop-filter backdrop-blur-md rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L14 8H19L16 12L17 17L12 14L7 17L8 12L5 8H10L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="h-16 w-16 bg-white/10 backdrop-filter backdrop-blur-md rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 10H7C9 10 10 9 10 7V5C10 3 9 2 7 2H5C3 2 2 3 2 5V7C2 9 3 10 5 10Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 10H19C21 10 22 9 22 7V5C22 3 21 2 19 2H17C15 2 14 3 14 5V7C14 9 15 10 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 22H19C21 22 22 21 22 19V17C22 15 21 14 19 14H17C15 14 14 15 14 17V19C14 21 15 22 17 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 22H7C9 22 10 21 10 19V17C10 15 9 14 7 14H5C3 14 2 15 2 17V19C2 21 3 22 5 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Bottom footer */}
        <div className="absolute bottom-0 left-0 right-0 py-4 bg-gradient-to-t from-slate-900/60 to-transparent">
          <div className="text-center text-slate-400/80 text-xs font-medium">
            &copy; {new Date().getFullYear()} Infinity Tech • Enterprise Email Marketing Solutions
          </div>
        </div>
      </div>
      
      {/* Mobile footer */}
      <div className="md:hidden text-center mt-6 mb-8 text-slate-400/80 text-xs">
        &copy; {new Date().getFullYear()} Infinity Tech • Premium Email Platform
      </div>
    </div>
  );
};

export default ClientLogin;