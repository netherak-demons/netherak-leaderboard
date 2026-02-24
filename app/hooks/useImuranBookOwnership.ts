'use client'

import { useState, useEffect } from 'react'
import { IMURAN_BOOK_CONTRACT } from '../config/contracts'

const RPC_URL = 'https://rpc.ankr.com/somnia_mainnet'

function padAddress(addr: string): string {
  const clean = addr.startsWith('0x') ? addr.slice(2) : addr
  return clean.toLowerCase().padStart(64, '0')
}

/**
 * Check if the given wallet owns the Imuran Book NFT.
 * Uses linked wallet from season stats (game wallet) - the book is checked on Somnia.
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
      if (!walletAddress) return
      setLoading(true)
      setHasBook(false)

      try {
        const addr = padAddress(walletAddress)

        const res = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: IMURAN_BOOK_CONTRACT.address,
                data: '0x70a08231' + addr,
              },
              'latest',
            ],
            id: 1,
          }),
        })

        const json = await res.json()
        if (cancelled || json.error) {
          setLoading(false)
          return
        }

        const balance = parseInt(json.result || '0', 16)
        setHasBook(balance > 0)
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
