import { useEffect, useState } from 'react'

const API_URL = '/api/season-stats'

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
  const [totalPlayers, setTotalPlayers] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

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
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [seasonId])

  return {
    dungeonsLeaderboard,
    enemiesLeaderboard,
    loading,
    error,
    totalPlayers,
  }
}
