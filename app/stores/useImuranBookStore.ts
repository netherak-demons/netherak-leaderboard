'use client'

import { create } from 'zustand'

const IMURAN_BOOK_CACHE_TTL_MS = 5 * 60 * 1000

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

interface BookEntry {
  hasBook: boolean
  ts: number
}

interface ImuranBookState {
  cache: Map<string, BookEntry>
  loadingWallets: Set<string>
  fetchHasBook: (wallet: string) => Promise<boolean>
  getHasBook: (wallet: string) => boolean | null
  fetchHasBookForWallets: (wallets: string[]) => Promise<boolean>
  isLoading: (wallets: string[]) => boolean
}

export const useImuranBookStore = create<ImuranBookState>((set, get) => ({
  cache: new Map(),
  loadingWallets: new Set(),

  getHasBook: (wallet) => {
    const key = wallet.toLowerCase()
    const entry = get().cache.get(key)
    if (!entry || Date.now() - entry.ts > IMURAN_BOOK_CACHE_TTL_MS) return null
    return entry.hasBook
  },

  isLoading: (wallets) => {
    return wallets.some((w) => get().loadingWallets.has(w.toLowerCase()))
  },

  fetchHasBook: async (wallet) => {
    const key = wallet.toLowerCase()
    const { cache, loadingWallets } = get()

    const entry = cache.get(key)
    if (entry && Date.now() - entry.ts <= IMURAN_BOOK_CACHE_TTL_MS) {
      return entry.hasBook
    }

    if (loadingWallets.has(key)) {
      return false
    }

    set((s) => ({
      loadingWallets: new Set(s.loadingWallets).add(key),
    }))

    try {
      const walletParam = wallet.startsWith('0x') ? wallet : `0x${wallet}`
      const res = await fetch(`/api/imuran-book?wallet=${encodeURIComponent(walletParam)}`)
      const data = await res.json()
      const hasBook = res.ok && data?.hasBook === true

      set((s) => {
        const newCache = new Map(s.cache)
        newCache.set(key, { hasBook, ts: Date.now() })
        const newLoading = new Set(s.loadingWallets)
        newLoading.delete(key)
        return { cache: newCache, loadingWallets: newLoading }
      })
      return hasBook
    } catch {
      set((s) => {
        const newLoading = new Set(s.loadingWallets)
        newLoading.delete(key)
        return { loadingWallets: newLoading }
      })
      return false
    }
  },

  fetchHasBookForWallets: async (wallets) => {
    const unique = uniqueWallets(wallets)
    for (const w of unique) {
      const cached = get().getHasBook(w)
      if (cached === true) return true
      if (cached !== null) continue
      const hasBook = await get().fetchHasBook(w)
      if (hasBook) return true
    }
    return false
  },
}))
