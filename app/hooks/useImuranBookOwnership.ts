'use client'

import { useEffect, useMemo } from 'react'
import { useImuranBookStore } from '../stores/useImuranBookStore'

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

  const getHasBook = useImuranBookStore((s) => s.getHasBook)
  const isLoading = useImuranBookStore((s) => s.isLoading)
  const fetchHasBookForWallets = useImuranBookStore((s) => s.fetchHasBookForWallets)

  const allCached = wallets.length > 0 && wallets.every((w) => getHasBook(w) !== null)
  const hasBook = allCached ? wallets.some((w) => getHasBook(w) === true) : false
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
