import { useEffect, useState } from 'react'
import { calculateEvilPoints } from '../utils/evilPoints'
import {
  mockDungeonsLeaderboard,
  mockEnemiesLeaderboard,
  mockSoulsLeaderboard,
  mockWavesLeaderboard,
} from './mockData'
import { shouldUseMockData, getDataMode } from '../utils/dataMode'
import { setCachedPlayers } from './playersCache'

const API_URL = '/api/season-stats'

// Get data mode
const DATA_MODE = getDataMode()
const USE_MOCK_DATA = shouldUseMockData()
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

interface EnemiesKilled {
  [enemyType: string]: number
}

interface DungeonsCompleted {
  [dungeonType: string]: number
}

interface PlayerSeasonStats {
  wallet: string
  username: string
  profile: {
    username: string
    extraPoints?: number
  }
  stats: {
    enemiesKilled?: EnemiesKilled
    dungeonsCompleted?: DungeonsCompleted
    skillsUsed?: Record<string, number>
    wavesCompleted?: number
  }
}

interface SeasonStatsResponse {
  seasonId: string
  lastEvaluatedKey: string | null
  seasonStats: PlayerSeasonStats[]
}

export interface LeaderboardEntry {
  ranking: number
  demon: string
  avatar: string
  score: number
  address: string
  username: string
  evilPoints: number
  rewards: boolean
}

function sumObjectValues(obj?: Record<string, number>): number {
  if (!obj) return 0
  return Object.values(obj).reduce((sum, v) => sum + v, 0)
}

function getHarvestedSouls(stats?: PlayerSeasonStats['stats']): number {
  return stats?.skillsUsed?.DrainSoul ?? 0
}

function getWavesCompleted(stats?: PlayerSeasonStats['stats']): number {
  return stats?.wavesCompleted ?? 0
}

export function useSeasonStats(seasonId: string = '0') {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dungeonsLeaderboard, setDungeonsLeaderboard] = useState<LeaderboardEntry[]>([])
  const [slayedHumansLeaderboard, setSlayedHumansLeaderboard] = useState<LeaderboardEntry[]>([])
  const [harvestedSoulsLeaderboard, setHarvestedSoulsLeaderboard] = useState<LeaderboardEntry[]>([])
  const [wavesLeaderboard, setWavesLeaderboard] = useState<LeaderboardEntry[]>([])
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [allPlayers, setAllPlayers] = useState<PlayerSeasonStats[]>([]) // Expose raw players data

  useEffect(() => {
    async function load() {
      // Don't fetch if seasonId is empty (user not connected)
      if (!seasonId) {
        setLoading(false)
        setDungeonsLeaderboard([])
        setSlayedHumansLeaderboard([])
        setHarvestedSoulsLeaderboard([])
        setWavesLeaderboard([])
        setTotalPlayers(0)
        setAllPlayers([])
        return
      }

      setLoading(true)
      setError(null)

      // Use mock data if in preview mode
      if (USE_MOCK_DATA) {
        if (isDev) console.log(`🔧 [${DATA_MODE.toUpperCase()}] Using mock data`)
        setTimeout(() => {
          setDungeonsLeaderboard(mockDungeonsLeaderboard)
          setSlayedHumansLeaderboard(mockEnemiesLeaderboard)
          setHarvestedSoulsLeaderboard(mockSoulsLeaderboard)
          setWavesLeaderboard(mockWavesLeaderboard)
          setTotalPlayers(20)
          // For mock data, create empty array (useUserStats will use mock data separately)
          setAllPlayers([])
          setLoading(false)
        }, 500) // Simulate loading delay
        return
      }

      if (isDev) {
        if (DATA_MODE === 'observation') {
          console.log(`👁️ [OBSERVATION] Fetching real data from API`)
        } else {
          console.log(`🚀 [PRODUCTION] Fetching real data from API`)
        }
      }

      try {
        const players: PlayerSeasonStats[] = []
        let lastKey: string | null = null
        let requestCount = 0

        do {
          requestCount++
          if (isDev) console.log(`📡 [${DATA_MODE.toUpperCase()}] useSeasonStats: API call #${requestCount}${lastKey ? ` (pagination)` : ''}`)
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              seasonId,
              limit: 50,
              ...(lastKey ? { lastKey } : {}),
            }),
          })

          if (!response.ok) {
            // In production/observation mode, show error (don't fall back to mock)
            throw new Error(`API error: ${response.status}`)
          }

          const data: SeasonStatsResponse = await response.json()
          players.push(...data.seasonStats)
          lastKey = data.lastEvaluatedKey
        } while (lastKey)

        setTotalPlayers(players.length)
        setAllPlayers(players) // Store raw players data for reuse
        setCachedPlayers(seasonId, players) // Populate cache for useUserStats (e.g. when navigating to account page)
        if (isDev) console.log(`✅ [${DATA_MODE.toUpperCase()}] useSeasonStats: Fetched ${players.length} players (${requestCount} API call${requestCount > 1 ? 's' : ''})`)

        // Build player map for evil points and rewards (rewards not from API yet)
        const playerMap = new Map<string, { evilPoints: number; rewards: boolean }>()
        for (const p of players) {
          const pfpCount = 0
          const extraPoints = p.profile?.extraPoints ?? 0
          const evilPointsCalc = calculateEvilPoints(p.stats || {}, pfpCount, extraPoints)
          playerMap.set(p.wallet, {
            evilPoints: evilPointsCalc.totalPoints,
            rewards: false, // TODO: from API when implemented
          })
        }

        const toEntry = (
          p: PlayerSeasonStats,
          score: number,
          index: number
        ): LeaderboardEntry => {
          const { evilPoints, rewards } = playerMap.get(p.wallet) ?? { evilPoints: 0, rewards: false }
          return {
            ranking: index + 1,
            demon: p.username || p.profile?.username || 'Unknown',
            avatar: '/demons/avatar1.svg',
            score,
            address: p.wallet,
            username: p.username || p.profile?.username || 'Unknown',
            evilPoints,
            rewards,
          }
        }

        setDungeonsLeaderboard(
          players
            .map(p => ({ p, score: sumObjectValues(p.stats?.dungeonsCompleted) }))
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(({ p, score }, i) => toEntry(p, score, i))
        )

        setSlayedHumansLeaderboard(
          players
            .map(p => ({ p, score: sumObjectValues(p.stats?.enemiesKilled) }))
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(({ p, score }, i) => toEntry(p, score, i))
        )

        setHarvestedSoulsLeaderboard(
          players
            .map(p => ({ p, score: getHarvestedSouls(p.stats) }))
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(({ p, score }, i) => toEntry(p, score, i))
        )

        setWavesLeaderboard(
          players
            .map(p => ({ p, score: getWavesCompleted(p.stats) }))
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(({ p, score }, i) => toEntry(p, score, i))
        )
      } catch (err) {
        // In preview mode, we shouldn't reach here, but handle it anyway
        if (USE_MOCK_DATA) {
          console.warn('⚠️ Error in preview mode, using mock data as fallback')
          setDungeonsLeaderboard(mockDungeonsLeaderboard)
          setSlayedHumansLeaderboard(mockEnemiesLeaderboard)
          setHarvestedSoulsLeaderboard(mockSoulsLeaderboard)
          setWavesLeaderboard(mockWavesLeaderboard)
          setTotalPlayers(20)
          setError(null)
        } else {
          // In production/observation mode, show error
          if (isDev) console.error(`❌ [${DATA_MODE.toUpperCase()}] API error:`, err)
          setError(err instanceof Error ? err.message : 'Unknown error')
          // Set empty arrays instead of mock data
          setDungeonsLeaderboard([])
          setSlayedHumansLeaderboard([])
          setHarvestedSoulsLeaderboard([])
          setWavesLeaderboard([])
          setTotalPlayers(0)
          setAllPlayers([])
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [seasonId])

  return {
    dungeonsLeaderboard,
    slayedHumansLeaderboard,
    harvestedSoulsLeaderboard,
    wavesLeaderboard,
    loading,
    error,
    totalPlayers,
    allPlayers, // Expose raw players data for reuse in useUserStats
  }
}
