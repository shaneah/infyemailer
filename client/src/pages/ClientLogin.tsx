import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Eye, EyeOff, ChevronRight, ArrowRight, Shield, BarChart3, Zap, Layers } from 'lucide-react';
import LogoWhite from '@/assets/Logo-white.png';

// Form schema
const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type FormValues = z.infer<typeof formSchema>;

// Particle type
type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
};

const ClientLogin = () => {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const { toast } = useToast();

  // Generate particles for background effect
  useEffect(() => {
    const particlesCount = 60;
    const newParticles = Array.from({ length: particlesCount }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.7 + 0.3
    }));
    
    setParticles(newParticles);
    
    const interval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          y: particle.y - particle.speed > 0 ? particle.y - particle.speed : 100,
          x: particle.x + (Math.random() * 0.4 - 0.2)
        }))
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

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
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    toast({
      title: 'Attempting login',
      description: `Logging in as ${data.username}...`
    });
    
    try {
      console.log("Login data:", data);
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      // Log the raw response
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      // Clone the response to read it twice (for error and success cases)
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      console.log("Raw response body:", responseText);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }

      let userData;
      try {
        userData = JSON.parse(responseText);

        // Store user data in sessionStorage
        const userToStore = {
          id: userData.id,
          username: userData.username,
          clientId: userData.clientId,
          clientName: userData.clientName || 'Client User',
          clientCompany: userData.clientCompany || 'Company',
          permissions: userData.permissions || {
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
        
        // Show success message
        toast({
          title: 'Login successful',
          description: 'Welcome to InfyMailer client portal!'
        });
        
        // Redirect to campaigns - without leading slash to match the route in App.tsx
        setLocation('client-campaigns');
      } catch (err) {
        console.error("Error parsing success response:", err);
        throw new Error('Failed to parse server response');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid username or password',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#112b4a] to-[#1a3a5f] text-white flex flex-col justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, index) => (
          <div 
            key={index}
            className="absolute rounded-full bg-[#d4af37]"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px rgba(212, 175, 55, 0.3)`
            }}
          />
        ))}
        
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('/assets/infy.png')] bg-center bg-no-repeat opacity-5 mix-blend-overlay"></div>
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-[#d4af37]/5 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-[#1a3a5f]/30 blur-3xl"></div>
        
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0a1929] to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a1929] to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 z-10 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Left column - Form */}
          <div className="backdrop-blur-sm bg-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative">
            {/* Glow effects */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#d4af37]/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#1a3a5f]/30 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <div className="text-center">
                <img src={LogoWhite} alt="InfyMailer Logo" className="h-28 mx-auto mb-6 drop-shadow-xl" />
                <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-white via-[#d4af37] to-white inline-block text-transparent bg-clip-text">
                  Infinity Portal
                </h2>
                <div className="w-32 h-1 mx-auto bg-gradient-to-r from-transparent via-[#d4af37] to-transparent my-3"></div>
                <p className="text-sm text-white/70">
                  Access your premium AI-powered marketing suite
                </p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80 font-medium text-sm flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-2 text-[#d4af37]" />
                          Username
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center relative bg-white/5 border border-white/20 rounded-lg focus-within:ring-1 focus-within:ring-[#d4af37]/50 focus-within:border-[#d4af37]/30 transition-all duration-300 backdrop-blur-sm">
                            <div className="h-full aspect-square flex items-center justify-center bg-[#d4af37]/10 rounded-l-lg border-r border-white/10">
                              <Mail className="h-4 w-4 text-[#d4af37]" />
                            </div>
                            <Input 
                              placeholder="Enter your username" 
                              {...field} 
                              className="py-3 px-3 block w-full bg-transparent border-0 rounded-r-lg focus:outline-none text-white"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80 font-medium text-sm flex items-center">
                          <Shield className="h-3.5 w-3.5 mr-2 text-[#d4af37]" />
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center relative bg-white/5 border border-white/20 rounded-lg focus-within:ring-1 focus-within:ring-[#d4af37]/50 focus-within:border-[#d4af37]/30 transition-all duration-300 backdrop-blur-sm">
                            <div className="h-full aspect-square flex items-center justify-center bg-[#d4af37]/10 rounded-l-lg border-r border-white/10">
                              <Lock className="h-4 w-4 text-[#d4af37]" />
                            </div>
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••" 
                              {...field} 
                              className="py-3 px-3 block w-full bg-transparent border-0 rounded-r-lg focus:outline-none text-white" 
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-[#d4af37] transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#d4af37]/70 hover:from-[#d4af37]/70 hover:to-[#d4af37] text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden relative group"
                    disabled={isLoading}
                  >
                    <span className="absolute inset-0 w-0 bg-white/10 transition-all duration-500 ease-out group-hover:w-full"></span>
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="relative">Authenticating...</span>
                      </>
                    ) : (
                      <span className="flex items-center relative">
                        Access Portal <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-xs text-white/80 text-center border border-white/10">
                    <p className="mb-1 font-medium text-[#d4af37]">For demonstration purposes:</p>
                    <p>Username: <strong>client1</strong> | Password: <strong>clientdemo</strong></p>
                  </div>
                </form>
              </Form>
              
              <div className="mt-6 text-sm text-center">
                <p className="text-white/50 mb-2">
                  Only authorized users with client credentials can access this portal.
                  <br />Contact your account manager if you need assistance.
                </p>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation('auth');
                  }}
                  className="font-medium text-[#d4af37] hover:text-white transition-colors duration-200 inline-flex items-center"
                >
                  Switch to Admin Login <ChevronRight className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Right column - Features */}
          <div className="hidden md:block">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-extrabold mb-2">
                  <span className="text-white">Welcome to </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d4af37] to-[#f5f0e1]">
                    Infinity Tech
                  </span>
                </h1>
                <p className="text-xl text-white/80 max-w-lg">
                  Access premium marketing tools, real-time analytics, and AI-powered insights in one elegant dashboard.
                </p>
              </div>
              
              <div className="space-y-5">
                <div className="feature-card bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#d4af37]/30">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-gradient-to-br from-[#d4af37] to-purple-600 p-3 shadow-lg">
                      <BarChart3 size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics</h3>
                      <p className="text-white/70">Real-time metrics and campaign performance dashboards with AI-driven insights and recommendations.</p>
                    </div>
                  </div>
                </div>
                
                <div className="feature-card bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#d4af37]/30">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-gradient-to-br from-[#d4af37] to-purple-600 p-3 shadow-lg">
                      <Zap size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">AI Optimization</h3>
                      <p className="text-white/70">Smart content suggestions, optimal send time predictions, and audience segmentation tools.</p>
                    </div>
                  </div>
                </div>
                
                <div className="feature-card bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#d4af37]/30">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-gradient-to-br from-[#d4af37] to-purple-600 p-3 shadow-lg">
                      <Layers size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Enterprise Security</h3>
                      <p className="text-white/70">Bank-level encryption, secure access controls, and comprehensive data protection measures.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <div className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Infinity Tech. <span className="px-1 text-[#d4af37]/70">Enterprise Platform</span> All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;