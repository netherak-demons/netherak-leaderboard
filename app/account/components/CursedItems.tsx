'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { useUserStats } from '../../hooks/useUserStats'
import { getDataMode, getEffectiveWallet } from '../../utils/dataMode'

function CursedItemImage({
  src,
  alt,
}: {
  src: string | null
  alt: string
}) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div
        className="w-full aspect-square rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '0.5px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span className="text-xs text-white/40">{alt}</span>
      </div>
    )
  }
  return (
    <div
      className="w-full aspect-square rounded-lg overflow-hidden relative"
      style={{
        border: '0.5px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        onError={() => setError(true)}
      />
    </div>
  )
}

export default function CursedItems() {
  const { address, isConnected } = useAccount()
  const dataMode = getDataMode()
  const effectiveWallet = getEffectiveWallet(address)
  // In observation/preview mode, we can show data without wallet connection
  const canShowData = isConnected || dataMode === 'observation' || dataMode === 'preview'
  const { userStats, loading, hasNoData, error } = useUserStats(effectiveWallet)

  // TODO: Replace with actual cursed items data from API when available
  const cursedItems: Array<{ id: number; src: string | null; alt: string }> = []

  // Show skeleton when not connected (unless in observation/preview mode)
  if (!canShowData) {
    return (
      <div
        className="flex flex-col gap-4 w-[350px] shrink-0 rounded-xl p-6"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h3 className="text-white text-base font-medium uppercase tracking-wider font-zachar">
          Cursed Items
        </h3>
        <div className="h-px w-full bg-white/10 rounded-full" />
        <div className="flex items-center justify-center py-8">
          <p className="text-secondary text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            There&apos;s no data to display. Please log in to view cursed items.
          </p>
        </div>
      </div>
    )
  }

  // Show loading skeleton
  if (loading) {
    return (
      <div
        className="flex flex-col gap-4 w-[350px] shrink-0 rounded-xl p-6 animate-pulse"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="h-5 bg-white/10 rounded w-32" />
        <div className="h-px w-full bg-white/10 rounded-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full aspect-square rounded-lg bg-white/10" />
          ))}
        </div>
      </div>
    )
  }

  // Show error message
  if (error) {
    return (
      <div
        className="flex flex-col gap-4 w-[350px] shrink-0 rounded-xl p-6"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h3 className="text-white text-base font-medium uppercase tracking-wider font-zachar">
          Cursed Items
        </h3>
        <div className="h-px w-full bg-white/10 rounded-full" />
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-[#FF8C8A] text-base mb-2" style={{ fontFamily: 'var(--font-harmonique)' }}>
              We are experiencing some issues
            </p>
            <p className="text-secondary/70 text-sm" style={{ fontFamily: 'var(--font-harmonique)' }}>
              We&apos;ll fix this soon. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show no data message
  if (hasNoData || !userStats) {
    return (
      <div
        className="flex flex-col gap-4 w-[350px] shrink-0 rounded-xl p-6"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h3 className="text-white text-base font-medium uppercase tracking-wider font-zachar">
          Cursed Items
        </h3>
        <div className="h-px w-full bg-white/10 rounded-full" />
        <div className="flex items-center justify-center py-8">
          <p className="text-secondary text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            No cursed items data available for your wallet address
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-4 w-[350px] shrink-0 rounded-xl p-6"
      style={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        border: '0.5px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <h3
        className="text-white text-base font-medium uppercase tracking-wider font-zachar"
      >
        Cursed Items
      </h3>

      {/* Divider */}
      <div
        className="w-full shrink-0"
        style={{
          height: '0.5px',
          background: 'linear-gradient(90deg, transparent, #796359, #DFB7A4, #796359, transparent)',
        }}
      />

      {/* 2-col grid of square images */}
      {cursedItems.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-secondary text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            No cursed items available
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cursedItems.map((item) => (
            <CursedItemImage key={item.id} src={item.src} alt={item.alt} />
          ))}
        </div>
      )}
    </div>
  )
}
