'use client'

import React from 'react'
import { EMPTY_STATE } from '../utils/emptyStateCopy'

interface LeaderboardEntry {
  ranking: number
  demon: string
  avatar: string
  score: number
  address?: string
  tokenId?: string
  username?: string
  evilPoints: number
  baseEvilPoints?: number
  extraEvilPoints?: number
  rewards: boolean
}

interface LeaderboardCardProps {
  title: string
  icon: string
  subtitle: string
  scoreLabel: string
  entries: LeaderboardEntry[]
  userAddress?: string
  skeleton?: boolean
  showLoginMessage?: boolean
  hasNoData?: boolean
  error?: string | null
  canLoadMore?: boolean
  onLoadMore?: () => void
  loadingMore?: boolean
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  title,
  icon,
  scoreLabel,
  entries,
  userAddress,
  skeleton = false,
  showLoginMessage = false,
  hasNoData = false,
  error = null,
  canLoadMore = false,
  onLoadMore,
  loadingMore = false,
}) => {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isCurrentUser = (entryAddress?: string) => {
    if (!userAddress || !entryAddress) return false
    return userAddress.toLowerCase() === entryAddress.toLowerCase()
  }

  // Base evil points only (no book/PFP multiplier on leaderboard)
  const displayEvilPoints = (entry: LeaderboardEntry) =>
    (entry.baseEvilPoints ?? entry.evilPoints) + (entry.extraEvilPoints ?? 0)

  const isEvilLeaderboard = scoreLabel === 'EVIL'

  // Skeleton state
  if (skeleton) {
    return (
      <div
        className="relative rounded-xl w-full min-w-0 mt-12 md:mt-8 p-6 md:p-5 md:pt-10 sm:p-4 animate-pulse"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="absolute -top-8 md:-top-14 sm:-top-6 left-1/2 -translate-x-1/2 w-16 h-16 md:w-22 md:h-22 sm:w-10 sm:h-10 bg-white/10 rounded-full z-10" />
        <div className="pb-4 border-b-2 border-white/5 text-center">
          <div className="h-5 bg-white/10 rounded w-3/4 mx-auto" />
        </div>

        <div className="pt-4 overflow-x-auto">
          <div className={`grid gap-x-4 py-3 px-4 border-b-2 border-white/5 min-w-[340px] ${
            isEvilLeaderboard
              ? 'grid-cols-[minmax(130px,1fr)_minmax(100px,auto)]'
              : 'grid-cols-[minmax(130px,1fr)_minmax(100px,auto)]'
          }`}>
            <div className="h-4 bg-white/10 rounded w-20" />
            <div className="h-4 bg-white/10 rounded w-16 mx-auto" />
          </div>

          <div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className={`grid gap-x-4 py-4 px-4 border-b border-white/5 items-center min-w-[340px] ${
                  isEvilLeaderboard
                    ? 'grid-cols-[minmax(130px,1fr)_minmax(100px,auto)]'
                    : 'grid-cols-[minmax(130px,1fr)_minmax(100px,auto)]'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-2.5 sm:gap-1.5 min-w-0">
                  <div className="w-6 h-4 bg-white/10 rounded shrink-0" />
                  <div className="w-10 h-10 md:w-8 md:h-8 sm:w-6.5 sm:h-6.5 rounded-full bg-white/10 shrink-0" />
                  <div className="h-4 bg-white/10 rounded flex-1 max-w-[120px]" />
                </div>
                <div className="h-4 bg-white/10 rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative rounded-xl w-full min-w-0 mt-12 md:mt-8 p-6 md:p-5 md:pt-10 sm:p-4"
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
        className="absolute -top-8 md:-top-16 sm:-top-6 left-1/2 -translate-x-1/2 w-16 h-16 md:w-28 md:h-28 sm:w-10 sm:h-10 brightness-[1.3] contrast-[1.2] z-10"
      />
      <div className="pb-4 border-b-2 border-white/5 text-center">
        <h2
          className="text-base xl:text-lg font-medium m-0 tracking-[4px] md:tracking-[3px] sm:tracking-[1px] uppercase text-primary"
          style={{ fontFamily: 'var(--font-zachar-scratched)' }}
        >
          {title}
        </h2>
      </div>

      <div className="pt-4 overflow-x-auto">
        {/* Column headers: Demon + Stats or Demon + Evil (no Rewards) */}
        <div
          className={`grid gap-x-4 py-3 px-4 border-b-2 border-white/5 min-w-[340px] ${
            isEvilLeaderboard
              ? 'grid-cols-[minmax(130px,1fr)_minmax(100px,auto)]'
              : 'grid-cols-[minmax(130px,1fr)_minmax(100px,auto)]'
          }`}
        >
          <span
            className="text-base xl:text-lg font-light tracking-[1.5px] md:tracking-[0.5px] sm:tracking-[0.2px] uppercase md:whitespace-normal sm:whitespace-normal text-secondary"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            Demon
          </span>
          <span
            className="text-base xl:text-lg font-light tracking-[1.5px] md:tracking-[0.5px] sm:tracking-[0.2px] uppercase text-center md:whitespace-normal sm:whitespace-normal text-secondary"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            {isEvilLeaderboard ? 'EVIL' : scoreLabel}
          </span>
        </div>

        {/* Scrollable rows container so long leaderboards don't grow the page height */}
        <div className="max-h-[420px] md:max-h-[460px] overflow-y-auto">
          {  showLoginMessage ? (
            <div
              className="py-12 px-4 text-center"
              style={{ fontFamily: 'var(--font-harmonique)' }}
            >
              <p className="text-secondary text-base xl:text-lg mb-2">
                {EMPTY_STATE.connectTitle}
              </p>
              <p className="text-primary/80 text-sm xl:text-base">
                {EMPTY_STATE.connectSubtext}
              </p>
            </div>
          ) : error ? (
            <div
              className="py-12 px-4 text-center"
              style={{ fontFamily: 'var(--font-harmonique)' }}
            >
              <p className="text-[#FF8C8A] text-base xl:text-lg mb-2">
                {EMPTY_STATE.errorTitle}
              </p>
              <p className="text-secondary/70 text-sm xl:text-base">
                {EMPTY_STATE.errorSubtext}
              </p>
            </div>
          ) : hasNoData ? (
            <div
              className="py-12 px-4 text-center text-secondary"
              style={{ fontFamily: 'var(--font-harmonique)' }}
            >
              No scores for this address
            </div>
          ) : entries.length === 0 ? (
            <div
              className="py-12 px-4 text-center text-secondary"
              style={{ fontFamily: 'var(--font-harmonique)' }}
            >
              No campaigns yet
            </div>
          ) : entries.map((entry) => {
            const isUser = isCurrentUser(entry.address)
            return (
              <div
                key={`${entry.address}-${entry.ranking}`}
                className={`grid gap-x-4 py-4 px-4 border-b border-white/5 items-center transition-all duration-200 min-w-[340px] ${
                  isEvilLeaderboard
                    ? 'grid-cols-[minmax(130px,1fr)_minmax(100px,auto)]'
                    : 'grid-cols-[minmax(130px,1fr)_minmax(100px,auto)]'
                } ${
                  isUser
                    ? 'bg-[rgba(131,233,150,0.15)] border border-green-netherak border-l-[3px] border-l-green-netherak shadow-[0_0_15px_rgba(131,233,150,0.3)] hover:bg-[rgba(131,233,150,0.2)] hover:translate-x-[3px]'
                    : 'hover:bg-[rgba(131,233,150,0.1)] hover:translate-x-[2px]'
                } last:border-b-0 last:rounded-b-xl`}
              >
                {/* Demon column: number + avatar + name */}
                <div className="flex items-center gap-3 md:gap-2.5 sm:gap-1.5 min-w-0">
                  <span
                    className={`text-sm xl:text-base font-bold shrink-0 ${
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
                    className={`text-sm xl:text-base font-semibold overflow-hidden text-ellipsis whitespace-nowrap min-w-0 lowercase ${
                      isUser ? 'text-green-netherak drop-shadow-[0_0_8px_rgba(131,233,150,0.5)] font-bold' : 'text-primary'
                    }`}
                    style={{ fontFamily: 'var(--font-zachar-scratched)' }}
                  >
                    {entry.username || (entry.address ? shortenAddress(entry.address) : entry.demon)}
                  </span>
                </div>
                {/* Stats / Evil column */}
                {isEvilLeaderboard ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <img
                      src="/evil.svg"
                      alt="Evil points"
                      className="w-5 h-6 shrink-0"
                    />
                    <span
                      className="text-sm xl:text-base font-bold text-white"
                      style={{ fontFamily: 'var(--font-harmonique)' }}
                    >
                      {displayEvilPoints(entry).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span
                    className="text-sm xl:text-base font-bold text-center text-white"
                    style={{ fontFamily: 'var(--font-harmonique)' }}
                  >
                    {entry.score.toLocaleString()}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {canLoadMore && onLoadMore && !showLoginMessage && !error && (
          <div className="flex justify-center mt-4">
            <button
              type="button"
              disabled={loadingMore}
              onClick={onLoadMore}
              className="px-4 py-1.5 rounded-full border border-white/20 text-xs uppercase tracking-[2px] text-secondary hover:text-white hover:border-white/40 hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: 'var(--font-harmonique)' }}
            >
              {loadingMore ? 'Loading…' : 'Load more demons'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaderboardCard
