/**
 * Multiplier configuration
 * - Imuran Book: x2 (+1)
 * - PFP NFT: x1.5 (+0.5)
 * - None: x1
 * - Both stack: x2.5
 */
export function getMultiplier(hasImuranBook: boolean, hasPfp: boolean): number {
  let multiplier = 1
  if (hasImuranBook) multiplier += 1
  if (hasPfp) multiplier += 0.5
  return multiplier
}
