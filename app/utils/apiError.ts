/**
 * Standardized API error handling.
 * Parses fetch responses and returns user-facing error messages.
 */

const USER_MESSAGES: Record<number, string> = {
  400: 'Invalid request',
  401: 'Authentication required',
  403: 'Access denied',
  404: 'Not found',
  408: 'Request timed out',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable',
  503: 'Service temporarily unavailable',
}

export async function parseApiError(response: Response): Promise<string> {
  const fallback = USER_MESSAGES[response.status] ?? `Error: ${response.status}`
  try {
    const data = await response.json().catch(() => ({}))
    const msg = data?.error ?? data?.message ?? data?.details
    if (typeof msg === 'string' && msg.trim()) return msg
  } catch {
    // ignore
  }
  return fallback
}

export function parseFetchError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes('fetch')) return 'Network error. Please check your connection.'
    if (err.message.includes('timeout')) return 'Request timed out. Please try again.'
    return err.message
  }
  return 'An unexpected error occurred'
}
