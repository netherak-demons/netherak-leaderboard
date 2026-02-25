'use client'

import { useState, useEffect } from 'react'

/**
 * Check if the given wallet owns the Imuran Book NFT.
 * Uses Somnia Explorer API (same as PFP) - checks linked wallet (game wallet).
 */
export function useImuranBookOwnership(walletAddress: string | undefined): {
  hasBook: boolean
  loading: boolean
} {
  const [hasBook, setHasBook] = useState(false)
  const [loading, setLoading] = useState(!!walletAddress)

  useEffect(() => {
    if (!walletAddress) {
      setHasBook(false)
      setLoading(false)
      return
    }

    let cancelled = false

    async function check() {
      const wallet = walletAddress
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
        setHasBook(data?.hasBook === true)
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
