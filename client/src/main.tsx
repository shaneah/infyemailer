import { createRoot } from "react-dom/client";
import "./index.css";

// Simple minimal app - no dependency issues
function SimpleLogin() {
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrEmail: username, password }),
        credentials: 'include',
      });
      
      if (response.ok) {
        showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/emergency';
        }, 1500);
      } else {
        const data = await response.json();
        showMessage(data.message || 'Login failed. Please try again.', 'error');
      }
    } catch (error) {
      showMessage('Could not connect to the server. Please try again later.', 'error');
    }
  };
  
  const showMessage = (text: string, type: 'success' | 'error') => {
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = text;
      messageEl.className = `message ${type}`;
      messageEl.style.display = 'block';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <svg className="mx-auto" width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="#1a3a5f"/>
            <path d="M10 20L20 15L30 20L20 25L10 20Z" fill="#d4af37" stroke="white" strokeWidth="1.5"/>
            <path d="M20 15V10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M20 30V25" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 20V25L20 30" stroke="white" strokeWidth="1.5"/>
            <path d="M30 20V25L20 30" stroke="white" strokeWidth="1.5"/>
            <text x="45" y="25" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1a3a5f">InfyMailer</text>
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Email Marketing Platform</h1>
        </div>
        
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
          The application is running in simplified mode due to a technical issue.
          Please log in below.
        </div>
        
        <div id="message" className="message" style={{display: 'none'}}></div>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
              Username or Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

// Create simple styles directly in JavaScript to avoid module loading issues
const styles = document.createElement('style');
styles.textContent = `
  .message {
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
    display: none;
  }
  .message.success {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
  }
  .message.error {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
  }
`;
document.head.appendChild(styles);

// Render the simplified app with no dependencies
createRoot(document.getElementById("root")!).render(
  <SimpleLogin />
);

// Signal app loaded
if (typeof (window as any).appLoaded === 'function') {
  setTimeout(() => {
    (window as any).appLoaded();
  }, 300);
}
