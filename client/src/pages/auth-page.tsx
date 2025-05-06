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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row rounded-xl shadow-xl overflow-hidden bg-white">
        {/* Left side - Brand/Logo */}
        <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex-col justify-between relative hidden md:flex">
          {/* Decorative elements - professional visualization */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
            </svg>
          </div>
          
          {/* Logo and branding */}
          <div className="relative z-10 mt-4">
            <div className="flex flex-col items-start">
              <div className="mb-6 flex flex-col items-start">
                <div className="relative">
                  <img 
                    src={Infy} 
                    alt="Infinity Tech Logo" 
                    className="h-16 w-auto mb-4" 
                  />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Infinity<span className="text-blue-200">Mailer</span>
                </h1>
              </div>
              <div className="h-0.5 w-16 bg-blue-300 rounded my-6"></div>
              <p className="text-white text-lg font-medium">
                Enterprise Email Marketing
              </p>
              <p className="text-blue-100 text-sm mt-2 max-w-sm">
                Powerful analytics and optimization tools for enterprise-level email marketing campaigns
              </p>
            </div>
          </div>
          
          {/* Feature highlights with professional styling */}
          <div className="relative z-10 space-y-4 mt-12">
            <div className="flex items-start space-x-3 p-4 rounded-md bg-white/10 backdrop-blur-sm transition-all">
              <div>
                <h3 className="font-medium text-white flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-200" /> 
                  Smart Analytics Dashboard
                </h3>
                <p className="text-blue-100 text-sm">Comprehensive performance metrics for informed decisions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-md bg-white/10 backdrop-blur-sm transition-all">
              <div>
                <h3 className="font-medium text-white flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-200" /> 
                  Advanced Segmentation
                </h3>
                <p className="text-blue-100 text-sm">Precision targeting for optimal customer engagement</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-md bg-white/10 backdrop-blur-sm transition-all">
              <div>
                <h3 className="font-medium text-white flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-200" /> 
                  Enterprise Security
                </h3>
                <p className="text-blue-100 text-sm">Industry-leading data protection and compliance</p>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="relative z-10 text-blue-200 text-sm mt-6 flex flex-col">
            <div className="text-xs text-blue-100 mb-2">v3.4.2 • Enterprise Edition</div>
            &copy; {new Date().getFullYear()} Infinity Tech. All rights reserved.
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-3/5 p-6 md:p-12 bg-white text-gray-800">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 md:hidden">
            <div className="relative mb-4">
              <img 
                src={Infy} 
                alt="Infinity Tech Logo" 
                className="h-16 w-auto" 
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
              Infinity<span className="text-blue-600">Mailer</span>
            </h1>
            <p className="text-gray-600 text-center max-w-xs">
              Enterprise Email Marketing Platform
            </p>
          </div>
          
          <Card className="border-0 shadow-md bg-white rounded-xl">
            <CardHeader className="text-center md:text-left pb-2 space-y-1 px-6 pt-6">
              <div className="flex items-center space-x-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="text-xs font-medium text-green-600">Secure Connection</div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">Sign In</CardTitle>
              <CardDescription className="text-gray-500">Access your enterprise dashboard</CardDescription>
            </CardHeader>
            
            <CardContent className="px-6 pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="usernameOrEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-medium block mb-1.5">
                          Username or Email
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your username or email" 
                            {...field} 
                            className="h-11 bg-gray-50 border-gray-200 text-gray-800 rounded-md focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                          />
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
                          <FormLabel className="flex items-center text-gray-700 font-medium">
                            Password
                          </FormLabel>
                          <a href="#" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                            Forgot password?
                          </a>
                        </div>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            {...field} 
                            className="h-11 bg-gray-50 border-gray-200 text-gray-800 rounded-md focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                          />
                        </FormControl>
                        <FormMessage className="text-sm font-medium text-red-500 mt-1" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                            />
                          </FormControl>
                          <div className="leading-none">
                            <FormLabel className="text-gray-600 ml-1 cursor-pointer">Remember me</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      <span className="flex items-center">
                        <Info className="h-4 w-4 mr-1" /> Need help?
                      </span>
                    </a>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-sm font-medium tracking-wide rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors relative overflow-hidden"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing In...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Sign In
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                    
                    {/* Security indication */}
                    <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Lock className="h-3 w-3 mr-1 text-gray-400" />
                        <span>Secure enterprise-grade authentication</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 mt-6 pt-6 text-center">
                    <p className="text-gray-600 text-sm">
                      <span>Client access:</span> <a href="/client-login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium ml-1">Client Portal</a>
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