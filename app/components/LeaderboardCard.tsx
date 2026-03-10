'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CircleCheck, CircleAlert } from 'lucide-react'
import Link from 'next/link'
import { EMPTY_STATE } from '../utils/emptyStateCopy'
import { useImuranBookStore } from '../stores/useImuranBookStore'
import { usePfpStore } from '../stores/usePfpStore'
import { ASSET_CACHE_TTL_MS } from '../utils/walletCache'
import { applyEvilPointsMultiplier } from '../utils/evilPoints'

const IMURAN_SHOP_URL = 'https://fascinating-alpaca-40611.sequence.market/shop'

function EligibilityCell({ hasBook, currentUserHasBook }: { hasBook: boolean; currentUserHasBook: boolean }) {
  const [showOverlay, setShowOverlay] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!showOverlay || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPosition({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    })
  }, [showOverlay])

  const handleTriggerLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => setShowOverlay(false), 100)
  }

  const handleOverlayEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
    setShowOverlay(true)
  }

  const handleOverlayLeave = () => {
    setShowOverlay(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        className="relative flex justify-center pt-8 -mt-8"
        onMouseEnter={() => {
          if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current)
            leaveTimeoutRef.current = null
          }
          setShowOverlay(true)
        }}
        onMouseLeave={handleTriggerLeave}
      >
        {hasBook ? (
          <CircleCheck
            className="w-5 h-5 shrink-0 text-white cursor-pointer"
            strokeWidth={2.5}
          />
        ) : (
          <span title="Book Multiplier">
            <CircleAlert
              className="w-5 h-5 shrink-0 text-white/50 cursor-pointer"
              strokeWidth={2.5}
            />
          </span>
        )}
      </div>
      {showOverlay &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed flex flex-col gap-2 p-4 rounded-md min-w-[160px] z-50 -translate-x-1/2 -translate-y-full"
            style={{
              top: position.top,
              left: position.left,
              backgroundColor: 'rgba(26, 26, 26, 0.98)',
              border: '0.5px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            }}
            onMouseEnter={handleOverlayEnter}
            onMouseLeave={handleOverlayLeave}
          >
            <span
              className={hasBook ? 'text-primary' : 'text-white/60'}
              style={{ fontFamily: 'var(--font-harmonique)', textAlign: 'center' }}
            >
              {hasBook ? 'Eligible for rewards' : 'Not eligible for rewards'}
            </span>
            {!currentUserHasBook && (
              <Link
                href={IMURAN_SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-secondary text-white py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out tracking-[1px] hover:border-primary hover:text-primary text-sm font-medium bg-white/5 hover:bg-white/10"
                style={{ fontFamily: 'var(--font-zachar)' }}
              >
                Mint book
              </Link>
            )}
          </div>,
          document.body
        )}
    </>
  )
}

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
  currentUserHasBook?: boolean
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
  currentUserHasBook = false,
}) => {
  const cache = useImuranBookStore((s) => s.cache)
  const getPfp = usePfpStore((s) => s.getPfp)

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isCurrentUser = (entryAddress?: string) => {
    if (!userAddress || !entryAddress) return false
    return userAddress.toLowerCase() === entryAddress.toLowerCase()
  }

  const getHasBook = (address: string | undefined): boolean | null => {
    if (!address) return null
    const entry = cache.get(address.toLowerCase())
    if (!entry || Date.now() - entry.ts > ASSET_CACHE_TTL_MS) return null
    return entry.hasBook
  }

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
          <div className="grid grid-cols-[minmax(130px,1fr)_minmax(72px,auto)_minmax(80px,auto)_minmax(48px,auto)] gap-x-4 py-3 px-4 border-b-2 border-white/5 min-w-[400px]">
            <div className="h-4 bg-white/10 rounded w-20" />
            <div className="h-4 bg-white/10 rounded w-16 mx-auto" />
            <div className="h-4 bg-white/10 rounded w-16 mx-auto" />
            <div className="h-4 bg-white/10 rounded w-16 mx-auto" />
          </div>

          <div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[minmax(130px,1fr)_minmax(72px,auto)_minmax(80px,auto)_minmax(48px,auto)] gap-x-4 py-4 px-4 border-b border-white/5 items-center min-w-[400px]"
              >
                <div className="flex items-center gap-3 md:gap-2.5 sm:gap-1.5 min-w-0">
                  <div className="w-6 h-4 bg-white/10 rounded shrink-0" />
                  <div className="w-10 h-10 md:w-8 md:h-8 sm:w-6.5 sm:h-6.5 rounded-full bg-white/10 shrink-0" />
                  <div className="h-4 bg-white/10 rounded flex-1 max-w-[120px]" />
                </div>
                <div className="h-4 bg-white/10 rounded w-12 mx-auto" />
                <div className="h-4 bg-white/10 rounded w-16 mx-auto" />
                <div className="h-5 w-5 bg-white/10 rounded mx-auto" />
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
        {/* Column headers: Demon, Stats, Evil, Rewards */}
        <div className="grid grid-cols-[minmax(130px,1fr)_minmax(72px,auto)_minmax(80px,auto)_minmax(48px,auto)] gap-x-4 py-3 px-4 border-b-2 border-white/5 min-w-[400px]">
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
            {scoreLabel}
          </span>
          <span
            className="text-base xl:text-lg font-light tracking-[1.5px] md:tracking-[0.5px] sm:tracking-[0.2px] uppercase text-center md:whitespace-normal sm:whitespace-normal text-secondary"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            Evil
          </span>
          <span
            className="text-base xl:text-lg font-light tracking-[1.5px] md:tracking-[0.5px] sm:tracking-[0.2px] uppercase text-center md:whitespace-normal sm:whitespace-normal text-secondary"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            Rewards
          </span>
        </div>

        <div>
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
                className={`grid grid-cols-[minmax(130px,1fr)_minmax(72px,auto)_minmax(80px,auto)_minmax(48px,auto)] gap-x-4 py-4 px-4 border-b border-white/5 items-center transition-all duration-200 min-w-[400px] ${
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
                {/* Stats column (for EVIL POINTS leaderboard, apply multiplier) */}
                <span
                  className="text-sm xl:text-base font-bold text-center text-white"
                  style={{ fontFamily: 'var(--font-harmonique)' }}
                >
                  {(scoreLabel === 'EVIL' && entry.baseEvilPoints !== undefined && entry.extraEvilPoints !== undefined
                    ? applyEvilPointsMultiplier(
                        entry.baseEvilPoints,
                        entry.extraEvilPoints,
                        getHasBook(entry.address) === true,
                        !!getPfp(entry.address)
                      )
                    : entry.score
                  ).toLocaleString()}
                </span>
                {/* Evil column: logo + number (with book + PFP multiplier applied) */}
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
                    {(entry.baseEvilPoints !== undefined && entry.extraEvilPoints !== undefined
                      ? applyEvilPointsMultiplier(
                          entry.baseEvilPoints,
                          entry.extraEvilPoints,
                          getHasBook(entry.address) === true,
                          !!getPfp(entry.address)
                        )
                      : entry.evilPoints
                    ).toLocaleString()}
                  </span>
                </div>
                {/* Rewards column - eligible/not eligible based on Imuran Book ownership */}
                <div className="flex justify-center">
                  {getHasBook(entry.address) !== null ? (
                    <EligibilityCell
                      hasBook={getHasBook(entry.address)!}
                      currentUserHasBook={currentUserHasBook}
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
