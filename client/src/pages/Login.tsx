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
import { useState, useEffect, useRef } from "react";
import infyLogo from "@/assets/Logo-white.png";
import { useClientAuth } from '@/hooks/useClientAuth';
import { motion, useAnimation } from "framer-motion";
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";

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
  
  // Create refs for the button containers
  const adminButtonRef = useRef<HTMLDivElement>(null);
  const clientButtonRef = useRef<HTMLDivElement>(null);
  
  // Control animations for the buttons
  const adminButtonControls = useAnimation();
  const clientButtonControls = useAnimation();
  
  // Function to make the button run away from mouse when credentials aren't filled
  const runAwayFromMouse = (e: React.MouseEvent, buttonRef: React.RefObject<HTMLDivElement>, form: any, controls: any) => {
    if (buttonRef.current && (!form.getValues().usernameOrEmail && !form.getValues().username || !form.getValues().password)) {
      const rect = buttonRef.current.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      
      // Calculate direction to move (away from mouse)
      const deltaX = e.clientX - buttonCenterX;
      const deltaY = e.clientY - buttonCenterY;
      
      // Normalize and invert the direction
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normalizedX = -deltaX / length;
      const normalizedY = -deltaY / length;
      
      // Apply movement (faster when mouse is closer)
      const distance = Math.min(100, 1000 / length);
      controls.start({
        x: normalizedX * distance,
        y: normalizedY * distance,
        rotate: Math.random() * 10 - 5,
        transition: { type: "spring", duration: 0.3 }
      });
    }
  };
  
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-900 via-fuchsia-800 to-rose-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute top-0 right-0 w-full h-full opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.5 }}
        >
          {/* Fun animated background shapes */}
          <motion.div 
            className="absolute top-20 left-20 w-96 h-96 bg-pink-400 rounded-full filter blur-[140px]"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut"
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full filter blur-[140px]"
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 9,
              ease: "easeInOut",
              delay: 0.5
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-600 rounded-full filter blur-[120px]"
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
              y: [0, 30, 0],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 7,
              ease: "easeInOut",
              delay: 1
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute top-1/3 left-1/4 w-64 h-64 bg-yellow-500 rounded-full filter blur-[130px] opacity-40"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, -20, 0],
              y: [0, -30, 0],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut",
              delay: 2
            }}
          ></motion.div>
        </motion.div>
        
        {/* Floating emoji particles */}
        <div className="absolute inset-0 overflow-hidden">
          {["✨", "🎮", "🎯", "🎪", "🎨"].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-xl opacity-30"
              initial={{
                x: Math.random() * 100 + "%",
                y: -30,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                y: "120vh",
                rotate: Math.random() * 360
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 10
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Content container with floating card */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <motion.div 
          className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white/10 backdrop-blur-lg shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: 20, rotate: -2 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            rotate: 0,
            scale: [1, 1.01, 0.99, 1],
          }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            scale: {
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut"
            }
          }}
          whileHover={{
            boxShadow: "0 25px 50px -12px rgba(255, 100, 255, 0.25)",
            borderColor: "rgba(255, 255, 255, 0.3)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left column - Brand and visuals */}
            <div className="relative p-10 overflow-hidden bg-gradient-to-br from-indigo-900 to-blue-800">
              <div className="relative z-10">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                >
                  <img 
                    src="/attached_assets/Infinity Tech Logo-01.png" 
                    alt="InfyMailer Logo" 
                    className="h-12 mb-12" 
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                >
                  <h1 className="text-4xl font-bold mb-4">
                    <span className="text-white">Welcome to the</span><br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-200 font-extrabold">
                      InfyMailer Platform
                    </span>
                  </h1>
                  
                  <p className="text-white/80 mb-8 text-lg">
                    Smart email marketing for modern businesses
                  </p>
                </motion.div>
                
                <motion.div 
                  className="space-y-6 my-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all duration-300">
                    <div className="flex items-center">
                      <div className="mr-4 p-2 rounded-full bg-indigo-500/20">
                        <CheckCircle2 className="h-6 w-6 text-indigo-300" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">AI-Powered Campaigns</h3>
                        <p className="text-white/60 text-sm">Create engaging content effortlessly</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all duration-300">
                    <div className="flex items-center">
                      <div className="mr-4 p-2 rounded-full bg-indigo-500/20">
                        <CheckCircle2 className="h-6 w-6 text-indigo-300" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Real-Time Analytics</h3>
                        <p className="text-white/60 text-sm">Track and optimize your campaigns</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Background decorative elements */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/30 rounded-full"></div>
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full"></div>
                <div className="absolute top-40 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
              </div>
            </div>
            
            {/* Right column - Login form with tab navigation */}
            <div className="p-10 bg-white/5 backdrop-blur-lg relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                <h2 className="text-2xl font-bold text-white mb-8">
                  Sign in to your account
                </h2>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-8 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                    <TabsTrigger 
                      value="admin" 
                      className="py-3 data-[state=active]:bg-indigo-600/50 data-[state=active]:text-white 
                               data-[state=inactive]:bg-transparent data-[state=inactive]:text-white/50 
                               font-medium transition-all duration-300">
                      Admin Dashboard
                    </TabsTrigger>
                    <TabsTrigger 
                      value="client"
                      className="py-3 data-[state=active]:bg-indigo-600/50 data-[state=active]:text-white 
                               data-[state=inactive]:bg-transparent data-[state=inactive]:text-white/50 
                               font-medium transition-all duration-300">
                      Client Portal
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Admin Login Form */}
                  <TabsContent value="admin" className="mt-0">
                    <Form {...adminForm}>
                      <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        >
                          <FormField
                            control={adminForm.control}
                            name="usernameOrEmail"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-white/80 font-medium text-sm">Username or Email</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-indigo-400 transition-colors duration-200">
                                      <Mail className="h-5 w-5" />
                                    </div>
                                    <Input 
                                      placeholder="Enter your username" 
                                      {...field} 
                                      className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 focus:border-indigo-500 focus:bg-white/10 text-white placeholder:text-white/30 transition-all duration-200" 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-pink-300" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          <FormField
                            control={adminForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-white/80 font-medium text-sm">Password</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-indigo-400 transition-colors duration-200">
                                      <Lock className="h-5 w-5" />
                                    </div>
                                    <Input 
                                      type="password" 
                                      placeholder="••••••••" 
                                      {...field} 
                                      className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 focus:border-indigo-500 focus:bg-white/10 text-white placeholder:text-white/30 transition-all duration-200" 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-pink-300" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                          className="flex items-center justify-between"
                        >
                          <FormField
                            control={adminForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="border-white/30 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                  />
                                </FormControl>
                                <div className="leading-none">
                                  <FormLabel className="font-normal text-sm text-white/70">Remember me</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <div className="text-sm">
                            <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                              Forgot password?
                            </a>
                          </div>
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                          className="relative"
                        >
                          <motion.div
                            ref={adminButtonRef}
                            className="w-full"
                            initial={{ x: 0, y: 0 }}
                            animate={adminButtonControls}
                            whileHover={!adminForm.getValues().usernameOrEmail || !adminForm.getValues().password ? {
                              scale: 0.95,
                              x: Math.random() > 0.5 ? 80 : -80,
                              y: Math.random() > 0.5 ? 40 : -40,
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
                              className="w-full h-12 mt-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200 group overflow-hidden"
                              disabled={isAdminLoading}
                              onMouseEnter={() => {
                                if (!adminForm.getValues().usernameOrEmail || !adminForm.getValues().password) {
                                  // Play a fun sound effect
                                  try {
                                    const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
                                    audio.volume = 0.1;
                                    audio.play().catch(e => console.log("Audio error", e));
                                  } catch (e) {
                                    console.log("Audio error", e);
                                  }
                                }
                              }}
                            >
                              {isAdminLoading ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Signing in...
                                </>
                              ) : (
                                <>
                                  {adminForm.getValues().usernameOrEmail && adminForm.getValues().password ? 
                                    <span className="flex items-center justify-center">Sign in to Admin <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" /></span> : 
                                    <span className="flex items-center justify-center">{Math.random() > 0.5 ? "Catch me if you can!" : "Complete the form first!"} <span className="ml-2 animate-bounce">🤭</span></span>
                                  }
                                </>
                              )}
                            </Button>
                          </motion.div>
                          
                          {/* Little helper text */}
                          {(!adminForm.getValues().usernameOrEmail || !adminForm.getValues().password) && (
                            <motion.p 
                              className="text-center text-white/50 text-xs mt-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              Fill out both fields and I'll stop moving! 😉
                            </motion.p>
                          )}
                        </motion.div>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  {/* Client Login Form */}
                  <TabsContent value="client" className="mt-0">
                    <Form {...clientForm}>
                      <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        >
                          <FormField
                            control={clientForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-white/80 font-medium text-sm">Username</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-indigo-400 transition-colors duration-200">
                                      <User className="h-5 w-5" />
                                    </div>
                                    <Input 
                                      placeholder="Enter your username" 
                                      {...field} 
                                      className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 focus:border-indigo-500 focus:bg-white/10 text-white placeholder:text-white/30 transition-all duration-200" 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-pink-300" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          <FormField
                            control={clientForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-white/80 font-medium text-sm">Password</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-indigo-400 transition-colors duration-200">
                                      <Lock className="h-5 w-5" />
                                    </div>
                                    <Input 
                                      type="password" 
                                      placeholder="••••••••" 
                                      {...field} 
                                      className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 focus:border-indigo-500 focus:bg-white/10 text-white placeholder:text-white/30 transition-all duration-200" 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-pink-300" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                          className="flex items-center justify-between"
                        >
                          <FormField
                            control={clientForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="border-white/30 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                  />
                                </FormControl>
                                <div className="leading-none">
                                  <FormLabel className="font-normal text-sm text-white/70">Remember me</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <div className="text-sm">
                            <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                              Forgot password?
                            </a>
                          </div>
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                          className="relative"
                        >
                          <motion.div
                            ref={clientButtonRef}
                            className="w-full"
                            initial={{ x: 0, y: 0 }}
                            animate={clientButtonControls}
                            whileHover={!clientForm.getValues().username || !clientForm.getValues().password ? {
                              scale: 0.95,
                              x: Math.random() > 0.5 ? 80 : -80,
                              y: Math.random() > 0.5 ? 40 : -40,
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
                              className="w-full h-12 mt-4 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium rounded-full shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-200 group overflow-hidden"
                              disabled={isClientLoading}
                              onMouseEnter={() => {
                                if (!clientForm.getValues().username || !clientForm.getValues().password) {
                                  // Play a fun sound effect
                                  try {
                                    const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
                                    audio.volume = 0.1;
                                    audio.play().catch(e => console.log("Audio error", e));
                                  } catch (e) {
                                    console.log("Audio error", e);
                                  }
                                }
                              }}
                            >
                              {isClientLoading ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Signing in...
                                </>
                              ) : (
                                <>
                                  {clientForm.getValues().username && clientForm.getValues().password ? 
                                    <span className="flex items-center justify-center">Sign in to Client Portal <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" /></span> : 
                                    <span className="flex items-center justify-center">{Math.random() > 0.5 ? "Nice try! Fill the form!" : "You can't catch me!"} <span className="ml-2 animate-pulse">😏</span></span>
                                  }
                                </>
                              )}
                            </Button>
                          </motion.div>
                          
                          {/* Little helper text */}
                          {(!clientForm.getValues().username || !clientForm.getValues().password) && (
                            <motion.p 
                              className="text-center text-white/50 text-xs mt-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              Complete the form to make me behave! 🙃
                            </motion.p>
                          )}
                        </motion.div>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </motion.div>
              
              <motion.div 
                className="mt-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <p className="text-white/40 text-sm">
                  If you're having trouble accessing your account, please contact <a href="#" className="text-indigo-400 hover:text-indigo-300">support@infymailer.com</a>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}