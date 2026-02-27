'use client'

import { useAppStore, selectUserStats, selectHasNoData } from '../stores/useAppStore'

export type { UserStats } from '../utils/leaderboardUtils'

/**
 * Returns user stats for the effective wallet from the global store.
 * Data is derived from season stats (no duplicate fetch).
 * Pass walletAddress for compatibility; effectiveWallet is set by DataLoader.
 */
export function useUserStats(
  _walletAddress: string | undefined,
  _seasonId: string = '0',
  _allPlayersData?: unknown
) {
  const userStats = useAppStore(selectUserStats)
  const hasNoData = useAppStore(selectHasNoData)
  const loading = useAppStore((s) => s.loading)
  const error = useAppStore((s) => s.error)

  return {
    userStats,
    loading,
    error,
    hasNoData,
  }
}
