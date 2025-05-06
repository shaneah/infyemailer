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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row rounded-xl shadow-xl overflow-hidden">
        {/* Left side - Brand/Logo & Information */}
        <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex-col justify-between relative hidden md:flex">
          {/* Decorative background elements - medical/pharma themed */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path fill="white" d="M39.5,-65.1C52.9,-59.5,66.8,-51.8,75.2,-39.7C83.5,-27.7,86.4,-11.2,84.6,4.5C82.9,20.2,76.6,35.2,66.7,47.2C56.8,59.2,43.3,68.2,29.4,70.8C15.4,73.3,1,69.4,-14.2,67.3C-29.5,65.2,-45.6,64.8,-56.5,57.2C-67.4,49.5,-73,34.5,-77.4,19C-81.8,3.5,-84.9,-12.5,-80,-25.1C-75.2,-37.7,-62.4,-46.9,-49,-53.8C-35.6,-60.7,-21.6,-65.4,-7.5,-63.8C6.7,-62.3,26.1,-70.7,39.5,-65.1Z" transform="translate(100 100)" />
              </svg>
            </div>
          </div>
          
          {/* Logo and branding */}
          <div className="relative z-10 mt-4">
            <div className="flex flex-col items-start">
              <div className="mb-6 flex flex-col items-start">
                <div className="relative">
                  <img 
                    src={Infy} 
                    alt="Infinity Tech Logo" 
                    className="h-20 w-auto mb-4" 
                  />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Infinity<span className="text-blue-200">Mailer</span>
                </h1>
              </div>
              <div className="h-0.5 w-16 bg-white rounded my-6"></div>
              <p className="text-white text-lg font-light">
                Secure Healthcare Communication
              </p>
              <p className="text-blue-100 text-sm mt-2 max-w-sm">
                Industry-leading email marketing platform designed specifically for pharmaceutical and healthcare organizations
              </p>
            </div>
          </div>
          
          {/* Feature highlights with healthcare/pharma styling */}
          <div className="relative z-10 space-y-4 mt-12">
            <div className="flex items-start space-x-3 p-4 rounded-md bg-white/10 border border-white/20 backdrop-blur-sm transition-all hover:bg-white/20">
              <div className="bg-white rounded-full p-1.5 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-white flex items-center">
                  HIPAA Compliant
                </h3>
                <p className="text-blue-100 text-sm">Secure messaging that meets healthcare regulations</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-md bg-white/10 border border-white/20 backdrop-blur-sm transition-all hover:bg-white/20">
              <div className="bg-white rounded-full p-1.5 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-white flex items-center">
                  Regulatory Approved
                </h3>
                <p className="text-blue-100 text-sm">FDA and EMA compliant communication platform</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-md bg-white/10 border border-white/20 backdrop-blur-sm transition-all hover:bg-white/20">
              <div className="bg-white rounded-full p-1.5 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-white flex items-center">
                  Advanced Security
                </h3>
                <p className="text-blue-100 text-sm">End-to-end encryption for sensitive healthcare data</p>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="relative z-10 text-blue-100 text-sm mt-6 flex flex-col">
            <div className="flex items-center text-blue-200 text-xs mb-2">
              <Lock className="h-3 w-3 mr-1" />
              <span>Secure Connection • 256-bit Encryption</span>
            </div>
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
                className="h-24 w-auto" 
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
              Infinity<span className="text-blue-600">Mailer</span>
            </h1>
            <p className="text-gray-600 text-center max-w-xs">
              Secure Healthcare Communication
            </p>
          </div>
          
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center md:text-left pb-2 space-y-1 px-0">
              <div className="flex items-center space-x-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="text-xs font-medium text-green-600">Secure System</div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">Please sign in to access your secure dashboard</CardDescription>
            </CardHeader>
            
            <CardContent className="px-0 pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="usernameOrEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">
                          Username or Email
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your username or email" 
                            {...field} 
                            className="h-12 bg-gray-50 border-gray-200 text-gray-900 rounded-md focus-visible:ring-blue-600 focus-visible:ring-1 focus-visible:border-blue-600 outline-none transition-all placeholder:text-gray-400"
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
                          <FormLabel className="font-medium text-gray-700">
                            Password
                          </FormLabel>
                          <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                            Forgot Password?
                          </a>
                        </div>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            {...field} 
                            className="h-12 bg-gray-50 border-gray-200 text-gray-900 rounded-md focus-visible:ring-blue-600 focus-visible:ring-1 focus-visible:border-blue-600 outline-none transition-all placeholder:text-gray-400"
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
                            <FormLabel className="text-gray-600 ml-1 cursor-pointer text-sm">Remember me</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      Need Help?
                    </a>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-medium tracking-wide rounded-md bg-blue-600 hover:bg-blue-700 transition-colors relative overflow-hidden group"
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
                          <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>
                    
                    {/* Security information */}
                    <div className="flex items-center mt-4 text-xs text-gray-500 justify-center">
                      <Lock className="h-3 w-3 mr-1 text-gray-400" />
                      <span>Secured by InfinityMailer Enterprise Security</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 mt-6 pt-6 text-center">
                    <p className="text-gray-600 text-sm">
                      <span>Client Portal:</span> <a href="/client-login" className="text-blue-600 hover:text-blue-800 hover:underline font-medium ml-1">Access Here</a>
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