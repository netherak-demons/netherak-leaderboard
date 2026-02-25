/**
 * Shared API response types.
 */

export interface PlayerSeasonStats {
  wallet: string
  username: string
  profile: {
    username?: string
    linkedWallet?: string
    LINKEDWALLET?: string
    extraPoints?: number
  }
  stats: {
    enemiesKilled?: Record<string, number>
    dungeonsCompleted?: Record<string, number>
    skillsUsed?: Record<string, number>
    wavesCompleted?: number | Record<string, number>
  }
}

export interface SeasonStatsResponse {
  seasonId: string
  lastEvaluatedKey: string | null
  seasonStats: PlayerSeasonStats[]
}

export interface PfpApiItem {
  id: string
  image_url?: string | null
  media_url?: string | null
  metadata?: {
    image?: string
    image_url?: string
  }
}

export interface PfpApiResponse {
  items: PfpApiItem[]
  next_page_params?: unknown
}
