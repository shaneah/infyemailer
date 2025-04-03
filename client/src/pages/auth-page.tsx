import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import * as infyLogo from '@assets/infy.png';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.usernameOrEmail || !loginData.password) {
      toast({
        title: 'Error',
        description: 'Please enter both username/email and password',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await loginMutation.mutateAsync(loginData);
      navigate('/dashboard');
    } catch (error) {
      // Error handling is done in the useAuth hook
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.username || !registerData.email || !registerData.password) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await registerMutation.mutateAsync({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        role: 'user',
      });
      navigate('/dashboard');
    } catch (error) {
      // Error handling is done in the useAuth hook
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Auth form column */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <img src={infyLogo.default} alt="InfyMailer" className="h-12" />
            </div>
            <CardTitle className="text-3xl font-bold">InfyMailer</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to start managing your email campaigns
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="usernameOrEmail">Username or Email</Label>
                    <Input 
                      id="usernameOrEmail" 
                      placeholder="Enter your username or email" 
                      value={loginData.usernameOrEmail}
                      onChange={(e) => setLoginData({ ...loginData, usernameOrEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Enter your password" 
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : 'Sign In'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input 
                      id="register-username" 
                      placeholder="Choose a username" 
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      placeholder="Create a password" 
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="Confirm your password" 
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : 'Create Account'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Hero column - only shown on larger screens */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary-800 text-white p-8 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6">Welcome to InfyMailer</h1>
          <p className="text-xl mb-8">
            The comprehensive email marketing platform for creating, managing, and analyzing your email campaigns.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Campaign Management</h3>
                <p>Create and manage email campaigns with ease</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Template Builder</h3>
                <p>Drag-and-drop email template builder</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20v-6M9 17l3 3 3-3M20 4v6M16 7l4 3 4-3M4 20v-6M1 17l3 3 3-3M4 4v6M7 7l-3 3-3-3"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Advanced Analytics</h3>
                <p>Track campaign performance with detailed analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}