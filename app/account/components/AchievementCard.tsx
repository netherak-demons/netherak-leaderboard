'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import Image from 'next/image'

const LUMINOUS_GREEN = '#83E996'

interface AchievementCardProps {
  title: string
  description: string
  progress: number
  target: number
  reward: number
  iconUrl?: string
}

function AchievementIcon({ iconUrl }: { iconUrl?: string }) {
  const size = 56
  const spikes = 8
  const spikeOuterR = 50
  const spikeInnerR = 42

  const spikePath = Array.from({ length: spikes }, (_, i) => {
    const baseAngle = (i * 360) / spikes - 90
    const outerAngle = (baseAngle * Math.PI) / 180
    const innerAngle = ((baseAngle + 360 / spikes / 2) * Math.PI) / 180
    const nextOuterAngle = ((baseAngle + 360 / spikes) * Math.PI) / 180
    const ox1 = 50 + spikeOuterR * Math.cos(outerAngle)
    const oy1 = 50 + spikeOuterR * Math.sin(outerAngle)
    const ix = 50 + spikeInnerR * Math.cos(innerAngle)
    const iy = 50 + spikeInnerR * Math.sin(innerAngle)
    const ox2 = 50 + spikeOuterR * Math.cos(nextOuterAngle)
    const oy2 = 50 + spikeOuterR * Math.sin(nextOuterAngle)
    return `M ${ox1} ${oy1} L ${ix} ${iy} L ${ox2} ${oy2} Z`
  }).join(' ')

  return (
    <div className="relative shrink-0 w-14 h-14 text-white">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="absolute inset-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="innerBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D2A28" />
            <stop offset="100%" stopColor="#1a1816" />
          </linearGradient>
          <clipPath id="achievementClip">
            <circle cx="50" cy="50" r="36" />
          </clipPath>
        </defs>
        <path
          d={spikePath}
          fill="#4A5568"
          stroke="#5A6578"
          strokeWidth="0.5"
        />
        <g clipPath="url(#achievementClip)">
          <circle cx="50" cy="50" r="36" fill="url(#innerBg)" />
          {!iconUrl && (
            <g transform="translate(50, 50)">
              <path
                d="M-12 -18 L-8 -14 L-8 14 L-12 18 L12 18 L8 14 L8 -14 L12 -18 Z"
                fill="#5C4A42"
                stroke="#796359"
                strokeWidth="0.8"
              />
              <ellipse cx="0" cy="-4" rx="4" ry="5" fill="#3D322C" />
            </g>
          )}
        </g>
      </svg>
      {iconUrl && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ padding: 8 }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2D2A28]">
            <Image
              src={iconUrl}
              alt=""
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
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
}: AchievementCardProps) {
  const completed = progress >= target
  const percent = Math.min(100, (progress / target) * 100)

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl w-full text-white"
    >
      {/* Left: Achievement icon */}
      <AchievementIcon iconUrl={iconUrl} />

      {/* Center: Title, description, progress */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <h4
          className="text-sm font-medium uppercase tracking-wider truncate"
          style={{
            fontFamily: 'var(--font-harmonique)',
          }}
        >
          {title}
        </h4>
        <p
          className="text-xs"
          style={{
            fontFamily: 'var(--font-zachar)',
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
          <div className="flex justify-between items-baseline">
            <span
              className="text-sm font-medium uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-harmonique)',
                color: completed ? LUMINOUS_GREEN : 'rgba(234, 227, 211, 0.6)',
              }}
            >
              {completed ? 'COMPLETED' : 'IN PROGRESS'}
            </span>
            <span
              className="text-sm"
              style={{
                fontFamily: 'var(--font-zachar)',
                color: completed ? LUMINOUS_GREEN : '#EAE3D3',
              }}
            >
              {progress} / {target}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Divider + Reward */}
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
          <img src="/evil-point-logo.svg" alt="Evil points" className="w-5 h-6 shrink-0" />
          <span
            className="text-sm font-medium"
            style={{
              fontFamily: 'var(--font-zachar)',
              color: LUMINOUS_GREEN,
            }}
          >
            {reward}
          </span>
        </div>
      </div>
    </div>
  )
}
