import { useEffect, useState } from 'react'
import { calculateEvilPoints } from '../utils/evilPoints'
import {
  mockDungeonsLeaderboard,
  mockEnemiesLeaderboard,
  mockSoulsLeaderboard,
  mockWavesLeaderboard,
} from './mockData'

const API_URL = '/api/season-stats'

// Control mock data usage:
// - NEXT_PUBLIC_USE_MOCK_DATA=true: Always use mock data
// - NEXT_PUBLIC_USE_MOCK_DATA=false: Always use API (default in production)
// - Not set: Use API, but fallback to mock on errors (default behavior)
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
const FORCE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'false'

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

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      // Use mock data if explicitly enabled
      if (USE_MOCK_DATA) {
        console.log('🔧 Using mock data (NEXT_PUBLIC_USE_MOCK_DATA=true)')
        setTimeout(() => {
          setDungeonsLeaderboard(mockDungeonsLeaderboard)
          setSlayedHumansLeaderboard(mockEnemiesLeaderboard)
          setHarvestedSoulsLeaderboard(mockSoulsLeaderboard)
          setWavesLeaderboard(mockWavesLeaderboard)
          setTotalPlayers(20)
          setLoading(false)
        }, 500) // Simulate loading delay
        return
      }

      try {
        const players: PlayerSeasonStats[] = []
        let lastKey: string | null = null

        do {
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
            // If rate limited or error, fall back to mock data (unless FORCE_API is true)
            if (!FORCE_API && (response.status === 429 || response.status >= 500)) {
              console.warn(`⚠️ API error (${response.status}), falling back to mock data`)
              setDungeonsLeaderboard(mockDungeonsLeaderboard)
              setSlayedHumansLeaderboard(mockEnemiesLeaderboard)
              setHarvestedSoulsLeaderboard(mockSoulsLeaderboard)
              setWavesLeaderboard(mockWavesLeaderboard)
              setTotalPlayers(20)
              setLoading(false)
              setError(null)
              return
            }
            throw new Error(`API error: ${response.status}`)
          }

          const data: SeasonStatsResponse = await response.json()
          players.push(...data.seasonStats)
          lastKey = data.lastEvaluatedKey
        } while (lastKey)

        setTotalPlayers(players.length)

        // Build player map for evil points and rewards (rewards not from API yet)
        const playerMap = new Map<string, { evilPoints: number; rewards: boolean }>()
        for (const p of players) {
          const pfpCount = 0
          const extraPoints = 0
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
        // Fall back to mock data on any error (unless FORCE_API is true)
        if (!FORCE_API) {
          console.warn('⚠️ API error, falling back to mock data:', err)
          setDungeonsLeaderboard(mockDungeonsLeaderboard)
          setSlayedHumansLeaderboard(mockEnemiesLeaderboard)
          setHarvestedSoulsLeaderboard(mockSoulsLeaderboard)
          setWavesLeaderboard(mockWavesLeaderboard)
          setTotalPlayers(20)
          setError(null)
        } else {
          console.error('❌ API error (FORCE_API=true, not using mock):', err)
          setError(err instanceof Error ? err.message : 'Unknown error')
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
  }
}
