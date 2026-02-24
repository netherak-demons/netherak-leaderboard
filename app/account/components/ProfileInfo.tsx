'use client'

import React, { useState } from 'react'
import { Trophy, Flame, BookCheck, Sparkles, Minus, CircleAlert } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useUserStatsContext } from '../context/UserStatsContext'
import { useUserPfp } from '../../hooks/useUserPfp'
import { useImuranBookOwnership } from '../../hooks/useImuranBookOwnership'
import { getEffectiveWallet } from '../../utils/dataMode'
import { getMultiplier } from '../../config/multiplier'

const DEFAULT_PFP = '/demons/avatar1.svg'

function ProfileAvatar({ pfpUrl }: { pfpUrl: string | null }) {
  const [useDefault, setUseDefault] = useState(false)
  const src = !useDefault && pfpUrl ? pfpUrl : DEFAULT_PFP
  return (
    <img
      src={src}
      alt="Profile"
      className="w-[62px] h-[62px] rounded-full shrink-0 object-cover bg-[#2a2a2a] border-2 border-green-netherak"
      onError={() => setUseDefault(true)}
    />
  )
}

function ImuranBookImage() {
  const [error, setError] = useState(false)

  return (
    <div className="w-full aspect-3/4 max-h-[200px] rounded-lg flex items-center justify-center overflow-hidden relative">
      <video
        src="/immuran-book.webm"
        autoPlay
        loop
        muted
        playsInline
        className={`bg-transparent w-full h-full object-contain ${error ? 'hidden' : ''}`}
        style={{ mixBlendMode: 'screen' }}
        onError={() => setError(true)}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-sm">Imuran Book</span>
        </div>
      )}
    </div>
  )
}

export default function ProfileInfo() {
  const { address } = useAccount()
  const { userStats, loading, hasNoData, error, canShowData } = useUserStatsContext()
  const walletForPfp = userStats?.wallet ?? getEffectiveWallet(address)
  const { pfpUrl } = useUserPfp(walletForPfp)
  const walletForBook = (userStats?.linkedWallet || userStats?.wallet) ?? getEffectiveWallet(address)
  const { hasBook: hasImuranBook, loading: bookLoading } = useImuranBookOwnership(walletForBook)

  // Show skeleton when not connected (unless in observation/preview mode)
  if (!canShowData) {
    return (
      <div
        className="flex flex-col gap-4 w-full max-w-[320px] shrink-0 rounded-xl p-px"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, #81FF9F70 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          className="flex flex-col gap-4 w-full max-w-[320px] shrink-0 rounded-xl p-6 h-full items-center justify-center min-h-[400px]"
          style={{
            backgroundColor: '#00000090',
          }}
        >
          <p className="text-secondary text-base text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            No data to display
          </p>
          <p className="text-secondary/70 text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Please connect to view your profile
          </p>
        </div>
      </div>
    )
  }

  // Show loading skeleton
  if (loading) {
    return (
      <div
        className="flex flex-col gap-4 w-full max-w-[320px] shrink-0 rounded-xl p-px animate-pulse"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, #81FF9F70 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          className="flex flex-col gap-4 w-full max-w-[320px] shrink-0 rounded-xl p-6 h-full"
          style={{
            backgroundColor: '#00000090',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-[62px] h-[62px] rounded-full bg-white/10 shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-5 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          </div>
          <div className="h-px w-full bg-white/10 rounded-full" />
          <div className="flex items-center gap-3">
            <div className="h-6 bg-white/10 rounded w-24" />
            <div className="h-4 w-px bg-white/10 shrink-0" />
            <div className="h-12 bg-white/10 rounded w-16" />
          </div>
          <div className="h-px w-full bg-white/10 rounded-full" />
          <div className="w-full aspect-3/4 max-h-[200px] rounded-lg bg-white/10" />
          <div className="h-5 bg-white/10 rounded w-32 mx-auto" />
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-white/10 rounded w-full" />
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-2/3" />
          </div>
          <div className="min-h-[80px] bg-white/10 rounded-lg" />
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 bg-white/10 rounded" />
            <div className="h-4 bg-white/10 rounded w-24" />
          </div>
        </div>
      </div>
    )
  }

  // Show error message
  if (error) {
    return (
      <div
        className="flex flex-col gap-4 w-full max-w-[320px] shrink-0 rounded-xl p-px"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, #81FF9F70 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          className="flex flex-col gap-4 w-full max-w-[320px] shrink-0 rounded-xl p-6 h-full items-center justify-center min-h-[400px]"
          style={{
            backgroundColor: '#00000090',
          }}
        >
          <p className="text-[#FF8C8A] text-base text-center mb-2" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Temporary error
          </p>
          <p className="text-secondary/70 text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Please try again later.
          </p>
        </div>
      </div>
    )
  }

  // Show no data message
  if (hasNoData || !userStats) {
    return (
      <div
        className="flex flex-col gap-4 w-full max-w-[320px] shrink-0 rounded-xl p-px"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, #81FF9F70 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          className="flex flex-col gap-4 w-full max-w-[320px] shrink-0 rounded-xl p-6 h-full items-center justify-center min-h-[400px]"
          style={{
            backgroundColor: '#00000090',
          }}
        >
          <p className="text-secondary text-base text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            No data to display
          </p>
          <p className="text-secondary/70 text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Start playing to see your stats here!
          </p>
        </div>
      </div>
    )
  }

  // Use actual data from API
  const displayName = userStats.username || (userStats.wallet ? `${userStats.wallet.slice(0, 6)}...${userStats.wallet.slice(-4)}` : 'Guest')
  const rankingPosition = userStats.ranking.dungeons || userStats.ranking.slayedHumans || userStats.ranking.harvestedSouls || userStats.ranking.waves || null
  const isEligible = hasImuranBook
  const evilPoints = userStats.evilPoints
  const multiplier = getMultiplier(hasImuranBook, !!pfpUrl)

  return (
    
    // create div with gradient background
    <div
      className="flex flex-col gap-4 w-full max-w-[320px] shrink-0 rounded-xl p-px"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, #81FF9F70 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div
        className="flex flex-col gap-4 w-full max-w-[320px] shrink-0 rounded-xl p-6 h-full"
        style={{
          backgroundColor: '#00000090',
        }}
      >
      {/* 1) PFP + name, ranking, eligible */}
      <div className="flex items-center gap-3">
        <ProfileAvatar pfpUrl={pfpUrl} />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className="text-white font-medium truncate"
            style={{ fontFamily: 'var(--font-zachar-scratched)' }}
          >
            {displayName}
          </span>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: '#DFB7A4' }} strokeWidth={2} />
              <span
                className="text-base font-medium"
                style={{ fontFamily: 'var(--font-harmonique)', color: '#DFB7A4' }}
              >
                #{rankingPosition}
              </span>
            </div>
            {/* {isEligible ? (
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                <span
                  className="text-sm font-medium uppercase"
                  style={{ fontFamily: 'var(--font-harmonique)' }}
                >
                  ELIGIBLE
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border border-white/40 flex items-center justify-center shrink-0">
                  <Minus className="w-2 h-2 text-white" strokeWidth={2.5} />
                </div>
                <span
                  className="text-sm font-medium uppercase text-white"
                  style={{ fontFamily: 'var(--font-harmonique)' }}
                >
                  NOT ELIGIBLE
                </span>
                <CircleAlert className="w-3.5 h-3.5 shrink-0 text-[#808080]" strokeWidth={2} />
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* 2) Divider - 0.5px gradient */}
      <div
        className="h-px w-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #796359, #DFB7A4, #796359, transparent)',
        }}
      />

      {/* 3) EvilPoints | Multiplier */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <img src="/evil.svg" alt="Evil points" className="w-5 h-6 shrink-0" />
          <span
            className="text-green-netherak font-bold text-lg"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            {evilPoints.toLocaleString()}
          </span>
          <span
            className="text-white text-lg"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            EVIL Points
          </span>
        </div>
        <div className="h-4 w-px bg-white/30 shrink-0" />
        <div className="flex flex-col gap-0.5 items-center">
          <div className="flex items-center gap-1">
            <span className="text-sm uppercase text-text-secondary" style={{ fontFamily: 'var(--font-harmonique)' }}>multiplier</span>
            <CircleAlert className="w-3.5 h-3.5 shrink-0 text-[#808080]" strokeWidth={2} />
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 shrink-0" style={{ color: '#FFD36C' }} strokeWidth={2} />
            <span
              className="text-white"
              style={{ fontFamily: 'var(--font-harmonique)' }}
            >
              x{multiplier}
            </span>
          </div>
        </div>
      </div>

      {/* Divider - gradient */}
      <div
        className="h-px w-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #796359, #DFB7A4, #796359, transparent)',
        }}
      />

      {/* 4) Imuran book image */}
      <ImuranBookImage />

      {/* 5) Imuran book text */}
      <span
        className="text-white text-[18px] font-medium text-center uppercase"
        style={{ fontFamily: 'var(--font-zachar-scratched)', letterSpacing: '0.16em' }}
      >
        Imuran book
      </span>

      {/* 6) Competition rewards access */}
      <div
        className="flex flex-col gap-2 text-sm"
        style={{ fontFamily: 'var(--font-harmonique)' }}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 shrink-0" style={{ color: '#DFB7A4' }} strokeWidth={2} />
          <span className="text-white uppercase tracking-wider">COMPETITION REWARDS&apos; ACCESS</span>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 shrink-0" style={{ color: '#FFD36C' }} strokeWidth={2} />
          <span className="text-white">x2 EVIL MULTIPLIER</span>
        </div>
        <div className="flex items-center gap-2">
          <BookCheck className="w-4 h-4 shrink-0" style={{ color: '#AAA2C1' }} strokeWidth={2} />
          <span className="text-white">Auto WL for Demon Crow</span>
        </div>
      </div>

      {/* 7) Get Book / Owned button */}
      <button
        className={`relative min-h-[80px] overflow-hidden rounded-lg transition-all duration-300 ${
          hasImuranBook || bookLoading ? 'cursor-default' : 'cursor-pointer hover:scale-105 hover:brightness-110'
        }`}
        style={{
          backgroundImage: hasImuranBook ? 'none' : 'url(/media/buttons/button_positive.png)',
          backgroundColor: hasImuranBook ? 'rgba(131, 233, 150, 0.2)' : undefined,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          fontFamily: 'var(--font-zachar-scratched)',
        }}
        disabled={hasImuranBook || bookLoading}
      >
        <span
          className="relative z-10 flex items-center justify-center w-full h-full min-h-[48px] py-3 text-primary text-base font-medium uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-zachar-scratched)' }}
        >
          {bookLoading ? '...' : hasImuranBook ? 'Owned' : 'Get Book'}
        </span>
      </button>

      {/* 8) Pay with $OMI - hide when owned */}
      {!hasImuranBook && (
        <div className="flex items-center justify-center gap-2">
          <img src="/omi-logo.svg" alt="OMI" className="w-5 h-5" />
          <span
            className="text-white text-sm"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            Pay with $OMI
          </span>
        </div>
      )}
    </div>
    </div>
  )
}
