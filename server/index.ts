// Import environment setup first to configure Vite optimization
import "./env-setup";

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fileUpload from "express-fileupload";
import { isDatabaseAvailable, initDatabase } from "./db";
import { updateStorageReferences, getStorage } from './storageManager';
import { initializeRolesAndPermissions } from './init-roles-permissions';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { DbStorage } from './dbStorage';
import session from 'express-session';
import { setupAuth } from './auth';
import memorystore from 'memorystore';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db';
import passport from 'passport';
import clientCampaignsRouter from './routes/clientCampaigns';

// Add type declaration for WebSocket
interface WebSocketConnection extends WebSocket {
  userId: string;
  templateId: string;
}

const app = express();
const server = createServer(app);

// Increase the JSON payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Setup session middleware first
let sessionStore;
if (isDatabaseAvailable) {
  console.log('Using PostgreSQL for session storage');
  const PgSessionStore = connectPgSimple(session);
  sessionStore = new PgSessionStore({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 60
  });
} else {
  console.log('Using memory store for session storage');
  const MemoryStore = memorystore(session);
  sessionStore = new MemoryStore({
    checkPeriod: 86400000,
    max: 1000
  });
}

// Configure session settings
app.set("trust proxy", 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'infy-mailer-secret',
  resave: true,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: false,
    sameSite: 'lax',
    path: '/',
    httpOnly: true
  },
  name: 'infy.sid'
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Add session debugging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Session debug:', {
    sessionID: req.sessionID,
    hasSession: !!req.session,
    hasUser: !!(req.session && req.session.user),
    cookies: req.cookies
  });
  next();
});

// Setup auth routes
setupAuth(app);

// Configure file upload middleware
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: true,
  abortOnLimit: true
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Register the client campaigns route
app.use(clientCampaignsRouter);

// Initialize the application
(async () => {
  try {
    // Initialize database connection first
    log('Initializing database connection...', 'server');
    const dbInitialized = await initDatabase();
    
    if (!dbInitialized || !isDatabaseAvailable) {
      throw new Error('Database connection is required but not available. Please check your database configuration.');
    }
    
    // Wait a moment to ensure connection is stable
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update storage references to use database storage
    log('Updating storage references...', 'server');
    await updateStorageReferences();
    
    // Log storage mode
    log('Using PostgreSQL database for data operations', 'server');
    
    // Extra verification for database connection
    log('Performing final database connection checks...', 'server');
    try {
      // Extra verification query to ensure database is fully ready
      const { pool } = await import('./db');
      
      // First verify tables exist with a more robust check
      const tablesQuery = await pool.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      if (tablesQuery.rows.length > 0) {
        log(`Database verification: Found ${tablesQuery.rows.length} tables in schema`, 'server');
        
        // Now check the clients table specifically
        const verifyResult = await pool.query('SELECT COUNT(*) FROM clients');
        log(`Database verification successful - found ${verifyResult.rows[0].count} clients`, 'server');
        
        // Add one more check to make sure contacts are accessible
        const contactsCheck = await pool.query('SELECT COUNT(*) FROM contacts');
        log(`Database verification for contacts - found ${contactsCheck.rows[0].count} contacts`, 'server');
        
        // Verify contact_lists table structure
        const listRelationsCheck = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'contact_lists'
        `);
        log(`Contact-list relations columns: ${listRelationsCheck.rows.map((r: { column_name: string }) => r.column_name).join(', ')}`, 'server');
      } else {
        throw new Error('No tables found in database schema!');
      }
    } catch (verifyError: any) {
      log(`Database verification failed: ${verifyError.message}`, 'server');
      throw new Error(`Database verification failed: ${verifyError.message}`);
    }
    
    // Initialize roles and permissions
    log('Initializing roles and permissions...', 'server');
    await initializeRolesAndPermissions();
    
    // Create HTTP server first
    const server = createServer(app);
    
    // Initialize storage before registering routes
    log('Initializing storage...', 'server');
    const storage = getStorage();
    log('Storage initialized successfully', 'server');
    
    // Initialize test data
    if (storage instanceof DbStorage) {
      await storage.initializeTestData();
    }
    
    // Register API routes after server is created
    log('Registering API routes...', 'server');
    await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    // Initialize WebSocket server with proper configuration
    const wss = new WebSocketServer({
      server,
      path: '/collaboration',
      clientTracking: true
    });

    // Add error handling for the WebSocket server
    wss.on('error', (err) => {
      console.error('[WebSocketServer] Error:', err);
    });

    // Add error handling for each WebSocket connection
    wss.on('connection', (ws, req) => {
      try {
        // Log detailed connection info
        console.log('[WebSocket] New connection:', {
          remoteAddress: req?.socket?.remoteAddress,
          headers: req?.headers,
          userAgent: req?.headers['user-agent']
        });

        // Get userId and templateId from query parameters
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const userId = url.searchParams.get('userId');
        const templateId = url.searchParams.get('templateId');
        const token = url.searchParams.get('token');

        if (!userId || !templateId) {
          console.error('[WebSocket] Connection rejected: Missing required parameters');
          ws.close(4000, 'Missing required parameters');
          return;
        }

        // Token is optional for now
        if (token) {
          // Add token validation here if needed
          console.log('[WebSocket] Token received:', token);
        }

        // Store user info in a map
        const userMap = new Map<WebSocket, { userId: string; templateId: string }>();
        userMap.set(ws as WebSocket, { userId, templateId });

        ws.on('error', (err) => {
          // Log all WebSocket errors
          console.error('[WebSocket] Connection error:', err, 'Remote address:', req?.socket?.remoteAddress);
        });

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            console.log('[WebSocket] Received message:', message);
            
            // Handle incoming messages here
            switch (message.type) {
              case 'room_state':
              case 'user_list':
              case 'cursor_update':
              case 'template_change':
                // Forward message to other clients
                wss.clients.forEach(client => {
                  if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                  }
                });
                break;
              default:
                console.log('[WebSocket] Unhandled message type:', message.type);
            }
          } catch (err) {
            console.error('[WebSocket] Error parsing message:', err);
          }
        });

        // Send initial connection confirmation
        ws.send(JSON.stringify({ type: 'connected', status: 'success' }));

        // Handle connection close
        ws.on('close', () => {
          console.log('[WebSocket] Connection closed:', {
            userId,
            templateId,
            remoteAddress: req?.socket?.remoteAddress
          });
          userMap.delete(ws);
        });

      } catch (err) {
        console.error('[WebSocket] Initialization error:', err);
        ws.close(5000, 'Server initialization error');
      }
    });

    server.listen({
      port: 5000,
    }, () => {
      log(`Server running on port ${5000} (using PostgreSQL database)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();