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

  // Clear any existing session storage on login page load
  useEffect(() => {
    // Clear any existing client user data to ensure a fresh login
    sessionStorage.removeItem('clientUser');
    localStorage.removeItem('clientUser');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      {/* Simple background with subtle pattern */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTEyLCAxMTIsIDExMiwgMC4xKSIgZD0iTTAsMGg4MCw4MHYtODAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')]"></div>
      
      {/* Main container */}
      <div className="w-full max-w-md z-10">
        {/* Brand and logo */}
        <div className="mb-10 text-center">
          <img src={LogoColor} alt="InfyTech Logo" className="h-16 mx-auto" />
        </div>
        
        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Card header */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <h2 className="text-xl font-bold">Welcome to InfyTech Solutions</h2>
            <p className="text-blue-100 text-sm mt-1">Sign in to access your portal</p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mx-6 -mb-2 mt-6 bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-700 text-sm">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 p-2.5"
                    placeholder="Enter your password"
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span className="flex items-center">
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </button>
              </div>
            </form>
            
            {/* Demo credentials */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded p-3 text-sm text-blue-800">
              <div className="font-medium mb-1">Demo Credentials</div>
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-1">Username:</span>
                  <code className="bg-white px-1.5 py-0.5 rounded text-blue-700 font-mono">client1</code>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-1">Password:</span>
                  <code className="bg-white px-1.5 py-0.5 rounded text-blue-700 font-mono">clientdemo</code>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-center">
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setLocation('auth');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              Switch to Admin Login <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} InfyTech Solutions | Advanced Email Marketing Platform
        </div>
      </div>
    </div>
  );
};

export default SimpleClientLogin;