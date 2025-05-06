import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import ClientLayout from '@/components/layouts/ClientLayout';

const AdvancedAnalyticsTest: React.FC = () => {
  const [location] = useLocation();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        setLoading(true);
        const response = await fetch('/api/client/session', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Session data:', data);
          setSessionData(data);
        } else {
          setError(`Session API error: ${response.status}`);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError(`Session check error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  return (
    <ClientLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-4">Advanced Analytics Test Page</h1>
        <p className="text-gray-600 mb-4">Current path: {location}</p>
        
        {loading ? (
          <div className="p-4 bg-blue-50 rounded-md">Loading session data...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div className="p-4 bg-green-50 rounded-md">
            <h3 className="font-bold mb-2">Session Data:</h3>
            <pre className="bg-white p-3 rounded border overflow-auto max-h-80">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">API Test:</h2>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={async () => {
              try {
                const res = await fetch('/api/advanced-analytics/predictive');
                const data = await res.json();
                console.log('API test data:', data);
                alert('Check console for API test results');
              } catch (err) {
                console.error('API test error:', err);
                alert(`API test error: ${err instanceof Error ? err.message : String(err)}`);
              }
            }}
          >
            Test Predictive Analytics API
          </button>
        </div>
      </div>
    </ClientLayout>
  );
};

export default AdvancedAnalyticsTest;