'use client'

import React, { useState } from 'react'
import { Trophy, Flame, BookCheck, Sparkles, Minus, CircleAlert } from 'lucide-react'
import { useAccount } from 'wagmi'

const DEFAULT_PFP = '/demons/avatar1.svg'

function ImuranBookImage() {
  const [error, setError] = useState(false)

  return (
    <div className="w-full aspect-[3/4] max-h-[200px] rounded-lg flex items-center justify-center overflow-hidden relative">
      <img
        src="/imuran-book.png"
        alt="Imuran Book"
        className={`w-full h-full object-contain ${error ? 'hidden' : ''}`}
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
  const { address, isConnected } = useAccount()

  // Hardcoded data for display
  const displayName = isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Guest'
  const rankingPosition = 42
  const isEligible = true
  const evilPoints = 1284
  const multiplier = 2
  const hasImuranBook = false

  return (
    <div
      className="flex flex-col gap-4 w-full max-w-[320px] shrink-0 rounded-xl p-6"
      style={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        border: '0.5px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* 1) PFP + name, ranking, eligible */}
      <div className="flex items-center gap-3">
        <img
          src={DEFAULT_PFP}
          alt="Profile"
          className="w-[62px] h-[62px] rounded-full shrink-0 object-cover bg-[#2a2a2a] border-2 border-green-netherak"
        />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className="text-white font-medium truncate"
            style={{ fontFamily: 'var(--font-zachar)' }}
          >
            {displayName}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: '#DFB7A4' }} strokeWidth={2} />
              <span
                className="text-sm font-medium"
                style={{ fontFamily: 'var(--font-harmonique)', color: '#DFB7A4' }}
              >
                #{rankingPosition}
              </span>
            </div>
            {isEligible ? (
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                <span
                  className="text-xs font-medium uppercase"
                  style={{ fontFamily: 'var(--font-harmonique)' }}
                >
                  ELIGIBLE
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center shrink-0">
                  <Minus className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
                <span
                  className="text-xs font-medium uppercase text-white"
                  style={{ fontFamily: 'var(--font-harmonique)' }}
                >
                  NOT ELIGIBLE
                </span>
                <CircleAlert className="w-3.5 h-3.5 shrink-0 text-[#808080]" strokeWidth={2} />
              </div>
            )}
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
          <img src="/evil-point-logo.svg" alt="Evil points" className="w-5 h-6 shrink-0" />
          <span
            className="text-green-netherak font-bold text-lg"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            {evilPoints.toLocaleString()}
          </span>
          <span
            className="text-white text-sm"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            EVIL Points
          </span>
        </div>
        <div className="h-4 w-px bg-white/30 shrink-0" />
        <div className="flex flex-col gap-0.5 items-center">
          <div className="flex items-center gap-1">
            <CircleAlert className="w-3.5 h-3.5 shrink-0 text-[#808080]" strokeWidth={2} />
            <span className="text-sm uppercase text-text-secondary" style={{ fontFamily: 'var(--font-harmonique)' }}>multiplier</span>
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
        style={{ fontFamily: 'var(--font-zachar)', letterSpacing: '0.16em' }}
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

      {/* 7) Get Book button */}
      <button
        className="w-full bg-[rgba(131,233,150,0.2)] border-2 border-green-netherak text-connect-button-text py-3 px-4 rounded-lg font-medium uppercase tracking-wider transition-all duration-300 hover:bg-[rgba(131,233,150,0.3)] hover:shadow-[0_4px_15px_rgba(131,233,150,0.3)] cursor-pointer"
        style={{ fontFamily: 'var(--font-zachar-scratched)' }}
      >
        Get Book
      </button>

      {/* 8) Pay with $OMI */}
      <div className="flex items-center justify-center gap-2">
        <img src="/omi-logo.svg" alt="OMI" className="w-5 h-5" />
        <span
          className="text-white text-sm"
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          Pay with $OMI
        </span>
      </div>
    </div>
  )
}
