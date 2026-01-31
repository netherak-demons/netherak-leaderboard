/**
 * Evil Points Calculation System
 * 
 * Calculates Evil Points for players based on their game statistics.
 * Evil Points are the main scoring system that combines multiple gameplay metrics.
 */

interface PlayerStats {
  enemiesKilled?: Record<string, number> // Total enemies killed by type
  dungeonsCompleted?: Record<string, number> // Total dungeons completed by type
  skillsUsed?: Record<string, number> // Skills usage count (includes DrainSoul for souls stolen)
}

interface EvilPointsCalculation {
  basePoints: number // Points before multipliers (enemies + dungeons + souls)
  pointsFromEnemies: number // Points earned from killing enemies
  pointsFromDungeons: number // Points earned from completing dungeons
  pointsFromSouls: number // Points earned from stealing souls
  pfpMultiplier: number // Multiplier based on PFP NFT holdings (1.0, 1.5, 2.0, or 2.5)
  extraPoints: number // Extra points from backoffice/admin system
  totalPoints: number // Final calculated Evil Points
}

/**
 * Sums all values in a record object
 */
function sumObjectValues(obj: Record<string, number> | undefined): number {
  if (!obj) return 0
  return Object.values(obj).reduce((sum, val) => sum + val, 0)
}

/**
 * Calculates Evil Points for a player based on their stats
 * 
 * Scoring Rules:
 * - 1 point per 20 enemies killed
 * - 1 point per dungeon completed
 * - 1 point per 10 souls stolen (using DrainSoul skill usage as proxy)
 * - PFP multiplier: x1.5 (1 PFP), x2.0 (2 PFPs), x2.5 (3+ PFPs)
 * - Extra points from backoffice (added after multiplier)
 * 
 * TODO: Daily/Weekly Bonus
 * - Daily bonus: Players get bonus points for playing each day
 * - Weekly bonus: Players get bonus points for playing multiple days in a week
 * - Implementation requires: lastPlayedAt timestamp from backend
 * - Should be added here: pointsFromDailyBonus and pointsFromWeeklyBonus
 * - Should be added to basePoints calculation before applying multiplier
 * 
 * @param stats Player's game statistics
 * @param pfpCount Number of PFP NFTs owned (0-3+)
 * @param extraPoints Extra points from backoffice/admin system
 * @returns Calculated Evil Points breakdown
 */
export function calculateEvilPoints(
  stats: PlayerStats,
  pfpCount: number = 0,
  extraPoints: number = 0
): EvilPointsCalculation {
  // 1. Points from enemies killed
  // Rule: 1 point per 20 enemies
  const totalEnemies = sumObjectValues(stats.enemiesKilled)
  const pointsFromEnemies = Math.floor(totalEnemies / 20)

  // 2. Points from dungeons completed
  // Rule: 1 point per dungeon completed
  // Filter out "None" entries which are invalid dungeon completions
  const dungeons = stats.dungeonsCompleted || {}
  const validDungeons = Object.entries(dungeons)
    .filter(([key]) => key !== 'None')
    .reduce((sum, [, value]) => sum + value, 0)
  const pointsFromDungeons = validDungeons

  // 3. Points from souls stolen
  // Rule: 1 point per 10 souls stolen
  // Using DrainSoul skill usage as proxy for souls stolen
  // TODO: Replace with actual soulsStolen field when backend adds it
  const drainSoulCount = stats.skillsUsed?.DrainSoul || 0
  const pointsFromSouls = Math.floor(drainSoulCount / 10)

  // Base points calculation (before multipliers)
  // TODO: Add daily/weekly bonus here when implemented:
  // const pointsFromDailyBonus = calculateDailyBonus(lastPlayedAt)
  // const pointsFromWeeklyBonus = calculateWeeklyBonus(playHistory)
  // const basePoints = pointsFromEnemies + pointsFromDungeons + pointsFromSouls + pointsFromDailyBonus + pointsFromWeeklyBonus
  const basePoints = pointsFromEnemies + pointsFromDungeons + pointsFromSouls

  // 4. PFP multiplier
  // Multiplier based on number of PFP NFTs owned
  // Rule: x1.5 (1 PFP), x2.0 (2 PFPs), x2.5 (3+ PFPs)
  // TODO: Get actual PFP count from PFP system when feature/pfp-system is merged
  let pfpMultiplier = 1.0
  if (pfpCount >= 3) {
    pfpMultiplier = 2.5
  } else if (pfpCount === 2) {
    pfpMultiplier = 2.0
  } else if (pfpCount === 1) {
    pfpMultiplier = 1.5
  }

  // 5. Apply multiplier and add extra points
  // Extra points are added after multiplier (from backoffice/admin system)
  const pointsAfterMultiplier = basePoints * pfpMultiplier
  const totalPoints = pointsAfterMultiplier + extraPoints

  return {
    basePoints,
    pointsFromEnemies,
    pointsFromDungeons,
    pointsFromSouls,
    pfpMultiplier,
    extraPoints,
    totalPoints: Math.floor(totalPoints) // Round down to integer
  }
}
