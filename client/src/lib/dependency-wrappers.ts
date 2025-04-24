// This file acts as a wrapper around problematic dependencies
// It provides safe exports that won't break Vite's optimization

// Wrapper for @sendgrid/mail
export const sendgridMailWrapper = {
  // Import the actual module only when needed, not during build/optimization
  getInstance: async () => {
    try {
      const { default: sendgrid } = await import('@sendgrid/mail');
      return sendgrid;
    } catch (error) {
      console.error('Failed to load @sendgrid/mail:', error);
      // Return a mock that won't break the app
      return {
        setApiKey: () => {},
        send: () => Promise.resolve()
      };
    }
  }
};

// Wrapper for postgres
export const postgresWrapper = {
  getInstance: async () => {
    try {
      const { default: postgres } = await import('postgres');
      return postgres;
    } catch (error) {
      console.error('Failed to load postgres:', error);
      // Return a basic mock
      return () => ({
        // Mock implementation
        query: () => Promise.resolve([])
      });
    }
  }
};

// Wrapper for ws
export const wsWrapper = {
  getInstance: async () => {
    try {
      const { default: WebSocket } = await import('ws');
      return WebSocket;
    } catch (error) {
      console.error('Failed to load ws:', error);
      // Return a mock WebSocket class
      return class MockWebSocket {
        constructor() {
          console.warn('Using mock WebSocket implementation');
        }
        on() { return this; }
        send() {}
        close() {}
      };
    }
  }
};