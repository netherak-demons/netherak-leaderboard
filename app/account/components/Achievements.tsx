'use client'

import React, { useState } from 'react'
import AchievementCard from './AchievementCard'

const ACHIEVEMENTS_DATA = [
  {
    id: 1,
    title: 'Extinction Warden',
    description: 'Slay 500 Humans',
    progress: 500,
    target: 500,
    reward: 32,
  },
  {
    id: 2,
    title: 'First Dungeon',
    description: 'Complete your first dungeon',
    progress: 1,
    target: 1,
    reward: 10,
  },
  {
    id: 3,
    title: 'Soul Collector',
    description: 'Harvest 100 Souls',
    progress: 67,
    target: 100,
    reward: 25,
  },
  {
    id: 4,
    title: 'Demon Lord',
    description: 'Reach wave 50',
    progress: 23,
    target: 50,
    reward: 50,
  },
]

export default function Achievements() {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing')

  const ongoing = ACHIEVEMENTS_DATA.filter((a) => a.progress < a.target)
  const completed = ACHIEVEMENTS_DATA.filter((a) => a.progress >= a.target)
  const displayed = activeTab === 'ongoing' ? ongoing : completed

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
        {displayed.map((a) => (
          <AchievementCard
            key={a.id}
            title={a.title}
            description={a.description}
            progress={a.progress}
            target={a.target}
            reward={a.reward}
          />
        ))}
      </div>
    </div>
  )
}
