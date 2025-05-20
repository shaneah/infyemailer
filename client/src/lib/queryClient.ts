import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Clone the response before reading to avoid "body stream already read" errors
    const clonedRes = res.clone();
    
    try {
      // Try to parse as JSON first
      const errorData = await clonedRes.json();
      throw new Error(errorData.error || `${res.status}: ${res.statusText}`);
    } catch (jsonError) {
      try {
        // If not JSON, get as text
        const text = await clonedRes.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      } catch (textError) {
        // If both fail, return a generic error
        throw new Error(`${res.status}: ${res.statusText}`);
      }
    }
  }
}

// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000';

export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  options?: RequestInit,
): Promise<Response> {
  // Ensure URL starts with a slash
  const apiUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : `${API_BASE_URL}/${url}`;
  
  console.log(`API Request [${method}]:`, apiUrl, body);
  
  try {
    const res = await fetch(apiUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
      credentials: 'include',
    });

    console.log(`API Response [${res.status}]:`, res);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
