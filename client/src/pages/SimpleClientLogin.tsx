import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import LogoColor from '@assets/Logo-white.png';
import { 
  Mail, Lock, Eye, EyeOff, ChevronRight, Shield, ArrowRight, 
  Fingerprint, Sparkles, CheckCircle2, BellRing, LineChart, 
  BarChart, Database, Users, Zap, Globe, Key
} from 'lucide-react';

const SimpleClientLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [, setLocation] = useLocation();
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, speed: number, opacity: number, color: string}>>([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Clear any existing session storage on login page load
  useEffect(() => {
    // Clear any existing client user data to ensure a fresh login
    sessionStorage.removeItem('clientUser');
    localStorage.removeItem('clientUser');
  }, []);

  // Initialize canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match parent container
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Generate stars/particles
    const particlesCount = 120;
    const newParticles = [];
    const colors = ['#d4af37', '#e5e5e5', '#91a7ff', '#3b82f6'];
    
    for (let i = 0; i < particlesCount; i++) {
      newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.2 + 0.1,
        opacity: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setParticles(newParticles);
    
    // Animation 
    let animationFrameId: number;
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
      particles.forEach((particle, index) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
        
        // Update position
        particles[index] = {
          ...particle,
          y: particle.y - particle.speed > 0 ? particle.y - particle.speed : canvas.height,
          x: particle.x + (Math.random() * 0.4 - 0.2)
        };
      });
      
      // Draw gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(10, 25, 41, 0.9)');
      gradient.addColorStop(0.5, 'rgba(17, 43, 74, 0.5)');
      gradient.addColorStop(1, 'rgba(26, 58, 95, 0.9)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [particles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === 'client1' && password === 'clientdemo') {
      setIsLoading(true);
      setSuccess(true);
      
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
      
      // Save the client user data to storage based on remember me option
      if (rememberMe) {
        localStorage.setItem('clientUser', JSON.stringify(clientUser));
      } else {
        sessionStorage.setItem('clientUser', JSON.stringify(clientUser));
      }
      
      // Simulate biometric verification for advanced login experience
      setTimeout(() => {
        setIsLoading(false);
        window.location.href = '/client-dashboard';
      }, 1500);
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setLoginAttempts(prev => prev + 1);
      
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          device: navigator.userAgent,
          remember: rememberMe
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }
      
      // Login successful through API
      setSuccess(true);
      
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
      
      // Save the client user data to storage based on remember me option
      if (rememberMe) {
        localStorage.setItem('clientUser', JSON.stringify(clientUser));
      } else {
        sessionStorage.setItem('clientUser', JSON.stringify(clientUser));
      }
      
      // Simulate verification
      setTimeout(() => {
        // Redirect to dashboard
        window.location.href = '/client-dashboard';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
      setSuccess(false);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  };

  // Features list for the right panel
  const features = [
    { icon: <LineChart className="h-5 w-5" />, text: "Advanced Analytics Dashboard" },
    { icon: <BarChart className="h-5 w-5" />, text: "Campaign Performance Metrics" },
    { icon: <Sparkles className="h-5 w-5" />, text: "AI-Powered Email Optimization" },
    { icon: <Database className="h-5 w-5" />, text: "Enterprise Data Security" },
    { icon: <Users className="h-5 w-5" />, text: "Team Collaboration Tools" },
    { icon: <Globe className="h-5 w-5" />, text: "Global Delivery Network" }
  ];

  return (
    <div className="min-h-screen w-full relative text-white flex justify-center items-center">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10" />
      
      {/* Error notification */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-xl z-50 flex items-center space-x-2 animate-fade-in-down border border-red-500/30">
          <div className="bg-red-500/30 p-2 rounded-full">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Authentication Error</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}
      
      {/* Success notification */}
      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-emerald-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-xl z-50 flex items-center space-x-2 animate-fade-in-down border border-emerald-500/30">
          <div className="bg-emerald-500/30 p-2 rounded-full">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Authentication Successful</p>
            <p className="text-xs opacity-80">Preparing your dashboard...</p>
          </div>
        </div>
      )}

      <div className="container max-w-6xl mx-auto z-10 px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        {/* Left Panel - Login Form */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/5 p-8 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex flex-col items-center">
              <img src={LogoColor} alt="InfyMailer Logo" className="h-20 mb-4 drop-shadow-lg" />
              <h2 className="text-3xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d4af37] to-white">
                Enterprise Client Portal
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent my-3"></div>
              <p className="text-sm text-white/70 text-center max-w-xs">
                Access your secure client dashboard with advanced marketing tools and AI-powered insights
              </p>
            </div>
            
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="username" className="flex items-center justify-between">
                  <span className="text-white/90 font-medium text-sm flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-2 text-[#d4af37]" /> 
                    Username
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200">
                    Client ID
                  </span>
                </label>
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/50 to-blue-500/50 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative flex items-center bg-black/20 border border-white/10 rounded-lg overflow-hidden focus-within:border-[#d4af37]/50 transition-colors">
                    <div className="h-full aspect-square flex items-center justify-center bg-gradient-to-br from-[#d4af37]/20 to-blue-600/20 p-3 border-r border-white/5">
                      <Fingerprint className="h-5 w-5 text-white" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full py-3 px-4 bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder:text-white/40"
                      placeholder="Enter client username"
                      autoComplete="username"
                    />
                    {username && (
                      <div className="pr-3">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="password" className="flex items-center justify-between">
                  <span className="text-white/90 font-medium text-sm flex items-center">
                    <Key className="h-3.5 w-3.5 mr-2 text-[#d4af37]" /> 
                    Password
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
                    Secured
                  </span>
                </label>
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/50 to-indigo-500/50 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative flex items-center bg-black/20 border border-white/10 rounded-lg overflow-hidden focus-within:border-[#d4af37]/50 transition-colors">
                    <div className="h-full aspect-square flex items-center justify-center bg-gradient-to-br from-[#d4af37]/20 to-indigo-600/20 p-3 border-r border-white/5">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full py-3 px-4 bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder:text-white/40"
                      placeholder="••••••••••"
                      autoComplete="current-password"
                    />
                    <button 
                      type="button"
                      className="pr-4 text-white/60 hover:text-[#d4af37] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#d4af37] border-[#d4af37]' : 'border-white/30 bg-white/5'}`}
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    {rememberMe && <CheckCircle2 className="h-3 w-3 text-black" />}
                  </div>
                  <label htmlFor="remember-me" className="text-sm text-white/70 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                    Remember me
                  </label>
                </div>
                <div>
                  <a href="#" className="text-sm text-[#d4af37] hover:text-[#d4af37]/80 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#d4af37] to-[#d4af37]/80 hover:from-[#d4af37]/90 hover:to-[#d4af37] text-black font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></span>
                  <div className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Authenticating</span>
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        <span>Sign In to Dashboard</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-blue-900/30 via-[#0a1929]/80 to-blue-900/30 backdrop-blur-sm rounded-xl p-4 text-sm text-white/90 border border-white/5">
                <div className="flex items-center space-x-2 mb-2">
                  <BellRing className="h-4 w-4 text-[#d4af37]" />
                  <p className="font-medium">For demonstration access:</p>
                </div>
                <div className="pl-6 text-sm">
                  <p>Username: <span className="font-mono bg-white/10 px-1 py-0.5 rounded text-[#d4af37]">client1</span></p>
                  <p>Password: <span className="font-mono bg-white/10 px-1 py-0.5 rounded text-[#d4af37]">clientdemo</span></p>
                </div>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLocation('auth');
                }}
                className="inline-flex items-center text-sm text-[#d4af37] hover:text-white/90 transition-colors duration-200 bg-gradient-to-r from-[#0a1929]/80 to-black/0 hover:from-[#0a1929] px-4 py-2 rounded-full"
              >
                <span>Administrator Login</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Information and Features */}
        <div className="lg:col-span-3 backdrop-blur-md bg-blue-900/20 rounded-2xl border border-blue-400/10 shadow-xl p-8 relative overflow-hidden hidden lg:block">
          {/* Decorative elements */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
          
          <div className="relative h-full flex flex-col justify-between">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-500/20 backdrop-blur-sm rounded-full text-xs font-medium text-blue-200 mb-6 border border-blue-400/20">
                InfyMailer Enterprise Platform
              </div>
              
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Welcome to your <span className="text-[#d4af37]">next-generation</span> <br />marketing command center
              </h2>
              
              <p className="text-white/70 mb-8 max-w-lg">
                Access your personalized dashboard with real-time analytics, 
                AI-powered campaign optimization, and enterprise-grade security. 
                All your marketing tools are now in one place.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500/30 to-[#d4af37]/20 rounded-lg border border-white/10">
                      {feature.icon}
                    </div>
                    <div>
                      <p className="font-medium text-white">{feature.text}</p>
                      <p className="text-xs text-white/60">Enterprise ready</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12">
              <div className="flex items-center justify-between bg-gradient-to-r from-[#0a1929]/80 to-blue-900/30 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-[#d4af37]/20 rounded-lg">
                    <Zap className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="font-medium">New AI features available</p>
                    <p className="text-xs text-white/60">Unlock advanced capabilities for your campaigns</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                  Learn More
                </button>
              </div>
              
              <p className="text-white/40 text-xs mt-6 text-center">
                &copy; {new Date().getFullYear()} InfyMailer Enterprise. <span className="text-[#d4af37]/70 px-1">Secured with 256-bit encryption</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleClientLogin;