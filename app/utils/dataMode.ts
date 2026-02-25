/**
 * Data Mode Configuration
 * Controls how data is fetched and displayed
 *
 * Modes:
 * - production: Real data from API, requires login
 * - observation: Data from a specific wallet address (from env), login optional
 * - preview: Mock data for development, login optional
 *
 * Observation + connect: When user connects while in observation mode,
 * we still show the observation wallet's data (not the connected wallet).
 * This ensures devs can test UI with a known wallet while logged in.
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
 * Whether we can show data without requiring wallet connection.
 * In observation/preview mode, data is shown for a fixed wallet or mock data.
 */
export function getCanShowData(isConnected: boolean): boolean {
  const mode = getDataMode()
  return isConnected || mode === 'observation' || mode === 'preview'
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
  }
  
  return walletAddress
}

/**
 * Normalize linkedWallet from API: backend may return string "null" to mean empty
 */
export function normalizeLinkedWallet(v: string | undefined | null): string {
  if (v === undefined || v === null) return ''
  const s = typeof v === 'string' ? v.trim() : ''
  return s === 'null' ? '' : s
}
