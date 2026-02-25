'use client'

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
  const showObservationLabel =
    dataMode === 'observation' && !isConnected

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
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row flex-wrap gap-6 md:gap-8 justify-start w-full">
            <ProfileInfo />
            <Achievements />
            <Rewards />
            <CursedItems />
          </div>
        </div>
      </UserStatsProvider>
    </ErrorBoundary>
  )
}
