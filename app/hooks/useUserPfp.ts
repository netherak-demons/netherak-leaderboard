'use client'

import { useEffect } from 'react'
import { usePfpStore } from '../stores/usePfpStore'

const PFP_CACHE_TTL_MS = 5 * 60 * 1000

function uniqueWallets(wallets: (string | undefined)[]): string[] {
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
    if (!entry || Date.now() - entry.ts > PFP_CACHE_TTL_MS) return null
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
