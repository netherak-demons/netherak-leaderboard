'use client'

import React from 'react'
import { CircleCheck } from 'lucide-react'

export default function Rewards() {
  const rewards = [
    { id: 1, name: 'Season 1 Badge', claimed: true },
    { id: 2, name: 'Evil Points Bonus', claimed: true },
    { id: 3, name: 'Demon Crow WL', claimed: false },
  ]

  return (
    <div
      className="flex flex-col gap-4 w-full max-w-[280px] shrink-0 rounded-xl p-6"
      style={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        border: '0.5px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <h3
        className="text-white text-base font-medium uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-harmonique)' }}
      >
        Rewards
      </h3>
      <div className="flex flex-col gap-2">
        {rewards.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between p-3 rounded-lg border border-[#242424] bg-[#1a1a1a]"
          >
            <span
              className="text-sm text-white"
              style={{ fontFamily: 'var(--font-zachar)' }}
            >
              {r.name}
            </span>
            {r.claimed ? (
              <CircleCheck className="w-5 h-5 text-green-netherak shrink-0" strokeWidth={2.5} />
            ) : (
              <span className="text-white text-xs">Pending</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
