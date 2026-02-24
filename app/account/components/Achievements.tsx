'use client'

import React, { useState, useMemo } from 'react'
import AchievementCard from './AchievementCard'
import { useUserStatsContext } from '../context/UserStatsContext'
import { ACHIEVEMENT_CONFIG, getCurrentLevel, type AchievementCategory } from '../achievementsConfig'

const CATEGORY_ORDER: AchievementCategory[] = ['monsters', 'dungeons', 'waves', 'souls']

export default function Achievements() {
  const { userStats, loading, hasNoData, error, canShowData } = useUserStatsContext()
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing')

  const stats = useMemo(
    () =>
      userStats
        ? {
            slayedHumans: userStats.slayedHumans,
            dungeonsCompleted: userStats.dungeonsCompleted,
            wavesCompleted: userStats.wavesCompleted,
            harvestedSouls: userStats.harvestedSouls,
          }
        : null,
    [userStats]
  )

  const achievements = useMemo(() => {
    if (!stats) return []

    return CATEGORY_ORDER.map((category) => {
      const config = ACHIEVEMENT_CONFIG[category]
      const progress = config.getProgress(stats)
      const { level, progress: p, target, isCompleted } = getCurrentLevel(category, progress)

      return {
        id: category,
        title: level.title,
        description: level.getDescription(level.target),
        progress: p,
        target,
        isCompleted,
        progressLabel: level.progressLabel,
        iconUrl: level.getIconPath(level.level),
      }
    })
  }, [stats])

  const ongoing = achievements.filter((a) => !a.isCompleted)
  const completed = achievements.filter((a) => a.isCompleted)
  const displayed = activeTab === 'ongoing' ? ongoing : completed

  // Show skeleton when not connected (unless in observation/preview mode)
  if (!canShowData) {
    return (
      <div
        className="flex flex-col gap-5 w-full md:min-w-[460px] md:max-w-[560px] shrink-0 rounded-xl p-4 md:p-6 h-fit"
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
        className="flex flex-col gap-5 w-full md:min-w-[460px] shrink-0 rounded-xl p-4 md:p-6 h-fit animate-pulse"
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
        <div className="flex items-center justify-between w-full gap-4 md:gap-6 px-4 md:px-10">
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
        className="flex flex-col gap-5 w-full md:min-w-[460px] md:max-w-[560px] shrink-0 rounded-xl p-4 md:p-6 h-fit"
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
        className="flex flex-col gap-5 w-full md:min-w-[460px] md:max-w-[560px] shrink-0 rounded-xl p-4 md:p-6 h-fit"
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
      className="flex flex-col gap-5 w-full md:min-w-[460px] md:max-w-[560px] shrink-0 rounded-xl p-4 md:p-6 h-fit"
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
      <div className="flex items-center justify-between w-full gap-4 md:gap-6 px-4 md:px-10">
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
              progressLabel={a.progressLabel}
              iconUrl={a.iconUrl}
            />
          ))
        )}
      </div>
    </div>
  )
}
