'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import ProfileInfo from './components/ProfileInfo'
import Achievements from './components/Achievements'
import Rewards from './components/Rewards'
import CursedItems from './components/CursedItems'
import { UserStatsProvider } from './context/UserStatsContext'
import { getDataMode } from '../utils/dataMode'
import ErrorBoundary from '../components/ErrorBoundary'

export default function AccountPage() {
  const { isConnected } = useAccount()
  const dataMode = getDataMode()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Defer to client to avoid hydration mismatch: isConnected can differ between server and client
  const showObservationLabel =
    mounted && dataMode === 'observation' && !isConnected

  return (
    <ErrorBoundary>
      <UserStatsProvider>
        <div className="relative min-h-screen w-full overflow-x-hidden px-4 sm:px-8 pb-12">
          {showObservationLabel && (
            <p
              className="text-amber-400/90 text-xs mb-4"
              style={{ fontFamily: 'var(--font-harmonique)' }}
            >
              Viewing observation wallet
            </p>
          )}
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row flex-wrap gap-6 md:gap-8 justify-start w-full">
            <ProfileInfo />
            <Achievements />
            <div className="flex flex-col gap-6 md:gap-8 w-full md:w-auto md:shrink-0">
              <Rewards />
              <CursedItems />
            </div>
          </div>
        </div>
      </UserStatsProvider>
    </ErrorBoundary>
  )
}
