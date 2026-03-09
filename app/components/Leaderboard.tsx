'use client'

import React, { useEffect, useMemo } from 'react'
import LeaderboardCard from './LeaderboardCard'
import { useSeasonStats } from '../hooks/useSeasonStats'
import { useUserStats } from '../hooks/useUserStats'
import { useAccount } from 'wagmi'
import { getCanShowData, getEffectiveWallet } from '../utils/dataMode'
import { useImuranBookStore } from '../stores/useImuranBookStore'
import { usePfpStore } from '../stores/usePfpStore'
import { getMultiplier } from '../config/multiplier'

const Leaderboard: React.FC = () => {
  const { address, isConnected } = useAccount()
  const effectiveWallet = getEffectiveWallet(address)
  const canShowData = getCanShowData(isConnected)

  const fetchHasBookForWallets = useImuranBookStore((s) => s.fetchHasBookForWallets)
  const fetchPfp = usePfpStore((s) => s.fetchPfp)

  // Fetch leaderboard data when we can show data
  const {
    evilPointsLeaderboard,
    dungeonsLeaderboard,
    slayedHumansLeaderboard,
    harvestedSoulsLeaderboard,
    wavesLeaderboard,
    loading,
    error,
  } = useSeasonStats(canShowData ? '0' : '')

  const { hasNoData } = useUserStats(effectiveWallet, '0')

  // Single fetch for all unique leaderboard addresses (avoids 5 separate fetches from each LeaderboardCard)
  const allLeaderboardAddresses = useMemo(() => {
    const addrs = new Set<string>()
    for (const entries of [
      evilPointsLeaderboard,
      dungeonsLeaderboard,
      slayedHumansLeaderboard,
      harvestedSoulsLeaderboard,
      wavesLeaderboard,
    ]) {
      for (const e of entries) {
        if (e.address) addrs.add(e.address)
      }
    }
    return [...addrs]
  }, [
    evilPointsLeaderboard,
    dungeonsLeaderboard,
    slayedHumansLeaderboard,
    harvestedSoulsLeaderboard,
    wavesLeaderboard,
  ])
  useEffect(() => {
    if (allLeaderboardAddresses.length > 0) {
      fetchHasBookForWallets(allLeaderboardAddresses)
      allLeaderboardAddresses.forEach((w) => fetchPfp(w))
    }
  }, [allLeaderboardAddresses, fetchHasBookForWallets, fetchPfp])

  const imuranCache = useImuranBookStore((s) => s.cache)
  const getPfp = usePfpStore((s) => s.getPfp)

  // Re-sort evil points leaderboard by multiplied value when we have book/PFP data
  const sortedEvilPointsLeaderboard = useMemo(() => {
    if (evilPointsLeaderboard.length === 0) return []
    const getMultipliedEvil = (e: (typeof evilPointsLeaderboard)[0]) => {
      const base = e.baseEvilPoints ?? e.evilPoints
      const extra = e.extraEvilPoints ?? 0
      const hasBook = imuranCache.get(e.address?.toLowerCase() ?? '')?.hasBook ?? false
      const hasPfp = !!getPfp(e.address)
      const mult = getMultiplier(hasBook, hasPfp)
      return Math.floor(base * mult + extra)
    }
    return [...evilPointsLeaderboard]
      .sort((a, b) => getMultipliedEvil(b) - getMultipliedEvil(a))
      .map((e, i) => ({ ...e, ranking: i + 1 }))
  }, [evilPointsLeaderboard, imuranCache, getPfp])

  // Show all leaderboards with connect message when not connected (unless in observation/preview mode)
  if (!canShowData) {
    const emptyCardProps = { entries: [], userAddress: undefined, showLoginMessage: true }
    return (
      <div className="relative w-full overflow-x-hidden flex justify-center items-center py-12">
        <div className="w-full max-w-[1440px] mx-auto p-8 md:p-4 sm:p-2 box-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 lg:gap-20 w-full">
            <div className="md:col-span-2">
              <LeaderboardCard title="EVIL POINTS" icon="/evil.svg" subtitle="" scoreLabel="EVIL" {...emptyCardProps} />
            </div>
            <LeaderboardCard title="DUNGEONS COMPLETED" icon="/dungeons.svg" subtitle="" scoreLabel="Stats" {...emptyCardProps} />
            <LeaderboardCard title="SLAYED HUMANS" icon="/enemies.svg" subtitle="" scoreLabel="Stats" {...emptyCardProps} />
            <LeaderboardCard title="HARVESTED SOULS" icon="/harvested.svg" subtitle="" scoreLabel="Stats" {...emptyCardProps} />
            <LeaderboardCard title="WAVES COMPLETED" icon="/dungeons.svg" subtitle="" scoreLabel="Stats" {...emptyCardProps} />
          </div>
        </div>
      </div>
    )
  }

  // Show loading skeleton
  if (loading) {
    return (
      <div
        className="relative w-full overflow-x-hidden flex justify-center items-center py-12"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="w-full max-w-[1440px] mx-auto p-8 md:p-4 sm:p-2 box-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 lg:gap-20 w-full">
            <div className="md:col-span-2">
              <LeaderboardCard
                key="evil"
                title=""
                icon=""
                subtitle=""
                scoreLabel=""
                entries={[]}
                userAddress={undefined}
                skeleton={true}
              />
            </div>
            {[2, 3, 4, 5].map((i) => (
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
      <div className="w-full max-w-[1440px] mx-auto p-8 md:p-4 sm:p-2 box-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 lg:gap-20 w-full">
          <div className="md:col-span-2">
            <LeaderboardCard
              title="EVIL POINTS"
              icon="/evil.svg"
              subtitle=""
              scoreLabel="EVIL"
              entries={sortedEvilPointsLeaderboard}
              userAddress={effectiveWallet || address}
              hasNoData={hasNoData}
              error={error}
            />
          </div>

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
