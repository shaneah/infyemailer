import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

// Store connected WebSocket clients
const clients = new Set<WebSocket>();

// Track email metrics for real-time updates
let emailMetrics = {
  opens: 0,
  clicks: 0,
  bounces: 0,
  delivered: 0,
  uniqueOpens: 0,
  clickRate: 0,
  engagementScore: 0
};

// Store the real-time data for hourly metrics
const hourlyData = new Map<string, {opens: number, clicks: number}>();

// Initialize hourly data with zero values for all 24 hours
for (let i = 0; i < 24; i++) {
  const hour = `${i}:00`;
  hourlyData.set(hour, {opens: 0, clicks: 0});
}

// Initialize WebSocket server and set up real-time metrics updates
export function initRealTimeMetrics(httpServer: Server): void {
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/metrics-ws' });
  
  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected for real-time metrics');
    clients.add(ws);
    
    // Send initial data when a client connects
    const initialData = {
      type: 'email-metrics-update',
      ...emailMetrics,
      hourlyActivity: Array.from(hourlyData.entries()).map(([hour, data]) => ({
        hour,
        opens: data.opens,
        clicks: data.clicks
      })),
      timestamp: Date.now()
    };
    
    ws.send(JSON.stringify(initialData));
    
    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle subscription requests
        if (data.type === 'subscribe' && data.channel === 'email-metrics') {
          console.log('Client subscribed to email-metrics channel');
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected from real-time metrics');
      clients.delete(ws);
    });
  });
  
  // Set up interval to simulate real-time metrics updates
  // In a real application, these would come from actual tracking events
  startSimulatedUpdates();
}

// Function to update the metrics with real data (would be called by tracking service)
export function updateMetrics(metrics: Partial<typeof emailMetrics>): void {
  emailMetrics = {
    ...emailMetrics,
    ...metrics,
    timestamp: Date.now()
  };
  
  broadcastMetricsUpdate();
}

// Function to record an email open (would be called by tracking service)
export function recordOpen(hour?: string): void {
  emailMetrics.opens += 1;
  emailMetrics.uniqueOpens += 1;
  updateEngagementScore();
  
  // Also update hourly data
  if (hour) {
    const hourData = hourlyData.get(hour) || {opens: 0, clicks: 0};
    hourlyData.set(hour, {
      ...hourData,
      opens: hourData.opens + 1
    });
  } else {
    // If no hour specified, update current hour
    const now = new Date();
    const currentHour = `${now.getHours()}:00`;
    const hourData = hourlyData.get(currentHour) || {opens: 0, clicks: 0};
    hourlyData.set(currentHour, {
      ...hourData,
      opens: hourData.opens + 1
    });
  }
  
  broadcastMetricsUpdate();
}

// Function to record a click (would be called by tracking service)
export function recordClick(hour?: string): void {
  emailMetrics.clicks += 1;
  updateEngagementScore();
  
  // Also update hourly data
  if (hour) {
    const hourData = hourlyData.get(hour) || {opens: 0, clicks: 0};
    hourlyData.set(hour, {
      ...hourData,
      clicks: hourData.clicks + 1
    });
  } else {
    // If no hour specified, update current hour
    const now = new Date();
    const currentHour = `${now.getHours()}:00`;
    const hourData = hourlyData.get(currentHour) || {opens: 0, clicks: 0};
    hourlyData.set(currentHour, {
      ...hourData,
      clicks: hourData.clicks + 1
    });
  }
  
  broadcastMetricsUpdate();
}

// Helper to recalculate engagement score and click rate
function updateEngagementScore(): void {
  if (emailMetrics.uniqueOpens > 0) {
    emailMetrics.clickRate = (emailMetrics.clicks / emailMetrics.uniqueOpens) * 100;
  }
  
  // Engagement score is a weighted metric (75% click rate, 25% open rate)
  const openRate = emailMetrics.uniqueOpens / Math.max(1, emailMetrics.delivered) * 100;
  emailMetrics.engagementScore = (0.25 * openRate) + (0.75 * emailMetrics.clickRate);
  
  // Ensure the score stays within reasonable bounds
  emailMetrics.engagementScore = Math.min(100, Math.max(0, emailMetrics.engagementScore));
}

// Broadcast current metrics to all connected clients
function broadcastMetricsUpdate(): void {
  const update = JSON.stringify({
    type: 'email-metrics-update',
    ...emailMetrics,
    hourlyActivity: Array.from(hourlyData.entries()).map(([hour, data]) => ({
      hour,
      opens: data.opens,
      clicks: data.clicks
    })),
    timestamp: Date.now()
  });
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(update);
    }
  });
}

// Simulate metrics updates for demonstration purposes
// In a real application, this would be replaced by actual tracking data
function startSimulatedUpdates(): void {
  setInterval(() => {
    // Generate a random number of new opens and clicks
    const newOpens = Math.floor(Math.random() * 5) + 1; // 1-5 new opens
    const newClicks = Math.floor(Math.random() * 3); // 0-2 new clicks
    
    // Update the metrics
    emailMetrics = {
      ...emailMetrics,
      opens: emailMetrics.opens + newOpens,
      clicks: emailMetrics.clicks + newClicks,
      delivered: emailMetrics.delivered + Math.floor(Math.random() * 8) + 3, // 3-10 new deliveries
      uniqueOpens: emailMetrics.uniqueOpens + Math.floor(Math.random() * 3) + 1, // 1-3 new unique opens
    };
    
    // Update hourly data for the current hour
    const now = new Date();
    const currentHour = `${now.getHours()}:00`;
    const hourData = hourlyData.get(currentHour) || {opens: 0, clicks: 0};
    hourlyData.set(currentHour, {
      opens: hourData.opens + newOpens,
      clicks: hourData.clicks + newClicks
    });
    
    updateEngagementScore();
    broadcastMetricsUpdate();
  }, 3000); // Update every 3 seconds
}