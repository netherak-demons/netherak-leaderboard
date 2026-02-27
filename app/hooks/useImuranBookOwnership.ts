'use client'

import { useState, useEffect } from 'react'

const IMURAN_BOOK_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const imuranBookCache = new Map<string, { hasBook: boolean; ts: number }>()

function getCachedImuranBook(wallet: string): boolean | null {
  const key = wallet.toLowerCase()
  const entry = imuranBookCache.get(key)
  if (!entry || Date.now() - entry.ts > IMURAN_BOOK_CACHE_TTL_MS) return null
  return entry.hasBook
}

function setCachedImuranBook(wallet: string, hasBook: boolean) {
  imuranBookCache.set(wallet.toLowerCase(), { hasBook, ts: Date.now() })
}

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
 * Check if any of the given wallets owns the Imuran Book NFT.
 * The book can be held by either the main profile wallet or the linked (game) wallet.
 * Uses Somnia Explorer API. Caches results so navigating away and back shows immediately.
 */
export function useImuranBookOwnership(
  walletAddresses: string | undefined | (string | undefined)[]
): {
  hasBook: boolean
  loading: boolean
} {
  const wallets = Array.isArray(walletAddresses)
    ? uniqueWallets(walletAddresses)
    : walletAddresses
      ? uniqueWallets([walletAddresses])
      : []

  const allCached = wallets.length > 0 && wallets.every((w) => getCachedImuranBook(w) !== null)
  const cachedHasBook = wallets.some((w) => getCachedImuranBook(w) === true)

  const [hasBook, setHasBook] = useState(() => (allCached ? cachedHasBook : false))
  const [loading, setLoading] = useState(wallets.length > 0 && !allCached)

  useEffect(() => {
    if (wallets.length === 0) {
      setHasBook(false)
      setLoading(false)
      return
    }

    const cached = wallets.map((w) => getCachedImuranBook(w))
    if (cached.every((c) => c !== null)) {
      setHasBook(cached.some((c) => c === true))
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setHasBook(false)

    async function check() {
      for (const wallet of wallets) {
        if (cancelled) return

        const cachedResult = getCachedImuranBook(wallet)
        if (cachedResult !== null) {
          if (cachedResult) {
            if (!cancelled) setHasBook(true)
            break
          }
          continue
        }

        try {
          const walletParam = wallet.startsWith('0x') ? wallet : `0x${wallet}`
          const res = await fetch(
            `/api/imuran-book?wallet=${encodeURIComponent(walletParam)}`
          )
          if (cancelled) return
          if (!res.ok) continue

          const data = await res.json()
          const hasBookResult = data?.hasBook === true
          setCachedImuranBook(wallet, hasBookResult)
          if (hasBookResult) {
            if (!cancelled) setHasBook(true)
            break
          }
        } catch {
          // continue to next wallet
        }
      }
      if (!cancelled) setLoading(false)
    }

    check()
    return () => {
      cancelled = true
    }
  }, [wallets.join(',')])

  return { hasBook, loading }
}
