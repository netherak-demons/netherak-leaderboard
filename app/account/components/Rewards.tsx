'use client'

import React, { useState } from 'react'
import RewardCard from './RewardCard'
import { useAccount } from 'wagmi'
import { useUserStats } from '../../hooks/useUserStats'
import { getDataMode, getEffectiveWallet } from '../../utils/dataMode'

export default function Rewards() {
  const { address, isConnected } = useAccount()
  const dataMode = getDataMode()
  const effectiveWallet = getEffectiveWallet(address)
  // In observation/preview mode, we can show data without wallet connection
  const canShowData = isConnected || dataMode === 'observation' || dataMode === 'preview'
  const { userStats, loading, hasNoData, error } = useUserStats(effectiveWallet)
  const [activeTab, setActiveTab] = useState<'history' | 'claimables'>('history')
  
  // TODO: Replace with actual rewards data from API when available
  const rewardsHistory: Array<{ id: number; questName: string; amount: number }> = []
  const claimableRewards: Array<{ id: number; questName: string; amount: number }> = []
  
  const displayed = activeTab === 'history' ? rewardsHistory : claimableRewards

  // Show skeleton when not connected (unless in observation/preview mode)
  if (!canShowData) {
    return (
      <div
        className="flex flex-col gap-5 w-[350px] shrink-0 rounded-xl p-6 h-fit"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h3 className="text-white text-base font-medium uppercase tracking-wider font-zachar">
          Rewards
        </h3>
        <div className="h-px w-full bg-white/10 rounded-full" />
        <div className="flex items-center justify-center py-8">
          <p className="text-secondary text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            There&apos;s no data to display. Please log in to view rewards.
          </p>
        </div>
      </div>
    )
  }

  // Show loading skeleton
  if (loading) {
    return (
      <div
        className="flex flex-col gap-5 w-[350px] shrink-0 rounded-xl p-6 h-fit animate-pulse"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="h-5 bg-white/10 rounded w-24" />
        <div className="h-px w-full bg-white/10 rounded-full" />
        <div className="flex items-center justify-between w-full gap-6 px-10">
          <div className="h-5 bg-white/10 rounded w-20" />
          <div className="h-5 bg-white/10 rounded w-24" />
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 p-4 rounded-xl w-full">
              <div className="h-5 bg-white/10 rounded w-32" />
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show error message
  if (error) {
    return (
      <div
        className="flex flex-col gap-5 w-[350px] shrink-0 rounded-xl p-6 h-fit"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h3 className="text-white text-base font-medium uppercase tracking-wider font-zachar">
          Rewards
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
        className="flex flex-col gap-5 w-[350px] shrink-0 rounded-xl p-6 h-fit"
        style={{
          backgroundColor: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h3 className="text-white text-base font-medium uppercase tracking-wider font-zachar">
          Rewards
        </h3>
        <div className="h-px w-full bg-white/10 rounded-full" />
        <div className="flex items-center justify-center py-8">
          <p className="text-secondary text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            No rewards data available for your wallet address
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-5 w-[350px] shrink-0 rounded-xl p-6 h-fit"
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
        Rewards
      </h3>

      {/* Divider */}
      <div
        className="w-full shrink-0"
        style={{
          height: '0.5px',
          background: 'linear-gradient(90deg, transparent, #796359, #DFB7A4, #796359, transparent)',
        }}
      />

      {/* Tab buttons */}
      <div className="flex items-center justify-between w-full gap-6 px-10">
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`text-base font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'history' ? 'text-primary' : 'text-secondary hover:text-primary'
          }`}
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('claimables')}
          className={`text-base font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'claimables' ? 'text-primary' : 'text-secondary hover:text-primary'
          }`}
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          Claimables
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {displayed.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-secondary text-sm text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
              {activeTab === 'history' 
                ? 'No reward history available' 
                : 'No claimable rewards'}
            </p>
          </div>
        ) : (
          displayed.map((r) => (
            <RewardCard key={r.id} questName={r.questName} amount={r.amount} />
          ))
        )}
      </div>
    </div>
  )
}
