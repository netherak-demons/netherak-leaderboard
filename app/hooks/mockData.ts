/**
 * Mock data for development when API rate limits are hit
 */

// Define locally to avoid circular dependency with useSeasonStats
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

// Helper to convert mock data to LeaderboardEntry format
function toLeaderboardEntry(
  entry: {
    ranking: number
    demon: string
    avatar: string
    score: number
    address: string
    username?: string
  },
  evilPoints: number,
  rewards: boolean
): LeaderboardEntry {
  return {
    ranking: entry.ranking,
    demon: entry.demon,
    avatar: entry.avatar,
    score: entry.score,
    address: entry.address,
    username: entry.username || entry.demon,
    evilPoints,
    rewards,
  }
}

// Evil points and rewards per address (consistent across leaderboards)
const evilPointsByAddress: Record<string, number> = {
  '0x1234567890123456789012345678901234567890': 512,
  '0x2345678901234567890123456789012345678901': 467,
  '0x3456789012345678901234567890123456789012': 431,
  '0x4567890123456789012345678901234567890123': 398,
  '0x5678901234567890123456789012345678901234': 379,
  '0x6789012345678901234567890123456789012345': 364,
  '0x7890123456789012345678901234567890123456': 354,
  '0x8901234567890123456789012345678901234567': 339,
  '0x9012345678901234567890123456789012345678': 328,
  '0x0123456789012345678901234567890123456789': 317,
}

const rewardsByAddress: Record<string, boolean> = {
  '0x1234567890123456789012345678901234567890': true,
  '0x2345678901234567890123456789012345678901': true,
  '0x3456789012345678901234567890123456789012': false,
  '0x4567890123456789012345678901234567890123': true,
  '0x5678901234567890123456789012345678901234': false,
  '0x6789012345678901234567890123456789012345': true,
  '0x7890123456789012345678901234567890123456': false,
  '0x8901234567890123456789012345678901234567': true,
  '0x9012345678901234567890123456789012345678': false,
  '0x0123456789012345678901234567890123456789': true,
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

// Harvested souls (DrainSoul skill usage)
const mockSoulsData = [
  { ranking: 1, demon: 'SoulEater', avatar: '/demons/avatar1.svg', score: 892, address: '0x7890123456789012345678901234567890123456', username: 'SoulEater' },
  { ranking: 2, demon: 'BloodReaper', avatar: '/demons/avatar2.svg', score: 756, address: '0x6789012345678901234567890123456789012345', username: 'BloodReaper' },
  { ranking: 3, demon: 'DemonLord', avatar: '/demons/avatar1.svg', score: 654, address: '0x1234567890123456789012345678901234567890', username: 'DemonLord' },
  { ranking: 4, demon: 'DeathKnight', avatar: '/demons/avatar2.svg', score: 543, address: '0x0123456789012345678901234567890123456789', username: 'DeathKnight' },
  { ranking: 5, demon: 'ShadowKnight', avatar: '/demons/avatar2.svg', score: 432, address: '0x2345678901234567890123456789012345678901', username: 'ShadowKnight' },
  { ranking: 6, demon: 'FireDemon', avatar: '/demons/avatar1.svg', score: 398, address: '0x3456789012345678901234567890123456789012', username: 'FireDemon' },
  { ranking: 7, demon: 'ChaosBeast', avatar: '/demons/avatar1.svg', score: 287, address: '0x9012345678901234567890123456789012345678', username: 'ChaosBeast' },
  { ranking: 8, demon: 'IceWraith', avatar: '/demons/avatar2.svg', score: 234, address: '0x4567890123456789012345678901234567890123', username: 'IceWraith' },
  { ranking: 9, demon: 'DarkMage', avatar: '/demons/avatar1.svg', score: 198, address: '0x5678901234567890123456789012345678901234', username: 'DarkMage' },
  { ranking: 10, demon: 'VoidWalker', avatar: '/demons/avatar2.svg', score: 156, address: '0x8901234567890123456789012345678901234567', username: 'VoidWalker' },
]

// Waves completed
const mockWavesData = [
  { ranking: 1, demon: 'DemonLord', avatar: '/demons/avatar1.svg', score: 128, address: '0x1234567890123456789012345678901234567890', username: 'DemonLord' },
  { ranking: 2, demon: 'ShadowKnight', avatar: '/demons/avatar2.svg', score: 112, address: '0x2345678901234567890123456789012345678901', username: 'ShadowKnight' },
  { ranking: 3, demon: 'FireDemon', avatar: '/demons/avatar1.svg', score: 98, address: '0x3456789012345678901234567890123456789012', username: 'FireDemon' },
  { ranking: 4, demon: 'IceWraith', avatar: '/demons/avatar2.svg', score: 87, address: '0x4567890123456789012345678901234567890123', username: 'IceWraith' },
  { ranking: 5, demon: 'BloodReaper', avatar: '/demons/avatar2.svg', score: 76, address: '0x6789012345678901234567890123456789012345', username: 'BloodReaper' },
  { ranking: 6, demon: 'DarkMage', avatar: '/demons/avatar1.svg', score: 65, address: '0x5678901234567890123456789012345678901234', username: 'DarkMage' },
  { ranking: 7, demon: 'SoulEater', avatar: '/demons/avatar1.svg', score: 54, address: '0x7890123456789012345678901234567890123456', username: 'SoulEater' },
  { ranking: 8, demon: 'VoidWalker', avatar: '/demons/avatar2.svg', score: 43, address: '0x8901234567890123456789012345678901234567', username: 'VoidWalker' },
  { ranking: 9, demon: 'ChaosBeast', avatar: '/demons/avatar1.svg', score: 32, address: '0x9012345678901234567890123456789012345678', username: 'ChaosBeast' },
  { ranking: 10, demon: 'DeathKnight', avatar: '/demons/avatar2.svg', score: 21, address: '0x0123456789012345678901234567890123456789', username: 'DeathKnight' },
]

export const mockDungeonsLeaderboard: LeaderboardEntry[] = mockDungeonsData.map(e =>
  toLeaderboardEntry(e, evilPointsByAddress[e.address] ?? 0, rewardsByAddress[e.address] ?? false)
)
export const mockEnemiesLeaderboard: LeaderboardEntry[] = mockEnemiesData.map(e =>
  toLeaderboardEntry(e, evilPointsByAddress[e.address] ?? 0, rewardsByAddress[e.address] ?? false)
)
export const mockSoulsLeaderboard: LeaderboardEntry[] = mockSoulsData.map(e =>
  toLeaderboardEntry(e, evilPointsByAddress[e.address] ?? 0, rewardsByAddress[e.address] ?? false)
)
export const mockWavesLeaderboard: LeaderboardEntry[] = mockWavesData.map(e =>
  toLeaderboardEntry(e, evilPointsByAddress[e.address] ?? 0, rewardsByAddress[e.address] ?? false)
)
