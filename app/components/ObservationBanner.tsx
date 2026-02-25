'use client'

import { getDataMode, getObservationWallet } from '../utils/dataMode'

export default function ObservationBanner() {
  const dataMode = getDataMode()
  const observationWallet = getObservationWallet()

  if (dataMode === 'preview') {
    return (
      <div
        className="w-full py-1.5 px-4 text-center text-xs font-medium bg-blue-500/20 text-blue-400 border-b border-blue-500/30"
        style={{ fontFamily: 'var(--font-harmonique)' }}
      >
        🎭 Preview mode — using mock data
      </div>
    )
  }

  if (dataMode === 'observation') {
    return (
      <div
        className="w-full py-1.5 px-4 text-center text-xs font-medium bg-amber-500/20 text-amber-400 border-b border-amber-500/30"
        style={{ fontFamily: 'var(--font-harmonique)' }}
      >
        {observationWallet ? (
          <>
            👁️ Observation mode — showing data for{' '}
            {observationWallet.slice(0, 6)}...{observationWallet.slice(-4)}
          </>
        ) : (
          <>
            ⚠️ Observation mode — set <code className="bg-amber-500/20 px-1 rounded">NEXT_PUBLIC_OBSERVATION_WALLET</code> in .env.local
          </>
        )}
      </div>
    )
  }

  return null
}
