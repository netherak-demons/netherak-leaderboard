'use client'

import { useAppStore } from '../stores/useAppStore'

export type { LeaderboardEntry } from '../utils/leaderboardUtils'

/**
 * Returns season stats and leaderboards from the global store.
 * Data is fetched by DataLoader when canShowData. No duplicate fetches.
 */
export function useSeasonStats(seasonId: string = '0') {
  const loading = useAppStore((s) => s.loading)
  const error = useAppStore((s) => s.error)
  const evilPointsLeaderboard = useAppStore((s) => s.leaderboards.evilPoints)
  const dungeonsLeaderboard = useAppStore((s) => s.leaderboards.dungeons)
  const slayedHumansLeaderboard = useAppStore((s) => s.leaderboards.slayedHumans)
  const harvestedSoulsLeaderboard = useAppStore((s) => s.leaderboards.harvestedSouls)
  const wavesLeaderboard = useAppStore((s) => s.leaderboards.waves)
  const totalPlayers = useAppStore((s) => s.totalPlayers)
  const allPlayers = useAppStore((s) => s.allPlayers)
  const hasMore = useAppStore((s) => s.hasMore)
  const fetchMoreSeason = useAppStore((s) => s.fetchMoreSeason)

  return {
    evilPointsLeaderboard,
    dungeonsLeaderboard,
    slayedHumansLeaderboard,
    harvestedSoulsLeaderboard,
    wavesLeaderboard,
    loading,
    error,
    totalPlayers,
    allPlayers,
    hasMore,
    loadMore: fetchMoreSeason,
  }
}
