/**
 * Evil Points Calculation System
 *
 * Calculates Evil Points for players based on their game statistics.
 * Evil Points = (basePoints * multiplier) + extraPoints
 * Multiplier: none x1, book x2, PFP x1.5, both x3 (config/multiplier)
 */

import { getMultiplier } from '../config/multiplier'

interface PlayerStats {
  enemiesKilled?: Record<string, number>
  dungeonsCompleted?: Record<string, number>
  skillsUsed?: Record<string, number>
}

interface EvilPointsCalculation {
  basePoints: number
  extraPoints: number
  totalPoints: number // basePoints * multiplier + extraPoints
}

/**
 * Sums all values in a record object
 */
function sumObjectValues(obj: Record<string, number> | undefined): number {
  if (!obj) return 0
  return Object.values(obj).reduce((sum, val) => sum + val, 0)
}

/**
 * Calculates base Evil Points (before multiplier). Multiplier (book + PFP) is applied at display time.
 * Scoring: 1 pt/20 enemies, 1 pt/dungeon, 1 pt/10 souls. Extra points from backoffice added after multiplier.
 */
export function calculateEvilPoints(
  stats: PlayerStats,
  _pfpCount: number = 0,
  extraPoints: number = 0
): EvilPointsCalculation {
  const totalEnemies = sumObjectValues(stats.enemiesKilled)
  const pointsFromEnemies = Math.floor(totalEnemies / 20)

  const dungeons = stats.dungeonsCompleted || {}
  const validDungeons = Object.entries(dungeons)
    .filter(([key]) => key !== 'None')
    .reduce((sum, [, value]) => sum + value, 0)

  const drainSoulCount = stats.skillsUsed?.DrainSoul || 0
  const pointsFromSouls = Math.floor(drainSoulCount / 10)

  const basePoints = pointsFromEnemies + validDungeons + pointsFromSouls
  const totalPoints = basePoints + extraPoints

  return {
    basePoints,
    extraPoints,
    totalPoints: Math.floor(totalPoints),
  }
}

/**
 * Applies book + PFP multiplier to base evil points for display.
 */
export function applyEvilPointsMultiplier(
  basePoints: number,
  extraPoints: number,
  hasImuranBook: boolean,
  hasPfp: boolean
): number {
  const multiplier = getMultiplier(hasImuranBook, hasPfp)
  return Math.floor(basePoints * multiplier + extraPoints)
}
