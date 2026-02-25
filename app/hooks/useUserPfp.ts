'use client'

import { useState, useEffect } from 'react'
import type { PfpApiResponse } from '../types/api'

/**
 * Fetches PFP via our API proxy (avoids CORS from Somnia Explorer).
 * See https://explorer.somnia.network/api-docs
 */
function toIpfsGateway(url: string): string {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
  return url
}

export function useUserPfp(walletAddress: string | undefined): { pfpUrl: string | null; loading: boolean } {
  const [pfpUrl, setPfpUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!walletAddress)

  useEffect(() => {
    if (!walletAddress) {
      setPfpUrl(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      const wallet = walletAddress
      if (!wallet) return

      setLoading(true)
      setPfpUrl(null)

      try {
        const walletParam = wallet.startsWith('0x') ? wallet : `0x${wallet}`
        const res = await fetch(`/api/pfp?wallet=${encodeURIComponent(walletParam)}`)
        if (!res.ok) {
          setLoading(false)
          return
        }

        const data: PfpApiResponse = await res.json()
        if (cancelled || !data?.items?.length) {
          setLoading(false)
          return
        }

        const first = data.items[0]
        const imageUrl =
          first.image_url ||
          first.metadata?.image_url ||
          first.metadata?.image ||
          first.media_url

        if (!imageUrl) {
          setLoading(false)
          return
        }

        setPfpUrl(toIpfsGateway(imageUrl))
      } catch {
        setPfpUrl(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [walletAddress])

  return { pfpUrl, loading }
}
