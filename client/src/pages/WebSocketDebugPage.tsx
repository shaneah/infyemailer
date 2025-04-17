import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WebSocketDebugPage() {
  // WebSocket state for metrics connection
  const [metricsConnected, setMetricsConnected] = useState(false);
  const [metricsMessages, setMetricsMessages] = useState<string[]>([]);
  const metricsSocketRef = useRef<WebSocket | null>(null);
  const metricsReconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket state for collaboration connection
  const [collabConnected, setCollabConnected] = useState(false);
  const [collabMessages, setCollabMessages] = useState<string[]>([]);
  const collabSocketRef = useRef<WebSocket | null>(null);
  const collabReconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect metrics WebSocket
  const connectMetricsWebSocket = () => {
    // Clean up any existing connection
    if (metricsSocketRef.current) {
      metricsSocketRef.current.close();
    }
    
    // Initialize WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?type=metrics`;
    
    try {
      const socket = new WebSocket(wsUrl);
      metricsSocketRef.current = socket;
      
      socket.onopen = () => {
        console.log('Metrics WebSocket connected');
        setMetricsConnected(true);
        addMetricsMessage('Connected to metrics WebSocket');
        
        // Subscribe to metrics
        socket.send(JSON.stringify({ 
          type: 'subscribe', 
          channel: 'email-metrics' 
        }));
        
        // Clear any reconnect timeouts
        if (metricsReconnectTimeoutRef.current) {
          clearTimeout(metricsReconnectTimeoutRef.current);
          metricsReconnectTimeoutRef.current = null;
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addMetricsMessage(`Received: ${JSON.stringify(data, null, 2)}`);
        } catch (error) {
          console.error('Error parsing metrics WebSocket message:', error);
          addMetricsMessage(`Error parsing message: ${event.data}`);
        }
      };
      
      socket.onclose = (event) => {
        console.log('Metrics WebSocket disconnected:', event.code, event.reason);
        setMetricsConnected(false);
        addMetricsMessage(`Disconnected: ${event.code} - ${event.reason || 'No reason provided'}`);
        
        // Try to reconnect
        if (!metricsReconnectTimeoutRef.current) {
          metricsReconnectTimeoutRef.current = setTimeout(() => {
            addMetricsMessage('Attempting to reconnect...');
            connectMetricsWebSocket();
            metricsReconnectTimeoutRef.current = null;
          }, 5000);
        }
      };
      
      socket.onerror = (event) => {
        console.error('Metrics WebSocket error:', event);
        addMetricsMessage('WebSocket error occurred');
      };
    } catch (error) {
      console.error('Error setting up metrics WebSocket:', error);
      addMetricsMessage(`Setup error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Connect collaboration WebSocket
  const connectCollabWebSocket = () => {
    // Clean up any existing connection
    if (collabSocketRef.current) {
      collabSocketRef.current.close();
    }
    
    // Initialize WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const userId = 'debug-user-' + Math.random().toString(36).substring(2, 10);
    const userName = 'Debug User';
    const userRole = 'debugger';
    
    const wsUrl = `${protocol}//${window.location.host}/ws?type=collaboration&userId=${userId}&userName=${encodeURIComponent(userName)}&userRole=${encodeURIComponent(userRole)}`;
    
    try {
      const socket = new WebSocket(wsUrl);
      collabSocketRef.current = socket;
      
      socket.onopen = () => {
        console.log('Collaboration WebSocket connected');
        setCollabConnected(true);
        addCollabMessage('Connected to collaboration WebSocket');
        
        // Register with the server
        socket.send(JSON.stringify({
          type: 'register',
          userId,
          userInfo: {
            id: userId,
            name: userName,
            role: userRole
          }
        }));
        
        // Clear any reconnect timeouts
        if (collabReconnectTimeoutRef.current) {
          clearTimeout(collabReconnectTimeoutRef.current);
          collabReconnectTimeoutRef.current = null;
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addCollabMessage(`Received: ${JSON.stringify(data, null, 2)}`);
        } catch (error) {
          console.error('Error parsing collaboration WebSocket message:', error);
          addCollabMessage(`Error parsing message: ${event.data}`);
        }
      };
      
      socket.onclose = (event) => {
        console.log('Collaboration WebSocket disconnected:', event.code, event.reason);
        setCollabConnected(false);
        addCollabMessage(`Disconnected: ${event.code} - ${event.reason || 'No reason provided'}`);
        
        // Try to reconnect
        if (!collabReconnectTimeoutRef.current) {
          collabReconnectTimeoutRef.current = setTimeout(() => {
            addCollabMessage('Attempting to reconnect...');
            connectCollabWebSocket();
            collabReconnectTimeoutRef.current = null;
          }, 5000);
        }
      };
      
      socket.onerror = (event) => {
        console.error('Collaboration WebSocket error:', event);
        addCollabMessage('WebSocket error occurred');
      };
    } catch (error) {
      console.error('Error setting up collaboration WebSocket:', error);
      addCollabMessage(`Setup error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Helper to add a message to the metrics log
  const addMetricsMessage = (message: string) => {
    setMetricsMessages(prev => [message, ...prev].slice(0, 50));
  };

  // Helper to add a message to the collaboration log
  const addCollabMessage = (message: string) => {
    setCollabMessages(prev => [message, ...prev].slice(0, 50));
  };

  // Connect both WebSockets when component mounts
  useEffect(() => {
    connectMetricsWebSocket();
    connectCollabWebSocket();
    
    // Clean up on unmount
    return () => {
      if (metricsSocketRef.current) {
        metricsSocketRef.current.close();
      }
      if (collabSocketRef.current) {
        collabSocketRef.current.close();
      }
      if (metricsReconnectTimeoutRef.current) {
        clearTimeout(metricsReconnectTimeoutRef.current);
      }
      if (collabReconnectTimeoutRef.current) {
        clearTimeout(collabReconnectTimeoutRef.current);
      }
    };
  }, []);

  // Restart a connection manually
  const reconnectMetrics = () => {
    addMetricsMessage('Manual reconnect initiated');
    connectMetricsWebSocket();
  };

  const reconnectCollab = () => {
    addCollabMessage('Manual reconnect initiated');
    connectCollabWebSocket();
  };

  // Send a test message
  const sendMetricsTestMessage = () => {
    if (metricsSocketRef.current && metricsSocketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: 'ping', timestamp: Date.now() });
      metricsSocketRef.current.send(message);
      addMetricsMessage(`Sent: ${message}`);
    } else {
      addMetricsMessage('Cannot send message - not connected');
    }
  };

  const sendCollabTestMessage = () => {
    if (collabSocketRef.current && collabSocketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ 
        action: 'start_editing', 
        resourceId: 'debug-resource-' + Math.floor(Math.random() * 1000),
        resourceType: 'template'
      });
      collabSocketRef.current.send(message);
      addCollabMessage(`Sent: ${message}`);
    } else {
      addCollabMessage('Cannot send message - not connected');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">WebSocket Debug Page</h1>
      
      <Tabs defaultValue="metrics">
        <TabsList className="mb-4">
          <TabsTrigger value="metrics">Metrics Connection</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration Connection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Metrics WebSocket 
                <Badge variant={metricsConnected ? "success" : "destructive"}>
                  {metricsConnected ? "Connected" : "Disconnected"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Button 
                  variant="default" 
                  onClick={reconnectMetrics}
                >
                  Reconnect
                </Button>
                <Button 
                  variant="outline" 
                  onClick={sendMetricsTestMessage}
                >
                  Send Test Message
                </Button>
              </div>
              
              <div className="border rounded-md p-2 h-[400px] overflow-y-auto bg-gray-50 dark:bg-gray-900">
                {metricsMessages.map((msg, idx) => (
                  <div key={idx} className="mb-2 p-2 border-b">
                    <pre className="whitespace-pre-wrap text-xs">{msg}</pre>
                  </div>
                ))}
                {metricsMessages.length === 0 && (
                  <div className="text-center text-gray-500 p-4">No messages yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="collaboration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Collaboration WebSocket 
                <Badge variant={collabConnected ? "success" : "destructive"}>
                  {collabConnected ? "Connected" : "Disconnected"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Button 
                  variant="default" 
                  onClick={reconnectCollab}
                >
                  Reconnect
                </Button>
                <Button 
                  variant="outline" 
                  onClick={sendCollabTestMessage}
                >
                  Send Test Message
                </Button>
              </div>
              
              <div className="border rounded-md p-2 h-[400px] overflow-y-auto bg-gray-50 dark:bg-gray-900">
                {collabMessages.map((msg, idx) => (
                  <div key={idx} className="mb-2 p-2 border-b">
                    <pre className="whitespace-pre-wrap text-xs">{msg}</pre>
                  </div>
                ))}
                {collabMessages.length === 0 && (
                  <div className="text-center text-gray-500 p-4">No messages yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}