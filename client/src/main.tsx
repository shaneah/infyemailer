import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Render the full application
createRoot(document.getElementById("root")!).render(
  <App />
);

// Detect and clear any fallback cookies
if (document.cookie.includes('app_failed=true')) {
  // Make a request to clear the fallback cookie
  fetch('/clear-load-failed')
    .then(() => console.log('Cleared app_failed cookie'))
    .catch(err => console.error('Error clearing cookie:', err));
}

// Signal app loaded
if (typeof (window as any).appLoaded === 'function') {
  setTimeout(() => {
    (window as any).appLoaded();
  }, 300);
}
