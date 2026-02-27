/**
 * Simple in-memory cache for season players data.
 * Shared between useSeasonStats and useUserStats to avoid duplicate fetches.
 *
 * TTL: 30 seconds. Balances freshness (leaderboard updates) with API load.
 * Adjust if leaderboard updates more/less frequently in production.
 */

import type { PlayerSeasonStats } from '../utils/leaderboardUtils'

const CACHE_TTL_MS = 30_000 // 30 seconds

interface CacheEntry {
  seasonId: string
  players: PlayerSeasonStats[]
  ts: number
}

let cache: CacheEntry | null = null

export function getCachedPlayers(seasonId: string): PlayerSeasonStats[] | null {
  if (!cache || cache.seasonId !== seasonId) return null
  if (Date.now() - cache.ts > CACHE_TTL_MS) return null
  return cache.players
}

export function setCachedPlayers(seasonId: string, players: PlayerSeasonStats[]) {
  cache = { seasonId, players, ts: Date.now() }
}

/** Clear cache so components refetch fresh data (e.g. after profile PUT) */
export function clearCachedPlayers() {
  cache = null
}
