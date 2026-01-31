/**
 * API service for Netherak backend
 * Handles all API calls to the backend
 */

const API_BASE_URL = '/api/netherak'
const API_KEY = process.env.NEXT_PUBLIC_NETHERAK_API_KEY || 'REDACTED'

interface ApiResponse<T> {
  data?: T
  error?: string
}

/**
 * Generic API call function
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get auth token if available
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('backoffice_token') : null
    
    // Map external endpoints to Next.js API routes
    let apiRoute = endpoint
    if (endpoint === '/stats/season') {
      apiRoute = '/api/season-stats'
    } else if (endpoint.startsWith('/')) {
      // If it starts with /, it's a relative path - use as is or prepend API_BASE_URL if needed
      apiRoute = endpoint.startsWith('/api/') ? endpoint : `${API_BASE_URL}${endpoint}`
    } else {
      apiRoute = `${API_BASE_URL}${endpoint}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    }

    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(apiRoute, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        error: `API error ${response.status}: ${errorText}`,
      }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, { method: 'GET' })
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Authentication service
 * Handles backoffice authentication
 */
export interface AuthResponse {
  success: boolean
  token?: string
  error?: string
}

/**
 * Authenticate with password
 * This should call a backend endpoint that validates the password
 * and returns a token/session that can be used for subsequent requests
 */
export async function authenticate(password: string): Promise<AuthResponse> {
  // Call backend endpoint to validate password
  // The backend should return a token or session ID
  const response = await apiPost<{ success: boolean; token?: string }>(
    '/auth/backoffice',
    { password }
  )

  if (response.error) {
    return { success: false, error: response.error }
  }

  if (response.data?.success && response.data.token) {
    // Store token securely (httpOnly cookies would be better, but this is a start)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('backoffice_token', response.data.token)
    }
    return { success: true, token: response.data.token }
  }

  return { success: false, error: 'Authentication failed' }
}

/**
 * Verify if user is authenticated
 * Checks for valid token and optionally validates with backend
 */
export async function verifyAuth(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  const token = sessionStorage.getItem('backoffice_token')
  if (!token) {
    return false
  }

  // Optionally verify token with backend
  // For now, just check if token exists
  // In production, you should validate the token with the backend
  const response = await apiGet<{ valid: boolean }>('/auth/verify')
  
  if (response.data?.valid) {
    return true
  }

  // If verification fails, clear token
  sessionStorage.removeItem('backoffice_token')
  return false
}

/**
 * Logout - clear authentication
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('backoffice_token')
  }
}
