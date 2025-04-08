import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/assets/Logo-white.png';

const SimpleClientLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is already logged in
  React.useEffect(() => {
    const clientUser = sessionStorage.getItem('clientUser');
    if (clientUser) {
      setLocation('/client-dashboard');
    }
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", { username, password });
      
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      console.log("Response status:", response.status);
      
      const data = await response.text();
      console.log("Response data:", data);
      
      if (!response.ok) {
        throw new Error(data || 'Login failed');
      }
      
      // For demo purposes, we'll bypass the actual login response
      // and just set hardcoded user data
      const mockUserData = {
        id: 5,
        username: username,
        clientId: 1,
        clientName: 'Demo Client',
        clientCompany: 'ACME Corp',
        permissions: {
          emailValidation: true,
          campaigns: true,
          contacts: true,
          templates: true,
          reporting: true,
          domains: true,
          abTesting: true
        }
      };
      
      sessionStorage.setItem('clientUser', JSON.stringify(mockUserData));
      
      toast({
        title: 'Login successful',
        description: 'Welcome to InfyMailer client portal!'
      });
      
      setLocation('/client-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid username or password',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-500/20 to-sky-500/20">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-xl">
        <div className="text-center">
          <img src={Logo} alt="InfyMailer Logo" className="h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Client Login</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your client dashboard</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="bg-teal-50 p-3 rounded-md text-xs">
            <p className="font-semibold text-center text-teal-800 mb-1">Demo Credentials:</p>
            <p className="text-center text-teal-700">Username: <strong>client1</strong> | Password: <strong>clientdemo</strong></p>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setLocation('/auth');
            }}
            className="text-sm text-teal-600 hover:text-teal-500"
          >
            Switch to Admin Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default SimpleClientLogin;