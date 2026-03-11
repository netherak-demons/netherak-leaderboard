'use client'

import { useMemo } from 'react'
import { useImuranBookStore } from '../stores/useImuranBookStore'
import { ASSET_CACHE_TTL_MS, uniqueWallets } from '../utils/walletCache'

/**
 * Returns whether any of the given wallets owns the Imuran Book.
 * Data is fetched only by DataLoader. This hook only reads from the store.
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

  const cache = useImuranBookStore((s) => s.cache)
  const isLoading = useImuranBookStore((s) => s.isLoading)

  const getCached = (w: string) => {
    const entry = cache.get(w.toLowerCase())
    if (!entry || Date.now() - entry.ts > ASSET_CACHE_TTL_MS) return null
    return entry.hasBook
  }
  const allCached = wallets.length > 0 && wallets.every((w) => getCached(w) !== null)
  const hasBook = allCached ? wallets.some((w) => getCached(w) === true) : false
  const loading = wallets.length > 0 && !allCached && isLoading(wallets)

  return {
    hasBook,
    loading,
  }
}
