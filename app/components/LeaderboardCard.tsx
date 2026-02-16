'use client'

import React from 'react'
import { CircleCheck } from 'lucide-react'

interface LeaderboardEntry {
  ranking: number
  demon: string
  avatar: string
  score: number
  address?: string
  tokenId?: string
  username?: string
  evilPoints: number
  rewards: boolean
}

interface LeaderboardCardProps {
  title: string
  icon: string
  subtitle: string
  scoreLabel: string
  entries: LeaderboardEntry[]
  userAddress?: string
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  title,
  icon,
  scoreLabel,
  entries,
  userAddress
}) => {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isCurrentUser = (entryAddress?: string) => {
    if (!userAddress || !entryAddress) return false
    return userAddress.toLowerCase() === entryAddress.toLowerCase()
  }

  return (
    <div
      className="relative rounded-xl w-full min-w-0 mt-12 md:mt-8 p-6 md:p-5 sm:p-4"
      style={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
      }}
    >
      <img
        src={icon}
        alt={title}
        className="absolute -top-8 md:-top-16 sm:-top-6 left-1/2 -translate-x-1/2 w-16 h-16 md:w-22 md:h-22 sm:w-10 sm:h-10 brightness-[1.3] contrast-[1.2] z-10"
      />
      <div className="pb-4 border-b-2 border-[#242424] text-center">
        <h2
          className="text-base font-medium m-0 tracking-[4px] md:tracking-[3px] sm:tracking-[1px] uppercase text-primary"
          style={{ fontFamily: 'var(--font-zachar-scratched)' }}
        >
          {title}
        </h2>
      </div>

      <div className="pt-4">
        {/* Column headers: Demon, Stats, Evil, Rewards */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(70px,auto)_minmax(90px,auto)_minmax(50px,auto)] gap-x-4 py-3 px-4 border-b-2 border-[#242424]">
          <span
            className="text-base font-light tracking-[1.5px] md:tracking-[0.5px] sm:tracking-[0.2px] uppercase md:whitespace-normal sm:whitespace-normal text-secondary"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            Demon
          </span>
          <span
            className="text-base font-light tracking-[1.5px] md:tracking-[0.5px] sm:tracking-[0.2px] uppercase text-center md:whitespace-normal sm:whitespace-normal text-secondary"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            {scoreLabel}
          </span>
          <span
            className="text-base font-light tracking-[1.5px] md:tracking-[0.5px] sm:tracking-[0.2px] uppercase text-center md:whitespace-normal sm:whitespace-normal text-secondary"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            Evil
          </span>
          <span
            className="text-base font-light tracking-[1.5px] md:tracking-[0.5px] sm:tracking-[0.2px] uppercase text-center md:whitespace-normal sm:whitespace-normal text-secondary"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            Rewards
          </span>
        </div>

        <div className="max-h-[500px] md:max-h-[400px] sm:max-h-[350px] overflow-y-auto overflow-x-hidden">
          {entries.map((entry) => {
            const isUser = isCurrentUser(entry.address)
            return (
              <div
                key={`${entry.address}-${entry.ranking}`}
                className={`grid grid-cols-[minmax(0,1fr)_minmax(70px,auto)_minmax(90px,auto)_minmax(50px,auto)] gap-x-4 py-4 px-4 border-b border-[#242424] items-center transition-all duration-200 ${
                  isUser
                    ? 'bg-[rgba(131,233,150,0.15)] border border-green-netherak border-l-[3px] border-l-green-netherak shadow-[0_0_15px_rgba(131,233,150,0.3)] hover:bg-[rgba(131,233,150,0.2)] hover:translate-x-[3px]'
                    : 'hover:bg-[rgba(131,233,150,0.1)] hover:translate-x-[2px]'
                } last:border-b-0 last:rounded-b-xl`}
              >
                {/* Demon column: number + avatar + name */}
                <div className="flex items-center gap-3 md:gap-2.5 sm:gap-1.5 min-w-0">
                  <span
                    className={`text-sm font-bold shrink-0 ${
                      isUser ? 'text-green-netherak drop-shadow-[0_0_8px_rgba(131,233,150,0.5)]' : 'text-white'
                    }`}
                    style={{ fontFamily: 'var(--font-harmonique)' }}
                  >
                    {entry.ranking}
                  </span>
                  <img
                    src={entry.avatar}
                    alt={entry.demon}
                    className="w-10 h-10 md:w-8 md:h-8 sm:w-6.5 sm:h-6.5 rounded-full shrink-0 bg-[#2a2a2a] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                    style={{
                      border: '0.25px solid #FD9D83',
                    }}
                  />
                  <span
                    className={`text-sm font-semibold md:overflow-hidden md:text-ellipsis md:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis sm:whitespace-nowrap lowercase ${
                      isUser ? 'text-green-netherak drop-shadow-[0_0_8px_rgba(131,233,150,0.5)] font-bold' : 'text-primary'
                    }`}
                    style={{ fontFamily: 'var(--font-zachar-scratched)' }}
                  >
                    {entry.username || (entry.address ? shortenAddress(entry.address) : entry.demon)}
                  </span>
                </div>
                {/* Stats column */}
                <span
                  className="text-sm font-bold text-center text-white"
                  style={{ fontFamily: 'var(--font-harmonique)' }}
                >
                  {entry.score.toLocaleString()}
                </span>
                {/* Evil column: logo + number */}
                <div className="flex items-center justify-center gap-1.5">
                  <img
                    src="/evil-point-logo.svg"
                    alt="Evil points"
                    className="w-5 h-6 shrink-0"
                  />
                  <span
                    className="text-sm font-bold text-white"
                    style={{ fontFamily: 'var(--font-harmonique)' }}
                  >
                    {entry.evilPoints.toLocaleString()}
                  </span>
                </div>
                {/* Rewards column */}
                <div className="flex justify-center">
                  {entry.rewards ? (
                    <CircleCheck
                      className="w-5 h-5 shrink-0 text-white"
                      strokeWidth={2.5}
                    />
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardCard
