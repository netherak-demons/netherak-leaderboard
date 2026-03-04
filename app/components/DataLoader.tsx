'use client'

import { useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { getCanShowData, getEffectiveWallet } from '../utils/dataMode'
import { useAppStore, selectUserStats } from '../stores/useAppStore'
import { usePfpStore } from '../stores/usePfpStore'
import { useImuranBookStore } from '../stores/useImuranBookStore'
import { useNkdRecipesStore } from '../stores/useNkdRecipesStore'
import { uniqueWallets } from '../utils/walletCache'

const REFRESH_EVENT = 'netherak:refreshUser'

/**
 * Bootstraps data fetching: fetches season stats when canShowData,
 * sets effective wallet, and ensures PFP/Imuran Book/NKD Recipes are loaded for the current user.
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
  const fetchHasRecipesForWallets = useNkdRecipesStore((s) => s.fetchHasRecipesForWallets)

  const wallets = useMemo(
    () =>
      uniqueWallets([
        userStats?.wallet,
        userStats?.linkedWallet,
        effectiveWallet,
      ]),
    [effectiveWallet, userStats?.wallet, userStats?.linkedWallet]
  )

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
    wallets.forEach((w) => fetchPfp(w))
  }, [wallets, fetchPfp])

  useEffect(() => {
    if (wallets.length === 0) return
    fetchHasBookForWallets(wallets)
  }, [wallets, fetchHasBookForWallets])

  useEffect(() => {
    if (wallets.length === 0) return
    fetchHasRecipesForWallets(wallets)
  }, [wallets, fetchHasRecipesForWallets])

  return null
}
