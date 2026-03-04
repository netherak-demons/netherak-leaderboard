'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { getCanShowData, getEffectiveWallet } from '../utils/dataMode'
import { useAppStore, selectUserStats } from '../stores/useAppStore'
import { usePfpStore } from '../stores/usePfpStore'
import { useImuranBookStore } from '../stores/useImuranBookStore'

const REFRESH_EVENT = 'netherak:refreshUser'

/**
 * Bootstraps data fetching: fetches season stats when canShowData,
 * sets effective wallet, and ensures PFP/Imuran Book are loaded for the current user.
 * Single source of truth - prevents duplicate fetches across Header, Leaderboard, Account.
 */
export default function DataLoader() {
  const { address, isConnected } = useAccount()
  const effectiveWallet = getEffectiveWallet(address)
  const canShowData = getCanShowData(isConnected)

  const fetchSeason = useAppStore((s) => s.fetchSeason)
  const setEffectiveWallet = useAppStore((s) => s.setEffectiveWallet)
  const userStats = useAppStore(selectUserStats)

  const fetchPfp = usePfpStore((s) => s.fetchPfp)
  const fetchHasBookForWallets = useImuranBookStore((s) => s.fetchHasBookForWallets)

  useEffect(() => {
    setEffectiveWallet(effectiveWallet)
  }, [effectiveWallet, setEffectiveWallet])

  useEffect(() => {
    if (canShowData) {
      fetchSeason('0')
    } else {
      fetchSeason('')
    }
  }, [canShowData, fetchSeason])

  useEffect(() => {
    const handler = () => fetchSeason('0')
    if (typeof window !== 'undefined') {
      window.addEventListener(REFRESH_EVENT, handler)
      return () => window.removeEventListener(REFRESH_EVENT, handler)
    }
  }, [fetchSeason])

  useEffect(() => {
    const wallets = [
      userStats?.wallet,
      userStats?.linkedWallet,
      effectiveWallet,
    ].filter((w): w is string => !!w && typeof w === 'string')
    wallets.forEach((w) => fetchPfp(w))
  }, [effectiveWallet, userStats?.wallet, userStats?.linkedWallet, fetchPfp])

  useEffect(() => {
    const wallets = [
      userStats?.wallet,
      userStats?.linkedWallet,
      effectiveWallet,
    ].filter((w): w is string => !!w && typeof w === 'string')
    if (wallets.length === 0) return
    fetchHasBookForWallets(wallets)
  }, [effectiveWallet, userStats?.wallet, userStats?.linkedWallet, fetchHasBookForWallets])

  return null
}
