'use client'

import { useEffect } from 'react'
import { usePfpStore } from '../stores/usePfpStore'
import { ASSET_CACHE_TTL_MS, uniqueWallets } from '../utils/walletCache'

/**
 * Returns PFP URL for the wallet(s). When given multiple wallets, returns the first that has a PFP.
 * Data is fetched by DataLoader for main + linked wallet. Components can call this for reactive updates.
 */
export function useUserPfp(
  walletAddress: string | undefined | (string | undefined)[]
): {
  pfpUrl: string | null
  loading: boolean
} {
  // Subscribe to cache so we re-render when fetch completes (getPfp is a function ref - never changes)
  const cache = usePfpStore((s) => s.cache)
  const isLoading = usePfpStore((s) => s.isLoading)
  const fetchPfp = usePfpStore((s) => s.fetchPfp)

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

  const walletsKey = [...wallets].sort().join(',')
  useEffect(() => {
    wallets.forEach((w) => fetchPfp(w))
  }, [walletsKey, fetchPfp])

  return {
    pfpUrl: pfpUrl ?? null,
    loading,
  }
}
