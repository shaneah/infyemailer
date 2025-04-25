import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import LogoColor from '@assets/Logo-white.png';
import { 
  Mail, Lock, Eye, EyeOff, ChevronRight, Shield, ArrowRight, 
  Fingerprint, Sparkles, CheckCircle2, BellRing, LineChart, 
  BarChart, Database, Users, Zap, Globe, Key, Scan, Cpu, 
  LucideIcon, BarChart4, Award, ServerCog, Wifi, QrCode, 
  CircleUser, ShieldCheck, PanelRight, Layers, Brain, 
  BrainCircuit, Bot, AlertCircle, Radar, Waypoints, 
  X, LockKeyhole, BadgeCheck, PowerOff, Network, Activity,
  ListChecks, Blocks
} from 'lucide-react';

interface Neural3DPoint {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  connections: number[];
  pulse: number;
  size: number;
  color: string;
}

interface AuthSession {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  device: string;
  active: boolean;
}

// Futuristic text flicker effect
const FlickerText: React.FC<{text: string; className?: string}> = ({text, className = ''}) => {
  return (
    <span className={`relative group ${className}`}>
      <span className="absolute top-0 left-0 w-full h-full hidden group-hover:inline">
        <span className="animate-flicker-1 text-[#66e4ff] absolute">
          {text}
        </span>
      </span>
      {text}
    </span>
  );
};

// Holographic display effect
const HolographicText: React.FC<{
  text: string;
  className?: string;
  variant?: 'success' | 'warning' | 'info' | 'error';
}> = ({text, className = '', variant = 'info'}) => {
  const colorMap = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
    error: 'text-red-400'
  };
  
  return (
    <div className={`relative font-mono tracking-wider ${colorMap[variant]} ${className}`}>
      <div className="absolute inset-0 blur-[1px] opacity-70">{text}</div>
      <div className="absolute inset-0 blur-[2px] opacity-50">{text}</div>
      <div className="relative">{text}</div>
    </div>
  );
};

// Neural nodes connection component for ultra-modern 3D background
const NeuralNodesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const nodesRef = useRef<Neural3DPoint[]>([]);
  const animationRef = useRef<number>(0);
  const mousePos = useRef({ x: 0, y: 0 });
  
  // Initialize canvas and handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        setDimensions({ width, height });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { 
        x: e.clientX / window.innerWidth, 
        y: e.clientY / window.innerHeight 
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Initialize nodes
  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    
    const NODE_COUNT = 70;
    const points: Neural3DPoint[] = [];
    
    // Color palette for nodes
    const colors = [
      'rgba(212, 175, 55, 0.8)',   // Gold
      'rgba(30, 144, 255, 0.8)',    // Blue
      'rgba(173, 216, 230, 0.8)',   // Light Blue
      'rgba(255, 255, 255, 0.7)',   // White
    ];
    
    // Create nodes
    for (let i = 0; i < NODE_COUNT; i++) {
      points.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        z: Math.random() * 500 - 250,
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 0.5 - 0.25,
        vz: Math.random() * 0.5 - 0.25,
        connections: [],
        pulse: Math.random(),
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    // Create connections
    points.forEach((point, i) => {
      const connectionCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < connectionCount; j++) {
        // Find a closest neighbor that isn't already connected
        let closestDist = Infinity;
        let closestIdx = -1;
        
        for (let k = 0; k < points.length; k++) {
          if (i === k || point.connections.includes(k)) continue;
          
          const dx = point.x - points[k].x;
          const dy = point.y - points[k].y;
          const dz = point.z - points[k].z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = k;
          }
        }
        
        if (closestIdx !== -1) {
          point.connections.push(closestIdx);
        }
      }
    });
    
    nodesRef.current = points;
  }, [dimensions]);
  
  // Animation logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Helper to get 3D point projected to 2D with perspective
    const project = (x: number, y: number, z: number) => {
      const fov = 250;
      const viewZ = 1000;
      const scale = fov / (viewZ + z);
      return {
        x: x * scale + dimensions.width / 2,
        y: y * scale + dimensions.height / 2,
        scale
      };
    };
    
    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      gradient.addColorStop(0, 'rgba(5, 15, 36, 0.95)');
      gradient.addColorStop(0.5, 'rgba(10, 25, 60, 0.95)');
      gradient.addColorStop(1, 'rgba(15, 35, 75, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(50, 130, 240, 0.08)';
      ctx.lineWidth = 0.5;
      
      // Horizontal grid
      for (let y = 0; y < dimensions.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.width, y);
        ctx.stroke();
      }
      
      // Vertical grid
      for (let x = 0; x < dimensions.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.height);
        ctx.stroke();
      }
      
      // Interactive cursor effect
      const mouseX = mousePos.current.x * dimensions.width;
      const mouseY = mousePos.current.y * dimensions.height;
      
      // Ripple effect around cursor
      ctx.beginPath();
      const now = Date.now() / 1000;
      ctx.arc(mouseX, mouseY, 50 + Math.sin(now * 2) * 10, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 80 + Math.sin(now * 2 + 1) * 15, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      // Update and draw neural nodes
      const points = nodesRef.current;
      const timestamp = Date.now() / 1000;
      
      // Update positions
      points.forEach(point => {
        // Movement with bounds check
        point.x += point.vx;
        point.y += point.vy;
        point.z += point.vz;
        
        // Bounce off boundaries
        if (point.x < 0 || point.x > dimensions.width) point.vx *= -1;
        if (point.y < 0 || point.y > dimensions.height) point.vy *= -1;
        if (point.z < -250 || point.z > 250) point.vz *= -1;
        
        // Mouse influence - attract points
        const dx = mouseX - point.x;
        const dy = mouseY - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 200) {
          const influence = (200 - dist) / 10000;
          point.vx += dx * influence;
          point.vy += dy * influence;
          
          // Limit velocity
          const maxVel = 2;
          const vel = Math.sqrt(point.vx * point.vx + point.vy * point.vy);
          if (vel > maxVel) {
            point.vx = (point.vx / vel) * maxVel;
            point.vy = (point.vy / vel) * maxVel;
          }
        }
      });
      
      // Sort by z for proper rendering (back to front)
      const sortedPoints = [...points].sort((a, b) => a.z - b.z);
      
      // Draw connections
      sortedPoints.forEach(point => {
        point.connections.forEach(idx => {
          const target = points[idx];
          const p1 = project(point.x - dimensions.width / 2, point.y - dimensions.height / 2, point.z);
          const p2 = project(target.x - dimensions.width / 2, target.y - dimensions.height / 2, target.z);
          
          // Draw line with pulsing effect
          const pulseOffset = (timestamp + point.pulse) % 2;
          const pulseAlpha = Math.max(0.05, Math.min(0.3, 0.3 - pulseOffset * 0.15));
          
          // Gradient for connection
          const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          gradient.addColorStop(0, point.color.replace('0.8', String(pulseAlpha)));
          gradient.addColorStop(1, target.color.replace('0.8', String(pulseAlpha)));
          
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.8 * Math.min(p1.scale, p2.scale);
          ctx.stroke();
          
          // Draw pulse moving along connection
          if (pulseOffset < 1) {
            const pulsePos = pulseOffset;
            const pulseX = p1.x + (p2.x - p1.x) * pulsePos;
            const pulseY = p1.y + (p2.y - p1.y) * pulsePos;
            
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 1.5 * Math.min(p1.scale, p2.scale), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
            ctx.fill();
          }
        });
      });
      
      // Draw nodes
      sortedPoints.forEach(point => {
        const p = project(point.x - dimensions.width / 2, point.y - dimensions.height / 2, point.z);
        const size = point.size * p.scale;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
        
        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(p.x, p.y, size, p.x, p.y, size * 2);
        glow.addColorStop(0, point.color.replace('0.8', '0.3'));
        glow.addColorStop(1, point.color.replace('0.8', '0'));
        ctx.fillStyle = glow;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(render);
    };
    
    animationRef.current = requestAnimationFrame(render);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions]);
  
  return (
    <canvas ref={canvasRef} className="absolute inset-0 -z-10" />
  );
};

// Animated counter with easing and value formatting
const AnimatedCounter: React.FC<{
  value: number;
  label: string;
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}> = ({ value, label, icon, prefix = '', suffix = '', duration = 2500, decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    let rafId: number;
    
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - percentage, 3);
      
      countRef.current = easedProgress * value;
      setCount(countRef.current);
      
      if (percentage < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };
    
    rafId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);
  
  // Format number with commas and proper decimals
  const formatNumber = (num: number) => {
    return prefix + num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + suffix;
  };
  
  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center space-x-3 transition-all hover:border-[#d4af37]/30 hover:bg-black/30">
      <div className="p-2 bg-gradient-to-br from-black/40 to-black/10 border border-white/10 rounded-lg flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xl font-mono font-bold text-white">
          {formatNumber(Math.floor(count))}
          {decimals > 0 && (
            <span className="text-[#d4af37]">
              {formatNumber(count).split('.')[1]?.substring(0, decimals)}
            </span>
          )}
        </div>
        <div className="text-xs text-white/60">{label}</div>
      </div>
    </div>
  );
};

// Radar scanning effect component
const RadarScan: React.FC<{className?: string}> = ({className = ''}) => {
  return (
    <div className={`relative w-32 h-32 ${className}`}>
      <div className="absolute inset-0 rounded-full border border-[#d4af37]/30"></div>
      <div className="absolute inset-0 rounded-full border border-[#d4af37]/20"></div>
      <div className="absolute inset-[2px] rounded-full border border-[#d4af37]/10"></div>
      <div className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full bg-[#d4af37]"></div>
      <div className="absolute left-1/2 top-1/2 w-[2px] h-[2px] rounded-full bg-[#d4af37]"></div>
      
      {/* Radar scan animation */}
      <div className="absolute left-1/2 top-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 origin-center">
        <div className="absolute left-1/2 top-1/2 w-[1px] h-1/2 bg-gradient-to-t from-[#d4af37] to-transparent -translate-x-1/2 origin-bottom animate-radar-scan"></div>
      </div>
      
      {/* Concentric circles pulse */}
      <div className="absolute inset-0 rounded-full border border-[#d4af37]/30 animate-ping-slow"></div>
      <div className="absolute inset-[15%] rounded-full border border-[#d4af37]/20 animate-ping-slow delay-300"></div>
      <div className="absolute inset-[30%] rounded-full border border-[#d4af37]/10 animate-ping-slow delay-600"></div>
    </div>
  );
};

// Terminal-like appearance component
const SecurityTerminal: React.FC<{
  title: string;
  lines: {text: string; type?: 'command' | 'response' | 'error' | 'success'}[];
  className?: string;
}> = ({title, lines, className = ''}) => {
  return (
    <div className={`bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-2 font-mono text-xs ${className}`}>
      <div className="flex items-center justify-between border-b border-gray-700/50 pb-1 mb-2">
        <div className="text-white/80">{title}</div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-red-500/70"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/70"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/70"></div>
        </div>
      </div>
      
      <div className="space-y-1">
        {lines.map((line, i) => {
          let textColor = 'text-white/80';
          let prefix = '';
          
          switch(line.type) {
            case 'command':
              textColor = 'text-green-400';
              prefix = '$ ';
              break;
            case 'error':
              textColor = 'text-red-400';
              prefix = '[ERR] ';
              break;
            case 'success':
              textColor = 'text-green-400';
              prefix = '[OK] ';
              break;
            default:
              textColor = 'text-white/80';
          }
          
          return (
            <div key={i} className={`${textColor} font-mono`}>
              {prefix}{line.text}
            </div>
          );
        })}
        <div className="text-green-400 flex items-center">
          $ <span className="ml-1 w-2 h-4 bg-green-400 animate-cursor"></span>
        </div>
      </div>
    </div>
  );
};

// Main login component with futuristic UI
const SimpleClientLogin = () => {
  // Form state and authentication state management
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [authMethod, setAuthMethod] = useState<'credentials'|'biometric'|'token'>('credentials');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [systemState, setSystemState] = useState<'initializing'|'ready'|'processing'|'error'|'success'>('initializing');
  const [verificationStage, setVerificationStage] = useState(0); // 0-100 progress percentage
  const [, setLocation] = useLocation();

  // Environment state values for immersive experience
  const [securityLevel, setSecurityLevel] = useState<'standard'|'enhanced'|'maximum'>('standard');
  const [activeUserCount, setActiveUserCount] = useState(24897);
  const [loginStats, setLoginStats] = useState({
    dailyLogins: 1254,
    failedAttempts: 23,
    averageLoginTime: 1.7 // in seconds
  });
  const [networkLatency, setNetworkLatency] = useState(37); // in ms
  const [lastScan, setLastScan] = useState(new Date());
  const [userActiveSessions, setUserActiveSessions] = useState<AuthSession[]>([
    {
      id: 'sess_' + Math.random().toString(36).slice(2),
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      expiresAt: new Date(Date.now() + 86400000), // 1 day from now
      device: 'Safari / macOS',
      active: true
    }
  ]);

  // Refs for animations and intervals
  const scanIntervalRef = useRef<NodeJS.Timeout>();
  const verificationTimeoutRef = useRef<NodeJS.Timeout>();
  const loadingRef = useRef<HTMLDivElement>(null);
  const terminalLinesRef = useRef([
    { text: 'Initializing security protocol', type: 'command' },
    { text: 'Environment checks completed', type: 'success' },
    { text: 'Establishing secure connection', type: 'command' },
    { text: 'TLS 1.3 handshake successful', type: 'success' },
    { text: 'Server fingerprint verified', type: 'success' },
  ]);
  
  // System initialization
  useEffect(() => {
    // System startup animation sequence
    const initTimer = setTimeout(() => {
      setSystemState('ready');
    }, 2000);
    
    // Set up simulated periodic security scans
    scanIntervalRef.current = setInterval(() => {
      setLastScan(new Date());
      setNetworkLatency(35 + Math.floor(Math.random() * 10));
    }, 5000);
    
    // Clear session storage
    sessionStorage.removeItem('clientUser');
    localStorage.removeItem('clientUser');
    
    return () => {
      clearTimeout(initTimer);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);
  
  // Authentication process simulation
  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo validation
    if (username !== 'client1' || password !== 'clientdemo') {
      setError('Invalid credentials. For demo, use: client1 / clientdemo');
      setSystemState('error');
      setTimeout(() => setSystemState('ready'), 2000);
      return;
    }
    
    // Begin authentication sequence
    setIsAuthenticating(true);
    setSystemState('processing');
    setError('');
    
    // Add authentication attempt to terminal
    terminalLinesRef.current = [
      ...terminalLinesRef.current,
      { text: `Authenticating user: ${username}`, type: 'command' },
      { text: 'Validating credentials...', type: 'command' }
    ];
    
    // Verification progress animation
    setVerificationStage(0);
    let stage = 0;
    
    verificationTimeoutRef.current = setInterval(() => {
      stage += 5;
      setVerificationStage(stage);
      
      // Add progress updates to the terminal
      if (stage === 25) {
        terminalLinesRef.current = [
          ...terminalLinesRef.current,
          { text: 'Identity confirmed', type: 'success' }
        ];
      }
      
      if (stage === 50) {
        terminalLinesRef.current = [
          ...terminalLinesRef.current,
          { text: 'Generating secure session token', type: 'command' }
        ];
      }
      
      if (stage === 75) {
        terminalLinesRef.current = [
          ...terminalLinesRef.current,
          { text: 'Session established successfully', type: 'success' }
        ];
      }
      
      if (stage >= 100) {
        clearInterval(verificationTimeoutRef.current);
        setSystemState('success');
        terminalLinesRef.current = [
          ...terminalLinesRef.current,
          { text: 'Access granted. Welcome!', type: 'success' }
        ];
        
        // Create user session
        const sessionId = 'sess_' + Math.random().toString(36).slice(2);
        const clientUser = {
          id: 1,
          username: 'client1',
          name: 'Demo Client',
          company: 'InfyTech Solutions',
          email: 'client1@example.com',
          role: 'client',
          permissions: ['view_campaigns', 'edit_campaigns', 'view_contacts', 'edit_contacts'],
          lastLoginAt: new Date().toISOString(),
          sessionId,
          securityLevel: securityLevel
        };
        
        // Store user data
        if (rememberMe) {
          localStorage.setItem('clientUser', JSON.stringify(clientUser));
        } else {
          sessionStorage.setItem('clientUser', JSON.stringify(clientUser));
        }
        
        // Add current session to active sessions list
        setUserActiveSessions([
          {
            id: sessionId,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 86400000),
            device: navigator.userAgent,
            active: true
          },
          ...userActiveSessions
        ]);
        
        // Redirect after successful login
        setTimeout(() => {
          window.location.href = '/client-dashboard';
        }, 2000);
      }
    }, 70);
  };

  // Toggle security level setting
  const toggleSecurityLevel = () => {
    if (securityLevel === 'standard') setSecurityLevel('enhanced');
    else if (securityLevel === 'enhanced') setSecurityLevel('maximum');
    else setSecurityLevel('standard');
  };
  
  // System status indicators
  const statusIndicators = [
    { name: 'Authentication', status: systemState === 'error' ? 'error' : 'active' },
    { name: 'Encryption', status: 'active' },
    { name: 'Network', status: networkLatency > 80 ? 'warning' : 'active' },
    { name: 'Database', status: 'active' }
  ];
  
  // Feature metrics shown as stats
  const metrics = [
    { 
      icon: <Users className="h-5 w-5 text-[#66e4ff]" />, 
      value: activeUserCount,
      label: "Active Users",
      suffix: "+"
    },
    { 
      icon: <Globe className="h-5 w-5 text-[#d4af37]" />, 
      value: 187,
      label: "Global Regions"
    },
    { 
      icon: <Activity className="h-5 w-5 text-green-400" />, 
      value: 99.998, 
      label: "Uptime",
      suffix: "%",
      decimals: 3
    },
    { 
      icon: <Network className="h-5 w-5 text-purple-400" />, 
      value: 76242,
      label: "Campaigns Delivered"
    }
  ];
  
  // Animated security features with different appearance based on security level
  const securityFeatures = [
    { 
      name: "Biometric Authentication", 
      icon: <FingerPrint className="h-5 w-5" />,
      level: 'enhanced'
    },
    {
      name: "Quantum-Resistant Encryption",
      icon: <LockKeyhole className="h-5 w-5" />,
      level: 'maximum'
    },
    {
      name: "Multi-Factor Verification",
      icon: <ListChecks className="h-5 w-5" />,
      level: 'standard'
    },
    {
      name: "Neural Network Monitoring",
      icon: <BrainCircuit className="h-5 w-5" />,
      level: 'enhanced'
    }
  ];
  
  // Platform capabilities showcased in the right panel
  const platformCapabilities = [
    {
      title: "Neural AI Analysis",
      description: "Advanced pattern recognition and predictive analytics powered by our proprietary neural network.",
      icon: <Brain className="h-6 w-6 text-[#66e4ff]" />
    },
    {
      title: "Quantum-Grade Security",
      description: "Enterprise-level protection with post-quantum cryptographic algorithms and multi-layered verification.",
      icon: <ShieldCheck className="h-6 w-6 text-[#d4af37]" />
    },
    {
      title: "Distributed Processing",
      description: "Seamless integration with global edge computing networks for millisecond response times worldwide.",
      icon: <Blocks className="h-6 w-6 text-green-400" />
    }
  ];
  
  // Current time display
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Render the sleek, ultra-modern login interface
  return (
    <div className="min-h-screen w-full relative text-white">
      {/* Dynamic neural network background */}
      <NeuralNodesBackground />
      
      {/* Top system status bar */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <img src={LogoColor} alt="InfyMailer" className="h-8 drop-shadow-glow" />
              
              <div className="hidden md:flex items-center h-5 px-3 rounded-full bg-black/30 border border-white/10 text-xs">
                <span className="text-white/60 mr-2">System:</span>
                <div className="flex items-center">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  <span className="text-emerald-400">Operational</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                {statusIndicators.map((indicator, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 text-xs">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                      indicator.status === 'active' ? 'bg-emerald-500 animate-pulse' : 
                      indicator.status === 'warning' ? 'bg-amber-500 animate-pulse' : 
                      'bg-red-500 animate-pulse'
                    }`}></span>
                    <span className="text-white/60">{indicator.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2 text-xs bg-black/20 px-3 py-1 rounded-full border border-white/10">
                <span className="text-white/60">{currentTime.toLocaleTimeString()}</span>
                <span className="inline-block h-1 w-1 rounded-full bg-white/30"></span>
                <HolographicText text={networkLatency + 'ms'} variant="info" className="text-xs" />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Error notification */}
      {error && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 bg-black/50 backdrop-blur-md border border-red-500/50 text-white rounded-lg shadow-xl px-4 py-3 flex items-center space-x-3 animate-slide-in-down">
          <div className="p-1.5 bg-red-500/20 rounded-full">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <div className="font-semibold text-sm flex items-center">
              <HolographicText text="Access Denied" variant="error" />
            </div>
            <p className="text-xs text-white/70 max-w-md">{error}</p>
          </div>
          <button 
            onClick={() => setError('')}
            className="ml-auto p-1 hover:bg-white/10 rounded-full"
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>
      )}
      
      {/* Main content area */}
      <main className="pt-20 pb-16">
        <div className="max-w-screen-xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left panel - Login form */}
          <div className="lg:col-span-2">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl">
              {/* Header area with security level */}
              <div className="relative p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">
                    <FlickerText text="Enterprise Client Portal" className="tracking-wide" />
                  </h1>
                  <p className="text-white/60 text-sm mt-1">Secure identification required</p>
                </div>
                
                <button 
                  onClick={toggleSecurityLevel}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300 flex items-center space-x-1.5 ${
                    securityLevel === 'standard' ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' :
                    securityLevel === 'enhanced' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' :
                    'border-purple-500/50 bg-purple-500/10 text-purple-400'
                  }`}
                >
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                    securityLevel === 'standard' ? 'bg-blue-500' :
                    securityLevel === 'enhanced' ? 'bg-amber-500' :
                    'bg-purple-500'
                  } animate-pulse`}></span>
                  <span>
                    {securityLevel === 'standard' ? 'Standard Security' :
                     securityLevel === 'enhanced' ? 'Enhanced Security' :
                     'Maximum Security'}
                  </span>
                </button>
              </div>
              
              {/* Authentication options */}
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  {['credentials', 'biometric', 'token'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setAuthMethod(method as any)}
                      className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-all ${
                        authMethod === method 
                          ? 'bg-[#d4af37]/20 border-[#d4af37]/40 text-[#d4af37]' 
                          : 'bg-black/20 border-white/10 text-white/60 hover:bg-black/30'
                      }`}
                    >
                      {method === 'credentials' && 'Password'}
                      {method === 'biometric' && 'Biometric'}
                      {method === 'token' && 'Security Key'}
                    </button>
                  ))}
                </div>
                
                {/* Conditional content based on authentication status */}
                {isAuthenticating ? (
                  <div className="p-4 space-y-6">
                    <div className="flex flex-col items-center text-center">
                      <RadarScan className="mb-6" />
                      <h3 className="text-lg font-semibold mb-2">
                        <HolographicText 
                          text={systemState === 'success' ? 'Authentication Complete' : 'Verifying Identity'} 
                          variant={systemState === 'success' ? 'success' : 'info'}
                        />
                      </h3>
                      <p className="text-white/60 text-sm max-w-xs">
                        {systemState === 'success' 
                          ? 'Access granted. Preparing secure session...' 
                          : 'Advanced security checks in progress. Please stand by...'}
                      </p>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="space-y-3">
                      <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#d4af37] to-[#66e4ff] rounded-full transition-all duration-300"
                          style={{ width: `${verificationStage}%` }}
                        ></div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className={`text-xs p-2 rounded border ${verificationStage >= 25 ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-black/20'}`}>
                          <div className="flex items-center h-full">
                            <Shield className="w-3.5 h-3.5 mr-1.5 text-green-400 opacity-80" />
                            <span className={verificationStage >= 25 ? 'text-green-400' : 'text-white/40'}>Identity</span>
                          </div>
                        </div>
                        
                        <div className={`text-xs p-2 rounded border ${verificationStage >= 50 ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-black/20'}`}>
                          <div className="flex items-center h-full">
                            <Key className="w-3.5 h-3.5 mr-1.5 text-green-400 opacity-80" />
                            <span className={verificationStage >= 50 ? 'text-green-400' : 'text-white/40'}>Session</span>
                          </div>
                        </div>
                        
                        <div className={`text-xs p-2 rounded border ${verificationStage >= 75 ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-black/20'}`}>
                          <div className="flex items-center h-full">
                            <LockKeyhole className="w-3.5 h-3.5 mr-1.5 text-green-400 opacity-80" />
                            <span className={verificationStage >= 75 ? 'text-green-400' : 'text-white/40'}>Encryption</span>
                          </div>
                        </div>
                        
                        <div className={`text-xs p-2 rounded border ${verificationStage >= 100 ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-black/20'}`}>
                          <div className="flex items-center h-full">
                            <BadgeCheck className="w-3.5 h-3.5 mr-1.5 text-green-400 opacity-80" />
                            <span className={verificationStage >= 100 ? 'text-green-400' : 'text-white/40'}>Access</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Security terminal */}
                    <SecurityTerminal 
                      title="Security Protocol" 
                      lines={terminalLinesRef.current}
                    />
                  </div>
                ) : (
                  <div>
                    {/* Authentication form */}
                    <form onSubmit={handleAuthentication} className="space-y-5">
                      {authMethod === 'credentials' && (
                        <>
                          <div className="space-y-1.5">
                            <label htmlFor="username" className="flex items-center justify-between text-sm">
                              <span className="text-white/70 font-medium flex items-center">
                                <CircleUser className="h-3.5 w-3.5 mr-2 text-[#d4af37]" /> 
                                Username
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#66e4ff]/10 text-[#66e4ff] font-mono">
                                Required
                              </span>
                            </label>
                            
                            <div className="relative bg-black/40 border border-white/10 rounded-lg overflow-hidden focus-within:border-[#d4af37]/50 focus-within:ring-1 focus-within:ring-[#d4af37]/20 transition-all duration-300">
                              <div className="h-full aspect-square flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent p-3 border-r border-white/5">
                                <Fingerprint className="h-5 w-5 text-[#d4af37]" />
                              </div>
                              <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full py-3 px-4 bg-transparent border-0 text-white placeholder:text-white/30 focus:ring-0"
                                placeholder="Enter your username"
                                autoComplete="username"
                              />
                              {username && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <div className="h-2 w-2 rounded-full bg-[#d4af37] animate-ping"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label htmlFor="password" className="flex items-center justify-between text-sm">
                              <span className="text-white/70 font-medium flex items-center">
                                <Key className="h-3.5 w-3.5 mr-2 text-[#d4af37]" /> 
                                Password
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-mono">
                                Secured
                              </span>
                            </label>
                            
                            <div className="relative bg-black/40 border border-white/10 rounded-lg overflow-hidden focus-within:border-[#d4af37]/50 focus-within:ring-1 focus-within:ring-[#d4af37]/20 transition-all duration-300">
                              <div className="h-full aspect-square flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent p-3 border-r border-white/5">
                                <Lock className="h-5 w-5 text-[#d4af37]" />
                              </div>
                              <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full py-3 px-4 bg-transparent border-0 text-white placeholder:text-white/30 focus:ring-0"
                                placeholder="••••••••••"
                                autoComplete="current-password"
                              />
                              <button 
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                onClick={() => setRememberMe(!rememberMe)}
                                className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-all ${
                                  rememberMe ? 'bg-[#d4af37] border-[#d4af37]' : 'border-white/30 bg-black/30'
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
                            <a href="#" className="text-sm text-[#66e4ff] hover:text-[#66e4ff]/80 transition-colors">
                              Reset password
                            </a>
                          </div>
                        </>
                      )}
                      
                      {authMethod === 'biometric' && (
                        <div className="p-6 flex flex-col items-center justify-center space-y-4">
                          <div className="w-24 h-24 rounded-full border-2 border-[#d4af37] flex items-center justify-center relative">
                            <Fingerprint className="h-14 w-14 text-[#d4af37]" />
                            <div className="absolute inset-0 border-2 border-[#d4af37]/30 rounded-full animate-ping-slow"></div>
                          </div>
                          <p className="text-white/70 text-center">
                            Touch fingerprint sensor<br/>to authenticate
                          </p>
                          <p className="text-white/40 text-xs text-center">
                            This is a demo. Use password authentication instead.
                          </p>
                        </div>
                      )}
                      
                      {authMethod === 'token' && (
                        <div className="p-6 flex flex-col items-center justify-center space-y-4">
                          <div className="p-4 border border-white/20 rounded-lg bg-black/30">
                            <QrCode className="h-24 w-24 text-[#d4af37]" />
                          </div>
                          <p className="text-white/70 text-center">
                            Scan this code with your<br/>security key device
                          </p>
                          <p className="text-white/40 text-xs text-center">
                            This is a demo. Use password authentication instead.
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <button
                          type="submit"
                          disabled={isAuthenticating || (authMethod === 'credentials' && (!username || !password))}
                          className="w-full py-3 px-4 bg-[#d4af37] hover:bg-[#d4af37]/90 text-black font-medium rounded-lg shadow-lg transition-all relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-shimmer"></span>
                          <span className="relative flex items-center justify-center">
                            {systemState === 'initializing' ? (
                              <><PowerOff className="mr-2 h-5 w-5" /> Initializing System</>
                            ) : (
                              <><Shield className="mr-2 h-5 w-5" /> Authenticate</>
                            )}
                          </span>
                        </button>
                      </div>
                      
                      {/* Demo credentials info */}
                      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 text-sm border border-white/10">
                        <div className="flex items-center space-x-2 mb-2">
                          <BellRing className="h-4 w-4 text-[#d4af37]" />
                          <p className="font-medium text-white/80">Demo Access:</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pl-6">
                          <div>
                            <p className="text-xs text-white/60">Username:</p>
                            <p className="font-mono text-[#d4af37] text-sm">client1</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/60">Password:</p>
                            <p className="font-mono text-[#d4af37] text-sm">clientdemo</p>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
              
              {/* Footer with active security features */}
              <div className="border-t border-white/10 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {securityFeatures
                    .filter(feature => {
                      if (securityLevel === 'standard') return feature.level === 'standard';
                      if (securityLevel === 'enhanced') return ['standard', 'enhanced'].includes(feature.level);
                      return true; // all features for maximum
                    })
                    .map((feature, idx) => (
                      <div 
                        key={idx} 
                        className="px-2 py-1 bg-black/30 rounded-md border border-white/10 text-xs flex items-center space-x-1.5"
                      >
                        <span className="text-[#d4af37]">{feature.icon}</span>
                        <span className="text-white/70">{feature.name}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            
            {/* Help and administrator link */}
            <div className="mt-4 flex justify-center">
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLocation('auth');
                }}
                className="flex items-center text-sm text-[#d4af37] hover:text-white/90 transition-colors px-4 py-2 rounded-full hover:bg-white/5"
              >
                <span>Administrator Access</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Right panel - Platform capabilities and metrics */}
          <div className="lg:col-span-3 hidden lg:block space-y-6">
            {/* Platform Capabilities */}
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
              <div className="mb-6">
                <div className="inline-flex items-center px-3 py-1 bg-[#d4af37]/10 rounded-full text-xs font-medium text-[#d4af37] mb-3 border border-[#d4af37]/20">
                  ENTERPRISE PLATFORM
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-[#66e4ff] to-white bg-clip-text text-transparent">
                  <FlickerText text="Next-Generation Marketing Intelligence" />
                </h2>
                <p className="text-white/70 mt-3 max-w-xl">
                  Access real-time campaign metrics, predictive analytics, and AI-powered insights through our secure enterprise portal. Advanced security protocols protect your marketing data at all times.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {platformCapabilities.map((capability, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start space-x-4 p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="p-3 bg-black/30 rounded-lg border border-white/10 group-hover:border-white/20 transition-all">
                      {capability.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-[#66e4ff] transition-colors">
                        {capability.title}
                      </h3>
                      <p className="text-white/60 text-sm mt-1">
                        {capability.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Performance Metrics and Active Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Metrics */}
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-[#66e4ff]" />
                  Platform Metrics
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {metrics.map((metric, idx) => (
                    <AnimatedCounter
                      key={idx}
                      value={metric.value}
                      label={metric.label}
                      icon={metric.icon}
                      prefix={metric.prefix}
                      suffix={metric.suffix}
                      decimals={metric.decimals}
                    />
                  ))}
                </div>
              </div>
              
              {/* Active Sessions */}
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Waypoints className="h-5 w-5 mr-2 text-[#d4af37]" />
                  Active Sessions
                </h3>
                
                <div className="space-y-3">
                  {userActiveSessions.map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-white/5 rounded-full">
                          <Fingerprint className="h-4 w-4 text-[#d4af37]" />
                        </div>
                        <div>
                          <p className="text-xs text-white/80 font-mono">{session.id}</p>
                          <p className="text-[10px] text-white/50">{session.device}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${session.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {session.active ? 'Active' : 'Expired'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom status bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-black/40 backdrop-blur-md border-t border-white/10 text-xs">
        <div className="max-w-screen-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-white/60">TLS 1.3 Secure Connection</span>
              </div>
              <div className="hidden md:block h-3 w-px bg-white/20"></div>
              <div className="hidden md:flex text-white/60 items-center">
                <span className="text-[#66e4ff]">Last scan:</span>
                <span className="ml-1 font-mono">{lastScan.toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-white/60">
              <span className="font-mono">v4.2.1-enterprise</span>
              <div className="h-3 w-px bg-white/20"></div>
              <span>&copy; {new Date().getFullYear()} InfyMailer</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleClientLogin;

export default SimpleClientLogin;