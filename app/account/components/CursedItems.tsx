'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useUserStatsContext } from '../context/UserStatsContext'
import { useUserPfp } from '../../hooks/useUserPfp'
import { useImuranBookOwnership } from '../../hooks/useImuranBookOwnership'
import { useNkdRecipesOwnership } from '../../hooks/useNkdRecipesOwnership'
import { useAppStore } from '../../stores/useAppStore'
import { useAccount } from 'wagmi'
import { getEffectiveWallet, normalizeLinkedWallet } from '../../utils/dataMode'
import { EMPTY_STATE } from '../../utils/emptyStateCopy'

type CursedItemMedia = 'image' | 'video'

function CursedItemMedia({
  src,
  alt,
  mediaType = 'image',
}: {
  src: string | null
  alt: string
  mediaType?: CursedItemMedia
}) {
  const [error, setError] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const tooltip = (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-10 px-3 py-2 rounded-lg text-white text-xs whitespace-nowrap pointer-events-none"
      style={{
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        border: '0.5px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        fontFamily: 'var(--font-harmonique)',
      }}
    >
      {alt}
    </div>
  )

  const wrapperProps = {
    className: 'relative',
    onMouseEnter: () => setShowTooltip(true),
    onMouseLeave: () => setShowTooltip(false),
  }

  if (!src || error) {
    return (
      <div {...wrapperProps}>
        {showTooltip && tooltip}
        <div
          className="w-full aspect-square rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        >
          <span className="text-xs text-white/40">{alt}</span>
        </div>
      </div>
    )
  }

  const containerClass = 'w-full aspect-square rounded-lg overflow-hidden relative'
  const containerStyle = { backgroundColor: 'rgba(0, 0, 0, 0.4)' }

  if (mediaType === 'video') {
    return (
      <div {...wrapperProps}>
        {showTooltip && tooltip}
        <div className={containerClass} style={containerStyle}>
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain bg-transparent"
            onError={() => setError(true)}
          />
        </div>
      </div>
    )
  }

  const isExternal = src.startsWith('http://') || src.startsWith('https://')
  if (isExternal) {
    return (
      <div {...wrapperProps}>
        {showTooltip && tooltip}
        <div className={containerClass} style={containerStyle}>
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain"
            onError={() => setError(true)}
          />
        </div>
      </div>
    )
  }

  return (
    <div {...wrapperProps}>
      {showTooltip && tooltip}
      <div className={containerClass} style={containerStyle}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          onError={() => setError(true)}
        />
      </div>
    </div>
  )
}

export default function CursedItems() {
  const { address } = useAccount()
  const { userStats, loading, error, canShowData } = useUserStatsContext()
  const linkedWalletFromApi = useAppStore((s) => s.linkedWalletFromApi)
  const linkedWallet = userStats?.linkedWallet ?? (normalizeLinkedWallet(linkedWalletFromApi) || undefined)
  const walletsForPfpAndBook = [
    userStats?.wallet,
    linkedWallet,
    getEffectiveWallet(address),
  ].filter((w): w is string => !!w && typeof w === 'string')
  const { pfpUrl } = useUserPfp(walletsForPfpAndBook)
  const { hasBook: hasImuranBook } = useImuranBookOwnership(walletsForPfpAndBook)
  const { hasRecipes: hasNkdRecipes, imageUrls: nkdRecipesImageUrls } = useNkdRecipesOwnership(walletsForPfpAndBook)

  const cursedItems: Array<{ id: number; src: string | null; alt: string; mediaType?: CursedItemMedia }> = []
  let nextId = 1
  if (pfpUrl) {
    cursedItems.push({ id: nextId++, src: pfpUrl, alt: 'Netherak Demons PFP', mediaType: 'image' })
  }
  if (hasImuranBook) {
    cursedItems.push({ id: nextId++, src: '/imuran-book.webm', alt: 'Imuran Book', mediaType: 'video' })
  }
  if (hasNkdRecipes) {
    const urls = nkdRecipesImageUrls.length > 0 ? nkdRecipesImageUrls : ['/nkd-recipes.svg']
    urls.forEach((url, i) => {
      cursedItems.push({
        id: nextId++,
        src: url,
        alt: urls.length > 1 ? `NKD Recipe ${i + 1}` : 'NKD Recipes',
        mediaType: 'image',
      })
    })
  }

  // Show skeleton when not connected (unless in observation/preview mode)
  if (!canShowData) {
    return (
      <div
        className="flex flex-col gap-4 w-full md:w-[350px] shrink-0 rounded-xl p-4 md:p-6"
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
            {EMPTY_STATE.connectTitle}. {EMPTY_STATE.connectSubtext}
          </p>
        </div>
      </div>
    )
  }

  // Show loading skeleton
  if (loading) {
    return (
      <div
        className="flex flex-col gap-4 w-full md:w-[350px] shrink-0 rounded-xl p-4 md:p-6 animate-pulse"
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
        className="flex flex-col gap-4 w-full md:w-[350px] shrink-0 rounded-xl p-4 md:p-6"
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

  return (
    <div
      className="flex flex-col gap-4 w-full md:w-[350px] shrink-0 rounded-xl p-4 md:p-6"
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
            <CursedItemMedia
              key={item.id}
              src={item.src}
              alt={item.alt}
              mediaType={item.mediaType}
            />
          ))}
        </div>
      )}
    </div>
  )
}
