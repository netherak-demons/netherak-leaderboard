'use client'

import React, { useState } from 'react'

export default function MultiplierTooltip({
  children,
  multiplier,
  hasImuranBook,
  hasPfp,
}: {
  children: React.ReactNode
  multiplier: number
  hasImuranBook: boolean
  hasPfp: boolean
}) {
  const [show, setShow] = useState(false)
  const items: string[] = []
  if (hasImuranBook) items.push('Imuran book x2')
  if (hasPfp) items.push('PFP x1.5')
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-100 px-2.5 py-1.5 rounded text-white text-xs pointer-events-none w-fit text-left min-w-28"
          style={{
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            border: '0.5px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            fontFamily: 'var(--font-harmonique)',
          }}
        >
          <div className="flex flex-col gap-0.5">
            {items.map((label) => (
              <div key={label}>{label}</div>
            ))}
            <div style={{ color: '#FFD36C', marginTop: 4 }}>Total x{multiplier}</div>
          </div>
        </div>
      )}
    </span>
  )
}
