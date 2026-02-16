'use client'

import React from 'react'
import LeaderboardCard from './LeaderboardCard'
import { useSeasonStats } from '../hooks/useSeasonStats'
import { useAccount } from 'wagmi'

const Leaderboard: React.FC = () => {
  const {
    dungeonsLeaderboard,
    slayedHumansLeaderboard,
    harvestedSoulsLeaderboard,
    wavesLeaderboard,
    loading,
    error,
  } = useSeasonStats('0')
  const { address } = useAccount()

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden flex justify-center items-center">
        <div className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "url('/background.svg')", zIndex: 0 }}></div>
        <div className="relative z-10 flex gap-12 justify-center items-center w-full max-w-[1200px] mx-auto p-8">
          <div className="text-primary text-center text-xl" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Loading leaderboards...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden flex justify-center items-center">
        <div className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "url('/background.svg')", zIndex: 0 }}></div>
        <div className="relative z-10 flex gap-12 justify-center items-center w-full max-w-[1200px] mx-auto p-8">
          <div className="text-[#FF8C8A] text-center text-xl" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Error loading leaderboards: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex justify-center items-center">
      <div className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "url('/background.svg')", zIndex: 0 }}></div>
      <div className="relative z-10 w-full max-w-[1200px] mx-auto p-8 md:p-4 sm:p-2 md:pt-20 sm:pt-20 box-border">
        <div className="grid grid-cols-2 gap-12 md:gap-8 sm:gap-4">
          <LeaderboardCard
            title="DUNGEONS COMPLETED"
            icon="/dungeons.svg"
            subtitle=""
            scoreLabel="Stats"
            entries={dungeonsLeaderboard}
            userAddress={address}
          />

          <LeaderboardCard
            title="SLAYED HUMANS"
            icon="/enemies.svg"
            subtitle=""
            scoreLabel="Stats"
            entries={slayedHumansLeaderboard}
            userAddress={address}
          />

          <LeaderboardCard
            title="HARVESTED SOULS"
            icon="/harvested.svg"
            subtitle=""
            scoreLabel="Stats"
            entries={harvestedSoulsLeaderboard}
            userAddress={address}
          />

          <LeaderboardCard
            title="WAVES COMPLETED"
            icon="/dungeons.svg"
            subtitle=""
            scoreLabel="Stats"
            entries={wavesLeaderboard}
            userAddress={address}
          />
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
