import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import LogoWhite from '@/assets/Logo-white.png';

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
        
        // Redirect to campaigns - without leading slash to match the route in App.tsx
        setLocation('client-campaigns');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 via-blue-900 to-indigo-800">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]"></div>
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/20"></div>
      <div className="absolute left-1/4 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      
      <div className="relative z-10 w-full max-w-md px-8">
        <div className="bg-white/10 backdrop-filter backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
          {/* Card header */}
          <div className="p-6 pb-0 text-center">
            <img src={LogoWhite} alt="Infinity Tech Logo" className="h-20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-1">Client Portal</h2>
            <p className="text-indigo-200 text-sm mb-6">Sign in to your Premium Dashboard</p>
          </div>
          
          {/* Card body */}
          <div className="p-6 pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-indigo-100 text-sm font-medium">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-indigo-300" />
                          </div>
                          <Input 
                            placeholder="Enter your username" 
                            className="pl-10 bg-white/5 border-indigo-500/30 focus:border-indigo-400 text-white rounded-lg" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300 text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-indigo-100 text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-indigo-300" />
                          </div>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••" 
                            className="pl-10 bg-white/5 border-indigo-500/30 focus:border-indigo-400 text-white rounded-lg pr-10" 
                            {...field} 
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-300 hover:text-white transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300 text-xs" />
                    </FormItem>
                  )}
                />
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full rounded-lg py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white shadow-md hover:shadow-lg transition duration-200"
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
                </div>
                
                <div className="mt-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-500/20 text-xs text-center">
                  <p className="text-indigo-300 mb-1">For demonstration purposes:</p>
                  <p className="text-white">Username: <strong>client1</strong> | Password: <strong>clientdemo</strong></p>
                </div>
              </form>
            </Form>
            
            <div className="mt-6 text-center text-xs">
              <p className="text-indigo-300">
                Only authorized clients can access this portal.<br/>
                Need help? Contact your account manager.
              </p>
              <div className="mt-4 border-t border-indigo-500/20 pt-4">
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation('auth');
                  }}
                  className="text-indigo-300 hover:text-white transition-colors inline-flex items-center"
                >
                  Switch to Admin Login
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6 text-indigo-300/70 text-xs">
          &copy; {new Date().getFullYear()} Infinity Tech • Premium Email Platform
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;