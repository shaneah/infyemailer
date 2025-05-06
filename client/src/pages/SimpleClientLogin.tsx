import React, { useState } from 'react';
import { useLocation } from 'wouter';
import LogoBlue from '@assets/Infinity Tech Logo-01.png';
import { 
  Lock, Eye, EyeOff, ChevronRight, Mail, 
  CheckCircle, Info, CircleUser
} from 'lucide-react';

const SimpleClientLogin = () => {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Handle form submission
  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      // Authentication successful, redirect to client dashboard
      setLocation('/client-dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-white to-blue-50">
      {/* Header with logo */}
      <header className="bg-white py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img src={LogoBlue} alt="Infinity Tech Logo" className="h-10" />
          <div className="text-sm text-gray-500 flex items-center">
            <a href="/auth" className="hover:text-blue-600 transition-colors">
              Admin Login
            </a>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 shadow-xl rounded-xl overflow-hidden">
          {/* Left side - Form */}
          <div className="bg-white p-6 md:p-10">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Client Portal
              </h1>
              <p className="text-gray-600">
                Sign in to access your email marketing dashboard
              </p>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
                <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Login form */}
            <form onSubmit={handleAuthentication} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CircleUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Forgot password?
                </a>
              </div>
              
              <button
                type="submit"
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
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
                  <>
                    Sign in <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
              
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600">
                  Don't have an account? <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Contact your administrator</a>
                </span>
              </div>
            </form>
          </div>
          
          {/* Right side - Company info */}
          <div className="hidden lg:block bg-gradient-to-br from-blue-800 to-blue-900 text-white p-10">
            <div className="h-full flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-6">Welcome to Infinity Tech</h2>
                <p className="mb-8 text-blue-50">
                  Access your enterprise email marketing platform, manage campaigns, and view analytics with our powerful client portal.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-blue-200 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-lg">Powerful Analytics</h3>
                      <p className="text-blue-100 text-sm">
                        Access real-time campaign performance metrics and detailed reports to optimize your strategy.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-blue-200 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-lg">Campaign Management</h3>
                      <p className="text-blue-100 text-sm">
                        Create, schedule, and monitor email campaigns from a unified dashboard.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-blue-200 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-lg">Enterprise Security</h3>
                      <p className="text-blue-100 text-sm">
                        Your data is protected with industry-leading security protocols and compliance measures.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-blue-700 text-blue-200 text-sm">
                &copy; {new Date().getFullYear()} Infinity Tech. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Security badge */}
      <div className="bg-white py-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center text-sm text-gray-500">
            <Lock className="h-4 w-4 mr-1.5 text-green-600" />
            <span>Secure connection. Your data is protected.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleClientLogin;