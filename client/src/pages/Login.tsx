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
      const response = await apiRequest('POST', '/api/login', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        description: "Welcome back to the admin dashboard!"
      });
      // Store user data in localStorage or sessionStorage based on remember me
      if (adminForm.getValues().rememberMe) {
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        sessionStorage.setItem('user', JSON.stringify(data));
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

  // Client login (direct demo implementation mirroring SimpleClientLogin functionality)
  const clientLoginMutation = useMutation({
    mutationFn: async (data: ClientLoginFormValues) => {
      // For demo, we'll validate directly here instead of making a server call
      if (data.username !== 'client1') {
        throw new Error('Invalid username. Please use "client1" for demo purposes.');
      }
      
      // Create mock user data for demo purposes
      return {
        id: 5,
        username: data.username,
        clientId: 1,
        clientName: 'Demo Client',
        clientCompany: 'ACME Corp',
        permissions: {
          emailValidation: true,
          campaigns: true,
          contacts: true,
          templates: true,
          reporting: true,
          domains: true,
          abTesting: true
        }
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        description: "Welcome to InfyMailer client portal!"
      });
      
      // Store user data in localStorage or sessionStorage based on remember me
      if (clientForm.getValues().rememberMe) {
        localStorage.setItem('clientUser', JSON.stringify(data));
      } else {
        sessionStorage.setItem('clientUser', JSON.stringify(data));
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
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-[#0c2f6c]/90 via-[#1a3a5f] to-[#0c2f6c] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 blur-3xl opacity-80"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-[#d4af37]/15 to-transparent blur-3xl"></div>
        <div className="absolute top-[25%] right-[10%] w-[35%] h-[30%] rounded-full bg-gradient-to-bl from-[#f5f0e1]/20 to-[#d4af37]/10 blur-3xl"></div>
        
        {/* Wave pattern overlay */}
        <div className="absolute inset-0 opacity-10" 
             style={{
               backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' viewBox=\'0 0 100 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z\' fill=\'%23d4af37\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
               backgroundSize: '100px 20px'
             }}
        ></div>
        
        {/* Subtle animated floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-[#d4af37]/40 animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-2/3 left-1/5 w-3 h-3 rounded-full bg-[#f5f0e1]/30 animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-[#d4af37]/40 animate-pulse" style={{animationDuration: '5s'}}></div>
        <div className="absolute bottom-1/4 right-1/3 w-4 h-1 rounded-full bg-[#f5f0e1]/30 animate-pulse" style={{animationDuration: '7s'}}></div>
      </div>
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full space-y-8 flex flex-col lg:flex-row gap-8">
          {/* Left side - Card with form */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-8 sm:px-10">
              <div className="mb-6 text-center">
                <img src={infyLogo} alt="InfyMailer Logo" className="h-14 mx-auto mb-4" />
                <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                  Welcome to InfyMailer
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select your login type below
                </p>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 border border-[#d4af37]/30 rounded-md p-1">
                  <TabsTrigger value="admin" className="data-[state=active]:bg-[#1a3a5f] data-[state=active]:text-[#d4af37] font-medium">Admin Login</TabsTrigger>
                  <TabsTrigger value="client" className="data-[state=active]:bg-[#1a3a5f] data-[state=active]:text-[#d4af37] font-medium">Client Portal</TabsTrigger>
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
                            <FormLabel className="text-gray-700 font-medium">Admin Username or Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="admin" 
                                {...field} 
                                className="rounded-lg border-gray-300 focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] focus:shadow-[0_0_0_1px_rgba(212,175,55,0.1)]" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={adminForm.control}
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
                      <div className="flex items-center justify-between">
                        <FormField
                          control={adminForm.control}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal text-gray-700">Remember me</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <div className="text-sm">
                          <a href="#" className="font-medium text-primary hover:text-primary-dark">
                            Forgot password?
                          </a>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full py-2.5 bg-[#1a3a5f] hover:bg-[#0c2f6c] text-[#d4af37] font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center border border-[#d4af37]/30"
                        disabled={isAdminLoading}
                      >
                        {isAdminLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#d4af37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </>
                        ) : "Sign in to Admin"}
                      </Button>
                      
                      <div className="bg-primary/5 rounded-lg p-3 text-xs text-gray-700 text-center">
                        <p className="mb-1 font-medium">For admin demo:</p>
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
                            <FormLabel className="text-gray-700 font-medium">Client Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="client1" 
                                {...field} 
                                className="rounded-lg border-gray-300 focus:ring-2 focus:ring-primary/50" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={clientForm.control}
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
                      <div className="flex items-center justify-between">
                        <FormField
                          control={clientForm.control}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal text-gray-700">Remember me</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <div className="text-sm">
                          <a href="#" className="font-medium text-primary hover:text-primary-dark">
                            Forgot password?
                          </a>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full py-2.5 bg-[#1a3a5f] hover:bg-[#0c2f6c] text-[#d4af37] font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center border border-[#d4af37]/30"
                        disabled={isClientLoading}
                      >
                        {isClientLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#d4af37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </>
                        ) : "Sign in to Client Portal"}
                      </Button>
                      
                      <div className="bg-primary/5 rounded-lg p-3 text-xs text-gray-700 text-center">
                        <p className="mb-1 font-medium">For client demo:</p>
                        <p>Username: <strong>client1</strong> | Password: <strong>clientdemo</strong> (any password works)</p>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Right side - Features/Marketing */}
          <div className="hidden lg:flex lg:flex-col lg:justify-between lg:flex-1 bg-gradient-to-br from-[#1a3a5f] to-[#0c2f6c] rounded-2xl shadow-xl p-10 text-white relative overflow-hidden">
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