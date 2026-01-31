/**
 * Netherak API Client
 * HTTP client for making requests to the Netherak backend API
 */

const API_BASE_URL = '/api/netherak'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

/**
 * Map external endpoints to Next.js API routes
 */
function getApiRoute(endpoint: string): string {
  // Map known endpoints to Next.js API routes
  if (endpoint === '/stats/season') {
    return '/api/season-stats'
  }
  if (endpoint === '/auth/backoffice') {
    return '/api/auth/backoffice'
  }
  if (endpoint === '/auth/verify') {
    return '/api/auth/verify'
  }
  // If it already starts with /api/, use as is
  if (endpoint.startsWith('/api/')) {
    return endpoint
  }
  // Otherwise, prepend API_BASE_URL
  return endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`
}

/**
 * Generic API call function
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('backoffice_token') : null
    const apiRoute = getApiRoute(endpoint)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // API key is handled by Next.js API routes, not the client
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    }

    const response = await fetch(apiRoute, {
      ...options,
      headers,
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
 */
export interface AuthResponse {
  success: boolean
  token?: string
  error?: string
}

export async function authenticate(password: string): Promise<AuthResponse> {
  const response = await apiPost<{ success: boolean; token?: string }>(
    '/auth/backoffice',
    { password }
  )

  if (response.error) {
    return { success: false, error: response.error }
  }

  if (response.data?.success && response.data.token) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('backoffice_token', response.data.token)
    }
    return { success: true, token: response.data.token }
  }

  return { success: false, error: 'Authentication failed' }
}

export async function verifyAuth(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const token = sessionStorage.getItem('backoffice_token')
  if (!token) return false

  // For now, just check if token exists (in production, verify with backend)
  // TODO: Implement token verification endpoint if needed
  // const response = await apiGet<{ valid: boolean }>('/auth/verify')
  // if (response.data?.valid) return true

  return true // Token exists, consider it valid for now
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('backoffice_token')
    sessionStorage.removeItem('backoffice_authenticated')
  }
}
