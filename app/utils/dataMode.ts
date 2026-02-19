/**
 * Data Mode Configuration
 * Controls how data is fetched and displayed
 * 
 * Modes:
 * - production: Real data from API
 * - observation: Data from a specific wallet address (from env)
 * - preview: Mock data for development
 */

export type DataMode = 'production' | 'observation' | 'preview'

/**
 * Get the current data mode from environment variables
 */
export function getDataMode(): DataMode {
  const mode = process.env.NEXT_PUBLIC_DATA_MODE?.toLowerCase()
  
  if (mode === 'observation' || mode === 'preview') {
    return mode
  }
  
  // Default to production
  return 'production'
}

/**
 * Get the observation wallet address from environment variables
 * Only used when mode is 'observation'
 */
export function getObservationWallet(): string | undefined {
  return process.env.NEXT_PUBLIC_OBSERVATION_WALLET
}

/**
 * Check if we should use mock data
 */
export function shouldUseMockData(): boolean {
  return getDataMode() === 'preview'
}

/**
 * Get the effective wallet address based on data mode
 * In observation mode, returns the observation wallet
 * Otherwise, returns the provided wallet
 */
export function getEffectiveWallet(walletAddress: string | undefined): string | undefined {
  const mode = getDataMode()
  
  if (mode === 'observation') {
    const observationWallet = getObservationWallet()
    if (observationWallet) {
      return observationWallet
    }
    console.warn('⚠️ Observation mode enabled but NEXT_PUBLIC_OBSERVATION_WALLET not set. Using provided wallet.')
  }
  
  return walletAddress
}
