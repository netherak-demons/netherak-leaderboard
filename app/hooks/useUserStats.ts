import { useEffect, useState } from 'react'
import { calculateEvilPoints } from '../utils/evilPoints'
import { shouldUseMockData, getEffectiveWallet, getDataMode } from '../utils/dataMode'
import {
  mockDungeonsLeaderboard,
  mockEnemiesLeaderboard,
  mockSoulsLeaderboard,
  mockWavesLeaderboard,
} from './mockData'
import { getCachedPlayers, setCachedPlayers } from './playersCache'

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
    username?: string
    linkedWallet?: string
    extraPoints?: number
  }
    stats: {
    enemiesKilled?: EnemiesKilled
    dungeonsCompleted?: DungeonsCompleted
    skillsUsed?: Record<string, number>
    wavesCompleted?: number | Record<string, number>
  }
}

interface SeasonStatsResponse {
  seasonId: string
  lastEvaluatedKey: string | null
  seasonStats: PlayerSeasonStats[]
}

export interface UserStats {
  wallet: string
  username: string
  linkedWallet?: string
  dungeonsCompleted: number
  slayedHumans: number
  harvestedSouls: number
  wavesCompleted: number
  evilPoints: number
  ranking: {
    dungeons: number | null
    slayedHumans: number | null
    harvestedSouls: number | null
    waves: number | null
  }
}

function sumObjectValues(obj?: Record<string, number>): number {
  if (!obj) return 0
  return Object.values(obj).reduce((sum, v) => sum + v, 0)
}

function getHarvestedSouls(stats?: PlayerSeasonStats['stats']): number {
  return stats?.skillsUsed?.DrainSoul ?? 0
}

function getWavesCompleted(stats?: PlayerSeasonStats['stats']): number {
  const w = stats?.wavesCompleted
  if (typeof w === 'number') return w
  if (w && typeof w === 'object') return sumObjectValues(w as Record<string, number>)
  return 0
}

const REFRESH_EVENT = 'netherak:refreshUser'

export function useUserStats(
  walletAddress: string | undefined, 
  seasonId: string = '0',
  allPlayersData?: PlayerSeasonStats[] | null // Optional: reuse data from useSeasonStats, null = wait for it, undefined = fetch yourself
) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [hasNoData, setHasNoData] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const handler = () => setRefreshTrigger((n) => n + 1)
    if (typeof window !== 'undefined') {
      window.addEventListener(REFRESH_EVENT, handler)
      return () => window.removeEventListener(REFRESH_EVENT, handler)
    }
  }, [])

  useEffect(() => {
    async function load() {
      // Get effective wallet (may be overridden in observation mode)
      const effectiveWallet = getEffectiveWallet(walletAddress)
      
      if (!effectiveWallet && !USE_MOCK_DATA) {
        setLoading(false)
        setUserStats(null)
        setHasNoData(false)
        return
      }

      // If allPlayersData is null, it means we're waiting for shared data from useSeasonStats
      // (null is explicitly passed when leaderboard is loading)
      // undefined means no shared data is expected (e.g., on account page)
      if (allPlayersData === null) {
        // Wait for shared data - don't fetch yet
        if (isDev) console.log(`⏳ [${DATA_MODE.toUpperCase()}] useUserStats: Waiting for shared data from useSeasonStats...`)
        // Keep loading state true while waiting
        return
      }

      // If allPlayersData is undefined and we're not in mock mode, 
      // it means we're on a page that doesn't share data (like account page)
      // So we should fetch ourselves
      
      setLoading(true)
      setError(null)
      setHasNoData(false)

      // Use mock data in preview mode
      if (USE_MOCK_DATA) {
        if (isDev) console.log(`🔧 [${DATA_MODE.toUpperCase()}] Using mock user stats`)
        
        // Find user in mock data (use first entry as example)
        const mockUser = mockDungeonsLeaderboard[0]
        if (mockUser) {
          setTimeout(() => {
            setUserStats({
              wallet: effectiveWallet || mockUser.address,
              username: mockUser.username,
              dungeonsCompleted: mockDungeonsLeaderboard.find(e => e.address === mockUser.address)?.score || 0,
              slayedHumans: mockEnemiesLeaderboard.find(e => e.address === mockUser.address)?.score || 0,
              harvestedSouls: mockSoulsLeaderboard.find(e => e.address === mockUser.address)?.score || 0,
              wavesCompleted: mockWavesLeaderboard.find(e => e.address === mockUser.address)?.score || 0,
              evilPoints: mockUser.evilPoints,
              ranking: {
                dungeons: mockDungeonsLeaderboard.findIndex(e => e.address === mockUser.address) + 1 || null,
                slayedHumans: mockEnemiesLeaderboard.findIndex(e => e.address === mockUser.address) + 1 || null,
                harvestedSouls: mockSoulsLeaderboard.findIndex(e => e.address === mockUser.address) + 1 || null,
                waves: mockWavesLeaderboard.findIndex(e => e.address === mockUser.address) + 1 || null,
              },
            })
            setLoading(false)
          }, 500)
          return
        }
      }

      try {
        if (isDev) {
          if (DATA_MODE === 'observation') {
            console.log(`👁️ [OBSERVATION] Fetching user stats for wallet: ${effectiveWallet}`)
          } else {
            console.log(`🚀 [PRODUCTION] Fetching user stats for wallet: ${effectiveWallet}`)
          }
        }

        let players: PlayerSeasonStats[] = []

        // Reuse data from useSeasonStats if provided (avoids duplicate API calls)
        if (allPlayersData && Array.isArray(allPlayersData) && allPlayersData.length > 0) {
          if (isDev) console.log(`♻️ [${DATA_MODE.toUpperCase()}] useUserStats: REUSING data from useSeasonStats (${allPlayersData.length} players) - NO API CALL`)
          players = allPlayersData
        } else if (allPlayersData === undefined) {
          // Check cache first
          const cached = getCachedPlayers(seasonId)
          if (cached && cached.length > 0) {
            if (isDev) console.log(`♻️ [${DATA_MODE.toUpperCase()}] useUserStats: Using cached data (${cached.length} players)`)
            players = cached
          } else {
            // Fetch from API
            if (isDev) console.log(`📡 [${DATA_MODE.toUpperCase()}] useUserStats: Fetching from API...`)
            let lastKey: string | null = null
            let requestCount = 0
            do {
              requestCount++
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
            setCachedPlayers(seasonId, players)
            if (isDev) console.log(`✅ [${DATA_MODE.toUpperCase()}] useUserStats: Fetched ${players.length} players (${requestCount} API call${requestCount > 1 ? 's' : ''})`)
          }
        }

        // Find the user's data
        const normalizedAddress = (effectiveWallet || walletAddress || '').toLowerCase()
        const userData = players.find(p => p.wallet.toLowerCase() === normalizedAddress)

        if (!userData) {
          setHasNoData(true)
          setUserStats(null)
          setLoading(false)
          return
        }

        // Calculate user's stats
        const dungeonsCompleted = sumObjectValues(userData.stats?.dungeonsCompleted)
        const slayedHumans = sumObjectValues(userData.stats?.enemiesKilled)
        const harvestedSouls = getHarvestedSouls(userData.stats)
        const wavesCompleted = getWavesCompleted(userData.stats)

        // Calculate evil points (include profile.extraPoints from backoffice)
        const pfpCount = 0
        const extraPoints = userData.profile?.extraPoints ?? 0
        const evilPointsCalc = calculateEvilPoints(userData.stats || {}, pfpCount, extraPoints)

        // Calculate rankings
        const allDungeons = players
          .map(p => ({ wallet: p.wallet, score: sumObjectValues(p.stats?.dungeonsCompleted) }))
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)

        const allSlayedHumans = players
          .map(p => ({ wallet: p.wallet, score: sumObjectValues(p.stats?.enemiesKilled) }))
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)

        const allHarvestedSouls = players
          .map(p => ({ wallet: p.wallet, score: getHarvestedSouls(p.stats) }))
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)

        const allWaves = players
          .map(p => ({ wallet: p.wallet, score: getWavesCompleted(p.stats) }))
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)

        const dungeonsRank = allDungeons.findIndex(p => p.wallet.toLowerCase() === normalizedAddress) + 1 || null
        const slayedHumansRank = allSlayedHumans.findIndex(p => p.wallet.toLowerCase() === normalizedAddress) + 1 || null
        const harvestedSoulsRank = allHarvestedSouls.findIndex(p => p.wallet.toLowerCase() === normalizedAddress) + 1 || null
        const wavesRank = allWaves.findIndex(p => p.wallet.toLowerCase() === normalizedAddress) + 1 || null

        setUserStats({
          wallet: userData.wallet,
          username: userData.username || userData.profile?.username || 'Unknown',
          linkedWallet: userData.profile?.linkedWallet ?? undefined,
          dungeonsCompleted,
          slayedHumans,
          harvestedSouls,
          wavesCompleted,
          evilPoints: evilPointsCalc.totalPoints,
          ranking: {
            dungeons: dungeonsRank || null,
            slayedHumans: slayedHumansRank || null,
            harvestedSouls: harvestedSoulsRank || null,
            waves: wavesRank || null,
          },
        })
      } catch (err) {
        if (isDev) console.error(`❌ [${DATA_MODE.toUpperCase()}] Error loading user stats:`, err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [walletAddress, seasonId, allPlayersData, refreshTrigger])

  return {
    userStats,
    loading,
    error,
    hasNoData,
  }
}
