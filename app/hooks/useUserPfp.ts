'use client'

import { usePfpStore } from '../stores/usePfpStore'
import { ASSET_CACHE_TTL_MS, uniqueWallets } from '../utils/walletCache'

/**
 * Returns PFP URL for the wallet(s). When given multiple wallets, returns the first that has a PFP.
 * Data is fetched only by DataLoader (main + linked wallet). This hook only reads from the store.
 */
export function useUserPfp(
  walletAddress: string | undefined | (string | undefined)[]
): {
  pfpUrl: string | null
  loading: boolean
} {
  const cache = usePfpStore((s) => s.cache)
  const isLoading = usePfpStore((s) => s.isLoading)

  const wallets = Array.isArray(walletAddress)
    ? uniqueWallets(walletAddress)
    : walletAddress ? uniqueWallets([walletAddress]) : []

  const getCached = (w: string) => {
    const entry = cache.get(w.toLowerCase())
    if (!entry || Date.now() - entry.ts > ASSET_CACHE_TTL_MS) return null
    return entry.url
  }
  const pfpUrl = wallets.reduce<string | null>(
    (acc, w) => acc ?? getCached(w),
    null
  )
  const loading = wallets.some((w) => isLoading(w))

  return {
    pfpUrl: pfpUrl ?? null,
    loading,
  }
}
