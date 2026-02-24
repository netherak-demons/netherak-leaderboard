'use client'

import { getDataMode, getObservationWallet } from '../utils/dataMode'

export default function ObservationBanner() {
  const dataMode = getDataMode()
  const observationWallet = getObservationWallet()

  if (dataMode !== 'observation') return null

  return (
    <div
      className="w-full py-1.5 px-4 text-center text-xs font-medium bg-amber-500/20 text-amber-400 border-b border-amber-500/30"
      style={{ fontFamily: 'var(--font-harmonique)' }}
    >
      👁️ Observation mode — showing data for{' '}
      {observationWallet
        ? `${observationWallet.slice(0, 6)}...${observationWallet.slice(-4)}`
        : '(wallet not set)'}
    </div>
  )
}
