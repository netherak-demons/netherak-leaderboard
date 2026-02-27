'use client'

import { create } from 'zustand'
import type { PfpApiResponse } from '../types/api'

const PFP_CACHE_TTL_MS = 5 * 60 * 1000

function toIpfsGateway(url: string): string {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
  return url
}

interface PfpEntry {
  url: string
  ts: number
}

interface PfpState {
  cache: Map<string, PfpEntry>
  loadingWallets: Set<string>
  fetchPfp: (wallet: string) => Promise<string | null>
  getPfp: (wallet: string | undefined) => string | null
  isLoading: (wallet: string | undefined) => boolean
}

export const usePfpStore = create<PfpState>((set, get) => ({
  cache: new Map(),
  loadingWallets: new Set(),

  getPfp: (wallet) => {
    if (!wallet) return null
    const key = wallet.toLowerCase()
    const entry = get().cache.get(key)
    if (!entry || Date.now() - entry.ts > PFP_CACHE_TTL_MS) return null
    return entry.url
  },

  isLoading: (wallet) => {
    if (!wallet) return false
    return get().loadingWallets.has(wallet.toLowerCase())
  },

  fetchPfp: async (wallet) => {
    if (!wallet) return null
    const key = wallet.toLowerCase()
    const { cache, loadingWallets } = get()

    const entry = cache.get(key)
    if (entry && Date.now() - entry.ts <= PFP_CACHE_TTL_MS) {
      return entry.url
    }

    if (loadingWallets.has(key)) {
      return null
    }

    set((s) => ({
      loadingWallets: new Set(s.loadingWallets).add(key),
    }))

    try {
      const walletParam = wallet.startsWith('0x') ? wallet : `0x${wallet}`
      const res = await fetch(`/api/pfp?wallet=${encodeURIComponent(walletParam)}`)
      if (!res.ok) return null

      const data: PfpApiResponse = await res.json()
      if (!data?.items?.length) return null

      const first = data.items[0]
      const imageUrl =
        first.image_url ||
        first.metadata?.image_url ||
        first.metadata?.image ||
        first.media_url
      if (!imageUrl) return null

      const url = toIpfsGateway(imageUrl)
      set((s) => {
        const newCache = new Map(s.cache)
        newCache.set(key, { url, ts: Date.now() })
        const newLoading = new Set(s.loadingWallets)
        newLoading.delete(key)
        return { cache: newCache, loadingWallets: newLoading }
      })
      return url
    } catch {
      set((s) => {
        const newLoading = new Set(s.loadingWallets)
        newLoading.delete(key)
        return { loadingWallets: newLoading }
      })
      return null
    }
  },
}))
