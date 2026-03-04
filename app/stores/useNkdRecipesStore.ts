'use client'

import { create } from 'zustand'
import { fetchWithRetry } from '../utils/fetchWithRetry'
import { ASSET_CACHE_TTL_MS, uniqueWallets } from '../utils/walletCache'

interface RecipesEntry {
  hasRecipes: boolean
  imageUrl: string | null
  ts: number
}

interface NkdRecipesState {
  cache: Map<string, RecipesEntry>
  loadingWallets: Set<string>
  pending: Map<string, Promise<{ hasRecipes: boolean; imageUrl: string | null }>>
  fetchHasRecipes: (wallet: string) => Promise<{ hasRecipes: boolean; imageUrl: string | null }>
  getHasRecipes: (wallet: string) => boolean | null
  getImageUrl: (wallet: string) => string | null
  fetchHasRecipesForWallets: (wallets: string[]) => Promise<{ hasRecipes: boolean; imageUrl: string | null }>
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

  getImageUrl: (wallet) => {
    const key = wallet.toLowerCase()
    const entry = get().cache.get(key)
    if (!entry || Date.now() - entry.ts > ASSET_CACHE_TTL_MS) return null
    return entry.imageUrl
  },

  isLoading: (wallets) => {
    return wallets.some((w) => get().loadingWallets.has(w.toLowerCase()))
  },

  fetchHasRecipes: async (wallet) => {
    const key = wallet.toLowerCase()
    const { cache, loadingWallets, pending } = get()

    const entry = cache.get(key)
    if (entry && Date.now() - entry.ts <= ASSET_CACHE_TTL_MS) {
      return { hasRecipes: entry.hasRecipes, imageUrl: entry.imageUrl }
    }

    const existing = pending?.get(key)
    if (existing) return existing

    const doFetch = async (): Promise<{ hasRecipes: boolean; imageUrl: string | null }> => {
      set((s) => ({
        loadingWallets: new Set(s.loadingWallets).add(key),
      }))

      try {
        const walletParam = wallet.startsWith('0x') ? wallet : `0x${wallet}`
        const res = await fetchWithRetry(`/api/nkd-recipes?wallet=${encodeURIComponent(walletParam)}`)
        const data = res.ok ? await res.json().catch(() => ({})) : {}
        const hasRecipes = res.ok && data?.hasRecipes === true
        const imageUrl = res.ok && data?.imageUrl ? data.imageUrl : null

        set((s) => {
          const newCache = new Map(s.cache)
          newCache.set(key, { hasRecipes, imageUrl, ts: Date.now() })
          const newLoading = new Set(s.loadingWallets)
          newLoading.delete(key)
          const newPending = new Map(s.pending)
          newPending.delete(key)
          return { cache: newCache, loadingWallets: newLoading, pending: newPending }
        })
        return { hasRecipes, imageUrl }
      } catch {
        set((s) => {
          const newLoading = new Set(s.loadingWallets)
          newLoading.delete(key)
          const newPending = new Map(s.pending)
          newPending.delete(key)
          return { loadingWallets: newLoading, pending: newPending }
        })
        return { hasRecipes: false, imageUrl: null }
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
    let result: { hasRecipes: boolean; imageUrl: string | null } = { hasRecipes: false, imageUrl: null }
    for (const w of unique) {
      const cached = get().getHasRecipes(w)
      if (cached === true) result = { hasRecipes: true, imageUrl: get().getImageUrl(w) }
      if (cached !== null) continue
      const res = await get().fetchHasRecipes(w)
      if (res.hasRecipes) result = { hasRecipes: true, imageUrl: res.imageUrl }
    }
    return result
  },
}))
