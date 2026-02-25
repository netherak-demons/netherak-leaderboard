'use client'

import { useState, useEffect } from 'react'
import type { PfpApiResponse } from '../types/api'

const PFP_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const pfpCache = new Map<string, { url: string; ts: number }>()

function getCachedPfp(wallet: string): string | null {
  const key = wallet.toLowerCase()
  const entry = pfpCache.get(key)
  if (!entry || Date.now() - entry.ts > PFP_CACHE_TTL_MS) return null
  return entry.url
}

function setCachedPfp(wallet: string, url: string) {
  pfpCache.set(wallet.toLowerCase(), { url, ts: Date.now() })
}

/**
 * Fetches PFP via our API proxy (avoids CORS from Somnia Explorer).
 * Caches results so navigating away and back shows PFP immediately.
 */
function toIpfsGateway(url: string): string {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
  return url
}

export function useUserPfp(walletAddress: string | undefined): { pfpUrl: string | null; loading: boolean } {
  const normalizedWallet = walletAddress?.toLowerCase()
  const cached = normalizedWallet ? getCachedPfp(normalizedWallet) : null

  const [pfpUrl, setPfpUrl] = useState<string | null>(() => cached)
  const [loading, setLoading] = useState(!!walletAddress && !cached)

  useEffect(() => {
    if (!walletAddress) {
      setPfpUrl(null)
      setLoading(false)
      return
    }

    const wallet = walletAddress
    const cachedUrl = getCachedPfp(wallet)
    if (cachedUrl) {
      setPfpUrl(cachedUrl)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
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

        const url = toIpfsGateway(imageUrl)
        setCachedPfp(wallet, url)
        setPfpUrl(url)
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
