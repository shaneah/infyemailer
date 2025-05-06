import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Shield, EyeOff, Eye, Lock, User, ChevronRight, Coffee, Sun, Moon, Sunset } from 'lucide-react';
// Import logo from the assets directory
import LogoColor from '@assets/Infinity Tech Logo-01.png';

const SimpleClientLoginV2: React.FC = () => {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Welcome message state
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [welcomeIcon, setWelcomeIcon] = useState<React.ReactNode>(null);
  const [lastUsername, setLastUsername] = useState<string | null>(null);
  
  // Auth state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  
  // Set welcome message based on time of day and check for returning user
  useEffect(() => {
    // Check for previous login
    const savedUserData = localStorage.getItem('clientUser');
    let userName = '';
    
    if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        if (userData && userData.name) {
          userName = userData.name.split(' ')[0]; // Get first name
          setLastUsername(userData.username);
          setUsername(userData.username); // Auto-fill username for returning users
        }
      } catch (e) {
        console.error('Error parsing saved user data');
      }
    }
    
    const hour = new Date().getHours();
    let timeMessage = '';
    
    if (hour >= 5 && hour < 12) {
      timeMessage = 'Good morning';
      setWelcomeIcon(<Coffee className="h-5 w-5 text-amber-500" />);
    } else if (hour >= 12 && hour < 17) {
      timeMessage = 'Good afternoon';
      setWelcomeIcon(<Sun className="h-5 w-5 text-amber-500" />);
    } else if (hour >= 17 && hour < 21) {
      timeMessage = 'Good evening';
      setWelcomeIcon(<Sunset className="h-5 w-5 text-amber-500" />);
    } else {
      timeMessage = 'Good night';
      setWelcomeIcon(<Moon className="h-5 w-5 text-blue-500" />);
    }
    
    // Personalize message if we have user data
    if (userName) {
      setWelcomeMessage(`${timeMessage}, ${userName}! Welcome back.`);
    } else {
      setWelcomeMessage(`${timeMessage}!`);
    }
  }, []);

  // Handle login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting client login with username:', username);
      
      // Call the actual API endpoint
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // Important for cookies/session
      });
      
      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials. For demo, use: client1 / clientdemo');
      }
      
      // Store based on remember me
      if (rememberMe) {
        localStorage.setItem('clientUser', JSON.stringify(data));
      } else {
        sessionStorage.setItem('clientUser', JSON.stringify(data));
      }
      
      // Immediately verify the session was created
      try {
        const verifyResponse = await fetch('/api/client/verify-session', {
          credentials: 'include' // Important for cookies/session
        });
        
        console.log('Session verification response:', verifyResponse.status);
        const verifyData = await verifyResponse.json();
        console.log('Session verification data:', verifyData);
      } catch (verifyErr) {
        console.error('Session verification failed:', verifyErr);
      }
      
      // Redirect to dashboard
      console.log('Login successful, redirecting to dashboard');
      
      // Force a small delay to ensure session is properly saved on server
      setTimeout(() => {
        window.location.href = '/client-dashboard';
      }, 300);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      {/* Main container with pharma-style clean design */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden rounded-xl shadow-xl">
        {/* Login form section - clean white background */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12">
          <div className="mb-8">
            <img 
              src={LogoColor} 
              alt="Infinity Tech" 
              className="h-16 mb-6" 
            />
            
            {/* Dynamic welcome message with medical-themed styling */}
            <div className="flex items-center space-x-2 mb-4 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100">
              {welcomeIcon}
              <span className="font-medium text-blue-800">{welcomeMessage}</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Healthcare Partner Portal
            </h1>
            <p className="text-gray-600">
              Secure access to your pharmaceutical communication dashboard
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username field */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    lastUsername ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your username"
                />
                {lastUsername && (
                  <div className="mt-1 text-xs text-blue-600">
                    Welcome back, we've filled your username for faster login.
                  </div>
                )}
              </div>
            </div>

            {/* Password field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Security note - pharmaceutical theme */}
            <div className="flex items-center justify-center mt-3">
              <Lock className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-xs text-gray-500">HIPAA Compliant Secure Connection</span>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-800 font-medium mb-2">Demo Access:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Username:</p>
                  <p className="font-mono">client1</p>
                </div>
                <div>
                  <p className="text-gray-500">Password:</p>
                  <p className="font-mono">clientdemo</p>
                </div>
              </div>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setLocation('/auth');
              }}
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
            >
              Administrator Access
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Feature showcase section - pharmaceutical themed */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white">
          <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold text-blue-100 mb-4">Healthcare Communication Portal</h2>
            <p className="mb-8 text-blue-100">
              Your secure, compliant email marketing platform designed specifically for pharmaceutical and healthcare organizations.
            </p>

            <div className="space-y-6 mb-auto">
              <div className="flex items-start space-x-4">
                <div className="bg-white rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">HIPAA Compliant</h3>
                  <p className="text-sm text-blue-100">
                    Secure messaging that meets all healthcare regulations and privacy requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Regulatory Approved</h3>
                  <p className="text-sm text-blue-100">
                    FDA and EMA compliant platform for pharmaceutical communications and marketing.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Content Compliance</h3>
                  <p className="text-sm text-blue-100">
                    Built-in tools to ensure all communications meet healthcare advertising standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-blue-500/30">
              <div className="flex items-center text-sm text-blue-200 mb-2">
                <Lock className="h-3 w-3 mr-1" />
                <span>256-bit Encrypted Connection • 21 CFR Part 11 Compliant</span>
              </div>
              <p className="text-sm text-blue-200">
                © {new Date().getFullYear()} Infinity Tech · All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleClientLoginV2;