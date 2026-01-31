import { useEffect, useState } from 'react'
import { calculateEvilPoints } from '../utils/evilPoints'
import { mockDungeonsLeaderboard, mockEnemiesLeaderboard } from './mockData'

const API_URL = '/api/season-stats'

// Control mock data usage:
// - NEXT_PUBLIC_USE_MOCK_DATA=true: Always use mock data
// - NEXT_PUBLIC_USE_MOCK_DATA=false: Always use API (default in production)
// - Not set: Use API, but fallback to mock on errors (default behavior)
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
const NODE_ENV = process.env.NODE_ENV || 'development'
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
}

function sumObjectValues(obj?: Record<string, number>): number {
  if (!obj) return 0
  return Object.values(obj).reduce((sum, v) => sum + v, 0)
}

export function useSeasonStats(seasonId: string = '0') {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dungeonsLeaderboard, setDungeonsLeaderboard] = useState<LeaderboardEntry[]>([])
  const [enemiesLeaderboard, setEnemiesLeaderboard] = useState<LeaderboardEntry[]>([])
  const [evilPointsLeaderboard, setEvilPointsLeaderboard] = useState<LeaderboardEntry[]>([])
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
          setEnemiesLeaderboard(mockEnemiesLeaderboard)
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
              setEnemiesLeaderboard(mockEnemiesLeaderboard)
              setTotalPlayers(20)
              setLoading(false)
              setError(null) // No mostrar error cuando se usa mock data
              return
            }
            throw new Error(`API error: ${response.status}`)
          }

          const data: SeasonStatsResponse = await response.json()
          players.push(...data.seasonStats)
          lastKey = data.lastEvaluatedKey
        } while (lastKey)

        setTotalPlayers(players.length)

        setDungeonsLeaderboard(
          players
            .map(p => ({
              ranking: 0,
              demon: p.username || p.profile?.username || 'Unknown',
              avatar: '/demons/avatar1.svg',
              score: sumObjectValues(p.stats?.dungeonsCompleted),
              address: p.wallet,
              username: p.username || p.profile?.username || 'Unknown',
            }))
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((p, i) => ({ ...p, ranking: i + 1 }))
        )

        setEnemiesLeaderboard(
          players
            .map(p => ({
              ranking: 0,
              demon: p.username || p.profile?.username || 'Unknown',
              avatar: '/demons/avatar2.svg',
              score: sumObjectValues(p.stats?.enemiesKilled),
              address: p.wallet,
              username: p.username || p.profile?.username || 'Unknown',
            }))
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((p, i) => ({ ...p, ranking: i + 1 }))
        )

        // Process for Evil Points leaderboard
        setEvilPointsLeaderboard(
          players
            .map(p => {
              // TODO: Get actual pfpCount from PFP system when feature/pfp-system is merged
              // TODO: Get extraPoints from backoffice endpoint when implemented
              const pfpCount = 0
              const extraPoints = 0

              const evilPointsCalc = calculateEvilPoints(
                p.stats || {},
                pfpCount,
                extraPoints
              )

              return {
                ranking: 0,
                demon: p.username || p.profile?.username || 'Unknown',
                avatar: '/demons/avatar1.svg',
                score: evilPointsCalc.totalPoints,
                address: p.wallet,
                username: p.username || p.profile?.username || 'Unknown',
              }
            })
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((p, i) => ({ ...p, ranking: i + 1 }))
        )
      } catch (err) {
        // Fall back to mock data on any error (unless FORCE_API is true)
        if (!FORCE_API) {
          console.warn('⚠️ API error, falling back to mock data:', err)
          setDungeonsLeaderboard(mockDungeonsLeaderboard)
          setEnemiesLeaderboard(mockEnemiesLeaderboard)
          setTotalPlayers(20)
          setError(null) // No mostrar error cuando se usa mock data
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
    enemiesLeaderboard,
    evilPointsLeaderboard,
    loading,
    error,
    totalPlayers,
  }
}
