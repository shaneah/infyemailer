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
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950 to-black opacity-80"></div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmMzAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')]"></div>
        
        {/* Floating particles */}
        {particles.map((particle, index) => (
          <div 
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size * 2}px`,
              height: `${particle.size * 2}px`,
              backgroundColor: index % 3 === 0 ? '#d4af37' : index % 3 === 1 ? '#9333ea' : '#6366f1',
              opacity: particle.opacity * 0.5,
              boxShadow: `0 0 ${particle.size * 4}px ${particle.size}px ${index % 3 === 0 ? 'rgba(212, 175, 55, 0.3)' : index % 3 === 1 ? 'rgba(147, 51, 234, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
            }}
          />
        ))}
        
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-gradient-to-br from-purple-600/10 to-indigo-600/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-amber-600/10 to-pink-600/5 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Main Container */}
      <div className="z-10 w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-4">
          <img src={LogoColor} alt="InfyMailer Logo" className="h-20 mx-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-[#d4af37] to-amber-300 mt-4 tracking-tight">
            InfyTech Solutions
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto my-2"></div>
          <p className="text-gray-300 text-sm">Client Portal Access</p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-900/40 backdrop-blur-sm border border-red-500/30 p-4 rounded-xl text-red-200 animate-pulse">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {/* Login Card */}
        <div className="backdrop-blur-md bg-black/40 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(90,60,150,0.25)] overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-4 w-4 text-[#d4af37]" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white placeholder-gray-400 text-sm rounded-lg focus:ring-[#d4af37]/50 focus:border-[#d4af37]/50 block w-full pl-10 p-3 transition-all duration-200"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-4 w-4 text-[#d4af37]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white placeholder-gray-400 text-sm rounded-lg focus:ring-[#d4af37]/50 focus:border-[#d4af37]/50 block w-full pl-10 pr-10 p-3 transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#d4af37] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full flex justify-center items-center py-3 px-4 text-sm font-medium text-white rounded-lg overflow-hidden group"
                >
                  {/* Button background with hover effect */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-700 via-[#d4af37] to-purple-700 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
                  
                  {/* Button content */}
                  <span className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">Access Portal</span>
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
            
            {/* Demo Credentials */}
            <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <p className="font-medium text-sm text-[#d4af37] mb-1">Demo Access:</p>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-300 space-y-1 sm:space-y-0">
                <div className="flex items-center">
                  <span className="font-medium text-gray-400">Username:</span>
                  <code className="ml-1 px-1 py-0.5 bg-white/10 rounded text-xs text-amber-200">client1</code>
                </div>
                <div className="sm:mx-3 hidden sm:block text-gray-500">|</div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-400">Password:</span>
                  <code className="ml-1 px-1 py-0.5 bg-white/10 rounded text-xs text-amber-200">clientdemo</code>
                </div>
              </div>
            </div>
            
            {/* Login Switch */}
            <div className="mt-5 pt-5 border-t border-white/10 text-center">
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLocation('auth');
                }}
                className="text-sm font-medium text-gray-300 hover:text-[#d4af37] transition-colors inline-flex items-center"
              >
                Switch to Admin Login <ChevronRight className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} InfyTech Solutions | Smart Email Marketing Platform | All rights reserved
        </div>
      </div>
    </div>
  );
};

export default SimpleClientLogin;