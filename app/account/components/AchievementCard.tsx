'use client'

import React from 'react'
import Image from 'next/image'

const LUMINOUS_GREEN = '#83E996'

interface AchievementCardProps {
  title: string
  description: string
  progress: number
  target: number
  reward?: number
  iconUrl?: string
  /** Label under progress bar (e.g. "Humans Slayed") */
  progressLabel?: string
}

function AchievementIcon({ iconUrl }: { iconUrl?: string }) {
  const size = 112
  if (!iconUrl) return <div className="shrink-0 rounded-lg bg-white/10" style={{ width: size, height: size }} />

  return (
    <div className="relative shrink-0 overflow-hidden rounded-lg" style={{ width: size, height: size }}>
      <Image
        src={iconUrl}
        alt=""
        width={size}
        height={size}
        className="w-full h-full object-cover"
      />
    </div>
  )
}

export default function AchievementCard({
  title,
  description,
  progress,
  target,
  reward,
  iconUrl,
  progressLabel,
}: AchievementCardProps) {
  const completed = progress >= target
  const percent = Math.min(100, target > 0 ? (progress / target) * 100 : 0)

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl w-full text-white text-base"
    >
      {/* Left: Achievement icon */}
      <AchievementIcon iconUrl={iconUrl} />

      {/* Center: Title, description, progress */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <h4
          className="font-medium uppercase tracking-wider truncate font-zachar"
        >
          {title}
        </h4>
        <p
          className="text-sm"
          style={{
            fontFamily: 'var(--font-harmonique)',
            opacity: 0.9,
          }}
        >
          {description}
        </p>

        {/* Progress bar */}
        <div className="flex flex-col gap-2.5 mt-0.5">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                backgroundColor: LUMINOUS_GREEN,
                boxShadow: completed ? `0 0 8px ${LUMINOUS_GREEN}` : 'none',
              }}
            />
          </div>
          <div className="flex justify-between items-baseline text-[14px]">
            <span
              className="font-medium uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-harmonique)',
                color: completed ? LUMINOUS_GREEN : 'rgba(234, 227, 211, 0.6)',
              }}
            >
              {progressLabel ?? (completed ? 'COMPLETED' : 'IN PROGRESS')}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-harmonique)',
                color: completed ? LUMINOUS_GREEN : '#EAE3D3',
              }}
            >
              {progress} / {target}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Divider + Reward (optional) */}
      {(reward != null && reward > 0) && (
        <div className="flex items-center gap-3 shrink-0 pl-2">
          <div
            className="w-px h-12 shrink-0"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          />
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-netherak/5"
            style={{
              boxShadow: completed ? `0 0 12px rgba(131, 233, 150, 0.2)` : 'none',
            }}
          >
            <img src="/evil.svg" alt="Evil points" className="w-5 h-6 shrink-0" />
            <span
              className="font-medium"
              style={{
                fontFamily: 'var(--font-zachar-scratched)',
                color: LUMINOUS_GREEN,
              }}
            >
              {reward}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
