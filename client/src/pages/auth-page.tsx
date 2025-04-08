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
import { Mail, Lock } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Main content container with paper-like appearance */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Only show branding section on tablet and larger screens */}
        <div className="hidden md:flex w-full max-w-6xl flex-col md:flex-row">
          {/* Left side - Brand/Logo */}
          <div className="w-full md:w-2/5 bg-gradient-to-br from-primary to-primary/80 p-8 flex flex-col justify-between relative">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-96 bg-white/5 rounded-full blur-3xl transform -translate-y-1/2"></div>
              <div className="absolute left-0 bottom-0 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-2xl transform translate-x-1/4"></div>
            </div>
            
            {/* Logo and branding */}
            <div className="relative z-10 text-center md:text-left">
              <div className="flex flex-col items-center md:items-start">
                <img src={Logo} alt="Infinity Tech Logo" className="h-16 mb-6" />
                <h1 className="text-3xl font-bold text-white">Infinity Tech</h1>
                <div className="h-1 w-16 bg-white/30 rounded my-4"></div>
                <p className="text-white/90 text-lg max-w-xs break-words whitespace-normal">
                  Your complete email marketing solution
                </p>
              </div>
            </div>
            
            {/* Feature highlights */}
            <div className="relative z-10 space-y-6 mt-12">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="text-white flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white whitespace-normal">Advanced Email Marketing</h3>
                  <p className="text-white/80 text-sm whitespace-normal">Create beautiful emails that convert</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="text-white flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white whitespace-normal break-words">Multi-domain Support</h3>
                  <p className="text-white/80 text-sm whitespace-normal">Better deliverability and branding</p>
                </div>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="relative z-10 text-white/70 text-sm mt-6 md:mt-0">
              &copy; {new Date().getFullYear()} Infinity Tech. All rights reserved.
            </div>
          </div>
        </div>
        
        {/* Right side - Login form (full width on mobile) */}
        <div className="w-full md:w-3/5 p-8 md:p-12 mx-auto">
          {/* Logo on mobile only */}
          <div className="md:hidden text-center mb-8">
            <img src={Logo} alt="Infinity Tech Logo" className="h-16 mx-auto mb-2" />
            <h1 className="text-xl font-bold text-primary">Infinity Tech</h1>
          </div>
          
          <div className="w-full max-w-md mx-auto">
            <div className="text-center md:text-left mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="usernameOrEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium block mb-1.5">Username or Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="Enter your username" 
                            {...field} 
                            className="pl-12 h-14 bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-primary focus-visible:ring-2 focus-visible:border-primary outline-none transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm font-medium text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between mb-1.5">
                        <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                        <a href="#" className="text-sm text-primary hover:text-primary/90 transition-colors">
                          Forgot password?
                        </a>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            {...field} 
                            className="pl-12 h-14 bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-primary focus-visible:ring-2 focus-visible:border-primary outline-none transition-all" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm font-medium text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="w-5 h-5 border-gray-300 rounded text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <div className="leading-none">
                          <FormLabel className="text-gray-600 ml-1 cursor-pointer">Remember me</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base font-medium bg-primary hover:bg-primary/90 transition-colors rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </div>
                    ) : "Sign in"}
                  </Button>
                </div>
                
                {/* Demo credentials */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-primary shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Demo Account</h4>
                      <p className="text-gray-600 text-sm mt-1 whitespace-normal break-words">
                        Username: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">admin</span>
                        <br />
                        Password: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">admin123</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-gray-500 text-sm">
                    Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}