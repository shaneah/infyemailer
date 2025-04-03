import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import infyLogo from "@/assets/Logo-white.png";

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false)
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) {
      setLocation('/');
    }
  }, [setLocation]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
      rememberMe: false
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await apiRequest('POST', '/api/login', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
      // Store user data in localStorage or sessionStorage based on remember me
      if (form.getValues().rememberMe) {
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        sessionStorage.setItem('user', JSON.stringify(data));
      }
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    loginMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-primary/5 to-white/80 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[40%] rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-primary/20 to-primary/5 blur-3xl"></div>
        <div className="absolute top-[20%] right-[15%] w-[30%] h-[25%] rounded-full bg-gradient-to-bl from-primary/10 to-primary/5 blur-3xl"></div>
        
        {/* Subtle animated floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-primary/30 animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-2/3 left-1/5 w-3 h-3 rounded-full bg-primary/20 animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-primary/30 animate-pulse" style={{animationDuration: '5s'}}></div>
      </div>
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full space-y-8 flex flex-col lg:flex-row gap-8">
          {/* Left side - Card with form */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-8 sm:px-10">
              <div className="mb-8 text-center">
                <img src={infyLogo} alt="InfyMailer Logo" className="h-14 mx-auto mb-6" />
                <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                  Admin Login
                </h2>
                <p className="text-sm text-gray-600">
                  Sign in to access your admin dashboard
                </p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="usernameOrEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Username or Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="admin" 
                            {...field} 
                            className="rounded-lg border-gray-300 focus:ring-2 focus:ring-primary/50" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
                      control={form.control}
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
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : "Sign in"}
                  </Button>
                  
                  <div className="bg-primary/5 rounded-lg p-3 text-xs text-gray-700 text-center">
                    <p className="mb-1 font-medium">For demo purposes:</p>
                    <p>Username: <strong>admin</strong> | Password: <strong>admin123</strong></p>
                  </div>
                </form>
              </Form>
              
              <div className="mt-6 text-sm text-center">
                <Link to="/client-login" className="font-medium text-primary hover:text-primary-dark">
                  Switch to Client Login
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right side - Features/Marketing */}
          <div className="hidden lg:flex lg:flex-col lg:justify-between lg:flex-1 bg-primary rounded-2xl shadow-xl p-10 text-white">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight">
                InfyMailer Platform
              </h1>
              <p className="mt-3 text-lg text-white/80">
                The comprehensive email marketing solution for growing businesses
              </p>
            </div>
            
            <div className="space-y-6 my-8">
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Advanced Email Marketing</h3>
                  <p className="text-white/80">Create and send beautiful emails that convert</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Intelligent Analytics</h3>
                  <p className="text-white/80">Track performance with detailed analytics and reports</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">A/B Testing</h3>
                  <p className="text-white/80">Optimize your campaigns with powerful testing tools</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/20 text-sm text-white/60">
              &copy; {new Date().getFullYear()} InfyMailer. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}