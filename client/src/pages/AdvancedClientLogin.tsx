import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import LogoColor from '@assets/Logo-white.png';
import {
  Eye, EyeOff, Lock, Shield, CheckCircle2, 
  Fingerprint, Brain, CircleUser, Key, ChevronRight,
  Globe, Users, Activity, BellRing, Cpu, Network
} from 'lucide-react';

// Advanced Client Login with futuristic interface
const AdvancedClientLogin: React.FC = () => {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Authentication state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginStage, setLoginStage] = useState<'credentials'|'verifying'|'complete'>('credentials');
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [securityLevel, setSecurityLevel] = useState<'standard'|'enhanced'|'maximum'>('enhanced');

  // Canvas and animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const verificationTimerRef = useRef<NodeJS.Timeout>();
  const redirectTimerRef = useRef<NodeJS.Timeout>();
  const [, setLocation] = useLocation();
  
  // Animated stats for visual effect
  const stats = [
    { icon: <Users size={20} className="text-cyan-400" />, value: 24897, label: "Active Users" },
    { icon: <Globe size={20} className="text-amber-400" />, value: 187, label: "Global Regions" },
    { icon: <Activity size={20} className="text-green-400" />, value: 99.9, label: "Uptime %" },
    { icon: <Shield size={20} className="text-purple-400" />, value: 100, label: "Security Score" }
  ];

  // Neural network background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Create neural network nodes
    const NODE_COUNT = 80;
    
    interface Node {
      x: number;
      y: number;
      z: number;
      size: number;
      links: number[];
      vx: number;
      vy: number;
      vz: number;
      color: string;
    }
    
    // Create nodes
    const nodes: Node[] = [];
    const colors = [
      'rgba(102, 228, 255, 0.8)', // Cyan
      'rgba(212, 175, 55, 0.8)',  // Gold
      'rgba(255, 255, 255, 0.7)'  // White
    ];
    
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 500 - 250,
        size: Math.random() * 2 + 1,
        links: [],
        vx: Math.random() * 0.4 - 0.2,
        vy: Math.random() * 0.4 - 0.2,
        vz: Math.random() * 0.4 - 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    // Create links between nodes
    nodes.forEach((node, i) => {
      const linkCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < linkCount; j++) {
        const targetIdx = (i + j + 1) % NODE_COUNT;
        if (!node.links.includes(targetIdx)) {
          node.links.push(targetIdx);
        }
      }
    });
    
    // Animation loop
    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, 'rgba(5, 20, 45, 0.95)');
      bgGradient.addColorStop(1, 'rgba(15, 35, 70, 0.95)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(40, 100, 180, 0.1)';
      ctx.lineWidth = 0.5;
      
      // Horizontal grid
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Vertical grid
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Mouse position for possible future interactivity
      const mouseX = canvas.width / 2; 
      const mouseY = canvas.height / 2;
      
      // Update node positions
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;
        
        // Boundary check
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        if (node.z < -250 || node.z > 250) node.vz *= -1;
      });
      
      // 3D projection
      const fov = 250;
      const viewZ = 1000;
      
      // Sort by Z for proper rendering order
      const sortedNodes = [...nodes].sort((a, b) => a.z - b.z);
      
      // Draw connections
      sortedNodes.forEach(node => {
        node.links.forEach(targetIdx => {
          const target = nodes[targetIdx];
          
          const scale1 = fov / (viewZ + node.z);
          const scale2 = fov / (viewZ + target.z);
          
          const sx = node.x * scale1 + (canvas.width / 2 - node.x * scale1);
          const sy = node.y * scale1 + (canvas.height / 2 - node.y * scale1);
          
          const tx = target.x * scale2 + (canvas.width / 2 - target.x * scale2);
          const ty = target.y * scale2 + (canvas.height / 2 - target.y * scale2);
          
          // Pulse effect along connection
          const pulseTime = (timestamp / 1000 + targetIdx * 0.1) % 2;
          const pulseX = sx + (tx - sx) * pulseTime;
          const pulseY = sy + (ty - sy) * pulseTime;
          
          // Draw connection line
          const gradient = ctx.createLinearGradient(sx, sy, tx, ty);
          gradient.addColorStop(0, node.color.replace('0.8', '0.2'));
          gradient.addColorStop(1, target.color.replace('0.8', '0.2'));
          
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(tx, ty);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.8 * Math.min(scale1, scale2);
          ctx.stroke();
          
          // Draw pulse
          if (pulseTime < 1) {
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 1.5 * Math.min(scale1, scale2), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
            ctx.fill();
          }
        });
      });
      
      // Draw nodes
      sortedNodes.forEach(node => {
        const scale = fov / (viewZ + node.z);
        const x = node.x * scale + (canvas.width / 2 - node.x * scale);
        const y = node.y * scale + (canvas.height / 2 - node.y * scale);
        const size = node.size * scale;
        
        // Node glow
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x, y, size, x, y, size * 3);
        glow.addColorStop(0, node.color.replace('0.8', '0.4'));
        glow.addColorStop(1, node.color.replace('0.8', '0'));
        ctx.fillStyle = glow;
        ctx.fill();
        
        // Node center
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    // Demo login check
    if (username !== 'client1' || password !== 'clientdemo') {
      setError('Invalid credentials. For demo, use: client1 / clientdemo');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Start login process
    setIsLoading(true);
    setError('');
    setLoginStage('verifying');
    
    // Simulate verification progress
    let progress = 0;
    verificationTimerRef.current = setInterval(() => {
      progress += 4;
      setVerificationProgress(progress);
      
      if (progress >= 100) {
        clearInterval(verificationTimerRef.current);
        setLoginSuccess(true);
        setLoginStage('complete');
        
        // Save user session
        const userData = {
          id: 1,
          username: 'client1',
          name: 'Demo Client',
          company: 'InfyTech Solutions',
          role: 'client',
          sessionId: 'sess_' + Math.random().toString(36).slice(2),
          lastLoginAt: new Date().toISOString(),
        };
        
        // Store based on remember me option
        if (rememberMe) {
          localStorage.setItem('clientUser', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('clientUser', JSON.stringify(userData));
        }
        
        // Redirect to dashboard after delay
        redirectTimerRef.current = setTimeout(() => {
          window.location.href = '/client-dashboard';
        }, 2000);
      }
    }, 50);
  };

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (verificationTimerRef.current) clearInterval(verificationTimerRef.current);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  // Toggle security level
  const cycleThroughSecurityLevels = () => {
    if (securityLevel === 'standard') setSecurityLevel('enhanced');
    else if (securityLevel === 'enhanced') setSecurityLevel('maximum');
    else setSecurityLevel('standard');
  };

  // Current time for status bar
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen relative text-white">
      {/* Neural network canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 -z-10" />
      
      {/* Top status bar */}
      <header className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur-md border-b border-white/10 px-4 py-2 z-20">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center space-x-4">
            <img src={LogoColor} alt="InfyMailer" className="h-8" />
            <div className="h-4 w-px bg-white/20 hidden md:block"></div>
            <div className="hidden md:flex items-center space-x-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-white/70">System Operational</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-xs bg-black/20 px-3 py-1 rounded-full border border-white/10 hidden md:flex items-center">
              <span className="text-white/60 mr-2">{currentTime.toLocaleTimeString()}</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
            </div>
            
            <div className="text-xs bg-black/20 px-3 py-1 rounded-full border border-white/10 hidden md:flex">
              <span className="text-white/70">v4.2.1</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Error message */}
      {error && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-30 bg-red-900/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg border border-red-500/50 flex items-center space-x-2 animate-fade-in-down">
          <Shield className="h-5 w-5 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Main content */}
      <main className="pt-16 pb-12 px-4">
        <div className="max-w-screen-xl mx-auto py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login form panel */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {/* Panel header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">Enterprise Client Portal</h1>
                <p className="text-white/60 text-sm">Secure authentication required</p>
              </div>
              
              <button 
                onClick={cycleThroughSecurityLevels}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center space-x-1.5 ${
                  securityLevel === 'standard' ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' :
                  securityLevel === 'enhanced' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' :
                  'border-violet-500/50 bg-violet-500/10 text-violet-400'
                }`}
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full animate-pulse ${
                  securityLevel === 'standard' ? 'bg-blue-400' :
                  securityLevel === 'enhanced' ? 'bg-amber-400' :
                  'bg-violet-400'
                }`}></span>
                <span>
                  {securityLevel === 'standard' ? 'Standard Security' :
                   securityLevel === 'enhanced' ? 'Enhanced Security' :
                   'Maximum Security'}
                </span>
              </button>
            </div>
            
            {/* Login content */}
            <div className="p-6">
              {loginStage === 'credentials' ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username field */}
                  <div className="space-y-1">
                    <label htmlFor="username" className="flex justify-between text-sm">
                      <span className="text-white/70 flex items-center">
                        <CircleUser className="h-3.5 w-3.5 mr-2 text-cyan-400" />
                        Username
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">Required</span>
                    </label>
                    
                    <div className="relative flex focus-within:ring-1 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/50 transition-all duration-300">
                      <div className="h-full aspect-square flex items-center justify-center bg-gradient-to-br from-black/60 to-black/40 p-3 border-y border-l border-white/10 rounded-l-lg">
                        <Fingerprint className="h-5 w-5 text-cyan-400" />
                      </div>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full py-3 px-4 bg-black/30 border-y border-r border-white/10 rounded-r-lg focus:outline-none text-white placeholder:text-white/30"
                        placeholder="Enter your username"
                      />
                    </div>
                  </div>
                  
                  {/* Password field */}
                  <div className="space-y-1">
                    <label htmlFor="password" className="flex justify-between text-sm">
                      <span className="text-white/70 flex items-center">
                        <Key className="h-3.5 w-3.5 mr-2 text-amber-400" />
                        Password
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Secured</span>
                    </label>
                    
                    <div className="relative flex focus-within:ring-1 focus-within:ring-amber-500/50 focus-within:border-amber-500/50 transition-all duration-300">
                      <div className="h-full aspect-square flex items-center justify-center bg-gradient-to-br from-black/60 to-black/40 p-3 border-y border-l border-white/10 rounded-l-lg">
                        <Lock className="h-5 w-5 text-amber-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-3 px-4 bg-black/30 border-y border-r border-white/10 rounded-r-lg focus:outline-none text-white placeholder:text-white/30"
                        placeholder="••••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Remember me toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        onClick={() => setRememberMe(!rememberMe)}
                        className={`w-4 h-4 rounded cursor-pointer flex items-center justify-center transition-all duration-200 ${
                          rememberMe ? 'bg-cyan-500 border-cyan-500' : 'border border-white/30 bg-black/30'
                        }`}
                      >
                        {rememberMe && <CheckCircle2 className="h-3 w-3 text-black" />}
                      </div>
                      <span 
                        className="text-sm text-white/60 cursor-pointer"
                        onClick={() => setRememberMe(!rememberMe)}
                      >
                        Remember session
                      </span>
                    </div>
                    
                    <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                      Reset password
                    </a>
                  </div>
                  
                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-medium rounded-lg shadow-lg transition-all duration-300 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-1 focus:ring-offset-black"
                  >
                    <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></span>
                    <span className="relative flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-5 w-5" />
                          Secure Sign In
                        </>
                      )}
                    </span>
                  </button>
                  
                  {/* Demo credentials info */}
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 text-sm border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <BellRing className="h-4 w-4 text-amber-400" />
                      <p className="font-medium text-white/80">Demo Access:</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6">
                      <div>
                        <p className="text-xs text-white/60">Username:</p>
                        <p className="font-mono text-amber-400 text-sm">client1</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Password:</p>
                        <p className="font-mono text-amber-400 text-sm">clientdemo</p>
                      </div>
                    </div>
                  </div>
                </form>
              ) : loginStage === 'verifying' ? (
                <div className="py-8 flex flex-col items-center">
                  {/* Verification progress */}
                  <div className="w-20 h-20 rounded-full bg-black/20 flex items-center justify-center mb-6 relative">
                    <Shield className="h-10 w-10 text-cyan-400" />
                    
                    {/* Circular progress indicator */}
                    <svg className="absolute inset-0 transform rotate-90" width="80" height="80" viewBox="0 0 80 80">
                      <circle 
                        className="text-white/5" 
                        strokeWidth="4"
                        stroke="currentColor" 
                        fill="transparent" 
                        r="36" 
                        cx="40" 
                        cy="40" 
                      />
                      <circle 
                        className="text-cyan-500" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        stroke="currentColor" 
                        fill="transparent" 
                        r="36" 
                        cx="40" 
                        cy="40" 
                        strokeDasharray={`${36 * 2 * Math.PI}`}
                        strokeDashoffset={`${36 * 2 * Math.PI * (1 - verificationProgress / 100)}`}
                      />
                    </svg>
                    
                    {/* Pulsing effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping-slow"></div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">
                    Verifying Identity
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-6 max-w-xs text-center">
                    Advanced security protocols in progress. Please stand by...
                  </p>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-black/30 h-1 rounded-full mb-4 max-w-md">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${verificationProgress}%` }}
                    />
                  </div>
                  
                  {/* Verification steps */}
                  <div className="grid grid-cols-2 gap-3 max-w-md w-full">
                    <div className={`p-3 rounded border transition-colors ${
                      verificationProgress >= 25 ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-black/20'
                    }`}>
                      <div className="flex items-center">
                        <Fingerprint className="h-4 w-4 mr-1.5 text-green-400" />
                        <span className={verificationProgress >= 25 ? 'text-green-400' : 'text-white/40'}>
                          Identity
                        </span>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded border transition-colors ${
                      verificationProgress >= 50 ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-black/20'
                    }`}>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1.5 text-green-400" />
                        <span className={verificationProgress >= 50 ? 'text-green-400' : 'text-white/40'}>
                          Authentication
                        </span>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded border transition-colors ${
                      verificationProgress >= 75 ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-black/20'
                    }`}>
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-1.5 text-green-400" />
                        <span className={verificationProgress >= 75 ? 'text-green-400' : 'text-white/40'}>
                          Encryption
                        </span>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded border transition-colors ${
                      verificationProgress >= 100 ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-black/20'
                    }`}>
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-400" />
                        <span className={verificationProgress >= 100 ? 'text-green-400' : 'text-white/40'}>
                          Access
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">
                    Authentication Complete
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-6">
                    Redirecting to your secure dashboard...
                  </p>
                  
                  <div className="inline-block bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-lg text-cyan-400 text-sm animate-pulse">
                    Preparing your workspace...
                  </div>
                </div>
              )}
            </div>
            
            {/* Panel footer */}
            <div className="border-t border-white/10 p-4 bg-black/20">
              <div className="flex justify-center">
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation('/auth');
                  }}
                  className="flex items-center text-sm text-amber-400 hover:text-white/90 transition-colors px-4 py-2 rounded-full hover:bg-white/5"
                >
                  <span>Administrator Access</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Info panel - only visible on larger screens */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl hidden lg:block">
            <div className="p-6 h-full flex flex-col">
              <div className="mb-8">
                <div className="inline-flex items-center px-3 py-1 bg-cyan-500/10 rounded-full text-xs font-semibold text-cyan-400 mb-4 border border-cyan-500/20">
                  ENTERPRISE PLATFORM
                </div>
                
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-400 to-white bg-clip-text text-transparent">
                  Next-Generation Marketing Intelligence
                </h2>
                
                <p className="text-white/70 max-w-lg">
                  Access real-time campaign metrics, predictive analytics, and AI-powered insights through our secure enterprise portal. Advanced security protocols protect your marketing data at all times.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-8">
                {/* Feature cards */}
                <div className="p-4 bg-black/30 border border-white/10 rounded-xl group hover:border-cyan-500/30 transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-black/60 to-black/40 rounded-lg border border-white/10 group-hover:border-cyan-500/20">
                      <Brain className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">AI-Powered Analytics</h3>
                      <p className="text-white/60 text-sm mt-1">
                        Advanced pattern recognition and predictive insights to optimize your marketing campaigns in real-time.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-black/30 border border-white/10 rounded-xl group hover:border-amber-500/30 transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-black/60 to-black/40 rounded-lg border border-white/10 group-hover:border-amber-500/20">
                      <Cpu className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">Intelligent Content Generation</h3>
                      <p className="text-white/60 text-sm mt-1">
                        Create personalized, high-converting email content with our advanced AI assistant technology.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-black/30 border border-white/10 rounded-xl group hover:border-green-500/30 transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-black/60 to-black/40 rounded-lg border border-white/10 group-hover:border-green-500/20">
                      <Network className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">Multi-Channel Orchestration</h3>
                      <p className="text-white/60 text-sm mt-1">
                        Seamlessly manage email, SMS, and social media campaigns from a single unified dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-black/40 border border-white/10 rounded-lg">
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-xl font-mono font-semibold text-white">
                          {stat.value.toLocaleString()}
                          <span className="text-xs text-cyan-400">+</span>
                        </div>
                        <div className="text-xs text-white/60">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom status bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-white/10 px-4 py-2 z-20">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
              <span className="text-xs text-white/60">TLS 1.3 Secure</span>
            </div>
            
            <div className="h-3 w-px bg-white/20 hidden md:block"></div>
            
            <div className="hidden md:block text-xs text-white/60">
              <span className="text-cyan-400">Last scan:</span>
              <span className="ml-1">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="text-xs text-white/60 flex items-center space-x-3">
            <span className="hidden md:inline">&copy; {new Date().getFullYear()} InfyMailer</span>
            <div className="h-3 w-px bg-white/20 hidden md:block"></div>
            <span className="text-amber-400">AI Assistant Available</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdvancedClientLogin;