import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import LogoColor from '@assets/Logo-white.png';
import { Mail, Lock, Eye, EyeOff, ChevronRight, Shield, ArrowRight } from 'lucide-react';

const SimpleClientLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, speed: number, opacity: number}>>([]);

  // Clear any existing session storage on login page load
  useEffect(() => {
    // Clear any existing client user data to ensure a fresh login
    sessionStorage.removeItem('clientUser');
    localStorage.removeItem('clientUser');
  }, []);

  // Generate particles effect
  useEffect(() => {
    const particlesCount = 80;
    const newParticles = [];
    
    for (let i = 0; i < particlesCount; i++) {
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 0.5,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.7 + 0.3
      });
    }
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === 'client1' && password === 'clientdemo') {
      setIsLoading(true);
      console.log('Attempting direct demo login with:', { username, password });
      
      // Simulate login delay and set session storage
      console.log('Login successful, storing client data and redirecting to dashboard...');
      
      // Create a mock client user object and store in session storage
      const clientUser = {
        id: 1,
        username: 'client1',
        name: 'Demo Client',
        company: 'My Company',
        email: 'client1@example.com',
        role: 'client',
        permissions: ['view_campaigns', 'edit_campaigns', 'view_contacts', 'edit_contacts']
      };
      
      // Save the client user data to session storage
      sessionStorage.setItem('clientUser', JSON.stringify(clientUser));
      
      setTimeout(() => {
        console.log('Navigating to /client-dashboard');
        window.location.href = '/client-dashboard'; // Use direct navigation to ensure redirect works
        setIsLoading(false);
      }, 1000);
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }
      
      // Login successful through API
      console.log('API login successful, storing client data and redirecting to dashboard...');
      
      // Extract user data from response
      const userData = await response.json();
      
      // Create a client user object with necessary data
      const clientUser = {
        id: userData.id || 1,
        username: userData.username || username,
        name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'API Client',
        company: userData.company || 'API Client Company',
        email: userData.email || `${username}@example.com`,
        role: userData.role || 'client',
        permissions: userData.permissions || ['view_campaigns', 'edit_campaigns', 'view_contacts', 'edit_contacts']
      };
      
      // Save the client user data to session storage
      sessionStorage.setItem('clientUser', JSON.stringify(clientUser));
      
      // Redirect to dashboard
      window.location.href = '/client-dashboard';
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#052e2e] via-[#0a4b4b] to-[#106b6b] text-white flex flex-col justify-center overflow-hidden">
      {/* Particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, index) => (
          <div 
            key={index}
            className="absolute rounded-full bg-[#14b8a6]"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px rgba(20, 184, 166, 0.3)`
            }}
          />
        ))}
        <div className="absolute inset-0 bg-[url('/assets/infy.png')] bg-center bg-no-repeat opacity-5 mix-blend-overlay"></div>
        
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#052e2e] to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#052e2e] to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-[#14b8a6]/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-[#106b6b]/30 blur-3xl"></div>
        
        {/* Animated borders */}
        <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] border border-[#14b8a6]/10 rounded-3xl"></div>
        <div className="absolute top-[15%] left-[15%] w-[70%] h-[70%] border border-[#14b8a6]/5 rounded-3xl"></div>
      </div>
      
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down">
          {error}
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-md w-full">
          <div className="backdrop-blur-sm bg-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative">
            {/* Glow effect */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#14b8a6]/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#106b6b]/30 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <div className="text-center">
                <img src={LogoColor} alt="InfyMailer Logo" className="h-32 mx-auto mb-6 drop-shadow-xl" />
                <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-white via-[#14b8a6] to-white inline-block text-transparent bg-clip-text">
                  NextGen Portal
                </h2>
                <div className="w-32 h-1 mx-auto bg-gradient-to-r from-transparent via-[#14b8a6] to-transparent my-3"></div>
                <p className="text-sm text-white/70">
                  Access your premium AI-powered marketing suite
                </p>
              </div>
              
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="username" className="text-white/80 font-medium text-sm block mb-2 flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-2 text-[#14b8a6]" />
                    Username
                  </label>
                  <div className="flex items-center relative bg-white/5 border border-white/20 rounded-lg focus-within:ring-1 focus-within:ring-[#14b8a6]/50 focus-within:border-[#14b8a6]/30 transition-all duration-300 backdrop-blur-sm">
                    <div className="h-full aspect-square flex items-center justify-center bg-[#14b8a6]/10 rounded-l-lg border-r border-white/10">
                      <Mail className="h-4 w-4 text-[#14b8a6]" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="py-3 px-3 block w-full bg-transparent border-0 rounded-r-lg focus:outline-none text-white"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="text-white/80 font-medium text-sm block mb-2 flex items-center">
                    <Shield className="h-3.5 w-3.5 mr-2 text-[#14b8a6]" />
                    Password
                  </label>
                  <div className="flex items-center relative bg-white/5 border border-white/20 rounded-lg focus-within:ring-1 focus-within:ring-[#14b8a6]/50 focus-within:border-[#14b8a6]/30 transition-all duration-300 backdrop-blur-sm">
                    <div className="h-full aspect-square flex items-center justify-center bg-[#14b8a6]/10 rounded-l-lg border-r border-white/10">
                      <Lock className="h-4 w-4 text-[#14b8a6]" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="py-3 px-3 block w-full bg-transparent border-0 rounded-r-lg focus:outline-none text-white"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-[#14b8a6] transition-colors"
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
                    className="w-full py-3 bg-gradient-to-r from-[#14b8a6] to-[#14b8a6]/70 hover:from-[#14b8a6]/70 hover:to-[#14b8a6] text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden relative group"
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
                  </button>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-xs text-white/80 text-center border border-white/10">
                  <p className="mb-1 font-medium text-[#14b8a6]">For demonstration purposes:</p>
                  <p>Username: <strong>client1</strong> | Password: <strong>clientdemo</strong></p>
                </div>
              </form>
              
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
                  className="font-medium text-[#14b8a6] hover:text-white transition-colors duration-200 inline-flex items-center"
                >
                  Switch to Admin Login <ChevronRight className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} InfyMailer. <span className="px-1 text-[#14b8a6]/70">Enterprise Platform</span> All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleClientLogin;