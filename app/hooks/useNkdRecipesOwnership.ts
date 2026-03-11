'use client'

import { useMemo } from 'react'
import { useNkdRecipesStore } from '../stores/useNkdRecipesStore'
import { ASSET_CACHE_TTL_MS, uniqueWallets } from '../utils/walletCache'

/**
 * Returns whether any of the given wallets owns NKD Recipes, and image URLs from all owned tokens.
 * Data is fetched only by DataLoader. This hook only reads from the store.
 */
export function useNkdRecipesOwnership(
  walletAddresses: string | undefined | (string | undefined)[]
): {
  hasRecipes: boolean
  imageUrls: string[]
  loading: boolean
} {
  const walletsKey = Array.isArray(walletAddresses)
    ? [...walletAddresses].filter(Boolean).sort().join(',')
    : walletAddresses ?? ''
  const wallets = useMemo(() => {
    if (Array.isArray(walletAddresses)) return uniqueWallets(walletAddresses)
    if (walletAddresses) return uniqueWallets([walletAddresses])
    return []
  }, [walletsKey])

  const cache = useNkdRecipesStore((s) => s.cache)
  const isLoading = useNkdRecipesStore((s) => s.isLoading)

  const getCached = (w: string) => {
    const entry = cache.get(w.toLowerCase())
    if (!entry || Date.now() - entry.ts > ASSET_CACHE_TTL_MS) return null
    return entry
  }
  const allCached = wallets.length > 0 && wallets.every((w) => getCached(w) !== null)
  const hasRecipes = allCached ? wallets.some((w) => getCached(w)?.hasRecipes === true) : false
  const imageUrls = allCached
    ? wallets.reduce<string[]>(
        (acc, w) => (acc.length > 0 ? acc : getCached(w)?.imageUrls ?? []),
        []
      )
    : []
  const loading = wallets.length > 0 && !allCached && isLoading(wallets)

  return {
    hasRecipes,
    imageUrls,
    loading,
  }
}
