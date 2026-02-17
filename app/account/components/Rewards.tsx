'use client'

import React, { useState } from 'react'
import RewardCard from './RewardCard'

const REWARDS_DATA = {
  history: [
    { id: 1, questName: 'The Soul of Jane', amount: 12 },
    { id: 2, questName: 'First Steps', amount: 8 },
    { id: 3, questName: 'Demon Awakening', amount: 25 },
  ],
  claimables: [
    { id: 4, questName: 'Wave Master', amount: 15 },
    { id: 5, questName: 'Soul Collector', amount: 20 },
  ],
}

export default function Rewards() {
  const [activeTab, setActiveTab] = useState<'history' | 'claimables'>('history')
  const displayed = activeTab === 'history' ? REWARDS_DATA.history : REWARDS_DATA.claimables

  return (
    <div
      className="flex flex-col gap-5 w-[350px] shrink-0 rounded-xl p-6 h-fit"
      style={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        border: '0.5px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <h3
        className="text-white text-base font-medium uppercase tracking-wider font-zachar"
      >
        Rewards
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
          onClick={() => setActiveTab('history')}
          className={`text-base font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'history' ? 'text-primary' : 'text-secondary hover:text-primary'
          }`}
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('claimables')}
          className={`text-base font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'claimables' ? 'text-primary' : 'text-secondary hover:text-primary'
          }`}
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          Claimables
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {displayed.map((r) => (
          <RewardCard key={r.id} questName={r.questName} amount={r.amount} />
        ))}
      </div>
    </div>
  )
}
