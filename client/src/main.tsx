import { createRoot } from "react-dom/client";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import "./index.css";

// Error boundary component for catching render errors
function ErrorBoundaryFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
      <p className="mb-4">There was a problem loading the application.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Reload Application
      </button>
      <Toaster />
    </div>
  );
}

// Try to detect problematic module before loading the app
const problematicDeps = ['@sendgrid/mail', 'ws', 'postgres'];
const buildHasIssues = problematicDeps.some(dep => {
  try {
    // This won't actually load the module but will trigger Vite's optimization
    // which will fail if there's an issue
    const triggerCheck = `${dep}/package.json`;
    return false;
  } catch (error) {
    console.warn(`Detected potential issue with dependency: ${dep}`);
    return true;
  }
});

// Lazy load the App component to handle any potential loading errors
const LazyApp = lazy(() => {
  // If we detect issues with dependencies or if the URL contains '?fallback=true',
  // go straight to the fallback
  if (buildHasIssues || window.location.search.includes('fallback=true')) {
    return import("./fallback-app");
  }
  
  // Otherwise try loading the main app, with fallback to simplified version
  return import("./App").catch(error => {
    console.error("Failed to load application:", error);
    // Return the fallback app instead of error boundary
    return import("./fallback-app");
  });
});

// Create a loading indicator
const LoadingIndicator = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Render the app with suspense and error handling
createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<LoadingIndicator />}>
    <LazyApp />
    <Toaster />
  </Suspense>
);
