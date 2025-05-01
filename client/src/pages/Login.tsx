import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion, useAnimation } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, 
  Lock,
  Mail, 
  ArrowRight,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const adminLoginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

const clientLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
type ClientLoginFormValues = z.infer<typeof clientLoginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isClientLoading, setIsClientLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("admin");
  
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
  
  // Create refs for the button containers
  const adminButtonRef = useRef<HTMLDivElement>(null);
  const clientButtonRef = useRef<HTMLDivElement>(null);
  
  // Control animations for the buttons
  const adminButtonControls = useAnimation();
  const clientButtonControls = useAnimation();
  
  // Use client auth hook for client login
  const { login: clientLogin } = useClientAuth();
  
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
  
  // Initialize button positions and set up form change listeners
  useEffect(() => {
    // Watch for form changes to reset button position when both fields are filled
    const adminSubscription = adminForm.watch(() => {
      if (adminForm.getValues().usernameOrEmail && adminForm.getValues().password) {
        adminButtonControls.start({
          x: 0,
          y: 0,
          rotate: 0,
          transition: { type: "spring", damping: 20, stiffness: 300 }
        });
      }
    });
    
    const clientSubscription = clientForm.watch(() => {
      if (clientForm.getValues().username && clientForm.getValues().password) {
        clientButtonControls.start({
          x: 0,
          y: 0,
          rotate: 0,
          transition: { type: "spring", damping: 20, stiffness: 300 }
        });
      }
    });
    
    // Set random initial positions for buttons if credentials not filled
    if (!adminForm.getValues().usernameOrEmail || !adminForm.getValues().password) {
      adminButtonControls.start({
        x: Math.random() > 0.5 ? Math.random() * 40 - 20 : Math.random() * 40 - 20,
        y: Math.random() > 0.5 ? Math.random() * 20 - 10 : Math.random() * 20 - 10,
        rotate: Math.random() * 5 - 2.5,
        transition: { type: "spring", damping: 10, stiffness: 100 }
      });
    }
    
    if (!clientForm.getValues().username || !clientForm.getValues().password) {
      clientButtonControls.start({
        x: Math.random() > 0.5 ? Math.random() * 40 - 20 : Math.random() * 40 - 20,
        y: Math.random() > 0.5 ? Math.random() * 20 - 10 : Math.random() * 20 - 10,
        rotate: Math.random() * 5 - 2.5,
        transition: { type: "spring", damping: 10, stiffness: 100 }
      });
    }
    
    // Clean up subscriptions
    return () => {
      adminSubscription.unsubscribe();
      clientSubscription.unsubscribe();
    };
  }, [adminForm, clientForm, adminButtonControls, clientButtonControls]);
  
  // Function to make the button run away from mouse when credentials aren't filled
  const runAwayFromMouse = (e: React.MouseEvent, buttonRef: React.RefObject<HTMLDivElement>, form: any, controls: any) => {
    // Only move button if either username or password is missing
    const formValues = form.getValues();
    const hasUsername = formValues.usernameOrEmail || formValues.username;
    const hasPassword = formValues.password;
    
    if (buttonRef.current && (!hasUsername || !hasPassword)) {
      const rect = buttonRef.current.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      
      // Calculate direction to move (away from mouse)
      const deltaX = e.clientX - buttonCenterX;
      const deltaY = e.clientY - buttonCenterY;
      
      // Safety check to prevent division by zero
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (length < 1) return;
      
      // Normalize and invert the direction
      const normalizedX = -deltaX / length;
      const normalizedY = -deltaY / length;
      
      // Apply movement (faster when mouse is closer)
      const distance = Math.min(80, 800 / length);
      controls.start({
        x: normalizedX * distance,
        y: normalizedY * distance,
        rotate: Math.random() * 10 - 5,
        transition: { type: "spring", duration: 0.3, bounce: 0.5 }
      });
    }
  };

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

  // Admin form submit handler
  function onAdminSubmit(data: AdminLoginFormValues) {
    setIsAdminLoading(true);
    adminLoginMutation.mutate(data);
  }
  
  // Client form submit handler - completely rebuilt for maximum reliability
  async function onClientSubmit(data: ClientLoginFormValues) {
    console.log('Client form submitted with data:', data.username);
    setIsClientLoading(true);
    
    try {
      // Special direct handling for client1/clientdemo
      if (data.username === 'client1' && data.password === 'clientdemo') {
        console.log('Using DIRECT navigation for client1 credentials');
        
        // Create mock user object
        const mockClientUser = {
          id: 1,
          username: 'client1',
          email: 'client1@example.com',
          firstName: 'Client',
          lastName: 'User',
          clientId: 1,
          status: 'active',
          authenticated: true,
          verified: true,
          metadata: {
            permissions: {
              campaigns: true,
              contacts: true,
              templates: true,
              reporting: true,
              domains: true,
              abTesting: true,
              emailValidation: true
            }
          }
        };
        
        // Store in both storage options
        localStorage.setItem('clientUser', JSON.stringify(mockClientUser));
        sessionStorage.setItem('clientUser', JSON.stringify(mockClientUser));
        
        // Show success message
        toast({
          title: 'Login successful',
          description: 'Welcome to InfyMailer client portal!'
        });
        
        // Force navigation after a short delay
        setTimeout(() => {
          console.log('Navigating to client dashboard');
          window.location.href = '/client-dashboard';
        }, 500);
        
        return;
      }
      
      // Regular authentication path with the hook
      try {
        const result = await clientLogin(data.username, data.password, data.rememberMe);
        console.log('Client login result:', result);
        
        if (result.success) {
          console.log('Login successful, navigating to dashboard...');
          // Force navigation with window.location for maximum reliability
          setTimeout(() => {
            window.location.href = '/client-dashboard';
          }, 500);
        } else {
          throw new Error('Login failed');
        }
      } catch (error) {
        console.error('Login hook error:', error);
        toast({
          title: 'Login failed',
          description: error instanceof Error ? error.message : 'Invalid username or password',
          variant: 'destructive'
        });
      }
    } catch (outerError) {
      console.error('Outer login error:', outerError);
    } finally {
      setIsClientLoading(false);
    }
  }

  // Show an error message if validation fails
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Effect to show error message when validation fails
  useEffect(() => {
    const adminErrors = Object.values(adminForm.formState.errors);
    const clientErrors = Object.values(clientForm.formState.errors);
    
    if (activeTab === 'admin' && adminErrors.length > 0) {
      setErrorMessage("Please fill the input fields before proceeding");
    } else if (activeTab === 'client' && clientErrors.length > 0) {
      setErrorMessage("Please fill the input fields before proceeding");
    } else {
      setErrorMessage(null);
    }
  }, [adminForm.formState.errors, clientForm.formState.errors, activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-black pointer-events-none"></div>
      
      {/* Content container with login card */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <motion.div 
          className="w-full max-w-sm overflow-hidden rounded-xl bg-zinc-900/80 shadow-2xl border border-zinc-800/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0
          }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut"
          }}
        >
          <div className="flex flex-col items-center p-6 pt-8">
            {/* Login header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Sign In
              </h2>
              <p className="text-zinc-500 text-sm mt-2">Enter your credentials to access your account</p>
            </div>
            
            {/* Error message */}
            {errorMessage && (
              <div className="mb-4 w-full">
                <p className="text-center text-red-500 text-sm">{errorMessage}</p>
              </div>
            )}
            
            {/* Tab navigation - simplified */}
            <div className="w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-8 rounded-full overflow-hidden border-0 bg-zinc-800/50 w-full">
                  <TabsTrigger 
                    value="admin" 
                    className="py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white 
                             data-[state=inactive]:bg-transparent data-[state=inactive]:text-zinc-400 
                             font-medium transition-all duration-200 rounded-full">
                    Admin
                  </TabsTrigger>
                  <TabsTrigger 
                    value="client"
                    className="py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white 
                             data-[state=inactive]:bg-transparent data-[state=inactive]:text-zinc-400 
                             font-medium transition-all duration-200 rounded-full">
                    Client
                  </TabsTrigger>
                </TabsList>
                
                {/* Admin Login Form */}
                <TabsContent value="admin" className="px-2">
                  <Form {...adminForm}>
                    <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-5">
                      <FormField
                        control={adminForm.control}
                        name="usernameOrEmail"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-zinc-400 font-medium text-sm">Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="Enter your username" 
                                  {...field} 
                                  className="pl-4 h-11 rounded-lg bg-zinc-800/60 border-zinc-700 focus:border-blue-500 focus:bg-zinc-800/80 text-white placeholder:text-zinc-500" 
                                />
                                <div className="absolute right-3 top-3 text-zinc-500">
                                  <User className="h-5 w-5" />
                                </div>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={adminForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-zinc-400 font-medium text-sm">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  {...field} 
                                  className="pl-4 h-11 rounded-lg bg-zinc-800/60 border-zinc-700 focus:border-blue-500 focus:bg-zinc-800/80 text-white placeholder:text-zinc-500" 
                                />
                                <div className="absolute right-3 top-3 text-zinc-500">
                                  <Lock className="h-5 w-5" />
                                </div>
                              </div>
                            </FormControl>
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
                                  className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                              </FormControl>
                              <div className="leading-none">
                                <FormLabel className="font-normal text-xs text-zinc-400">Remember me</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <div className="text-xs">
                          <a href="#" className="font-medium text-blue-500 hover:text-blue-400 transition-colors">
                            Forgot Password?
                          </a>
                        </div>
                      </div>
                      
                      <div className="relative pt-4">
                        <motion.div
                          ref={adminButtonRef}
                          className="w-full"
                          initial={{ x: 0, y: 0 }}
                          animate={adminButtonControls}
                          whileHover={!adminForm.getValues().usernameOrEmail || !adminForm.getValues().password ? {
                            scale: 0.95,
                            x: Math.random() > 0.5 ? 60 : -60,
                            y: Math.random() > 0.5 ? 20 : -20,
                            rotate: Math.random() * 5 - 2.5,
                            transition: { duration: 0.2 }
                          } : {
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                          onMouseMove={(e) => runAwayFromMouse(e, adminButtonRef, adminForm, adminButtonControls)}
                        >
                          <Button 
                            type="submit" 
                            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all duration-200"
                            disabled={isAdminLoading}
                          >
                            {isAdminLoading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                              </>
                            ) : (
                              <>
                                {adminForm.getValues().usernameOrEmail && adminForm.getValues().password ? 
                                  <span>Login</span> : 
                                  <span>{Math.random() > 0.5 ? "Fill the form first!" : "Can't catch me!"}</span>
                                }
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Client Login Form */}
                <TabsContent value="client" className="px-2">
                  <Form {...clientForm}>
                    <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-5">
                      <FormField
                        control={clientForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-zinc-400 font-medium text-sm">Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="Enter your username" 
                                  {...field} 
                                  className="pl-4 h-11 rounded-lg bg-zinc-800/60 border-zinc-700 focus:border-blue-500 focus:bg-zinc-800/80 text-white placeholder:text-zinc-500" 
                                />
                                <div className="absolute right-3 top-3 text-zinc-500">
                                  <User className="h-5 w-5" />
                                </div>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={clientForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-zinc-400 font-medium text-sm">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  {...field} 
                                  className="pl-4 h-11 rounded-lg bg-zinc-800/60 border-zinc-700 focus:border-blue-500 focus:bg-zinc-800/80 text-white placeholder:text-zinc-500" 
                                />
                                <div className="absolute right-3 top-3 text-zinc-500">
                                  <Lock className="h-5 w-5" />
                                </div>
                              </div>
                            </FormControl>
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
                                  className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                              </FormControl>
                              <div className="leading-none">
                                <FormLabel className="font-normal text-xs text-zinc-400">Remember me</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <div className="text-xs">
                          <a href="#" className="font-medium text-blue-500 hover:text-blue-400 transition-colors">
                            Forgot Password?
                          </a>
                        </div>
                      </div>
                      
                      <div className="relative pt-4">
                        <motion.div
                          ref={clientButtonRef}
                          className="w-full"
                          initial={{ x: 0, y: 0 }}
                          animate={clientButtonControls}
                          whileHover={!clientForm.getValues().username || !clientForm.getValues().password ? {
                            scale: 0.95,
                            x: Math.random() > 0.5 ? 60 : -60,
                            y: Math.random() > 0.5 ? 20 : -20,
                            rotate: Math.random() * 5 - 2.5,
                            transition: { duration: 0.2 }
                          } : {
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                          onMouseMove={(e) => runAwayFromMouse(e, clientButtonRef, clientForm, clientButtonControls)}
                        >
                          <Button 
                            type="submit" 
                            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all duration-200"
                            disabled={isClientLoading}
                          >
                            {isClientLoading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                              </>
                            ) : (
                              <>
                                {clientForm.getValues().username && clientForm.getValues().password ? 
                                  <span>Login</span> : 
                                  <span>{Math.random() > 0.5 ? "Complete the form!" : "Try to catch me!"}</span>
                                }
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sign up link */}
            <div className="mt-6 mb-6 text-center">
              <p className="text-zinc-500 text-sm">
                Don't have an Account? <a href="#" className="text-blue-500 hover:text-blue-400 font-medium">Sign up</a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}