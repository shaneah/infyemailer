import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import LogoWhite from '@assets/Logo-white.png';
import infinityLogo from '@assets/Infinity Tech Logo-06.png';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Form schema
const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type FormValues = z.infer<typeof formSchema>;

const ClientLogin = () => {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState('');
  const [show2fa, setShow2fa] = useState(false);
  const [twofaUserId, setTwofaUserId] = useState<number|null>(null);
  const [twofaCode, setTwofaCode] = useState('');
  const [is2faLoading, setIs2faLoading] = useState(false);

  // Check if user is already logged in
  React.useEffect(() => {
    const clientUser = sessionStorage.getItem('clientUser') || localStorage.getItem('clientUser');
    if (clientUser) {
      setLocation('client-campaigns');
    }
  }, [setLocation]);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  // Handle login submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          username: form.getValues('username'), 
          password: form.getValues('password') 
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      if (data.require2fa) {
        setTwofaUserId(data.userId);
        setShow2fa(true);
        setIsLoading(false);
        return;
      }
      // Store user data in session storage
      if (data.user) {
        sessionStorage.setItem('clientUser', JSON.stringify(data.user));
        toast({ title: 'Welcome back!', description: `Signed in as ${data.user.clientName || data.user.username}`, variant: 'default' });
        setLocation('/client-dashboard');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      toast({ title: 'Login failed', description: error instanceof Error ? error.message : 'Please try again', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // 2FA submit handler
  const handle2faSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIs2faLoading(true);
    try {
      const response = await fetch('/api/client-2fa/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: twofaUserId, code: twofaCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid 2FA code');
      setShow2fa(false);
      sessionStorage.setItem('clientUser', JSON.stringify(data.user));
      toast({ title: '2FA successful', description: 'Welcome back!' });
      setLocation('/client-dashboard');
    } catch (err) {
      toast({ title: '2FA failed', description: err instanceof Error ? err.message : 'Invalid code', variant: 'destructive' });
    } finally {
      setIs2faLoading(false);
      setTwofaCode('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-700 via-violet-900 to-indigo-900 relative overflow-hidden">
      {/* Meta tag for proper mobile viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-500 rounded-full mix-blend-soft-light filter blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-cyan-500 rounded-full mix-blend-soft-light filter blur-[120px] opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-yellow-400 rounded-full mix-blend-soft-light filter blur-[120px] opacity-20 animate-pulse delay-2000"></div>
      
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo only shown on small screens */}
          <div className="md:hidden flex flex-col items-center justify-center mb-8">
            <img 
              src={infinityLogo} 
              alt="Infinity Tech Logo" 
              className="h-20 mb-4" 
            />
            <h2 className="text-3xl font-bold text-white mb-1">Client Portal</h2>
            <p className="text-indigo-100/80 text-sm">Access your email marketing dashboard</p>
          </div>
          
          <div className="space-y-3 hidden md:block">
            <div className="inline-block rounded-full p-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4">
              <div className="bg-white rounded-full p-1">
                <img 
                  src={infinityLogo} 
                  alt="Infinity Tech Logo" 
                  className="h-12 w-12" 
                />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">
              Welcome back
            </h1>
            <p className="text-indigo-200/80 text-lg">
              Sign in to your client dashboard
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-2.5">
                      <FormLabel className="text-white text-sm font-medium">Username</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-indigo-300 group-focus-within:text-white transition-colors" />
                          </div>
                          <Input 
                            placeholder="Enter your username" 
                            className="pl-11 h-12 sm:h-11 bg-white/5 border-indigo-300/30 focus:border-indigo-400 text-white rounded-xl text-base sm:text-sm py-6 sm:py-3 ring-offset-indigo-900 focus:ring-indigo-400" 
                            {...field}
                            autoCapitalize="none"
                            autoCorrect="off"
                            autoComplete="username"
                            inputMode="text"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-pink-300 text-xs font-medium" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-white text-sm font-medium">Password</FormLabel>
                        <a href="#" className="text-xs text-indigo-300 hover:text-white transition-colors">
                          Forgot password?
                        </a>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-indigo-300 group-focus-within:text-white transition-colors" />
                          </div>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••" 
                            className="pl-11 h-12 sm:h-11 bg-white/5 border-indigo-300/30 focus:border-indigo-400 text-white rounded-xl pr-10 text-base sm:text-sm py-6 sm:py-3 ring-offset-indigo-900 focus:ring-indigo-400" 
                            {...field}
                            autoComplete="current-password"
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-indigo-300 hover:text-white transition-colors touch-manipulation"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-pink-300 text-xs font-medium" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 sm:h-11 rounded-xl py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-900/40 transition-all duration-300 text-base sm:text-sm font-medium mt-3"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      Sign In <ArrowRight className="ml-2 h-5 w-5 sm:h-4 sm:w-4" />
                    </span>
                  )}
                </Button>
                
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-indigo-300/20"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-3 text-indigo-200 font-semibold">Demo Account</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10 text-sm">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex flex-col items-start md:items-center md:flex-row w-full md:w-auto">
                      <span className="text-indigo-200/80">Username:</span>
                      <span className="font-mono font-medium text-pink-300 ml-0 md:ml-2">client1</span>
                    </div>
                    <div className="flex flex-col items-start md:items-center md:flex-row mt-2 md:mt-0 w-full md:w-auto">
                      <span className="text-indigo-200/80">Password:</span>
                      <span className="font-mono font-medium text-pink-300 ml-0 md:ml-2">clientdemo</span>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <div className="flex justify-center items-center space-x-1 text-indigo-200/80">
                <a href="#" onClick={(e) => { e.preventDefault(); setLocation('auth'); }} 
                  className="text-indigo-200 hover:text-white underline-offset-4 hover:underline p-2 touch-manipulation transition-colors font-medium">
                  Switch to Admin Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Brand imagery and features */}
      <div className="w-full md:w-1/2 hidden md:block relative overflow-hidden">
        {/* Abstract wave pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-800/70 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12">
          <div className="absolute top-0 right-0 p-8">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            </div>
          </div>
          
          <img src={infinityLogo} alt="Infinity Tech Logo" className="h-20 mb-12" />
          
          <h2 className="text-4xl font-bold text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">
            Premium Email Marketing Platform
          </h2>
          
          <div className="max-w-md">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="mt-1 mr-4 flex-shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 p-2">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-1">Campaign Analytics</h3>
                  <p className="text-indigo-100/80 text-base">Access real-time performance metrics and detailed insights for all your email campaigns</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mt-1 mr-4 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-2">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-1">AI-Powered Templates</h3>
                  <p className="text-indigo-100/80 text-base">Create stunning emails with our intelligent design assistant and advanced customization tools</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mt-1 mr-4 flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 p-2">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-1">Contact Management</h3>
                  <p className="text-indigo-100/80 text-base">Organize and segment your audience with powerful list management and automation tools</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex items-center justify-center space-x-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12L3 9H21L22 12" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3.5 9L5.5 5H18.5L20.5 9" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="2" y="12" width="20" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 15V16H15V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L14 8H19L16 12L17 17L12 14L7 17L8 12L5 8H10L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 10H7C9 10 10 9 10 7V5C10 3 9 2 7 2H5C3 2 2 3 2 5V7C2 9 3 10 5 10Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 10H19C21 10 22 9 22 7V5C22 3 21 2 19 2H17C15 2 14 3 14 5V7C14 9 15 10 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 22H19C21 22 22 21 22 19V17C22 15 21 14 19 14H17C15 14 14 15 14 17V19C14 21 15 22 17 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 22H7C9 22 10 21 10 19V17C10 15 9 14 7 14H5C3 14 2 15 2 17V19C2 21 3 22 5 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Bottom footer */}
        <div className="absolute bottom-0 left-0 right-0 py-4 bg-gradient-to-t from-slate-900/60 to-transparent">
          <div className="text-center text-slate-400/80 text-xs font-medium">
            &copy; {new Date().getFullYear()} Infinity Tech • Enterprise Email Marketing Solutions
          </div>
        </div>
      </div>
      
      {/* Mobile footer */}
      <div className="md:hidden text-center mt-6 mb-8 text-slate-400/80 text-xs">
        &copy; {new Date().getFullYear()} Infinity Tech • Premium Email Platform
      </div>

      <Dialog open={show2fa} onOpenChange={setShow2fa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          <form onSubmit={handle2faSubmit} className="space-y-4">
            <label htmlFor="twofa-code" className="text-sm font-medium">Enter 2FA Code</label>
            <Input id="twofa-code" value={twofaCode} onChange={e => setTwofaCode(e.target.value)} autoFocus autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required />
            <Button type="submit" disabled={is2faLoading}>{is2faLoading ? 'Verifying...' : 'Verify'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientLogin;