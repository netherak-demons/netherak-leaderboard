/**
 * Fetches with retry on transient failures. Retries only on network errors
 * and 5xx responses (not 4xx, which indicate client errors).
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  maxRetries = 2
): Promise<Response> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(input, init)
      const isRetryable = !res.ok && res.status >= 500
      if (res.ok || !isRetryable || attempt === maxRetries) return res
      lastError = new Error(`HTTP ${res.status}`)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)))
    }
  }
  throw lastError ?? new Error('Fetch failed')
}
