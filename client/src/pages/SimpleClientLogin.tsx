import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import LogoColor from '@assets/Logo-white.png';
import { 
  Mail, Lock, Eye, EyeOff, ChevronRight, Shield, ArrowRight, 
  Fingerprint, Sparkles, CheckCircle2, BellRing, LineChart, 
  BarChart, Database, Users, Zap, Globe, Key, Scan, Cpu, 
  LucideIcon, BarChart4, Award, ServerCog, Wifi, QrCode, 
  CircleUser, ShieldCheck, PanelRight, Layers
} from 'lucide-react';

// Define a TypeScripts type for the animated glitch text effects
type GlitchTextProps = {
  text: string;
  className?: string;
};

type AnimatedCounterProps = {
  endValue: number;
  label: string;
  duration?: number;
  icon: React.ReactNode;
};

// Animated Glitch Text Component for cyberpunk effect
const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "" }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative inline-block">
        <span className="inline-block text-white">{text}</span>
        <span className="absolute left-0 top-0 w-full h-full flex overflow-hidden opacity-70">
          <span className="animate-glitch-1 text-[#d4af37] inline-block absolute left-[calc(-100%)] top-0 w-full h-full">
            {text}
          </span>
        </span>
        <span className="absolute left-0 top-0 w-full h-full flex overflow-hidden opacity-70">
          <span className="animate-glitch-2 text-[#4f8dff] inline-block absolute left-[calc(100%)] top-0 w-full h-full">
            {text}
          </span>
        </span>
      </span>
    </div>
  );
};

// Animated counter component for dashboard stats
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ endValue, label, duration = 2000, icon }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;
    
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function for a smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const currentValue = Math.floor(easeOutQuart * endValue);
      
      setCount(currentValue);
      
      if (percentage < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateCount);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [endValue, duration]);
  
  return (
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-gradient-to-br from-[#d4af37]/20 to-blue-600/20 rounded-lg border border-white/10 backdrop-blur-sm">
        {icon}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span 
            ref={countRef} 
            className="font-bold text-xl text-white"
          >
            {count.toLocaleString()}
          </span>
          <span className="text-xs text-blue-300">+</span>
        </div>
        <p className="text-sm text-white/60">{label}</p>
      </div>
    </div>
  );
};

// Animated glowing border component
const GlowingBorder: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4af37] via-blue-500 to-[#d4af37] rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

// Feature badge component
const FeatureBadge = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm p-2 rounded-lg border border-white/5">
    {icon}
    <span className="text-xs font-medium">{text}</span>
  </div>
);

// Login form main component
const SimpleClientLogin = () => {
  // State management
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loginStep, setLoginStep] = useState<'credentials'|'verification'|'complete'>('credentials');
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [securityStatus, setSecurityStatus] = useState<'secure'|'scanning'|'warning'>('secure');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundItemsRef = useRef<HTMLDivElement>(null);
  
  // Stats counters for visual effect
  const stats = [
    { icon: <Users className="h-5 w-5 text-blue-300" />, value: 24897, label: "Active Users" },
    { icon: <Globe className="h-5 w-5 text-[#d4af37]" />, value: 187, label: "Countries Served" },
    { icon: <BarChart4 className="h-5 w-5 text-green-300" />, value: 99.98, label: "Uptime %" },
    { icon: <Shield className="h-5 w-5 text-purple-300" />, value: 100, label: "Security Score" }
  ];
  
  // Security features list
  const securityFeatures = [
    { icon: <ShieldCheck size={14} />, text: "Biometric Auth" },
    { icon: <ServerCog size={14} />, text: "256-bit Encryption" },
    { icon: <Wifi size={14} />, text: "Secure Socket Layer" },
    { icon: <Lock size={14} />, text: "Password Hashing" }
  ];
  
  // Features for right panel
  const marketingFeatures = [
    { 
      icon: <LineChart className="h-5 w-5 text-[#d4af37]" />, 
      title: "AI Analytics Dashboard", 
      description: "Real-time performance tracking with predictive insights powered by machine learning algorithms." 
    },
    { 
      icon: <Cpu className="h-5 w-5 text-blue-400" />, 
      title: "Smart Content Generation", 
      description: "Automated email content creation with AI to maximize engagement and conversion rates." 
    },
    { 
      icon: <Layers className="h-5 w-5 text-green-400" />, 
      title: "Multi-channel Campaigns", 
      description: "Seamlessly manage email, SMS, and social media campaigns from a single interface." 
    }
  ];

  // For animation timing
  const loginTimeout = useRef<NodeJS.Timeout>();
  const verificationInterval = useRef<NodeJS.Timeout>();
  
  // Clear any existing session storage on login page load
  useEffect(() => {
    // Clear existing user data
    sessionStorage.removeItem('clientUser');
    localStorage.removeItem('clientUser');
    
    // Update time
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Initialize 3D background effect
  useEffect(() => {
    if (!backgroundItemsRef.current) return;
    
    const container = backgroundItemsRef.current;
    const items = container.querySelectorAll('.bg-item');
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      items.forEach((item: Element, index) => {
        const depth = 0.05 + (index * 0.01); // Different depths for parallax effect
        const translateX = (x - 0.5) * depth * 100;
        const translateY = (y - 0.5) * depth * 100;
        
        (item as HTMLElement).style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotate(${translateX * 0.02}deg)`;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Initialize canvas and animation for futuristic background
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
    
    // Create grid pattern for cyberpunk effect
    const drawGrid = () => {
      const gridSize = 30;
      const gridColor = 'rgba(65, 105, 225, 0.1)';
      
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    };
    
    // Create futuristic circuit effect
    const drawCircuitLines = (timestamp: number) => {
      interface CircuitNode {
        x: number;
        y: number;
        connections: number;
        pulse: number;
      }
      
      const circuitNodes: CircuitNode[] = [];
      const nodeCount = 15;
      
      // Create nodes spread across the canvas
      for (let i = 0; i < nodeCount; i++) {
        circuitNodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          connections: Math.floor(Math.random() * 3) + 1,
          pulse: Math.random() * 1000
        });
      }
      
      // Draw connections between nodes
      ctx.lineWidth = 0.8;
      
      circuitNodes.forEach((node, index) => {
        for (let i = 0; i < node.connections; i++) {
          const target = circuitNodes[(index + i + 1) % nodeCount];
          
          // Calculate pulse animation (based on time)
          const pulseOffset = (timestamp + node.pulse) % 3000 / 3000;
          const pulsePosition = pulseOffset * 1.0; // Position of pulse along the line
          
          // Draw the line
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          
          const gradient = ctx.createLinearGradient(node.x, node.y, target.x, target.y);
          gradient.addColorStop(0, 'rgba(65, 105, 225, 0.2)');
          gradient.addColorStop(0.5, 'rgba(65, 105, 225, 0.1)');
          gradient.addColorStop(1, 'rgba(65, 105, 225, 0.2)');
          
          ctx.strokeStyle = gradient;
          ctx.stroke();
          
          // Draw pulse effect
          const pulseX = node.x + (target.x - node.x) * pulsePosition;
          const pulseY = node.y + (target.y - node.y) * pulsePosition;
          
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
          ctx.fill();
        }
        
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(65, 105, 225, 0.5)';
        ctx.fill();
      });
    };
    
    // Animation loop
    let animationFrameId: number;
    
    const render = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the grid
      drawGrid();
      
      // Draw futuristic circuit effect
      drawCircuitLines(timestamp);
      
      // Draw gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(10, 25, 41, 0.9)');
      gradient.addColorStop(0.5, 'rgba(17, 43, 74, 0.7)');
      gradient.addColorStop(1, 'rgba(26, 58, 95, 0.9)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    animationFrameId = window.requestAnimationFrame(render);
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Handle the login verification progress
  useEffect(() => {
    if (loginStep === 'verification') {
      verificationInterval.current = setInterval(() => {
        setVerificationProgress(prev => {
          const newValue = prev + 4; // Increment by 4% each time
          if (newValue >= 100) {
            clearInterval(verificationInterval.current);
            setLoginStep('complete');
            return 100;
          }
          return newValue;
        });
      }, 120);
    }
    
    return () => {
      if (verificationInterval.current) {
        clearInterval(verificationInterval.current);
      }
    };
  }, [loginStep]);

  // Handle successful login completion
  useEffect(() => {
    if (loginStep === 'complete') {
      loginTimeout.current = setTimeout(() => {
        window.location.href = '/client-dashboard';
      }, 1500);
    }
    
    return () => {
      if (loginTimeout.current) {
        clearTimeout(loginTimeout.current);
      }
    };
  }, [loginStep]);

  // Login form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo login with hardcoded credentials
    if (username === 'client1' && password === 'clientdemo') {
      setIsLoading(true);
      setSuccess(true);
      setSecurityStatus('scanning');
      
      // Create a mock client user object with enhanced data
      const clientUser = {
        id: 1,
        username: 'client1',
        name: 'Demo Client',
        company: 'My Company',
        email: 'client1@example.com',
        role: 'client',
        permissions: ['view_campaigns', 'edit_campaigns', 'view_contacts', 'edit_contacts'],
        lastLoginAt: new Date().toISOString(),
        sessionId: `sess_${Math.random().toString(36).slice(2)}`,
        verificationLevel: 'high'
      };
      
      // Save the client user data to storage based on remember me option
      if (rememberMe) {
        localStorage.setItem('clientUser', JSON.stringify(clientUser));
      } else {
        sessionStorage.setItem('clientUser', JSON.stringify(clientUser));
      }
      
      // Initiate multi-step login process - first credentials then verification
      setTimeout(() => {
        setLoginStep('verification');
        setIsLoading(false);
      }, 1500);
      
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSecurityStatus('scanning');
      
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          device: navigator.userAgent,
          remember: rememberMe,
          biometric: biometricAuth
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
        permissions: userData.permissions || ['view_campaigns', 'edit_campaigns', 'view_contacts', 'edit_contacts'],
        lastLoginAt: new Date().toISOString(),
        sessionId: `sess_${Math.random().toString(36).slice(2)}`,
        verificationLevel: 'high'
      };
      
      // Save the client user data to storage based on remember me option
      if (rememberMe) {
        localStorage.setItem('clientUser', JSON.stringify(clientUser));
      } else {
        sessionStorage.setItem('clientUser', JSON.stringify(clientUser));
      }
      
      // Initiate multi-step login process
      setTimeout(() => {
        setLoginStep('verification');
        setIsLoading(false);
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
      setSuccess(false);
      setSecurityStatus('warning');
      setIsLoading(false);
    }
  };

  // Render different content based on login step
  const renderLoginStep = () => {
    switch (loginStep) {
      case 'credentials':
        return (
          <div className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="username" className="flex items-center justify-between">
                <span className="text-white/90 font-medium text-sm flex items-center">
                  <CircleUser className="h-3.5 w-3.5 mr-2 text-[#d4af37]" /> 
                  Username
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 animate-pulse">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 mr-1"></span>
                  Active session
                </span>
              </label>
              <GlowingBorder>
                <div className="relative flex items-center bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden focus-within:border-[#d4af37] transition-all duration-300">
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
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                  )}
                </div>
              </GlowingBorder>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="password" className="flex items-center justify-between">
                <span className="text-white/90 font-medium text-sm flex items-center">
                  <Key className="h-3.5 w-3.5 mr-2 text-[#d4af37]" /> 
                  Password
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 mr-1"></span>
                  Secure
                </span>
              </label>
              <GlowingBorder>
                <div className="relative flex items-center bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden focus-within:border-[#d4af37] transition-all duration-300">
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
              </GlowingBorder>
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
                      <span>Secure Sign In</span>
                    </>
                  )}
                </div>
              </button>
            </div>
            
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <div 
                className={`flex-1 p-3 rounded-lg cursor-pointer transition-all duration-300 ${biometricAuth ? 'bg-gradient-to-r from-[#d4af37]/30 to-blue-600/30 border border-[#d4af37]/50' : 'bg-white/5 border border-white/10'}`}
                onClick={() => setBiometricAuth(!biometricAuth)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Scan className={`h-4 w-4 ${biometricAuth ? 'text-[#d4af37]' : 'text-white/60'}`} />
                    <span className={`text-xs font-medium ${biometricAuth ? 'text-white' : 'text-white/60'}`}>
                      Biometric Auth
                    </span>
                  </div>
                  {biometricAuth && (
                    <div className="h-2 w-2 rounded-full bg-[#d4af37] animate-pulse"></div>
                  )}
                </div>
              </div>
              <div 
                className="flex-1 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-300"
                onClick={() => {}}
              >
                <div className="flex items-center space-x-2">
                  <QrCode className="h-4 w-4 text-white/60" />
                  <span className="text-xs font-medium text-white/60">
                    QR Code Login
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/30 via-[#0a1929]/80 to-blue-900/30 backdrop-blur-sm rounded-xl p-4 text-sm text-white/90 border border-white/5">
              <div className="flex items-center space-x-2 mb-2">
                <BellRing className="h-4 w-4 text-[#d4af37]" />
                <p className="font-medium">For demonstration access:</p>
              </div>
              <div className="pl-6 text-sm">
                <p>Username: <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[#d4af37]">client1</span></p>
                <p>Password: <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[#d4af37]">clientdemo</span></p>
              </div>
            </div>
          </div>
        );
        
      case 'verification':
        return (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600/20 to-[#d4af37]/20 border border-white/10 mb-4">
                <Scan className="h-8 w-8 text-[#d4af37] animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Security Verification</h3>
              <p className="text-white/60 text-sm">Authenticating and setting up your secure session...</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#d4af37] to-blue-500 rounded-full"
                  style={{ width: `${verificationProgress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border ${verificationProgress >= 30 ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-500/10 border-gray-500/30'} transition-colors duration-500`}>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-medium text-white/80">Identity Verified</span>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border ${verificationProgress >= 60 ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-500/10 border-gray-500/30'} transition-colors duration-500`}>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-medium text-white/80">Session Secured</span>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border ${verificationProgress >= 80 ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-500/10 border-gray-500/30'} transition-colors duration-500`}>
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-medium text-white/80">Access Granted</span>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border ${verificationProgress >= 100 ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-500/10 border-gray-500/30'} transition-colors duration-500`}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-medium text-white/80">Ready</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-white/60 text-xs">
              <p>Security protocol: <span className="text-[#d4af37]">Enhanced</span></p>
              <p>User: <span className="text-white">{username}</span> • Location: <span className="text-white">Secured</span></p>
            </div>
          </div>
        );
        
      case 'complete':
        return (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500/20 to-[#d4af37]/20 border border-green-500/30 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
              <GlitchText text="Authentication Complete" className="text-xl font-bold mb-2" />
              <p className="text-white/60 text-sm">Redirecting to your dashboard...</p>
            </div>
            
            <div className="text-center">
              <div className="inline-block px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-sm font-medium animate-pulse">
                Dashboard loading...
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full relative text-white flex justify-center items-center overflow-hidden">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10" />
      
      {/* 3D background elements */}
      <div ref={backgroundItemsRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bg-item absolute top-[10%] left-[5%] w-40 h-40 rounded-full bg-blue-500/5 blur-3xl"></div>
        <div className="bg-item absolute bottom-[15%] right-[10%] w-60 h-60 rounded-full bg-[#d4af37]/5 blur-3xl"></div>
        <div className="bg-item absolute top-[40%] right-[15%] w-40 h-40 rounded-full bg-indigo-500/5 blur-3xl"></div>
        <div className="bg-item absolute bottom-[30%] left-[20%] w-40 h-40 rounded-full bg-blue-500/5 blur-3xl"></div>
      </div>
      
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
      {success && loginStep === 'complete' && (
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

      {/* Status Bar */}
      <div className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-md border-b border-white/5 px-4 py-2 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <img src={LogoColor} alt="InfyMailer Logo" className="h-8" />
            <div className="hidden md:block h-4 w-px bg-white/20"></div>
            <div className="hidden md:flex items-center space-x-1">
              <span className="text-xs text-white/60">System Status:</span>
              <span className="text-xs text-green-400 font-medium flex items-center">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="flex items-center bg-white/5 rounded-full px-3 py-1">
                <span className="text-xs text-white/60 mr-2">{currentTime.toLocaleTimeString()}</span>
                <span className={`inline-block h-2 w-2 rounded-full ${securityStatus === 'secure' ? 'bg-green-500' : securityStatus === 'scanning' ? 'bg-blue-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></span>
              </div>
            </div>
            
            <div className="flex space-x-1">
              {securityFeatures.map((feature, index) => (
                <FeatureBadge key={index} icon={feature.icon} text={feature.text} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto z-10 px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Panel - Login Form */}
        <div className="backdrop-blur-lg bg-black/20 p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center mb-4">
                <GlitchText 
                  text="ENTERPRISE" 
                  className="text-xl font-bold tracking-wider mr-2 bg-clip-text text-transparent bg-gradient-to-r from-[#d4af37] to-blue-400"
                />
                <div className="h-6 w-px bg-white/20 mx-2"></div>
                <span className="text-xl font-bold text-white/80">CLIENT PORTAL</span>
              </div>
              
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent my-3"></div>
              
              <div className="flex space-x-2 mb-2">
                {Array.from({length: 4}).map((_, i) => (
                  <div key={i} className={`h-1 w-1 rounded-full ${i === 0 ? 'bg-[#d4af37]' : 'bg-white/30'}`}></div>
                ))}
              </div>
              
              <p className="text-sm text-white/70 text-center max-w-xs">
                Access your secure dashboard with enterprise-grade tools and AI-powered analytics
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {renderLoginStep()}
            </form>
            
            {loginStep === 'credentials' && (
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
            )}
          </div>
        </div>
        
        {/* Right Panel - Information and Features */}
        <div className="backdrop-blur-lg bg-black/20 rounded-2xl border border-white/10 shadow-2xl p-8 relative overflow-hidden hidden lg:block">
          {/* Decorative elements */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
          
          <div className="relative h-full flex flex-col justify-between">
            <div>
              <div className="inline-block px-3 py-1 bg-[#d4af37]/20 backdrop-blur-sm rounded-full text-xs font-medium text-[#d4af37] mb-6 border border-[#d4af37]/20">
                NEXTGEN MARKETING PLATFORM
              </div>
              
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Your <GlitchText text="AI-powered" className="text-[#d4af37]" /> <br />
                marketing command center
              </h2>
              
              <p className="text-white/70 mb-8 max-w-lg">
                Access an integrated suite of cutting-edge tools designed to accelerate your 
                marketing performance with artificial intelligence, real-time analytics, 
                and enterprise security.
              </p>
              
              <div className="grid grid-cols-1 gap-6 mb-8">
                {marketingFeatures.map((feature, index) => (
                  <div 
                    key={index} 
                    className="group flex items-start space-x-4 bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:border-[#d4af37]/30 transition-colors cursor-pointer"
                  >
                    <div className="p-3 bg-gradient-to-br from-[#d4af37]/10 to-blue-600/10 group-hover:from-[#d4af37]/20 group-hover:to-blue-600/20 rounded-lg border border-white/10 group-hover:border-white/20 transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-[#d4af37] transition-colors">{feature.title}</p>
                      <p className="text-sm text-white/60">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <AnimatedCounter 
                    key={index}
                    endValue={stat.value}
                    label={stat.label}
                    icon={stat.icon}
                  />
                ))}
              </div>
            </div>
            
            <div className="mt-10">
              <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#0a1929]/80 to-[#0a1929]/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="p-2 bg-[#d4af37]/20 rounded-lg">
                    <Scan className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="font-medium">Advanced security protocols active</p>
                    <p className="text-xs text-white/60">Your data is protected with multiple layers of encryption</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/30 rounded-lg text-sm font-medium text-[#d4af37] transition-colors">
                  Security Details
                </button>
              </div>
              
              <p className="text-white/40 text-xs mt-6 text-center">
                &copy; {new Date().getFullYear()} InfyMailer Enterprise. <span className="text-[#d4af37]/70 px-1">ISO 27001 Certified</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom status bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md border-t border-white/5 px-4 py-2 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-white/60">Secure Connection</span>
            </div>
            <div className="h-3 w-px bg-white/20"></div>
            <span className="text-xs text-white/60">TLS 1.3</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-xs text-white/60">
              Authentication Server: <span className="text-white/80">Online</span>
            </div>
            <div className="h-3 w-px bg-white/20"></div>
            <div className="text-xs text-white/60">
              API Version: <span className="text-white/80">4.2.1</span>
            </div>
          </div>
          
          <div className="text-xs text-white/60">
            <span className="text-[#d4af37]">AI Assistant</span> is available
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleClientLogin;