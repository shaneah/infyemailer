import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if a media query is matched
 * Example: const isDesktop = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with null and update after mounting to avoid hydration mismatch
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Create a MediaQueryList object
    const mediaQuery = window.matchMedia(query);
    
    // Initial check
    setMatches(mediaQuery.matches);
    
    // Create a listener to handle changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add the event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up the listener when the component unmounts
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);
  
  return matches;
}