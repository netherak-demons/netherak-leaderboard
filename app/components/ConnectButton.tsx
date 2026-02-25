'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { useOpenConnectModal } from '@0xsequence/connect'
import { Settings } from 'lucide-react'
import UserProfilePopup from './UserProfilePopup'
import { getDataMode } from '../utils/dataMode'
import type { UserStats } from '../hooks/useUserStats'

function ConnectButtonAvatar({
  pfpUrl,
  onClick,
}: {
  pfpUrl?: string
  onClick?: () => void
}) {
  const [useDefault, setUseDefault] = useState(false)
  const src = !useDefault && pfpUrl ? pfpUrl : DEFAULT_PFP
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full focus:outline-none border border-primary/50 focus:ring-2 focus:ring-primary/70 focus:ring-offset-2 focus:ring-offset-black"
      aria-label="Open profile"
    >
      <img
        src={src}
        alt="Profile"
        className="w-[52px] h-[52px] rounded-full object-cover bg-[#2a2a2a] cursor-pointer transition-opacity hover:opacity-90"
        style={{ border: '0.25px solid #FD9D83' }}
        onError={() => setUseDefault(true)}
      />
    </button>
  )
}

const BUTTON_IMAGES = {
  normal: '/media/buttons/button_normal.png',
  hover: '/media/buttons/button_hover.png',
  disabled: '/media/buttons/button_disabled.png',
}

const DEFAULT_PFP = '/demons/avatar1.svg'

interface ConnectButtonProps {
  className?: string
  disabled?: boolean
  onClick?: () => void
  children?: React.ReactNode
  pfpUrl?: string
  userStats?: UserStats | null
}

export default function ConnectButton({
  className = "",
  disabled = false,
  onClick,
  children,
  pfpUrl,
  userStats,
}: ConnectButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { setOpenConnectModal } = useOpenConnectModal()
  const dataMode = getDataMode()
  const isObservationMode = dataMode === 'observation'

  useEffect(() => setMounted(true), [])

  const handleConnectClick = () => {
    if (onClick) {
      onClick()
      return
    }
    if (!isConnected) {
      setOpenConnectModal(true)
    }
  }

  // Show profile (avatar + popup) when connected, OR in observation mode with userStats or pfpUrl
  const showProfileView = isConnected || (isObservationMode && (userStats || pfpUrl))
  if (mounted && showProfileView && !children) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative shrink-0">
          <ConnectButtonAvatar
            pfpUrl={pfpUrl}
            onClick={() => !disabled && setProfileOpen(true)}
          />
          {isConnected && (
            <button
              type="button"
              className="absolute top-0 right-0 rounded-full text-secondary transition-colors hidden lg:block shadow-lg"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
        <UserProfilePopup
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          userStats={userStats ?? null}
          pfpUrl={pfpUrl}
        />
      </div>
    )
  }

  const getButtonImage = () => {
    if (disabled) return BUTTON_IMAGES.disabled
    if (isHovered) return BUTTON_IMAGES.hover
    return BUTTON_IMAGES.normal
  }

  const getButtonText = () => children ?? 'Sign in with Sequence'

  return (
    <button
      className={`relative overflow-hidden min-w-[240px]  cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ aspectRatio: '532/252' }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={disabled ? undefined : handleConnectClick}
      disabled={disabled}
    >
      <Image
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain"
        src={getButtonImage()}
        alt="Button Background"
        width={532}
        height={252}
        unoptimized
      />
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <span
          className="text-primary text-sm font-medium uppercase tracking-[0.02em] filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.5)]"
          style={{ fontFamily: 'var(--font-zachar-scratched)' }}
        >
          {getButtonText()}
        </span>
      </div>
    </button>
  )
}