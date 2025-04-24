// Set environment variables for Vite optimization
// This file is imported before the app starts to configure environment

// Set environment variable to skip problematic dependencies in Vite optimization
process.env.VITE_OPTIMIZEJS_EXCLUDE = '@sendgrid/mail,ws,postgres';

// Log the optimization exclusion
console.log('Configured Vite optimization excludes:', process.env.VITE_OPTIMIZEJS_EXCLUDE);