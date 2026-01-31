/**
 * Mock data for development when API rate limits are hit
 */

// Define locally to avoid circular dependency with useSeasonStats
interface LeaderboardEntry {
  ranking: number
  demon: string
  avatar: string
  score: number
  address: string
  username: string
}

// Helper to convert mock data to LeaderboardEntry format
function toLeaderboardEntry(entry: {
  ranking: number
  demon: string
  avatar: string
  score: number
  address: string
  username?: string
}): LeaderboardEntry {
  return {
    ranking: entry.ranking,
    demon: entry.demon,
    avatar: entry.avatar,
    score: entry.score,
    address: entry.address,
    username: entry.username || entry.demon,
  }
}

const mockDungeonsData = [
  { ranking: 1, demon: 'DemonLord', avatar: '/demons/avatar1.svg', score: 245, address: '0x1234567890123456789012345678901234567890', username: 'DemonLord' },
  { ranking: 2, demon: 'ShadowKnight', avatar: '/demons/avatar2.svg', score: 198, address: '0x2345678901234567890123456789012345678901', username: 'ShadowKnight' },
  { ranking: 3, demon: 'FireDemon', avatar: '/demons/avatar1.svg', score: 187, address: '0x3456789012345678901234567890123456789012', username: 'FireDemon' },
  { ranking: 4, demon: 'IceWraith', avatar: '/demons/avatar2.svg', score: 165, address: '0x4567890123456789012345678901234567890123', username: 'IceWraith' },
  { ranking: 5, demon: 'DarkMage', avatar: '/demons/avatar1.svg', score: 152, address: '0x5678901234567890123456789012345678901234', username: 'DarkMage' },
  { ranking: 6, demon: 'BloodReaper', avatar: '/demons/avatar2.svg', score: 143, address: '0x6789012345678901234567890123456789012345', username: 'BloodReaper' },
  { ranking: 7, demon: 'SoulEater', avatar: '/demons/avatar1.svg', score: 138, address: '0x7890123456789012345678901234567890123456', username: 'SoulEater' },
  { ranking: 8, demon: 'VoidWalker', avatar: '/demons/avatar2.svg', score: 129, address: '0x8901234567890123456789012345678901234567', username: 'VoidWalker' },
  { ranking: 9, demon: 'ChaosBeast', avatar: '/demons/avatar1.svg', score: 124, address: '0x9012345678901234567890123456789012345678', username: 'ChaosBeast' },
  { ranking: 10, demon: 'DeathKnight', avatar: '/demons/avatar2.svg', score: 118, address: '0x0123456789012345678901234567890123456789', username: 'DeathKnight' },
]

const mockEnemiesData = [
  { ranking: 1, demon: 'DemonLord', avatar: '/demons/avatar1.svg', score: 3421, address: '0x1234567890123456789012345678901234567890', username: 'DemonLord' },
  { ranking: 2, demon: 'ShadowKnight', avatar: '/demons/avatar2.svg', score: 2987, address: '0x2345678901234567890123456789012345678901', username: 'ShadowKnight' },
  { ranking: 3, demon: 'FireDemon', avatar: '/demons/avatar1.svg', score: 2876, address: '0x3456789012345678901234567890123456789012', username: 'FireDemon' },
  { ranking: 4, demon: 'IceWraith', avatar: '/demons/avatar2.svg', score: 2654, address: '0x4567890123456789012345678901234567890123', username: 'IceWraith' },
  { ranking: 5, demon: 'DarkMage', avatar: '/demons/avatar1.svg', score: 2543, address: '0x5678901234567890123456789012345678901234', username: 'DarkMage' },
  { ranking: 6, demon: 'BloodReaper', avatar: '/demons/avatar2.svg', score: 2432, address: '0x6789012345678901234567890123456789012345', username: 'BloodReaper' },
  { ranking: 7, demon: 'SoulEater', avatar: '/demons/avatar1.svg', score: 2321, address: '0x7890123456789012345678901234567890123456', username: 'SoulEater' },
  { ranking: 8, demon: 'VoidWalker', avatar: '/demons/avatar2.svg', score: 2210, address: '0x8901234567890123456789012345678901234567', username: 'VoidWalker' },
  { ranking: 9, demon: 'ChaosBeast', avatar: '/demons/avatar1.svg', score: 2099, address: '0x9012345678901234567890123456789012345678', username: 'ChaosBeast' },
  { ranking: 10, demon: 'DeathKnight', avatar: '/demons/avatar2.svg', score: 1988, address: '0x0123456789012345678901234567890123456789', username: 'DeathKnight' },
]

// Evil Points mock data (calculated from dungeons + enemies/20 + souls/10)
const mockEvilPointsData = [
  { ranking: 1, demon: 'DemonLord', avatar: '/demons/avatar1.svg', score: 512, address: '0x1234567890123456789012345678901234567890', username: 'DemonLord' },
  { ranking: 2, demon: 'ShadowKnight', avatar: '/demons/avatar2.svg', score: 467, address: '0x2345678901234567890123456789012345678901', username: 'ShadowKnight' },
  { ranking: 3, demon: 'FireDemon', avatar: '/demons/avatar1.svg', score: 431, address: '0x3456789012345678901234567890123456789012', username: 'FireDemon' },
  { ranking: 4, demon: 'IceWraith', avatar: '/demons/avatar2.svg', score: 398, address: '0x4567890123456789012345678901234567890123', username: 'IceWraith' },
  { ranking: 5, demon: 'DarkMage', avatar: '/demons/avatar1.svg', score: 379, address: '0x5678901234567890123456789012345678901234', username: 'DarkMage' },
  { ranking: 6, demon: 'BloodReaper', avatar: '/demons/avatar2.svg', score: 364, address: '0x6789012345678901234567890123456789012345', username: 'BloodReaper' },
  { ranking: 7, demon: 'SoulEater', avatar: '/demons/avatar1.svg', score: 354, address: '0x7890123456789012345678901234567890123456', username: 'SoulEater' },
  { ranking: 8, demon: 'VoidWalker', avatar: '/demons/avatar2.svg', score: 339, address: '0x8901234567890123456789012345678901234567', username: 'VoidWalker' },
  { ranking: 9, demon: 'ChaosBeast', avatar: '/demons/avatar1.svg', score: 328, address: '0x9012345678901234567890123456789012345678', username: 'ChaosBeast' },
  { ranking: 10, demon: 'DeathKnight', avatar: '/demons/avatar2.svg', score: 317, address: '0x0123456789012345678901234567890123456789', username: 'DeathKnight' },
]

export const mockDungeonsLeaderboard: LeaderboardEntry[] = mockDungeonsData.map(toLeaderboardEntry)
export const mockEnemiesLeaderboard: LeaderboardEntry[] = mockEnemiesData.map(toLeaderboardEntry)
export const mockEvilPointsLeaderboard: LeaderboardEntry[] = mockEvilPointsData.map(toLeaderboardEntry)