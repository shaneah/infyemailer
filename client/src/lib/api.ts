/**
 * API request utility function
 * Handles making HTTP requests to the server with proper error handling
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const url = `${baseUrl}${endpoint}`;

  const defaultOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // Important for cookies/session
  };

  if (data) {
    defaultOptions.body = JSON.stringify(data);
  }

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response;
}

/**
 * API request with automatic JSON parsing
 * Returns the parsed JSON data from the response
 */
export async function apiRequestJson<T>(
  method: string,
  endpoint: string,
  data?: any,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiRequest(method, endpoint, data, options);
  return response.json();
}

/**
 * API request with automatic error handling and toast notifications
 * Shows toast notifications for success/error states
 */
export async function apiRequestWithToast<T>(
  method: string,
  endpoint: string,
  data?: any,
  options: RequestInit = {},
  toast?: any
): Promise<T> {
  try {
    const response = await apiRequest(method, endpoint, data, options);
    const result = await response.json();

    if (toast) {
      toast({
        title: "Success",
        description: "Operation completed successfully",
      });
    }

    return result;
  } catch (error) {
    if (toast) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
    throw error;
  }
} 