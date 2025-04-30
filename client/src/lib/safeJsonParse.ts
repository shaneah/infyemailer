/**
 * Safely parses JSON from an HTTP response, handling HTML responses gracefully
 * @param response The fetch Response object
 * @param endpoint The API endpoint name for better error reporting
 * @returns A promise that resolves to the parsed JSON data
 */
export async function safeJsonParse<T>(response: Response, endpoint: string): Promise<T> {
  // Check if the response is OK
  if (!response.ok) {
    // Clone the response to avoid the "body already read" error
    const clonedResponse = response.clone();
    
    try {
      // Try to parse the error response as JSON
      const errorData = await clonedResponse.json();
      throw new Error(errorData.error || errorData.message || `API error ${response.status}: ${response.statusText}`);
    } catch (parseError) {
      // If JSON parsing fails, get the text response
      const errorText = await response.text();
      
      // If it looks like HTML, provide a more helpful error
      if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
        throw new Error(`Server returned HTML instead of JSON for ${endpoint}. The API may be experiencing issues.`);
      }
      
      // Otherwise throw with the raw error text (truncated if too long)
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 150)}${errorText.length > 150 ? '...' : ''}`);
    }
  }
  
  // Check the content type
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // Clone the response to avoid the "body already read" error
    const clonedResponse = response.clone();
    const text = await clonedResponse.text();
    
    // If it looks like HTML, provide a more helpful error
    if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
      throw new Error(`Server returned HTML instead of JSON for ${endpoint}. The API may be experiencing issues.`);
    }
    
    // Log the issue for debugging
    console.error(`Response is not JSON (${endpoint}):`, contentType);
    console.error(`Response text (${endpoint}):`, text.substring(0, 200) + '...');
    
    throw new Error(`Server returned non-JSON response for ${endpoint}. The API may be experiencing issues.`);
  }
  
  // Safe to parse as JSON now
  try {
    return await response.json() as T;
  } catch (error) {
    console.error(`JSON parsing error (${endpoint}):`, error);
    throw new Error(`Failed to parse JSON response from ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}