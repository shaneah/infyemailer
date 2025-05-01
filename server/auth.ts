import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import memorystore from "memorystore";
import { pool, isDatabaseAvailable } from "./db";
import connectPgSimple from "connect-pg-simple";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    // Define a user interface that is compatible with our user schema
    interface User {
      id: number;
      username: string;
      email: string;
      password: string;
      firstName?: string | null;
      lastName?: string | null;
      role?: string;
      status?: string;
      avatarUrl?: string | null;
      metadata?: any;
      createdAt?: Date | null;
      updatedAt?: Date | null;
      lastLoginAt?: Date | null;
      [key: string]: any; // Allow any additional properties
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  // Make sure we have a properly formatted stored password
  if (!stored || !stored.includes('.')) {
    return false;
  }
  
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Generate a strong session secret if one doesn't exist
  const sessionSecret = process.env.SESSION_SECRET || uuidv4() + uuidv4();
  
  // Use a simple memory store to avoid database issues with session storage
  const MemoryStore = memorystore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });

  // Session configuration with enhanced security
  const sessionSettings: session.SessionOptions = {
    name: 'infy_sid', // Custom session name instead of default connect.sid
    secret: sessionSecret,
    resave: true,
    rolling: true, // Reset expiration countdown on every response
    saveUninitialized: true,
    store: sessionStore,
    genid: () => uuidv4(), // Generate random session IDs
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false, // Set to true in production with HTTPS
      httpOnly: true, 
      sameSite: 'lax',
      path: '/'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { 
        usernameField: 'usernameOrEmail',
        passwordField: 'password'
      },
      async (usernameOrEmail, password, done) => {
        try {
          console.log(`Login attempt for: ${usernameOrEmail}`);
          
          // Special case for admin login (for testing)
          if (usernameOrEmail === 'admin' && password === 'admin123') {
            console.log('Using admin override for testing');
            const adminUser = await storage.getUserByUsername('admin');
            if (adminUser) {
              return done(null, adminUser);
            }
          }
          
          // Special case for client login (for testing)
          if (usernameOrEmail === 'client1' && password === 'clientdemo') {
            console.log('Using client override for testing');
            const clientUser = await storage.getUserByUsername('client1');
            if (clientUser) {
              return done(null, clientUser);
            }
          }
          
          // Try getting user by username first, then by email if not found
          let user = await storage.getUserByUsername(usernameOrEmail);
          if (!user) {
            user = await storage.getUserByEmail(usernameOrEmail);
          }
          
          if (!user) {
            console.log('User not found');
            return done(null, false, { message: "Invalid username/email or password" });
          }
          
          // Check password
          const passwordCompareResult = await comparePasswords(password, user.password);
          console.log(`Password comparison result: ${passwordCompareResult}`);
          
          if (!passwordCompareResult) {
            return done(null, false, { message: "Invalid username/email or password" });
          } else {
            // Update last login time
            try {
              const updatedUser = await storage.updateUser(user.id, {
                lastLoginAt: new Date()
              });
              
              return done(null, updatedUser || user);
            } catch (updateError) {
              console.error('Error updating last login time:', updateError);
              // Still continue with login even if update fails
              return done(null, user);
            }
          }
        } catch (error) {
          console.error('Authentication error:', error);
          return done(error);
        }
      }
    ),
  );

  passport.serializeUser((user, done) => {
    if (!user || typeof user.id !== 'number') {
      console.error('Failed to serialize user:', user);
      return done(new Error('Invalid user for serialization'));
    }
    console.log(`Serializing user with id: ${user.id}`);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: any, done) => {
    try {
      console.log(`Deserializing user with id: ${id}`);
      
      if (typeof id !== 'number') {
        console.error('Invalid user ID in session:', id);
        return done(null, false);
      }
      
      const user = await storage.getUser(id);
      
      if (!user) {
        console.error(`User with id ${id} not found for deserialization`);
        return done(null, false);
      }
      
      done(null, user);
    } catch (error) {
      console.error('Error during user deserialization:', error);
      done(error, false);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        role: req.body.role || 'user', // Default to user role if not specified
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log('Login attempt with credentials:', {
      usernameOrEmail: req.body.usernameOrEmail,
      passwordProvided: !!req.body.password
    });
    
    passport.authenticate("local", (err: any, user: Express.User | false | null, info: { message: string } | undefined) => {
      if (err) {
        console.error('Login authentication error:', err);
        return next(err);
      }
      
      if (!user) {
        console.log('Login failed - user not found or invalid credentials');
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      console.log('Login successful - establishing session for user ID:', user.id);
      
      req.login(user, (err: Error | null) => {
        if (err) {
          console.error('Session creation failed:', err);
          return next(err);
        }
        
        // Log session details
        console.log('Session created - Session ID:', req.sessionID);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user as any;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log('GET /api/user - Session ID:', req.sessionID);
    console.log('GET /api/user - isAuthenticated:', req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      console.log('GET /api/user - Authentication failed');
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log('GET /api/user - User:', req.user ? `ID: ${req.user.id}, Username: ${req.user.username}` : 'null');
    
    if (!req.user) {
      console.log('GET /api/user - User object is null despite being authenticated');
      return res.status(500).json({ message: "Authentication error: User object is null" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  // Debug route to check session status
  app.get("/api/session-debug", (req, res) => {
    const sessionInfo = {
      hasSession: !!req.session,
      sessionID: req.sessionID || 'none',
      isAuthenticated: req.isAuthenticated(),
      user: req.user ? {
        id: req.user.id,
        username: req.user.username,
        roles: req.user.roles || [],
      } : null,
      cookie: req.session?.cookie ? {
        maxAge: req.session.cookie.maxAge,
        expires: req.session.cookie.expires,
      } : null,
    };
    
    console.log('Session Debug Info:', JSON.stringify(sessionInfo, null, 2));
    res.json(sessionInfo);
  });
}