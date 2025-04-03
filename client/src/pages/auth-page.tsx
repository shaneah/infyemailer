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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Logo from "@/assets/Logo-white.png";

// Admin login schema
const adminLoginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false)
});

// Client login schema
const clientLoginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" })
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
type ClientLoginFormValues = z.infer<typeof clientLoginSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isClientLoading, setIsClientLoading] = useState(false);
  const { user, loginMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("admin");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }

    // Check if client user is already logged in
    const clientUser = sessionStorage.getItem('clientUser') || localStorage.getItem('clientUser');
    if (clientUser) {
      setLocation('/client-dashboard');
    }
  }, [user, setLocation]);

  // Admin login form
  const adminForm = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
      rememberMe: false
    }
  });

  // Client login form
  const clientForm = useForm<ClientLoginFormValues>({
    resolver: zodResolver(clientLoginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Handle admin login
  function onAdminSubmit(data: AdminLoginFormValues) {
    setIsAdminLoading(true);
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
          setIsAdminLoading(false);
        }
      }
    );
  }

  // Handle client login
  async function onClientSubmit(data: ClientLoginFormValues) {
    setIsClientLoading(true);
    try {
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const userData = await response.json();
      
      // Store user data in sessionStorage
      const userToStore = {
        id: userData.id,
        username: userData.username,
        clientId: userData.clientId,
        clientName: userData.clientName || 'Client User',
        clientCompany: userData.clientCompany || 'Company',
        permissions: userData.metadata?.permissions || {
          emailValidation: false,
          campaigns: false,
          contacts: false,
          templates: false,
          reporting: false,
          domains: false,
          abTesting: false
        }
      };
      
      sessionStorage.setItem('clientUser', JSON.stringify(userToStore));
      
      toast({
        title: 'Login successful',
        description: `Welcome ${userData.clientName || 'to InfyMailer client portal'}!`
      });
      
      setLocation('client-dashboard');
    } catch (error) {
      console.error("Client login error:", error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid username or password',
        variant: 'destructive'
      });
    } finally {
      setIsClientLoading(false);
    }
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
      
      {/* Right side - Login forms */}
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin">Admin/User</TabsTrigger>
                <TabsTrigger value="client">Client Portal</TabsTrigger>
              </TabsList>
              
              {/* Admin Login Form */}
              <TabsContent value="admin">
                <Form {...adminForm}>
                  <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-6">
                    <FormField
                      control={adminForm.control}
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
                      control={adminForm.control}
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
                      control={adminForm.control}
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
                      disabled={isAdminLoading}
                    >
                      {isAdminLoading ? "Signing in..." : "Sign in as Admin/User"}
                    </Button>
                    
                    <div className="text-xs text-muted-foreground text-center">
                      <p className="mb-1">For demo purposes:</p>
                      <p>Username: <strong>admin</strong> | Password: <strong>admin123</strong></p>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Client Login Form */}
              <TabsContent value="client">
                <Form {...clientForm}>
                  <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-6">
                    <FormField
                      control={clientForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="client1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={clientForm.control}
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
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isClientLoading}
                    >
                      {isClientLoading ? "Logging in..." : "Log in to Client Portal"}
                    </Button>
                    
                    <div className="text-xs text-muted-foreground text-center">
                      <p className="mb-1">For demo purposes:</p>
                      <p>Full Access: <strong>client1</strong> | <strong>client123</strong></p>
                      <p>Limited Access: <strong>email_validator</strong> | <strong>validator123</strong></p>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
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