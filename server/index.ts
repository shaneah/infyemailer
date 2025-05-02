// Import environment setup first to configure Vite optimization
import "./env-setup";

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
// Removed fileUpload import - it's now ONLY used in routes.ts
import { isDatabaseAvailable, initDatabase } from "./db";

const app = express();
// Increase the JSON payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
// IMPORTANT: File upload middleware is ONLY configured in registerRoutes 
// DO NOT add another instance of the fileUpload middleware here
// Using multiple instances causes "Request is not eligible for file upload" errors

// Log incoming requests with file upload info for debugging
app.use((req, res, next) => {
  if (req.path.includes('/import-zip')) {
    console.log('IMPORT REQUEST:', {
      path: req.path,
      method: req.method,
      contentType: req.headers['content-type'],
      hasFiles: req.files ? 'Yes' : 'No',
      filesKeys: req.files ? Object.keys(req.files) : [],
      body: Object.keys(req.body || {})
    });
  }
  next();
});

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

// Import the updateStorageReferences function
import { updateStorageReferences } from './storageManager';
import { initializeRolesAndPermissions } from './init-roles-permissions';

// Initialize the application
(async () => {
  try {
    // Initialize database connection first
    await initDatabase();
    
    // Update storage references to use the appropriate storage implementation
    // Make this await to ensure it completes before continuing
    await updateStorageReferences();
    
    // Log storage mode after database initialization
    log(`Using ${isDatabaseAvailable ? 'PostgreSQL database' : 'memory storage'} for data operations`, 'server');
    
    // Extra verification for database connection
    if (isDatabaseAvailable) {
      log('Database connection confirmed - performing final checks', 'server');
      try {
        // Extra verification query to ensure database is fully ready
        const { pool } = await import('./db');
        const verifyResult = await pool.query('SELECT COUNT(*) FROM clients');
        log(`Database verification successful - found ${verifyResult.rows[0].count} clients`, 'server');
      } catch (verifyError) {
        log(`Database verification warning: ${verifyError.message}`, 'server');
        // Continue anyway as we've already determined database is available
      }
    }
    
    // Initialize roles and permissions
    await initializeRolesAndPermissions();
    
    // Register API routes
    const server = await registerRoutes(app);

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
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server running on port ${port} (using ${isDatabaseAvailable ? 'database' : 'memory'} storage)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();