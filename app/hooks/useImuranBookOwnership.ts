'use client'

import { useEffect, useMemo } from 'react'
import { useImuranBookStore } from '../stores/useImuranBookStore'

const IMURAN_BOOK_CACHE_TTL_MS = 5 * 60 * 1000

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
 * Returns whether any of the given wallets owns the Imuran Book.
 * Data is fetched by DataLoader. Components can call this for reactive updates.
 */
export function useImuranBookOwnership(
  walletAddresses: string | undefined | (string | undefined)[]
): {
  hasBook: boolean
  loading: boolean
} {
  const walletsKey = Array.isArray(walletAddresses)
    ? [...walletAddresses].filter(Boolean).sort().join(',')
    : walletAddresses ?? ''
  const wallets = useMemo(() => {
    if (Array.isArray(walletAddresses)) return uniqueWallets(walletAddresses)
    if (walletAddresses) return uniqueWallets([walletAddresses])
    return []
  }, [walletsKey])

  // Subscribe to cache so we re-render when fetch completes (getHasBook is a function ref - never changes)
  const cache = useImuranBookStore((s) => s.cache)
  const isLoading = useImuranBookStore((s) => s.isLoading)
  const fetchHasBookForWallets = useImuranBookStore((s) => s.fetchHasBookForWallets)

  const getCached = (w: string) => {
    const entry = cache.get(w.toLowerCase())
    if (!entry || Date.now() - entry.ts > IMURAN_BOOK_CACHE_TTL_MS) return null
    return entry.hasBook
  }
  const allCached = wallets.length > 0 && wallets.every((w) => getCached(w) !== null)
  const hasBook = allCached ? wallets.some((w) => getCached(w) === true) : false
  const loading = wallets.length > 0 && !allCached && isLoading(wallets)

  useEffect(() => {
    if (wallets.length > 0) {
      fetchHasBookForWallets(wallets)
    }
  }, [walletsKey, wallets, fetchHasBookForWallets])

  return {
    hasBook,
    loading,
  }
}
