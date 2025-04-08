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
    <div className="min-h-screen flex relative">
      {/* Background for the entire page */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-white to-[#f0fdfa] z-0"></div>
        
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary/10 to-primary/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 z-0"></div>
      
      <div className="flex w-full flex-col md:flex-row relative z-10">
        {/* Left side - Login form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img src={Logo} alt="InfyMailer Logo" className="h-24 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-primary">Infinity Tech</h1>
              <p className="text-gray-500">Email Marketing Platform</p>
            </div>
            
            <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md">
              <CardHeader className="space-y-3 pb-2">
                <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-center text-gray-500">
                  Sign in to access your dashboard
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="usernameOrEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Username or Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-primary/60" />
                              <Input 
                                placeholder="admin" 
                                {...field} 
                                className="pl-10 py-7 bg-gray-50/80 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                          <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-primary/60" />
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                                className="pl-10 py-7 bg-gray-50/80 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
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
                      className="w-full py-7 text-md font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg transition-all hover:shadow-xl rounded-xl mt-2"
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
                      ) : "Sign in"}
                    </Button>
                    
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-xl shadow-sm text-sm text-gray-600 text-center">
                      <p className="mb-1 font-medium text-primary">For demo purposes:</p>
                      <p>Username: <strong>admin</strong> | Password: <strong>admin123</strong></p>
                    </div>
                  </form>
                </Form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4 pt-0 pb-6 border-t border-gray-100">
                <div className="text-sm text-center text-gray-500 pt-4">
                  <p>Need help? Contact support for assistance</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* Right side - Hero/Marketing content */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary/90 p-8 flex-col justify-center relative overflow-hidden">
          {/* Decorative patterns */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          
          {/* Wave decoration */}
          <div className="absolute top-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
              <path fill="rgba(255, 255, 255, 0.1)" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,90.7C672,85,768,107,864,144C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
            </svg>
          </div>
          
          {/* Content with glass effect */}
          <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-10 shadow-lg border border-white/20">
            <img src={Logo} alt="Infinity Tech Logo" className="h-16 mb-8" />
            <h1 className="text-4xl font-bold text-white mb-2">Infinity Tech</h1>
            <div className="h-1 w-20 bg-white/40 rounded mb-6"></div>
            <p className="mt-4 text-lg text-white/90 max-w-lg">
              The comprehensive email marketing solution for businesses of all sizes
            </p>
            
            <div className="mt-10 space-y-6">
              {/* Feature list */}
              <div className="flex items-start space-x-4 transition-all duration-300 hover:translate-x-1">
                <div className="bg-white/20 p-2 rounded-full shadow-lg flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white text-lg">Advanced Email Marketing</h3>
                  <p className="text-white/80">Create and send beautiful emails that convert</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 transition-all duration-300 hover:translate-x-1">
                <div className="bg-white/20 p-2 rounded-full shadow-lg flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white text-lg">Intelligent Analytics</h3>
                  <p className="text-white/80">Track performance with detailed analytics and reports</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 transition-all duration-300 hover:translate-x-1">
                <div className="bg-white/20 p-2 rounded-full shadow-lg flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white text-lg">A/B Testing</h3>
                  <p className="text-white/80">Optimize your campaigns with powerful testing tools</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 transition-all duration-300 hover:translate-x-1">
                <div className="bg-white/20 p-2 rounded-full shadow-lg flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white text-lg">Multi-domain Support</h3>
                  <p className="text-white/80">Manage multiple sending domains for better deliverability</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-white/70 text-sm mt-auto relative z-10">
            &copy; {new Date().getFullYear()} Infinity Tech. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}