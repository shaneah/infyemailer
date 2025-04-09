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
import Infy from "@/assets/infy.png";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side - Brand/Logo */}
        <div className="md:w-2/5 bg-gradient-to-br from-primary to-primary/80 p-8 flex-col justify-between relative hidden md:flex">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-0 w-64 h-64 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-xl transform translate-x-1/4 translate-y-1/4"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-lg"></div>
          </div>
          
          {/* Logo and branding */}
          <div className="relative z-10">
            <div className="flex flex-col items-start">
              <img src={Logo} alt="InfyMailer Logo" className="h-16 mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">InfyMailer</h1>
              <div className="h-1 w-16 bg-white/40 rounded my-4"></div>
              <p className="text-white/90 text-lg">
                Your complete email marketing platform
              </p>
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="relative z-10 space-y-4 mt-8">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/10 backdrop-blur-sm transition-all hover:bg-white/15">
              <CheckCircle className="h-5 w-5 text-white mt-0.5" />
              <div>
                <h3 className="font-medium text-white">AI-Powered Templates</h3>
                <p className="text-white/80 text-sm">Create beautiful emails with our AI assistant</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/10 backdrop-blur-sm transition-all hover:bg-white/15">
              <CheckCircle className="h-5 w-5 text-white mt-0.5" />
              <div>
                <h3 className="font-medium text-white">Multi-domain Support</h3>
                <p className="text-white/80 text-sm">Better deliverability and domain reputation</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/10 backdrop-blur-sm transition-all hover:bg-white/15">
              <CheckCircle className="h-5 w-5 text-white mt-0.5" />
              <div>
                <h3 className="font-medium text-white">Advanced Analytics</h3>
                <p className="text-white/80 text-sm">Track and optimize campaign performance</p>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="relative z-10 text-white/70 text-sm mt-6">
            &copy; {new Date().getFullYear()} InfyMailer. All rights reserved.
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-3/5 p-6 md:p-12 bg-white">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 md:hidden">
            <img src={Infy} alt="InfyMailer Logo" className="h-20 mb-3" />
            <h1 className="text-2xl font-bold text-primary mb-2">InfyMailer</h1>
            <p className="text-gray-600 text-center max-w-xs">Your complete email marketing platform</p>
          </div>
          
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center md:text-left pb-2 space-y-1 px-0">
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back</CardTitle>
              <CardDescription className="text-gray-600">Sign in to your administrator dashboard</CardDescription>
            </CardHeader>
            
            <CardContent className="px-0 pt-6">
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
                          <a href="#" className="text-sm text-primary hover:text-primary/90 transition-colors font-medium">
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
                              className="w-5 h-5 border-gray-300 rounded text-primary focus:ring-primary"
                            />
                          </FormControl>
                          <div className="leading-none">
                            <FormLabel className="text-gray-600 ml-1 cursor-pointer font-medium">Remember me</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <a href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                      Need help?
                    </a>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-base font-medium rounded-lg"
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
                      ) : (
                        <div className="flex items-center justify-center">
                          Sign in to Dashboard
                          <ChevronRight className="ml-1 h-5 w-5" />
                        </div>
                      )}
                    </Button>
                  </div>
                  
                  <div className="border-t border-gray-200 mt-6 pt-6 text-center">
                    <p className="text-gray-500 text-sm">
                      Are you a client? <a href="/client-login" className="text-primary hover:underline font-medium">Sign in to Client Portal</a>
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