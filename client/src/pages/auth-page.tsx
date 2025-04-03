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
    <div className="min-h-screen flex">
      {/* Left side - Hero/Marketing content */}
      <div className="hidden lg:flex lg:flex-col lg:w-1/2 bg-primary p-10 text-white">
        <div>
          <img src={Logo} alt="InfyMailer Logo" className="h-14 mb-6" />
          <h1 className="text-4xl font-bold">InfyMailer Platform</h1>
          <p className="mt-4 text-lg opacity-80">
            The comprehensive email marketing solution for businesses of all sizes
          </p>
        </div>
        
        <div className="flex-grow flex items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Advanced Email Marketing</h3>
                  <p className="text-sm opacity-80">Create and send beautiful emails that convert</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Intelligent Analytics</h3>
                  <p className="text-sm opacity-80">Track performance with detailed analytics and reports</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">A/B Testing</h3>
                  <p className="text-sm opacity-80">Optimize your campaigns with powerful testing tools</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Multi-domain Support</h3>
                  <p className="text-sm opacity-80">Manage multiple sending domains for better deliverability</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-sm opacity-70">
          &copy; {new Date().getFullYear()} InfyMailer. All rights reserved.
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 items-center">
            <div className="lg:hidden mb-6">
              <img src={Logo} alt="InfyMailer Logo" className="h-14" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Welcome to InfyMailer</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="usernameOrEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username or Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Remember me</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
                
                <div className="text-xs text-muted-foreground text-center">
                  <p className="mb-1">For demo purposes:</p>
                  <p>Username: <strong>admin</strong> | Password: <strong>admin123</strong></p>
                </div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              <p>Contact support for assistance with your account</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}