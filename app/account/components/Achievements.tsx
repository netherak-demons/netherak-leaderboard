'use client'

import React from 'react'

export default function Achievements() {
  const achievements = [
    { id: 1, name: 'First Dungeon', unlocked: true, icon: '🏆' },
    { id: 2, name: 'Soul Collector', unlocked: true, icon: '👻' },
    { id: 3, name: 'Demon Lord', unlocked: false, icon: '🔥' },
    { id: 4, name: 'Wave Master', unlocked: false, icon: '🌊' },
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
        Achievements
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border ${
              a.unlocked ? 'border-green-netherak bg-[rgba(131,233,150,0.08)]' : 'border-[#242424] bg-[#1a1a1a] opacity-60'
            }`}
          >
            <span className="text-2xl">{a.icon}</span>
            <span
              className="text-xs text-center text-white"
              style={{ fontFamily: 'var(--font-zachar)' }}
            >
              {a.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
