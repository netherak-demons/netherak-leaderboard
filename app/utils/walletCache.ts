/**
 * Shared utilities for wallet-based caching across PFP, Imuran Book, NKD Recipes.
 */

export const ASSET_CACHE_TTL_MS = 5 * 60 * 1000

export function uniqueWallets(wallets: (string | undefined)[]): string[] {
  const seen = new Set<string>()
  return wallets.filter((w): w is string => {
    if (!w || typeof w !== 'string') return false
    const key = w.toLowerCase().trim()
    if (!key || key === '0x') return false
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
