'use client'

import { useEffect } from 'react'
import { usePfpStore } from '../stores/usePfpStore'

/**
 * Returns PFP URL for the wallet. Data is fetched by DataLoader.
 * Components can call this for reactive updates from the store.
 */
export function useUserPfp(walletAddress: string | undefined): {
  pfpUrl: string | null
  loading: boolean
} {
  const getPfp = usePfpStore((s) => s.getPfp)
  const isLoading = usePfpStore((s) => s.isLoading)
  const fetchPfp = usePfpStore((s) => s.fetchPfp)

  const pfpUrl = getPfp(walletAddress)
  const loading = isLoading(walletAddress)

  useEffect(() => {
    if (walletAddress) {
      fetchPfp(walletAddress)
    }
  }, [walletAddress, fetchPfp])

  return {
    pfpUrl: pfpUrl ?? null,
    loading,
  }
}
