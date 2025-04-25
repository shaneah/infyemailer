// Extended Express session types
import 'express-session';

// Extend the session interface to include our custom properties
declare module 'express-session' {
  interface SessionData {
    user?: any; // Admin user data
    clientUser?: any; // Client user data
  }
}