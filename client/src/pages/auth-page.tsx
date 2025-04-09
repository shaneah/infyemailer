import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Logo from "@/assets/Logo-white.png";
import Infy from "@/assets/infinity-tech-logo-full.png";
import { Mail, Lock, Info, CheckCircle, ChevronRight } from "lucide-react";

// Admin login schema
const adminLoginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false)
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { user, loginMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Admin login form
  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
      rememberMe: false
    }
  });

  // Handle login
  function onSubmit(data: AdminLoginFormValues) {
    setIsLoading(true);
    loginMutation.mutate(
      {
        usernameOrEmail: data.usernameOrEmail,
        password: data.password
      },
      {
        onSuccess: () => {
          setLocation("/");
        },
        onSettled: () => {
          setIsLoading(false);
        }
      }
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row rounded-xl shadow-2xl overflow-hidden">
        {/* Left side - Brand/Logo */}
        <div className="md:w-2/5 bg-gradient-to-br from-black to-gray-800 p-8 flex-col justify-between relative hidden md:flex">
          {/* Decorative elements - animated data visualization */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {/* Simulated data visualization grid */}
            <div className="absolute top-0 left-0 w-full h-full grid grid-cols-8 grid-rows-12 gap-1">
              {Array.from({ length: 96 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-primary/80 rounded-sm" 
                  style={{ 
                    opacity: Math.random() * 0.8 + 0.2,
                    height: `${Math.random() * 100}%`,
                    animation: `pulse ${Math.random() * 4 + 2}s infinite alternate`
                  }} 
                />
              ))}
            </div>
          </div>
          
          {/* Logo and branding */}
          <div className="relative z-10 mt-4">
            <div className="flex flex-col items-start">
              <div className="mb-6 flex flex-col items-start">
                <div className="relative opacity-0 animate-fade-in animate-glow">
                  <img 
                    src={Infy} 
                    alt="Infinity Tech Logo" 
                    className="h-20 w-auto mb-4 opacity-0 animate-scale-in animation-delay-300" 
                  />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight opacity-0 animate-slide-up animation-delay-600">
                  Infinity<span className="text-primary">Mailer</span>
                </h1>
              </div>
              <div className="h-0.5 w-16 bg-primary rounded my-6 opacity-0 animate-slide-in-left animation-delay-700"></div>
              <p className="text-white text-lg font-light opacity-0 animate-fade-in animation-delay-800">
                Advanced AI-Powered Email Marketing
              </p>
              <p className="text-gray-400 text-sm mt-2 max-w-sm opacity-0 animate-fade-in animation-delay-900">
                Our AI reporting system provides deep insights and optimizes your email campaigns for maximum performance
              </p>
            </div>
          </div>
          
          {/* Feature highlights with code/AI styling */}
          <div className="relative z-10 space-y-4 mt-12">
            <div className="flex items-start space-x-3 p-4 rounded-md bg-black/40 border border-gray-700/50 backdrop-blur-sm transition-all hover:border-primary/50 opacity-0 animate-slide-in-left animation-delay-1000">
              <div className="text-primary font-mono mt-0.5">{">"}</div>
              <div>
                <h3 className="font-medium text-white flex items-center">
                  <span className="text-primary mr-2">AI</span> 
                  Smart Template Generation
                </h3>
                <p className="text-gray-400 text-sm">Data-driven email templates optimized for conversions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-md bg-black/40 border border-gray-700/50 backdrop-blur-sm transition-all hover:border-primary/50 opacity-0 animate-slide-in-left animation-delay-1100">
              <div className="text-primary font-mono mt-0.5">{">"}</div>
              <div>
                <h3 className="font-medium text-white flex items-center">
                  <span className="text-primary mr-2">ML</span> 
                  Advanced Analytics Engine
                </h3>
                <p className="text-gray-400 text-sm">Real-time data processing for actionable insights</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-md bg-black/40 border border-gray-700/50 backdrop-blur-sm transition-all hover:border-primary/50 opacity-0 animate-slide-in-left animation-delay-1200">
              <div className="text-primary font-mono mt-0.5">{">"}</div>
              <div>
                <h3 className="font-medium text-white flex items-center">
                  <span className="text-primary mr-2">API</span> 
                  Multi-domain Integration
                </h3>
                <p className="text-gray-400 text-sm">Seamless connection with all major email providers</p>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="relative z-10 text-gray-500 text-sm mt-6 flex flex-col">
            <div className="text-xs text-gray-600 font-mono mb-2">v3.4.2 • AI Engine: GPT-4o</div>
            &copy; {new Date().getFullYear()} Infinity Tech. All rights reserved.
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-3/5 p-6 md:p-12 bg-gray-900 text-white">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 md:hidden">
            <div className="relative mb-4 opacity-0 animate-fade-in animate-glow">
              <img 
                src={Infy} 
                alt="Infinity Tech Logo" 
                className="h-24 w-auto opacity-0 animate-scale-in animation-delay-300" 
              />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2 opacity-0 animate-slide-up animation-delay-600">
              Infinity<span className="text-primary">Mailer</span>
            </h1>
            <p className="text-gray-400 text-center max-w-xs opacity-0 animate-fade-in animation-delay-800">
              Advanced AI-Powered Email Marketing
            </p>
          </div>
          
          <Card className="border-0 shadow-none bg-transparent opacity-0 animate-fade-in animation-delay-700">
            <CardHeader className="text-center md:text-left pb-2 space-y-1 px-0">
              <div className="flex items-center space-x-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                <div className="text-xs font-mono text-primary">SYSTEM READY</div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-white opacity-0 animate-slide-in-right animation-delay-900">Authentication Portal</CardTitle>
              <CardDescription className="text-gray-400 opacity-0 animate-fade-in animation-delay-1000">Enter credentials to access your dashboard</CardDescription>
            </CardHeader>
            
            <CardContent className="px-0 pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="usernameOrEmail"
                    render={({ field }) => (
                      <FormItem className="opacity-0 animate-slide-in-right animation-delay-1200">
                        <FormLabel className="flex items-center text-gray-300 font-mono text-sm block mb-1.5">
                          <span className="text-primary mr-2">[user]</span>USERNAME
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your username" 
                            {...field} 
                            className="h-12 bg-gray-800/50 border-gray-700 text-white rounded-md focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary outline-none transition-all placeholder:text-gray-500"
                          />
                        </FormControl>
                        <FormMessage className="text-sm font-medium text-red-400 mt-1" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="opacity-0 animate-slide-in-right animation-delay-1400">
                        <div className="flex justify-between mb-1.5">
                          <FormLabel className="flex items-center text-gray-300 font-mono text-sm">
                            <span className="text-primary mr-2">[auth]</span>PASSWORD
                          </FormLabel>
                          <a href="#" className="text-xs text-primary/80 hover:text-primary transition-colors font-mono">
                            RESET_CREDENTIALS
                          </a>
                        </div>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            {...field} 
                            className="h-12 bg-gray-800/50 border-gray-700 text-white rounded-md focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary outline-none transition-all placeholder:text-gray-500"
                          />
                        </FormControl>
                        <FormMessage className="text-sm font-medium text-red-400 mt-1" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between opacity-0 animate-fade-in animation-delay-1600">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="w-4 h-4 border-gray-600 bg-gray-800 rounded text-primary focus:ring-primary"
                            />
                          </FormControl>
                          <div className="leading-none">
                            <FormLabel className="text-gray-400 ml-1 cursor-pointer font-mono text-xs">PERSIST_SESSION</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <a href="#" className="text-xs font-mono text-gray-500 hover:text-primary transition-colors">
                      <span className="text-primary/70 mr-1">[?]</span>SUPPORT
                    </a>
                  </div>
                  
                  <div className="pt-2 opacity-0 animate-slide-up animation-delay-1800">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-sm font-mono tracking-wide rounded-md bg-primary hover:bg-primary/90 transition-colors relative overflow-hidden group animate-glow"
                      disabled={isLoading}
                    >
                      <div className="absolute inset-0 w-full bg-gradient-to-r from-white/5 to-transparent"></div>
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          AUTHENTICATING...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          INITIALIZE SESSION
                          <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>
                    
                    {/* Terminal-like decoration */}
                    <div className="flex items-center mt-4 text-xs text-gray-500 font-mono">
                      <div className="w-2 h-2 bg-primary/50 rounded-full mr-2 animate-pulse"></div>
                      <span className="opacity-70">System ready • Awaiting authentication</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-700/30 mt-6 pt-6 text-center opacity-0 animate-fade-in animation-delay-2000">
                    <p className="text-gray-500 text-xs font-mono">
                      <span className="text-gray-500">CLIENT_ACCESS:</span> <a href="/client-login" className="text-primary/80 hover:text-primary hover:underline font-medium ml-1">PORTAL_LOGIN</a>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}