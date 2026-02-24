'use client'

import React from 'react'
import LeaderboardCard from './LeaderboardCard'
import { useSeasonStats } from '../hooks/useSeasonStats'
import { useUserStats } from '../hooks/useUserStats'
import { useAccount } from 'wagmi'
import { getDataMode, getEffectiveWallet } from '../utils/dataMode'

const Leaderboard: React.FC = () => {
  const { address, isConnected } = useAccount()
  const dataMode = getDataMode()
  const effectiveWallet = getEffectiveWallet(address)
  
  // In observation/preview mode, we can show data without wallet connection
  const canShowData = isConnected || dataMode === 'observation' || dataMode === 'preview'
  
  // Fetch leaderboard data when we can show data
  const {
    dungeonsLeaderboard,
    slayedHumansLeaderboard,
    harvestedSoulsLeaderboard,
    wavesLeaderboard,
    loading: leaderboardLoading,
    error,
    allPlayers, // Get raw players data to reuse
  } = useSeasonStats(canShowData ? '0' : '')
  
  // Check if user has data - reuse allPlayers data to avoid duplicate API calls
  // Pass null initially (to signal we want to wait), then pass the array when ready
  const { userStats, loading: userLoading, hasNoData } = useUserStats(
    effectiveWallet, 
    '0',
    leaderboardLoading ? null : (allPlayers.length > 0 ? allPlayers : undefined)
  )
  
  const loading = userLoading || leaderboardLoading

  // Show login message when not connected (unless in observation/preview mode)
  if (!canShowData) {
    return (
      <div className="relative w-full overflow-x-hidden flex justify-center items-center py-12">
        <div className="w-full max-w-[1200px] mx-auto p-8 md:p-4 sm:p-2 box-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 lg:gap-20 w-full">
            {[1, 2, 3, 4].map((i) => (
              <LeaderboardCard
                key={i}
                title=""
                icon=""
                subtitle=""
                scoreLabel=""
                entries={[]}
                userAddress={undefined}
                skeleton={true}
                showLoginMessage={true}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show loading skeleton
  if (loading) {
    return (
      <div className="relative w-full overflow-x-hidden flex justify-center items-center py-12">
        <div className="w-full max-w-[1200px] mx-auto p-8 md:p-4 sm:p-2 box-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 lg:gap-20 w-full">
            {[1, 2, 3, 4].map((i) => (
              <LeaderboardCard
                key={i}
                title=""
                icon=""
                subtitle=""
                scoreLabel=""
                entries={[]}
                userAddress={undefined}
                skeleton={true}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Always show leaderboards when connected (even if there's an error or user has no data)
  return (
    <div className="relative w-full overflow-x-hidden flex justify-center items-center py-12">
      <div className="w-full max-w-[1200px] mx-auto p-8 md:p-4 sm:p-2 box-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 lg:gap-20 w-full">
          <LeaderboardCard
            title="DUNGEONS COMPLETED"
            icon="/dungeons.svg"
            subtitle=""
            scoreLabel="Stats"
            entries={dungeonsLeaderboard}
            userAddress={effectiveWallet || address}
            hasNoData={hasNoData}
            error={error}
          />

          <LeaderboardCard
            title="SLAYED HUMANS"
            icon="/enemies.svg"
            subtitle=""
            scoreLabel="Stats"
            entries={slayedHumansLeaderboard}
            userAddress={effectiveWallet || address}
            hasNoData={hasNoData}
            error={error}
          />

          <LeaderboardCard
            title="HARVESTED SOULS"
            icon="/harvested.svg"
            subtitle=""
            scoreLabel="Stats"
            entries={harvestedSoulsLeaderboard}
            userAddress={effectiveWallet || address}
            hasNoData={hasNoData}
            error={error}
          />

          <LeaderboardCard
            title="WAVES COMPLETED"
            icon="/dungeons.svg"
            subtitle=""
            scoreLabel="Stats"
            entries={wavesLeaderboard}
            userAddress={effectiveWallet || address}
            hasNoData={hasNoData}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
