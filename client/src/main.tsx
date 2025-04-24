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

// Lazy load the App component to handle any potential loading errors
const LazyApp = lazy(() => 
  import("./App").catch(error => {
    console.error("Failed to load application:", error);
    // Return a minimal module with a default export
    return { default: ErrorBoundaryFallback };
  })
);

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
