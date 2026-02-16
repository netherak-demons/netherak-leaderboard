'use client'

import React from 'react'
import { MapPinCheck } from 'lucide-react'

const GOLDEN_YELLOW = '#F0DD87'
const GREEN_NETHERAK = '#83E996'

interface RewardCardProps {
  questName: string
  amount: number
}

export default function RewardCard({ questName, amount }: RewardCardProps) {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-xl w-full"
    >
      {/* Header: icon + QUEST COMPLETED */}
      <div className="flex items-center gap-2">
        <MapPinCheck
          className="w-5 h-5 shrink-0"
          stroke={GOLDEN_YELLOW}
        />
        <span
          className="font-semibold uppercase tracking-wider"
          style={{
            fontFamily: 'var(--font-harmonique)',
          }}
        >
          Quest completed
        </span>
      </div>

      {/* Message */}
      <p
        style={{ fontFamily: 'var(--font-harmonique)' }}
      >
        You&apos;ve completed &quot;{questName}&quot;.
      </p>

      {/* Reward line */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className=""
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          You earned
        </span>
        <div className="flex items-center gap-1.5">
          <img
            src="/evil-point-logo.svg"
            alt="Evil points"
            className="w-4 h-5 shrink-0"
          />
          <span
            className=" font-medium text-green-netherak"
          >
            {amount}
          </span>
        </div>
      </div>
    </div>
  )
}
