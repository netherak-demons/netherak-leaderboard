'use client'

import React from 'react'

export default function CursedItems() {
  const items = [
    { id: 1, name: 'Cursed Amulet', power: '+15% Evil', owned: true },
    { id: 2, name: 'Shadow Blade', power: '+10% Souls', owned: false },
    { id: 3, name: 'Demon Horn', power: 'x1.5 Multiplier', owned: false },
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
        Cursed Items
      </h3>
      <div className="flex flex-col gap-2">
        {items.map((i) => (
          <div
            key={i.id}
            className={`p-3 rounded-lg border ${
              i.owned ? 'border-[#FD9D83] bg-[rgba(253,157,131,0.08)]' : 'border-[#242424] bg-[#1a1a1a] opacity-70'
            }`}
          >
            <span
              className="text-sm font-medium text-white block"
              style={{ fontFamily: 'var(--font-zachar)' }}
            >
              {i.name}
            </span>
            <span
              className="text-xs text-white"
              style={{ fontFamily: 'var(--font-harmonique)' }}
            >
              {i.power}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
