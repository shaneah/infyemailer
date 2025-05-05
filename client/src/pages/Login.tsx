import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import infyLogo from "@/assets/Logo-white.png";

// Admin login schema
const adminLoginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false)
});

// Client login schema
const clientLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false)
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
type ClientLoginFormValues = z.infer<typeof clientLoginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isClientLoading, setIsClientLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("admin");
  
  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) {
      setLocation('/');
    }
    
    const clientUser = localStorage.getItem('clientUser') || sessionStorage.getItem('clientUser');
    if (clientUser) {
      setLocation('/client-dashboard');
    }
  }, [setLocation]);
  
  // Admin login form
  const adminForm = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
      rememberMe: false
    }
  });

  // Client login form
  const clientForm = useForm<ClientLoginFormValues>({
    resolver: zodResolver(clientLoginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false
    }
  });

  // Admin login mutation
  const adminLoginMutation = useMutation({
    mutationFn: async (data: AdminLoginFormValues) => {
      // Make sure we're using the proper credentials option
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',  // Important: This ensures cookies are sent with the request
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        description: "Welcome back to the admin dashboard!"
      });
      // Store minimal user info for UI purposes only (not for authentication)
      // Authentication will now use HTTP-only cookies
      if (adminForm.getValues().rememberMe) {
        localStorage.setItem('userInfo', JSON.stringify({
          username: data.username,
          role: data.role,
          id: data.id
        }));
      } else {
        sessionStorage.setItem('userInfo', JSON.stringify({
          username: data.username,
          role: data.role,
          id: data.id
        }));
      }
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid admin credentials. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsAdminLoading(false);
    }
  });

  // Client login (making real API call to authenticate client users)
  const clientLoginMutation = useMutation({
    mutationFn: async (data: ClientLoginFormValues) => {
      // Demo mode client login
      if (data.username === 'client1' && data.password === 'clientdemo') {
        // Make API call to login endpoint with credentials
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usernameOrEmail: data.username,
            password: data.password
          }),
          credentials: 'include',  // Important: This ensures cookies are sent with the request
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Authentication failed');
        }
        
        const user = await response.json();
        return {
          ...user,
          clientUser: true,
          permissions: user.metadata?.permissions || {
            emailValidation: true,
            campaigns: true,
            contacts: true,
            templates: true,
            reporting: true,
            domains: true,
            abTesting: true
          }
        };
      } else {
        throw new Error('Invalid username or password. For demo, use: client1 / clientdemo');
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        description: "Welcome to InfyMailer client portal!"
      });
      
      // Store minimal user info for UI purposes
      // Authentication will now use HTTP-only cookies
      if (clientForm.getValues().rememberMe) {
        localStorage.setItem('clientUserInfo', JSON.stringify({
          id: data.id,
          username: data.username,
          clientUser: true,
          role: data.role
        }));
      } else {
        sessionStorage.setItem('clientUserInfo', JSON.stringify({
          id: data.id,
          username: data.username,
          clientUser: true,
          role: data.role
        }));
      }
      
      // Short delay to show loading state
      setTimeout(() => {
        setLocation('/client-dashboard');
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid client credentials. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsClientLoading(false);
    }
  });

  // Admin form submit handler
  function onAdminSubmit(data: AdminLoginFormValues) {
    setIsAdminLoading(true);
    adminLoginMutation.mutate(data);
  }
  
  // Client form submit handler
  function onClientSubmit(data: ClientLoginFormValues) {
    setIsClientLoading(true);
    clientLoginMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09152E] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {/* Dark blue diamond pattern background */}
        <div className="absolute inset-0 opacity-10" 
             style={{
               backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M12 0l12 12-12 12L0 12 12 0zm0 4.686L4.686 12 12 19.314 19.314 12 12 4.686z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
               backgroundSize: '24px 24px'
             }}
        ></div>
      </div>
      
      {/* Content container with grid layout for three equal columns */}
      <div className="flex-1 flex items-center justify-center py-10 px-6 z-10">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Brand messaging with Infinity Tech logo */}
          <div className="bg-[#0c1d3d] rounded-2xl p-8 flex flex-col shadow-xl">
            <div>
              <img 
                src="/attached_assets/Infinity Tech Logo-01.png" 
                alt="Infinity Tech Logo" 
                className="h-10 mb-8" 
              />
              
              <h1 className="text-3xl font-bold mb-4">
                <span className="text-white">Welcome to the</span><br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d4af37] to-[#f5f0e1] font-extrabold">
                  InfyMailer Platform
                </span>
              </h1>
              
              <p className="text-white/80 mb-8">
                The premium email marketing solution designed for modern businesses
              </p>
              
              <div className="space-y-6 my-8">
                <div className="flex items-center">
                  <div className="mr-4 p-2 rounded-full bg-[#d4af37]/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[#d4af37] font-medium">Enterprise-Grade Security</h3>
                    <p className="text-white/60 text-sm">Advanced protection for your data and campaigns</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 p-2 rounded-full bg-[#d4af37]/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[#d4af37] font-medium">Real-Time Analytics</h3>
                    <p className="text-white/60 text-sm">Track performance with detailed insights and metrics</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-white/40 text-sm mt-auto pt-4">
              &copy; 2025 InfyMailer. Premium email marketing platform.
            </div>
          </div>
          
          {/* Middle column - Login form with tab navigation */}
          <div className="bg-[#0c1d3d] rounded-2xl p-8 flex flex-col shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Sign in to your account
            </h2>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-8 rounded-lg overflow-hidden border border-[#ffffff20]">
                  <TabsTrigger 
                    value="admin" 
                    className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0c2f6c] data-[state=active]:to-[#193555] 
                             data-[state=active]:text-[#d4af37] data-[state=inactive]:bg-[#ffffff08]
                             data-[state=inactive]:text-gray-400 font-medium">
                    Admin Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="client"
                    className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0c2f6c] data-[state=active]:to-[#193555] 
                             data-[state=active]:text-[#d4af37] data-[state=inactive]:bg-[#ffffff08]  
                             data-[state=inactive]:text-gray-400 font-medium">
                    Client Portal
                  </TabsTrigger>
                </TabsList>
                
                {/* Admin Login Form */}
                <TabsContent value="admin" className="mt-0">
                  <Form {...adminForm}>
                    <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-6">
                      <FormField
                        control={adminForm.control}
                        name="usernameOrEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90 font-medium text-sm">Admin Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="admin" 
                                {...field} 
                                className="rounded-lg bg-[#ffffff10] border-[#ffffff20] focus:border-[#d4af37] focus:bg-[#ffffff15] text-white placeholder:text-white/40 shadow-inner" 
                              />
                            </FormControl>
                            <FormMessage className="text-[#ffb4b4]" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={adminForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90 font-medium text-sm">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                                className="rounded-lg bg-[#ffffff10] border-[#ffffff20] focus:border-[#d4af37] focus:bg-[#ffffff15] text-white placeholder:text-white/40 shadow-inner" 
                              />
                            </FormControl>
                            <FormMessage className="text-[#ffb4b4]" />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center justify-between">
                        <FormField
                          control={adminForm.control}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                                />
                              </FormControl>
                              <div className="leading-none">
                                <FormLabel className="font-normal text-sm text-white/80">Remember me</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <div className="text-sm">
                          <a href="#" className="font-medium text-[#d4af37] hover:text-[#f5f0e1] transition-colors">
                            Forgot password?
                          </a>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full mt-2 py-3 bg-gradient-to-r from-[#d4af37] to-[#b38728] hover:from-[#b38728] hover:to-[#d4af37] text-[#09152E] font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                        disabled={isAdminLoading}
                      >
                        {isAdminLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#09152E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </>
                        ) : "Sign in to Admin"}
                      </Button>
                      
                      <div className="mt-4 rounded-lg p-4 text-xs text-white/80 text-center border border-[#ffffff15] bg-[#ffffff05]">
                        <p className="mb-1 font-medium text-[#d4af37]">Demo Credentials</p>
                        <p>Username: <strong>admin</strong> | Password: <strong>admin123</strong></p>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Client Login Form */}
                <TabsContent value="client" className="mt-0">
                  <Form {...clientForm}>
                    <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-6">
                      <FormField
                        control={clientForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90 font-medium text-sm">Client Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="client1" 
                                {...field} 
                                className="rounded-lg bg-[#ffffff10] border-[#ffffff20] focus:border-[#d4af37] focus:bg-[#ffffff15] text-white placeholder:text-white/40 shadow-inner" 
                              />
                            </FormControl>
                            <FormMessage className="text-[#ffb4b4]" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={clientForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90 font-medium text-sm">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                                className="rounded-lg bg-[#ffffff10] border-[#ffffff20] focus:border-[#d4af37] focus:bg-[#ffffff15] text-white placeholder:text-white/40 shadow-inner" 
                              />
                            </FormControl>
                            <FormMessage className="text-[#ffb4b4]" />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center justify-between">
                        <FormField
                          control={clientForm.control}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                                />
                              </FormControl>
                              <div className="leading-none">
                                <FormLabel className="font-normal text-sm text-white/80">Remember me</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <div className="text-sm">
                          <a href="#" className="font-medium text-[#d4af37] hover:text-[#f5f0e1] transition-colors">
                            Forgot password?
                          </a>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full mt-2 py-3 bg-gradient-to-r from-[#0c2f6c] to-[#193555] hover:from-[#193555] hover:to-[#0c2f6c] text-[#d4af37] font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center border border-[#d4af37]/20"
                        disabled={isClientLoading}
                      >
                        {isClientLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#d4af37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </>
                        ) : "Sign in to Client Portal"}
                      </Button>
                      
                      <div className="mt-4 rounded-lg p-4 text-xs text-white/80 text-center border border-[#ffffff15] bg-[#ffffff05]">
                        <p className="mb-1 font-medium text-[#d4af37]">Demo Credentials</p>
                        <p>Username: <strong>client1</strong> | Password: <strong>clientdemo</strong></p>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
          </div>
          
          {/* Right side - Features/Marketing */}
          <div className="hidden lg:flex lg:flex-col lg:justify-between bg-[#0c1d3d] rounded-2xl p-8 shadow-xl text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" 
                 style={{
                   backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'26\' viewBox=\'0 0 52 26\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4af37\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                 }}
            ></div>

            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[#d4af37] to-[#f5f0e1]">
                InfyMailer Platform
              </h1>
              <p className="mt-3 text-lg text-[#f5f0e1]/90">
                The comprehensive email marketing solution for growing businesses
              </p>
            </div>
            
            <div className="space-y-6 my-8 relative z-10">
              <div className="flex items-start bg-white/10 p-4 rounded-lg hover:bg-[#d4af37]/15 transition-all duration-200 border border-[#d4af37]/20">
                <div className="bg-[#d4af37] p-2 rounded-full mr-4 text-[#0c2f6c]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#d4af37]">Advanced Email Marketing</h3>
                  <p className="text-[#f5f0e1]/90">Create and send beautiful emails that convert</p>
                </div>
              </div>
              <div className="flex items-start bg-white/10 p-4 rounded-lg hover:bg-[#d4af37]/15 transition-all duration-200 border border-[#d4af37]/20">
                <div className="bg-[#d4af37] p-2 rounded-full mr-4 text-[#0c2f6c]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#d4af37]">Intelligent Analytics</h3>
                  <p className="text-[#f5f0e1]/90">Track performance with detailed analytics and reports</p>
                </div>
              </div>
              <div className="flex items-start bg-white/10 p-4 rounded-lg hover:bg-[#d4af37]/15 transition-all duration-200 border border-[#d4af37]/20">
                <div className="bg-[#d4af37] p-2 rounded-full mr-4 text-[#0c2f6c]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#d4af37]">A/B Testing</h3>
                  <p className="text-[#f5f0e1]/90">Optimize your campaigns with powerful testing tools</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-[#d4af37]/20 text-sm text-[#f5f0e1]/70 relative z-10">
              &copy; {new Date().getFullYear()} InfyMailer. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}