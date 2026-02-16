'use client'

import React, { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAccount, useDisconnect } from 'wagmi'
import { useOpenConnectModal } from '@0xsequence/connect'

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
        <img
          src={pfpUrl || DEFAULT_PFP}
          alt="Profile"
          className="w-[52px] h-[52px] rounded-full shrink-0 object-cover bg-[#2a2a2a]"
          style={{ border: '0.25px solid #FD9D83' }}
        />
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

  return (
    <button
      className={`bg-[rgba(131,233,150,0.2)] border-2 border-green-netherak text-connect-button-text py-[0.8rem] px-6 text-[0.9rem] font-medium rounded-lg cursor-pointer transition-all duration-300 ease-in-out uppercase tracking-[1px] backdrop-blur-[10px] shadow-[0_4px_15px_rgba(131,233,150,0.3)] ${
        disabled 
          ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-[0_4px_15px_rgba(131,233,150,0.3)]' 
          : isHovered 
            ? 'bg-[rgba(131,233,150,0.3)] border-green-netherak shadow-[0_6px_20px_rgba(131,233,150,0.4)] -translate-y-0.5' 
            : 'hover:bg-[rgba(131,233,150,0.3)] hover:border-green-netherak hover:shadow-[0_6px_20px_rgba(131,233,150,0.4)] hover:-translate-y-0.5'
      } ${className}`}
      style={{ fontFamily: 'var(--font-zachar-scratched)' }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={disabled ? undefined : handleConnectClick}
      disabled={disabled}
    >
      {children ?? "Sign in with Sequence"}
    </button>
  )
}