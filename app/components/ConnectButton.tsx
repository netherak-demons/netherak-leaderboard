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
      className={`netherak-connect-button ${className} ${
        disabled ? 'disabled' : ''
      } ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={disabled ? undefined : handleClick}
      disabled={disabled}
    >
      {getButtonText()}
    </button>
  )
}