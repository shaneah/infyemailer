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
import infyLogo from "@/assets/infy.png";
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Hero/Marketing content */}
      <div className="hidden md:flex md:flex-col md:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        {/* Wave decoration at the bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="rgba(255, 255, 255, 0.1)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,133.3C672,139,768,181,864,197.3C960,213,1056,203,1152,170.7C1248,139,1344,85,1392,58.7L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="relative z-10 px-10 py-12 flex flex-col h-full">
          <div>
            <img src={Logo} alt="InfyMailer Logo" className="h-16 mb-8" />
            <h1 className="text-4xl font-bold text-white mb-2">InfyMailer Platform</h1>
            <div className="h-1 w-16 bg-white/40 rounded mb-6"></div>
            <p className="mt-4 text-lg text-white/90 max-w-md">
              The comprehensive email marketing solution for businesses of all sizes
            </p>
          </div>
          
          <div className="flex-grow flex items-center">
            <div className="space-y-10 max-w-md">
              <div className="space-y-6">
                {/* Feature list */}
                <div className="flex items-start space-x-3 transition-all duration-300 hover:translate-x-1">
                  <div className="bg-white/30 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-lg">Advanced Email Marketing</h3>
                    <p className="text-white/80">Create and send beautiful emails that convert</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 transition-all duration-300 hover:translate-x-1">
                  <div className="bg-white/30 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-lg">Intelligent Analytics</h3>
                    <p className="text-white/80">Track performance with detailed analytics and reports</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 transition-all duration-300 hover:translate-x-1">
                  <div className="bg-white/30 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-lg">A/B Testing</h3>
                    <p className="text-white/80">Optimize your campaigns with powerful testing tools</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 transition-all duration-300 hover:translate-x-1">
                  <div className="bg-white/30 p-2 rounded-full">
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
          </div>
          
          <div className="text-white/70 text-sm mt-8">
            &copy; {new Date().getFullYear()} InfyMailer. All rights reserved.
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen md:min-h-0">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 md:hidden">
            <img src={infyLogo} alt="InfyMailer Logo" className="h-20 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary">InfyMailer</h1>
            <p className="text-gray-500">Email Marketing Platform</p>
          </div>
          
          <Card className="border-none shadow-xl">
            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
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
                        <FormLabel className="text-gray-700">Username or Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              placeholder="admin" 
                              {...field} 
                              className="pl-10 py-6 bg-gray-50 border-gray-200 focus:border-primary/50 focus:ring focus:ring-primary/30"
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
                        <FormLabel className="text-gray-700">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              className="pl-10 py-6 bg-gray-50 border-gray-200 focus:border-primary/50 focus:ring focus:ring-primary/30" 
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
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
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
                    className="w-full py-6 text-md font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md transition-all hover:shadow-lg"
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
                  
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-md shadow-sm text-sm text-gray-600 text-center">
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
    </div>
  );
}