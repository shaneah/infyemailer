import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Eye, EyeOff, ChevronRight } from 'lucide-react';
import LogoWhite from '@/assets/Logo-white.png';
import LogoColor from '@/assets/infinity-tech-logo.png';

const SimpleClientLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is already logged in
  React.useEffect(() => {
    const clientUser = sessionStorage.getItem('clientUser');
    if (clientUser) {
      // Match the path in App.tsx without leading slash
      setLocation('client-dashboard');
    }
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This is a demo version that bypasses the server
      // We'll accept any username "client1" with any password for demo purposes
      
      console.log("Attempting direct demo login with:", { username, password });
      
      if (username === 'client1') {
        // Create mock user data for demo purposes
        const mockUserData = {
          id: 5,
          username: username,
          clientId: 1,
          clientName: 'Demo Client',
          clientCompany: 'ACME Corp',
          permissions: {
            emailValidation: true,
            campaigns: true,
            contacts: true,
            templates: true,
            reporting: true,
            domains: true,
            abTesting: true
          }
        };
        
        sessionStorage.setItem('clientUser', JSON.stringify(mockUserData));
        
        toast({
          title: 'Login successful',
          description: 'Welcome to InfyMailer client portal!'
        });
        
        // Short delay to show loading state
        setTimeout(() => {
          // Match the path in App.tsx without leading slash
          setLocation('client-dashboard');
        }, 800);
      } else {
        throw new Error('Invalid username. Please use "client1" for demo purposes.');
      }
    } catch (error) {
      console.error('Login error:', error);
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-[#1a3a5f]/90 via-[#1a3a5f] to-[#0d2137]">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {/* Gold shimmer effect */}
        <div className="absolute top-[-10%] left-[20%] w-[70%] h-[40%] rounded-full bg-gradient-to-br from-[#d4af37]/20 to-transparent blur-3xl opacity-70"></div>
        <div className="absolute bottom-[-5%] right-[10%] w-[50%] h-[40%] rounded-full bg-gradient-to-tl from-[#d4af37]/15 to-transparent blur-3xl opacity-60"></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" 
             style={{
               backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23d4af37\' fill-opacity=\'0.4\'%3E%3Cpolygon points=\'0 0 10 0 0 10\'/%3E%3Cpolygon points=\'20 0 20 10 10 0\'/%3E%3Cpolygon points=\'0 20 0 10 10 20\'/%3E%3Cpolygon points=\'10 20 20 20 20 10\'/%3E%3C/g%3E%3C/svg%3E")',
               backgroundSize: '20px 20px'
             }}
        ></div>
        
        {/* Enhanced gold particle effects with animation */}
        <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-[#d4af37]/80 animate-ping" 
             style={{animationDuration: '3s', filter: 'blur(0.5px)'}}></div>
        <div className="absolute top-2/3 left-1/5 w-2.5 h-2.5 rounded-full bg-[#d4af37]/70 animate-ping" 
             style={{animationDuration: '5s', filter: 'blur(1px)'}}></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-[#d4af37]/80 animate-ping" 
             style={{animationDuration: '4s', filter: 'blur(0.5px)'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full bg-[#d4af37]/60 animate-ping" 
             style={{animationDuration: '6s', filter: 'blur(1px)'}}></div>
             
        {/* Additional gold particles */}
        <div className="absolute top-[15%] right-[15%] w-1 h-1 rounded-full bg-[#d4af37]/90 animate-ping" 
             style={{animationDuration: '2.5s', filter: 'blur(0.3px)'}}></div>
        <div className="absolute bottom-[20%] left-[25%] w-1.5 h-1.5 rounded-full bg-[#d4af37]/70 animate-ping" 
             style={{animationDuration: '4.5s', filter: 'blur(0.7px)'}}></div>
        <div className="absolute top-[40%] left-[60%] w-1 h-1 rounded-full bg-[#d4af37]/80 animate-ping" 
             style={{animationDuration: '3.5s', filter: 'blur(0.4px)'}}></div>
        <div className="absolute bottom-[15%] right-[20%] w-2 h-2 rounded-full bg-[#d4af37]/60 animate-ping" 
             style={{animationDuration: '5.5s', filter: 'blur(0.8px)'}}></div>
             
        {/* Floating light streaks */}
        <div className="absolute top-[30%] left-[10%] w-10 h-0.5 rounded-full bg-gradient-to-r from-[#d4af37]/40 to-transparent transform rotate-45 animate-pulse" 
             style={{animationDuration: '7s'}}></div>
        <div className="absolute bottom-[40%] right-[10%] w-12 h-0.5 rounded-full bg-gradient-to-l from-[#d4af37]/30 to-transparent transform -rotate-45 animate-pulse" 
             style={{animationDuration: '8s'}}></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-md w-full">
          <div className="bg-[#f5f0e1] p-8 rounded-2xl shadow-2xl overflow-hidden border border-[#d4af37]/20">
            <div className="text-center">
              <img src={LogoColor} alt="InfyMailer Logo" className="h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-extrabold text-[#1a3a5f] mb-1">
                Client Portal
              </h2>
              <p className="text-sm text-[#1a3a5f]/70">
                Sign in to access your premium email marketing dashboard
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="text-[#1a3a5f] font-medium text-sm block mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1a3a5f]/60 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 block w-full border border-[#d4af37]/30 bg-white rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-[#1a3a5f]"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="text-[#1a3a5f] font-medium text-sm block mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1a3a5f]/60 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 block w-full border border-[#d4af37]/30 bg-white rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-[#1a3a5f]"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1a3a5f]/60 hover:text-[#1a3a5f] transition-colors z-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8860b] hover:from-[#b8860b] hover:to-[#d4af37] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center border border-[#d4af37]/50 overflow-hidden relative group"
                >
                  <span className="absolute left-0 w-0 h-full bg-white/10 transform -skew-x-12 transition-all duration-300 ease-out group-hover:w-full"></span>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    <span className="flex items-center">
                      Sign In <ChevronRight className="ml-1 h-4 w-4" />
                    </span>
                  )}
                </button>
              </div>
              
              <div className="bg-[#d4af37]/10 rounded-lg p-4 text-xs text-[#1a3a5f]/80 text-center border border-[#d4af37]/20">
                <p className="mb-1 font-medium text-[#1a3a5f]">For demonstration purposes:</p>
                <p>Username: <strong>client1</strong> | Password: <strong>clientdemo</strong></p>
              </div>
            </form>
            
            <div className="mt-6 text-sm text-center">
              <p className="text-[#1a3a5f]/70 mb-2">
                Only authorized users with client credentials can access this portal.
                <br />Contact your account manager if you need assistance.
              </p>
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLocation('auth');
                }}
                className="font-medium text-[#1a3a5f] hover:text-[#d4af37] transition-colors duration-200"
              >
                Switch to Admin Login
              </a>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-white/60 text-sm">
              &copy; {new Date().getFullYear()} InfyMailer. <span className="px-1 text-[#d4af37]">Premium Client Portal</span> All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleClientLogin;