/**
 * Multiplier configuration (confirmed values)
 * - Nothing: x1
 * - Book only: x2
 * - PFP only: x1.5
 * - Book + PFP: x3
 */
export function getMultiplier(hasImuranBook: boolean, hasPfp: boolean): number {
  if (hasImuranBook && hasPfp) return 3
  if (hasImuranBook) return 2
  if (hasPfp) return 1.5
  return 1
}
