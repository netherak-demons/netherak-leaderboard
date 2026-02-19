'use client'

import React, { createContext, useContext } from 'react'
import { useUserStats } from '../../hooks/useUserStats'
import { useAccount } from 'wagmi'
import { getDataMode, getEffectiveWallet } from '../../utils/dataMode'
import type { UserStats } from '../../hooks/useUserStats'

interface UserStatsContextValue {
  userStats: UserStats | null
  loading: boolean
  hasNoData: boolean
  error: string | null
  canShowData: boolean
}

const UserStatsContext = createContext<UserStatsContextValue | null>(null)

export function UserStatsProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const dataMode = getDataMode()
  const effectiveWallet = getEffectiveWallet(address)
  const canShowData = isConnected || dataMode === 'observation' || dataMode === 'preview'

  const { userStats, loading, hasNoData, error } = useUserStats(
    effectiveWallet,
    '0',
    undefined // Fetch once - no shared data from leaderboard on account page
  )

  const value: UserStatsContextValue = {
    userStats,
    loading,
    hasNoData,
    error,
    canShowData,
  }

  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  )
}

export function useUserStatsContext(): UserStatsContextValue {
  const ctx = useContext(UserStatsContext)
  if (!ctx) {
    throw new Error('useUserStatsContext must be used within UserStatsProvider')
  }
  return ctx
}
