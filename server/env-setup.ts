// Set environment variables for Vite optimization
// This file is imported before the app starts to configure environment
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set environment variable to skip problematic dependencies in Vite optimization
process.env.VITE_OPTIMIZEJS_EXCLUDE = '@sendgrid/mail,ws,postgres';

// Log the optimization exclusion
console.log('Configured Vite optimization excludes:', process.env.VITE_OPTIMIZEJS_EXCLUDE);

// Log database connection status
console.log('Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Not configured');