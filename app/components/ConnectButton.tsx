'use client'

import React, { useState } from 'react'

function ConnectButtonAvatar({ pfpUrl }: { pfpUrl?: string }) {
  const [useDefault, setUseDefault] = useState(false)
  const src = !useDefault && pfpUrl ? pfpUrl : DEFAULT_PFP
  return (
    <img
      src={src}
      alt="Profile"
      className="w-[52px] h-[52px] rounded-full shrink-0 object-cover bg-[#2a2a2a]"
      style={{ border: '0.25px solid #FD9D83' }}
      onError={() => setUseDefault(true)}
    />
  )
}
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { useAccount, useDisconnect } from 'wagmi'
import { useOpenConnectModal } from '@0xsequence/connect'

const BUTTON_IMAGES = {
  normal: '/media/buttons/view_eligibility_button_normal.png',
  hover: '/media/buttons/view_eligibility_button_hover.png',
  disabled: '/media/buttons/view_eligibility_button_disabled.png',
}

const DEFAULT_PFP = '/demons/avatar1.svg'

interface ConnectButtonProps {
  className?: string
  disabled?: boolean
  onClick?: () => void
  children?: React.ReactNode
  pfpUrl?: string
}

export default function ConnectButton({
  className = "",
  disabled = false,
  onClick,
  children,
  pfpUrl
}: ConnectButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { setOpenConnectModal } = useOpenConnectModal()

  const handleConnectClick = () => {
    if (onClick) {
      onClick()
      return
    }
    if (isConnected) {
      disconnect()
    } else {
      setOpenConnectModal(true)
    }
  }

  const handleLogoutClick = () => {
    if (onClick) {
      onClick()
      return
    }
    disconnect()
  }

  if (isConnected && !children) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <ConnectButtonAvatar pfpUrl={pfpUrl} />
        <button
          className="flex items-center gap-2 border border-secondary text-connect-button-text py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out tracking-[1px] hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={disabled ? undefined : handleLogoutClick}
          disabled={disabled}
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={2.5} />
          Logout
        </button>
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