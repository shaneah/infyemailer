import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Shield, EyeOff, Eye, Lock, User, ChevronRight, Coffee, Sun, Moon, Sunset } from 'lucide-react';
// Import logo from the assets directory
import LogoColor from '../assets/Infinity Tech Logo-01.png';
// Import client session hook
import { useClientSession } from '@/hooks/use-client-session';

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
  
  // Use the client session hook for authentication
  const { login, isLoading: sessionLoading, error: sessionError, clientUser } = useClientSession();
  
  // Local loading and error state to supplement the hook
  const [isLocalLoading, setIsLocalLoading] = useState(false);
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

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (clientUser) {
      setLocation('/client-dashboard');
    }
  }, [clientUser, setLocation]);

  // Handle login using the useClientSession hook
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    setIsLocalLoading(true);
    setError('');
    
    try {
      // Use the login function from useClientSession hook
      const success = await login({ username, password });
      
      // If login was successful, the hook will handle state updates
      if (success) {
        // Store username preference based on remember me setting (just for UI enhancement)
        if (rememberMe) {
          localStorage.setItem('lastUsername', username);
        } else {
          localStorage.removeItem('lastUsername');
        }
        
        // The hook redirects automatically when the clientUser state is updated
        console.log('Login successful, redirecting to dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-4">
      {/* Main container */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden rounded-xl shadow-2xl">
        {/* Login form section */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12">
          <div className="mb-8">
            <img 
              src={LogoColor} 
              alt="Infinity Tech" 
              className="h-16 mb-6" 
            />
            
            {/* Dynamic welcome message */}
            <div className="flex items-center space-x-2 mb-3 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100">
              {welcomeIcon}
              <span className="font-medium text-blue-800">{welcomeMessage}</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Client Portal
            </h1>
            <p className="text-gray-600">
              Log in to access your campaign management dashboard
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
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              disabled={isLocalLoading || sessionLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
            >
              {(isLocalLoading || sessionLoading) ? (
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

        {/* Feature showcase section */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-blue-800 to-blue-900 p-12 text-white">
          <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-blue-100">Welcome to Infinity Tech</h2>
            <p className="mb-8 text-blue-50">
              Your complete email marketing solution with advanced analytics and AI-powered optimization.
            </p>

            <div className="space-y-6 mb-auto">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600/60 p-3 rounded-lg shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-blue-100">Campaign Analytics</h3>
                  <p className="text-sm text-blue-50">
                    Real-time performance metrics and actionable insights for your campaigns.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-600/60 p-3 rounded-lg shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-blue-100">Campaign Builder</h3>
                  <p className="text-sm text-blue-50">
                    Intuitive drag-and-drop editor for creating stunning email campaigns quickly.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-600/60 p-3 rounded-lg shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-blue-100">Mobile Optimization</h3>
                  <p className="text-sm text-blue-50">
                    All templates are fully responsive for perfect rendering on any device.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-blue-700">
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