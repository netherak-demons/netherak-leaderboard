'use client'

import React from 'react'
import LeaderboardCard from './LeaderboardCard'
import { useSeasonStats } from '../hooks/useSeasonStats'
import { useAccount } from 'wagmi'

const Leaderboard: React.FC = () => {
  const { dungeonsLeaderboard, enemiesLeaderboard, evilPointsLeaderboard, loading, error } = useSeasonStats('0')
  const { address } = useAccount()

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden flex justify-center items-center">
        <div className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10" style={{ backgroundImage: "url('/background.svg')" }}></div>
        <div className="flex gap-12 justify-center items-center w-full max-w-[1200px] mx-auto p-8">
          <div className="text-[#EAE3D3] text-center text-xl" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Loading leaderboards...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden flex justify-center items-center">
        <div className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10" style={{ backgroundImage: "url('/background.svg')" }}></div>
        <div className="flex gap-12 justify-center items-center w-full max-w-[1200px] mx-auto p-8">
          <div className="text-[#FF8C8A] text-center text-xl" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Error loading leaderboards: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex justify-center items-center">
      <div className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10" style={{ backgroundImage: "url('/background.svg')" }}></div>
      <div className="flex gap-12 md:gap-8 sm:gap-4 justify-center items-center w-full max-w-[1200px] mx-auto p-8 md:p-4 sm:p-2 md:pt-20 sm:pt-20 box-border lg:flex-row flex-col">
        <LeaderboardCard
          title="Dungeons Completed"
          icon="/dungeons.svg"
          subtitle="LEADERBOARD"
          scoreLabel="Dungeons Completed"
          entries={dungeonsLeaderboard}
          titleType="dungeons"
          userAddress={address}
        />

        <LeaderboardCard
          title="Enemies' Kills"
          icon="/enemies.svg"
          subtitle="LEADERBOARD"
          scoreLabel="Enemies killed"
          entries={enemiesLeaderboard}
          titleType="enemies"
          userAddress={address}
        />

        <LeaderboardCard
          title="Evil Points"
          icon="/dungeons.svg"
          subtitle="LEADERBOARD"
          scoreLabel="Evil Points"
          entries={evilPointsLeaderboard}
          titleType="evilpoints"
          userAddress={address}
        />
      </div>
    </div>
  )
}

export default Leaderboard