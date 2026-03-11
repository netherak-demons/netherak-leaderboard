'use client'

import { create } from 'zustand'
import { fetchWithRetry } from '../utils/fetchWithRetry'
import { ASSET_CACHE_TTL_MS, uniqueWallets } from '../utils/walletCache'

interface BookEntry {
  hasBook: boolean
  ts: number
}

interface ImuranBookState {
  cache: Map<string, BookEntry>
  loadingWallets: Set<string>
  pending: Map<string, Promise<boolean>>
  fetchHasBook: (wallet: string) => Promise<boolean>
  getHasBook: (wallet: string) => boolean | null
  fetchHasBookForWallets: (wallets: string[]) => Promise<boolean>
  isLoading: (wallets: string[]) => boolean
}

export const useImuranBookStore = create<ImuranBookState>((set, get) => ({
  cache: new Map(),
  loadingWallets: new Set(),
  pending: new Map(),

  getHasBook: (wallet) => {
    const key = wallet.toLowerCase()
    const entry = get().cache.get(key)
    if (!entry || Date.now() - entry.ts > ASSET_CACHE_TTL_MS) return null
    return entry.hasBook
  },

  isLoading: (wallets) => {
    return wallets.some((w) => get().loadingWallets.has(w.toLowerCase()))
  },

  fetchHasBook: async (wallet) => {
    const key = wallet.toLowerCase()
    const { cache, loadingWallets, pending } = get()

    const entry = cache.get(key)
    if (entry && Date.now() - entry.ts <= ASSET_CACHE_TTL_MS) {
      return entry.hasBook
    }

    const existing = pending?.get(key)
    if (existing) return existing

    const doFetch = async (): Promise<boolean> => {
      set((s) => ({
        loadingWallets: new Set(s.loadingWallets).add(key),
      }))

      try {
        const walletParam = wallet.startsWith('0x') ? wallet : `0x${wallet}`
        const res = await fetchWithRetry(`/api/imuran-book?wallet=${encodeURIComponent(walletParam)}`)
        const data = res.ok ? await res.json().catch(() => ({})) : {}
        const hasBook = res.ok && data?.hasBook === true

        set((s) => {
          const newCache = new Map(s.cache)
          newCache.set(key, { hasBook: res.ok ? hasBook : false, ts: Date.now() })
          const newLoading = new Set(s.loadingWallets)
          newLoading.delete(key)
          const newPending = new Map(s.pending)
          newPending.delete(key)
          return { cache: newCache, loadingWallets: newLoading, pending: newPending }
        })
        return hasBook
      } catch {
        set((s) => {
          const newCache = new Map(s.cache)
          newCache.set(key, { hasBook: false, ts: Date.now() })
          const newLoading = new Set(s.loadingWallets)
          newLoading.delete(key)
          const newPending = new Map(s.pending)
          newPending.delete(key)
          return { cache: newCache, loadingWallets: newLoading, pending: newPending }
        })
        return false
      }
    }

    const promise = doFetch()
    set((s) => ({
      pending: new Map(s.pending).set(key, promise),
    }))
    return promise
  },

  fetchHasBookForWallets: async (wallets) => {
    const unique = uniqueWallets(wallets)
    let hasAny = false
    for (const w of unique) {
      const cached = get().getHasBook(w)
      if (cached === true) hasAny = true
      if (cached !== null) continue
      const hasBook = await get().fetchHasBook(w)
      if (hasBook) hasAny = true
    }
    return hasAny
  },
}))
