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

/**
 * Check if the given wallet owns the Imuran Book NFT.
 * Uses Somnia Explorer API (same as PFP) - checks linked wallet (game wallet).
 * Caches results so navigating away and back shows immediately.
 */
export function useImuranBookOwnership(walletAddress: string | undefined): {
  hasBook: boolean
  loading: boolean
} {
  const normalizedWallet = walletAddress?.toLowerCase()
  const cached = normalizedWallet ? getCachedImuranBook(normalizedWallet) : null

  const [hasBook, setHasBook] = useState(() => cached ?? false)
  const [loading, setLoading] = useState(!!walletAddress && cached === null)

  useEffect(() => {
    if (!walletAddress) {
      setHasBook(false)
      setLoading(false)
      return
    }

    const wallet = walletAddress
    const cachedResult = getCachedImuranBook(wallet)
    if (cachedResult !== null) {
      setHasBook(cachedResult)
      setLoading(false)
      return
    }

    let cancelled = false

    async function check() {
      if (!wallet) return

      setLoading(true)
      setHasBook(false)

      try {
        const walletParam = wallet.startsWith('0x') ? wallet : `0x${wallet}`
        const res = await fetch(
          `/api/imuran-book?wallet=${encodeURIComponent(walletParam)}`
        )
        if (cancelled || !res.ok) {
          setLoading(false)
          return
        }

        const data = await res.json()
        const hasBookResult = data?.hasBook === true
        setCachedImuranBook(wallet, hasBookResult)
        setHasBook(hasBookResult)
      } catch {
        setHasBook(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [walletAddress])

  return { hasBook, loading }
}
