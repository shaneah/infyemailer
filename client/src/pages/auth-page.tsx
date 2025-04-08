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
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Background for the entire page - gradient with animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#f0f9ff] via-white to-[#e6f7f5] z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(24,119,242,0.2)_0,rgba(24,119,242,0)_50%)] animate-[ping_4s_ease-in-out_infinite]"></div>
      </div>
      
      {/* Main content container */}
      <div className="container max-w-screen-xl mx-auto px-4 py-8 relative z-10 flex flex-col items-center">
        {/* Logo and headline */}
        <div className="text-center mb-8">
          <img src={Logo} alt="Infinity Tech Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Infinity Tech</h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-md mx-auto mt-2">Email Marketing Platform</p>
        </div>
        
        {/* Card container */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Login form - takes up 2/5 of the space on large screens */}
          <div className="lg:col-span-2 w-full">
            <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/70 via-primary to-primary/70"></div>
              
              <CardHeader className="space-y-3 pb-2 pt-6">
                <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-center text-gray-500">
                  Sign in to your account dashboard
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4 px-6 md:px-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="usernameOrEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Username or Email</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute left-3 top-3.5 h-5 w-5 text-primary/60 group-focus-within:text-primary transition-colors duration-200">
                                <Mail className="h-full w-full" />
                              </div>
                              <Input 
                                placeholder="Enter your username" 
                                {...field} 
                                className="pl-10 py-6 bg-gray-50/80 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>
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
                          <div className="flex justify-between">
                            <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                            <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
                          </div>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute left-3 top-3.5 h-5 w-5 text-primary/60 group-focus-within:text-primary transition-colors duration-200">
                                <Lock className="h-full w-full" />
                              </div>
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                {...field} 
                                className="pl-10 py-6 bg-gray-50/80 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-between pt-1">
                      <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                            </FormControl>
                            <div className="leading-none">
                              <FormLabel className="font-normal text-gray-600">Remember me</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full py-6 text-md font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg transition-all hover:shadow-xl rounded-xl mt-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>Sign in</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      )}
                    </Button>
                    
                    <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-xl shadow-sm text-sm text-gray-600">
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary/20 p-1.5 rounded-full flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-primary">Demo credentials:</p>
                          <p className="mt-1">Username: <strong>admin</strong> | Password: <strong>admin123</strong></p>
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4 pt-0 pb-6 px-8 border-t border-gray-100">
                <div className="text-sm text-center text-gray-500 pt-4">
                  <p>Need help? <a href="#" className="text-primary hover:underline">Contact our support team</a></p>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Features section - takes up 3/5 of the space on large screens */}
          <div className="lg:col-span-3 w-full">
            <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 md:p-10 lg:p-12 shadow-lg relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute left-0 bottom-0 w-96 h-96 bg-black/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
              
              {/* Content with glass effect */}
              <div className="relative z-10">
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Email Marketing Tools</h2>
                  <p className="text-lg text-white/90 max-w-2xl">
                    Everything you need to create, optimize, and track successful email campaigns - all in one platform
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Feature tiles */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all hover:translate-y-[-2px] hover:shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white/20 p-2 rounded-full shadow-lg flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">Advanced Email Marketing</h3>
                        <p className="text-white/80 mt-1">Create and send beautiful emails that engage your audience and drive conversions</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all hover:translate-y-[-2px] hover:shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white/20 p-2 rounded-full shadow-lg flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">Intelligent Analytics</h3>
                        <p className="text-white/80 mt-1">Track performance with detailed analytics and reports for data-driven decisions</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all hover:translate-y-[-2px] hover:shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white/20 p-2 rounded-full shadow-lg flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">A/B Testing</h3>
                        <p className="text-white/80 mt-1">Optimize your campaigns with powerful testing tools to maximize results</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all hover:translate-y-[-2px] hover:shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white/20 p-2 rounded-full shadow-lg flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">Multi-domain Support</h3>
                        <p className="text-white/80 mt-1">Manage multiple sending domains for better deliverability and brand consistency</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-10 pt-6 border-t border-white/10">
                  <p className="text-white/70 text-sm">
                    &copy; {new Date().getFullYear()} Infinity Tech. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}