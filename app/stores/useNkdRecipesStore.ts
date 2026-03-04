'use client'

import { create } from 'zustand'
import { fetchWithRetry } from '../utils/fetchWithRetry'
import { ASSET_CACHE_TTL_MS, uniqueWallets } from '../utils/walletCache'

interface RecipesEntry {
  hasRecipes: boolean
  imageUrls: string[]
  ts: number
}

interface NkdRecipesState {
  cache: Map<string, RecipesEntry>
  loadingWallets: Set<string>
  pending: Map<string, Promise<{ hasRecipes: boolean; imageUrls: string[] }>>
  fetchHasRecipes: (wallet: string) => Promise<{ hasRecipes: boolean; imageUrls: string[] }>
  getHasRecipes: (wallet: string) => boolean | null
  getImageUrls: (wallet: string) => string[] | null
  fetchHasRecipesForWallets: (wallets: string[]) => Promise<{ hasRecipes: boolean; imageUrls: string[] }>
  isLoading: (wallets: string[]) => boolean
}

export const useNkdRecipesStore = create<NkdRecipesState>((set, get) => ({
  cache: new Map(),
  loadingWallets: new Set(),
  pending: new Map(),

  getHasRecipes: (wallet) => {
    const key = wallet.toLowerCase()
    const entry = get().cache.get(key)
    if (!entry || Date.now() - entry.ts > ASSET_CACHE_TTL_MS) return null
    return entry.hasRecipes
  },

  getImageUrls: (wallet) => {
    const key = wallet.toLowerCase()
    const entry = get().cache.get(key)
    if (!entry || Date.now() - entry.ts > ASSET_CACHE_TTL_MS) return null
    return entry.imageUrls
  },

  isLoading: (wallets) => {
    return wallets.some((w) => get().loadingWallets.has(w.toLowerCase()))
  },

  fetchHasRecipes: async (wallet) => {
    const key = wallet.toLowerCase()
    const { cache, loadingWallets, pending } = get()

    const entry = cache.get(key)
    if (entry && Date.now() - entry.ts <= ASSET_CACHE_TTL_MS) {
      return { hasRecipes: entry.hasRecipes, imageUrls: entry.imageUrls }
    }

    const existing = pending?.get(key)
    if (existing) return existing

    const doFetch = async (): Promise<{ hasRecipes: boolean; imageUrls: string[] }> => {
      set((s) => ({
        loadingWallets: new Set(s.loadingWallets).add(key),
      }))

      try {
        const walletParam = wallet.startsWith('0x') ? wallet : `0x${wallet}`
        const res = await fetchWithRetry(`/api/nkd-recipes?wallet=${encodeURIComponent(walletParam)}`)
        const data = res.ok ? await res.json().catch(() => ({})) : {}
        const hasRecipes = res.ok && data?.hasRecipes === true
        const imageUrls = res.ok && Array.isArray(data?.imageUrls) ? data.imageUrls : []

        set((s) => {
          const newCache = new Map(s.cache)
          newCache.set(key, { hasRecipes, imageUrls, ts: Date.now() })
          const newLoading = new Set(s.loadingWallets)
          newLoading.delete(key)
          const newPending = new Map(s.pending)
          newPending.delete(key)
          return { cache: newCache, loadingWallets: newLoading, pending: newPending }
        })
        return { hasRecipes, imageUrls }
      } catch {
        set((s) => {
          const newLoading = new Set(s.loadingWallets)
          newLoading.delete(key)
          const newPending = new Map(s.pending)
          newPending.delete(key)
          return { loadingWallets: newLoading, pending: newPending }
        })
        return { hasRecipes: false, imageUrls: [] }
      }
    }

    const promise = doFetch()
    set((s) => ({
      pending: new Map(s.pending).set(key, promise),
    }))
    return promise
  },

  fetchHasRecipesForWallets: async (wallets) => {
    const unique = uniqueWallets(wallets)
    let result: { hasRecipes: boolean; imageUrls: string[] } = { hasRecipes: false, imageUrls: [] }
    for (const w of unique) {
      const cached = get().getHasRecipes(w)
      if (cached === true) result = { hasRecipes: true, imageUrls: get().getImageUrls(w) ?? [] }
      if (cached !== null) continue
      const res = await get().fetchHasRecipes(w)
      if (res.hasRecipes) result = { hasRecipes: true, imageUrls: res.imageUrls }
    }
    return result
  },
}))
