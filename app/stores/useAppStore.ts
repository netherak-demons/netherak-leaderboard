'use client'

import { create } from 'zustand'
import type { PlayerSeasonStats } from '../utils/leaderboardUtils'
import type { LeaderboardEntry, Leaderboards, UserStats } from '../utils/leaderboardUtils'
import { computeLeaderboardsAndRankings } from '../utils/leaderboardUtils'
import { getCachedPlayers, setCachedPlayers } from '../hooks/playersCache'
import { shouldUseMockData } from '../utils/dataMode'
import { parseApiError, parseFetchError } from '../utils/apiError'
import {
  mockEvilPointsLeaderboard,
  mockDungeonsLeaderboard,
  mockEnemiesLeaderboard,
  mockSoulsLeaderboard,
  mockWavesLeaderboard,
  getMockPlayers,
} from '../hooks/mockData'

const API_URL = '/api/season-stats'
const REFRESH_EVENT = 'netherak:refreshUser'

interface SeasonStatsResponse {
  seasonId: string
  lastEvaluatedKey: string | null
  seasonStats: PlayerSeasonStats[]
}

interface SeasonState {
  seasonId: string
  allPlayers: PlayerSeasonStats[]
  leaderboards: {
    evilPoints: LeaderboardEntry[]
    dungeons: LeaderboardEntry[]
    slayedHumans: LeaderboardEntry[]
    harvestedSouls: LeaderboardEntry[]
    waves: LeaderboardEntry[]
  }
  totalPlayers: number
  loading: boolean
  error: string | null
}

interface AppState extends SeasonState {
  effectiveWallet: string | undefined
  userStats: UserStats | null
  hasNoData: boolean
  linkedWalletFromApi: string | null
  fetchSeason: (seasonId: string) => Promise<void>
  setEffectiveWallet: (wallet: string | undefined) => void
  setLinkedWalletFromApi: (wallet: string | null) => void
  refresh: () => void
}

function deriveUserStats(allPlayers: PlayerSeasonStats[], effectiveWallet: string | undefined): {
  userStats: UserStats | null
  hasNoData: boolean
} {
  if (!effectiveWallet || allPlayers.length === 0) {
    return { userStats: null, hasNoData: false }
  }
  const { userStats } = computeLeaderboardsAndRankings(allPlayers, effectiveWallet)
  return { userStats, hasNoData: userStats === null }
}

const emptyLeaderboards = {
  evilPoints: [] as LeaderboardEntry[],
  dungeons: [] as LeaderboardEntry[],
  slayedHumans: [] as LeaderboardEntry[],
  harvestedSouls: [] as LeaderboardEntry[],
  waves: [] as LeaderboardEntry[],
}

export const useAppStore = create<AppState>((set, get) => ({
  seasonId: '',
  allPlayers: [],
  leaderboards: emptyLeaderboards,
  totalPlayers: 0,
  loading: true,
  error: null,
  effectiveWallet: undefined,
  userStats: null,
  hasNoData: false,

  setEffectiveWallet: (wallet) =>
    set((state) => {
      const { userStats, hasNoData } = deriveUserStats(state.allPlayers, wallet)
      return { effectiveWallet: wallet, userStats, hasNoData }
    }),

  setLinkedWalletFromApi: (wallet) => set({ linkedWalletFromApi: wallet }),

  refresh: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(REFRESH_EVENT))
    }
  },

  fetchSeason: async (seasonId: string) => {
    if (!seasonId) {
      set({
        seasonId: '',
        allPlayers: [],
        leaderboards: emptyLeaderboards,
        totalPlayers: 0,
        loading: false,
        error: null,
        userStats: null,
        hasNoData: false,
      })
      return
    }

    const cached = getCachedPlayers(seasonId)
    if (cached && cached.length > 0) {
      const { leaderboards } = computeLeaderboardsAndRankings(cached)
      const { userStats, hasNoData } = deriveUserStats(cached, get().effectiveWallet)
      set({
        seasonId,
        allPlayers: cached,
        leaderboards: {
          evilPoints: leaderboards.evilPoints,
          dungeons: leaderboards.dungeons,
          slayedHumans: leaderboards.slayedHumans,
          harvestedSouls: leaderboards.harvestedSouls,
          waves: leaderboards.waves,
        },
        totalPlayers: cached.length,
        loading: false,
        error: null,
        userStats,
        hasNoData,
      })
      return
    }

    if (shouldUseMockData()) {
      const mockPlayers = getMockPlayers() as PlayerSeasonStats[]
      const { userStats, hasNoData } = deriveUserStats(mockPlayers, get().effectiveWallet)
      set({
        seasonId,
        allPlayers: mockPlayers,
        leaderboards: {
          evilPoints: mockEvilPointsLeaderboard,
          dungeons: mockDungeonsLeaderboard,
          slayedHumans: mockEnemiesLeaderboard,
          harvestedSouls: mockSoulsLeaderboard,
          waves: mockWavesLeaderboard,
        },
        totalPlayers: 20,
        loading: false,
        error: null,
        userStats,
        hasNoData,
      })
      return
    }

    set({ loading: true, error: null })

    try {
      const players: PlayerSeasonStats[] = []
      let lastKey: string | null = null

      do {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seasonId,
            limit: 50,
            ...(lastKey ? { lastKey } : {}),
          }),
        })

        if (!res.ok) {
          const msg = await parseApiError(res)
          throw new Error(msg)
        }

        const data: SeasonStatsResponse = await res.json()
        players.push(...data.seasonStats)
        lastKey = data.lastEvaluatedKey
      } while (lastKey)

      setCachedPlayers(seasonId, players)
      const { leaderboards } = computeLeaderboardsAndRankings(players)
      const { userStats, hasNoData } = deriveUserStats(players, get().effectiveWallet)

      set({
        seasonId,
        allPlayers: players,
        leaderboards: {
          evilPoints: leaderboards.evilPoints,
          dungeons: leaderboards.dungeons,
          slayedHumans: leaderboards.slayedHumans,
          harvestedSouls: leaderboards.harvestedSouls,
          waves: leaderboards.waves,
        },
        totalPlayers: players.length,
        loading: false,
        error: null,
        userStats,
        hasNoData,
      })
    } catch (err) {
      if (shouldUseMockData()) {
        const mockPlayers = getMockPlayers() as PlayerSeasonStats[]
        const { userStats, hasNoData } = deriveUserStats(mockPlayers, get().effectiveWallet)
        set({
          seasonId,
          allPlayers: mockPlayers,
          leaderboards: {
            evilPoints: mockEvilPointsLeaderboard,
            dungeons: mockDungeonsLeaderboard,
            slayedHumans: mockEnemiesLeaderboard,
            harvestedSouls: mockSoulsLeaderboard,
            waves: mockWavesLeaderboard,
          },
          totalPlayers: 20,
          loading: false,
          error: null,
          userStats,
          hasNoData,
        })
      } else {
        set({
          loading: false,
          error: parseFetchError(err),
          allPlayers: [],
          leaderboards: emptyLeaderboards,
          totalPlayers: 0,
          userStats: null,
          hasNoData: false,
        })
      }
    }
  },

}))

/** Selector: user stats (stored, stable reference) */
export function selectUserStats(state: AppState): UserStats | null {
  return state.userStats
}

/** Selector: hasNoData (stored) */
export function selectHasNoData(state: AppState): boolean {
  return state.hasNoData
}
