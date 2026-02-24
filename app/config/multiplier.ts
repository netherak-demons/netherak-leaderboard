/**
 * Multiplier configuration
 * - Imuran Book: x3
 * - PFP NFT: x2
 * - None: x1
 * - Both stack: x3 + x2 = x5
 */
export function getMultiplier(hasImuranBook: boolean, hasPfp: boolean): number {
  let multiplier = 1
  if (hasImuranBook) multiplier += 2
  if (hasPfp) multiplier += 1.5
  return multiplier
}
