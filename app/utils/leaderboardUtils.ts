/**
 * Single-pass leaderboard and ranking computation.
 * Avoids multiple iterations over the players array.
 */

import { calculateEvilPoints } from './evilPoints'
import { normalizeLinkedWallet } from './dataMode'

export interface PlayerSeasonStats {
  wallet: string
  username: string
  profile?: {
    username?: string
    linkedWallet?: string
    LINKEDWALLET?: string
    extraPoints?: number
  }
  stats?: {
    enemiesKilled?: Record<string, number>
    dungeonsCompleted?: Record<string, number>
    skillsUsed?: Record<string, number>
    wavesCompleted?: number | Record<string, number>
  }
}

export interface LeaderboardEntry {
  ranking: number
  demon: string
  avatar: string
  score: number
  address: string
  username: string
  evilPoints: number
  baseEvilPoints: number
  extraEvilPoints: number
  rewards: boolean
}

export interface Leaderboards {
  evilPoints: LeaderboardEntry[]
  dungeons: LeaderboardEntry[]
  slayedHumans: LeaderboardEntry[]
  harvestedSouls: LeaderboardEntry[]
  waves: LeaderboardEntry[]
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
  baseEvilPoints: number
  extraEvilPoints: number
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

function toEntry(
  p: PlayerSeasonStats,
  score: number,
  index: number,
  evilPoints: number,
  baseEvilPoints: number,
  extraEvilPoints: number
): LeaderboardEntry {
  return {
    ranking: index + 1,
    demon: p.username || p.profile?.username || 'Unknown',
    avatar: '/demons/avatar1.svg',
    score,
    address: p.wallet,
    username: p.username || p.profile?.username || 'Unknown',
    evilPoints,
    baseEvilPoints,
    extraEvilPoints,
    rewards: false,
  }
}

/**
 * Single pass: compute all scores per player, then build leaderboards and rankings.
 */
export function computeLeaderboardsAndRankings(
  players: PlayerSeasonStats[],
  targetWallet?: string
): {
  leaderboards: Leaderboards
  userStats: UserStats | null
  rankingMaps: {
    dungeons: Map<string, number>
    slayedHumans: Map<string, number>
    harvestedSouls: Map<string, number>
    waves: Map<string, number>
  }
} {
  const normalizedTarget = targetWallet?.toLowerCase()

  // Single pass: compute all scores per player (base points, no multiplier)
  type PlayerScores = {
    p: PlayerSeasonStats
    evilPoints: number
    baseEvilPoints: number
    extraEvilPoints: number
    dungeons: number
    slayedHumans: number
    harvestedSouls: number
    waves: number
  }

  const playerMap = new Map<string, { evilPoints: number; rewards: boolean }>()
  const scored: PlayerScores[] = []

  for (const p of players) {
    const extraPoints = p.profile?.extraPoints ?? 0
    const evilPointsCalc = calculateEvilPoints(p.stats || {}, 0, extraPoints)
    const baseEvilPoints = evilPointsCalc.basePoints
    const extraEvilPoints = evilPointsCalc.extraPoints
    const evilPoints = evilPointsCalc.totalPoints

    playerMap.set(p.wallet, {
      evilPoints,
      rewards: false,
    })

    const dungeons = sumObjectValues(p.stats?.dungeonsCompleted)
    const slayedHumans = sumObjectValues(p.stats?.enemiesKilled)
    const souls = getHarvestedSouls(p.stats)
    const waves = getWavesCompleted(p.stats)

    scored.push({
      p,
      evilPoints,
      baseEvilPoints,
      extraEvilPoints,
      dungeons,
      slayedHumans,
      harvestedSouls: souls,
      waves,
    })
  }

  // Build sorted arrays for rankings (single sort each)
  const byEvil = [...scored].filter((x) => x.evilPoints > 0).sort((a, b) => b.evilPoints - a.evilPoints)
  const byDungeons = [...scored].filter((x) => x.dungeons > 0).sort((a, b) => b.dungeons - a.dungeons)
  const bySlayed = [...scored].filter((x) => x.slayedHumans > 0).sort((a, b) => b.slayedHumans - a.slayedHumans)
  const bySouls = [...scored].filter((x) => x.harvestedSouls > 0).sort((a, b) => b.harvestedSouls - a.harvestedSouls)
  const byWaves = [...scored].filter((x) => x.waves > 0).sort((a, b) => b.waves - a.waves)

  // Build ranking maps (wallet -> rank)
  const rankingMaps = {
    dungeons: new Map<string, number>(),
    slayedHumans: new Map<string, number>(),
    harvestedSouls: new Map<string, number>(),
    waves: new Map<string, number>(),
  }
  byDungeons.forEach((s, i) => rankingMaps.dungeons.set(s.p.wallet.toLowerCase(), i + 1))
  bySlayed.forEach((s, i) => rankingMaps.slayedHumans.set(s.p.wallet.toLowerCase(), i + 1))
  bySouls.forEach((s, i) => rankingMaps.harvestedSouls.set(s.p.wallet.toLowerCase(), i + 1))
  byWaves.forEach((s, i) => rankingMaps.waves.set(s.p.wallet.toLowerCase(), i + 1))

  // Build leaderboard entries (all players, no cap - API already limited)
  const leaderboards: Leaderboards = {
    evilPoints: byEvil.map((s, i) =>
      toEntry(s.p, s.evilPoints, i, s.evilPoints, s.baseEvilPoints, s.extraEvilPoints)
    ),
    dungeons: byDungeons.map((s, i) =>
      toEntry(s.p, s.dungeons, i, s.evilPoints, s.baseEvilPoints, s.extraEvilPoints)
    ),
    slayedHumans: bySlayed.map((s, i) =>
      toEntry(s.p, s.slayedHumans, i, s.evilPoints, s.baseEvilPoints, s.extraEvilPoints)
    ),
    harvestedSouls: bySouls.map((s, i) =>
      toEntry(s.p, s.harvestedSouls, i, s.evilPoints, s.baseEvilPoints, s.extraEvilPoints)
    ),
    waves: byWaves.map((s, i) =>
      toEntry(s.p, s.waves, i, s.evilPoints, s.baseEvilPoints, s.extraEvilPoints)
    ),
  }

  // User stats for target wallet (match by main wallet OR linked wallet)
  let userStats: UserStats | null = null
  if (normalizedTarget) {
    const userData = scored.find((s) => {
      const main = s.p.wallet.toLowerCase()
      const rawLinked = s.p.profile?.linkedWallet ?? s.p.profile?.LINKEDWALLET
      const linked = normalizeLinkedWallet(rawLinked).toLowerCase()
      return main === normalizedTarget || (linked && linked === normalizedTarget)
    })
    if (userData) {
      const rawLinked = userData.p.profile?.linkedWallet ?? userData.p.profile?.LINKEDWALLET
      const linkedWallet = normalizeLinkedWallet(rawLinked) || undefined
      const mainWalletKey = userData.p.wallet.toLowerCase()
      userStats = {
        wallet: userData.p.wallet,
        username: userData.p.username || userData.p.profile?.username || 'Unknown',
        linkedWallet,
        dungeonsCompleted: userData.dungeons,
        slayedHumans: userData.slayedHumans,
        harvestedSouls: userData.harvestedSouls,
        wavesCompleted: userData.waves,
        evilPoints: userData.evilPoints,
        baseEvilPoints: userData.baseEvilPoints,
        extraEvilPoints: userData.extraEvilPoints,
        ranking: {
          dungeons: rankingMaps.dungeons.get(mainWalletKey) ?? null,
          slayedHumans: rankingMaps.slayedHumans.get(mainWalletKey) ?? null,
          harvestedSouls: rankingMaps.harvestedSouls.get(mainWalletKey) ?? null,
          waves: rankingMaps.waves.get(mainWalletKey) ?? null,
        },
      }
    }
  }

  return { leaderboards, userStats, rankingMaps }
}
