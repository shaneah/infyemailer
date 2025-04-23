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
        company: 'InfyTech Solutions',
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
    <div className="flex min-h-screen">
      {/* Left side - Brand/Image panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-blue-950 to-indigo-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-20">
          {/* Particle effects */}
          {particles.map((particle, index) => (
            <div 
              key={index}
              className="absolute rounded-full bg-primary"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity * 0.7,
              }}
            />
          ))}
        </div>
        
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-blue-950/80"></div>
        
        {/* Content */}
        <div className="relative flex flex-col justify-between h-full p-12 text-white z-10">
          <div>
            <img src={LogoColor} alt="InfyMailer Logo" className="h-12" />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Transform Your Email Marketing with AI
            </h1>
            <p className="text-xl text-blue-200">
              Access InfyTech's powerful tools to create, automate, and analyze your email campaigns
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-primary text-lg font-bold mb-1">96%</div>
                <div className="text-sm text-blue-200">Delivery Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-primary text-lg font-bold mb-1">45%</div>
                <div className="text-sm text-blue-200">Open Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-primary text-lg font-bold mb-1">3.2x</div>
                <div className="text-sm text-blue-200">ROI Increase</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-primary text-lg font-bold mb-1">24/7</div>
                <div className="text-sm text-blue-200">Support</div>
              </div>
            </div>
          </div>
          
          <div className="text-blue-300 text-sm">
            &copy; {new Date().getFullYear()} InfyTech Solutions. All rights reserved.
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <div className="text-center lg:hidden mb-8">
            <img src={LogoColor} alt="InfyMailer Logo" className="h-14 mx-auto" />
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>
            <p className="text-gray-600 mt-1">Please sign in to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-sm text-primary hover:text-primary/70">
                  Forgot password?
                </a>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span className="flex items-center">
                    Sign in <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <p>Username: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">client1</span> | Password: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">clientdemo</span></p>
            </div>
            
            <div className="mt-6 text-center">
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLocation('auth');
                }}
                className="font-medium text-primary hover:text-primary/70 transition-colors duration-200 inline-flex items-center"
              >
                Switch to Admin Login <ChevronRight className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500 lg:hidden">
            &copy; {new Date().getFullYear()} InfyTech Solutions. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleClientLogin;