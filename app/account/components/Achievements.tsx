'use client'

import React, { useState, useMemo } from 'react'
import AchievementCard from './AchievementCard'
import { useAccount } from 'wagmi'
import { useUserStats } from '../../hooks/useUserStats'
import { getDataMode, getEffectiveWallet } from '../../utils/dataMode'

// Achievement definitions
const ACHIEVEMENTS_DEFINITIONS = [
  {
    id: 1,
    title: 'Extinction Warden',
    description: 'Slay 500 Humans',
    target: 500,
    reward: 32,
    getProgress: (stats: { slayedHumans: number }) => stats.slayedHumans,
  },
  {
    id: 2,
    title: 'First Dungeon',
    description: 'Complete your first dungeon',
    target: 1,
    reward: 10,
    getProgress: (stats: { dungeonsCompleted: number }) => stats.dungeonsCompleted,
  },
  {
    id: 3,
    title: 'Soul Collector',
    description: 'Harvest 100 Souls',
    target: 100,
    reward: 25,
    getProgress: (stats: { harvestedSouls: number }) => stats.harvestedSouls,
  },
  {
    id: 4,
    title: 'Demon Lord',
    description: 'Reach wave 50',
    target: 50,
    reward: 50,
    getProgress: (stats: { wavesCompleted: number }) => stats.wavesCompleted,
  },
]

export default function Achievements() {
  const { address, isConnected } = useAccount()
  const dataMode = getDataMode()
  const effectiveWallet = getEffectiveWallet(address)
  // In observation/preview mode, we can show data without wallet connection
  const canShowData = isConnected || dataMode === 'observation' || dataMode === 'preview'
  const { userStats, loading, hasNoData, error } = useUserStats(effectiveWallet)
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing')

  // Calculate achievements from user stats
  const achievements = useMemo(() => {
    if (!userStats) return []

    return ACHIEVEMENTS_DEFINITIONS.map((def) => ({
      ...def,
      progress: def.getProgress({
        slayedHumans: userStats.slayedHumans,
        dungeonsCompleted: userStats.dungeonsCompleted,
        harvestedSouls: userStats.harvestedSouls,
        wavesCompleted: userStats.wavesCompleted,
      }),
    }))
  }, [userStats])

  const ongoing = achievements.filter((a) => a.progress < a.target)
  const completed = achievements.filter((a) => a.progress >= a.target)
  const displayed = activeTab === 'ongoing' ? ongoing : completed

  // Show skeleton when not connected (unless in observation/preview mode)
  if (!canShowData) {
    return (
      <div
        className="flex flex-col gap-5 w-fit min-w-[460px] shrink-0 rounded-xl p-6 h-fit"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h3 className="text-white text-base font-medium uppercase tracking-wider">
          Achievements
        </h3>
        <div className="h-px w-full bg-white/10 rounded-full" />
        <div className="flex items-center justify-center py-8">
          <p className="text-secondary text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            There&apos;s no data to display. Please log in to view achievements.
          </p>
        </div>
      </div>
    )
  }

  // Show loading skeleton
  if (loading) {
    return (
      <div
        className="flex flex-col gap-5 w-fit min-w-[460px] shrink-0 rounded-xl p-6 h-fit animate-pulse"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="h-5 bg-white/10 rounded w-32" />
        <div className="h-px w-full bg-white/10 rounded-full" />
        <div className="flex items-center justify-between w-full gap-6 px-10">
          <div className="h-5 bg-white/10 rounded w-20" />
          <div className="h-5 bg-white/10 rounded w-24" />
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl w-full">
              <div className="w-14 h-14 bg-white/10 rounded-full shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-5 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-2 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
              <div className="w-px h-12 bg-white/10 shrink-0" />
              <div className="w-20 h-12 bg-white/10 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show error message
  if (error) {
    return (
      <div
        className="flex flex-col gap-5 w-fit min-w-[460px] shrink-0 rounded-xl p-6 h-fit"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h3 className="text-white text-base font-medium uppercase tracking-wider">
          Achievements
        </h3>
        <div className="h-px w-full bg-white/10 rounded-full" />
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-[#FF8C8A] text-base mb-2" style={{ fontFamily: 'var(--font-harmonique)' }}>
              We are experiencing some issues
            </p>
            <p className="text-secondary/70 text-sm" style={{ fontFamily: 'var(--font-harmonique)' }}>
              We&apos;ll fix this soon. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show no data message
  if (hasNoData || !userStats) {
    return (
      <div
        className="flex flex-col gap-5 w-fit min-w-[460px] shrink-0 rounded-xl p-6 h-fit"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h3 className="text-white text-base font-medium uppercase tracking-wider">
          Achievements
        </h3>
        <div className="h-px w-full bg-white/10 rounded-full" />
        <div className="flex items-center justify-center py-8">
          <p className="text-secondary text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            No achievements data available for your wallet address
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-5 w-fit min-w-[460px] shrink-0 rounded-xl p-6 h-fit"
      style={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        border: '0.5px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <h3
        className="text-white text-base font-medium uppercase tracking-wider"
      >
        Achievements
      </h3>

      {/* Divider */}
      <div
        className="w-full shrink-0"
        style={{
          height: '0.5px',
          background: 'linear-gradient(90deg, transparent, #796359, #DFB7A4, #796359, transparent)',
        }}
      />

      {/* Tab buttons */}
      <div className="flex items-center justify-between w-full gap-6 px-10">
        <button
          type="button"
          onClick={() => setActiveTab('ongoing')}
          className={`text-base font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'ongoing' ? 'text-primary' : 'text-secondary hover:text-primary'
          }`}
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          Ongoing
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`text-base font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'completed' ? 'text-primary' : 'text-secondary hover:text-primary'
          }`}
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          Completed
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {displayed.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-secondary text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
              {activeTab === 'ongoing' 
                ? 'No ongoing achievements' 
                : 'No completed achievements'}
            </p>
          </div>
        ) : (
          displayed.map((a) => (
            <AchievementCard
              key={a.id}
              title={a.title}
              description={a.description}
              progress={a.progress}
              target={a.target}
              reward={a.reward}
            />
          ))
        )}
      </div>
    </div>
  )
}
