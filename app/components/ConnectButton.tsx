'use client'

import React, { useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useOpenConnectModal } from '@0xsequence/connect'

interface ConnectButtonProps {
  className?: string
  disabled?: boolean
  onClick?: () => void
  children?: React.ReactNode
}

export default function ConnectButton({
  className = "",
  disabled = false,
  onClick,
  children
}: ConnectButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { setOpenConnectModal } = useOpenConnectModal()

  const handleClick = () => {
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

  const getButtonText = () => {
    if (children) return children
    if (isConnected) {
      return isHovered ? "Disconnect" : `${address?.slice(0, 6)}...${address?.slice(-4)}`
    }
    return "Sign in with Sequence"
  }

  return (
    <button
      className={`bg-[rgba(131,233,150,0.2)] border-2 border-green-netherak text-connect-button-text py-[0.8rem] px-[1.5rem] text-[0.9rem] font-medium rounded-lg cursor-pointer transition-all duration-300 ease-in-out uppercase tracking-[1px] backdrop-blur-[10px] shadow-[0_4px_15px_rgba(131,233,150,0.3)] ${
        disabled 
          ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-[0_4px_15px_rgba(131,233,150,0.3)]' 
          : isHovered 
            ? 'bg-[rgba(131,233,150,0.3)] border-green-netherak shadow-[0_6px_20px_rgba(131,233,150,0.4)] -translate-y-0.5' 
            : 'hover:bg-[rgba(131,233,150,0.3)] hover:border-green-netherak hover:shadow-[0_6px_20px_rgba(131,233,150,0.4)] hover:-translate-y-0.5'
      } ${className}`}
      style={{ fontFamily: 'var(--font-zachar-scratched)' }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={disabled ? undefined : handleClick}
      disabled={disabled}
    >
      {getButtonText()}
    </button>
  )
}