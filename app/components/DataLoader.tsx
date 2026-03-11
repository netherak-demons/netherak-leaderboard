'use client'

import { useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { getCanShowData, getEffectiveWallet, normalizeLinkedWallet } from '../utils/dataMode'
import { useAppStore, selectUserStats } from '../stores/useAppStore'
import { usePfpStore } from '../stores/usePfpStore'
import { useImuranBookStore } from '../stores/useImuranBookStore'
import { useNkdRecipesStore } from '../stores/useNkdRecipesStore'
import { uniqueWallets } from '../utils/walletCache'

const REFRESH_EVENT = 'netherak:refreshUser'

/**
 * Bootstraps data fetching: fetches season stats when canShowData,
 * sets effective wallet, and ensures PFP/Imuran Book/NKD Recipes are loaded for the current user.
 * linkedWallet comes from userStats (leaderboard) or linkedWalletFromApi (SomniaQuesterHandler fetches GET /api/user on connect).
 * Single source of truth - prevents duplicate fetches across Header, Leaderboard, Account.
 */
export default function DataLoader() {
  const { address, isConnected } = useAccount()
  const effectiveWallet = getEffectiveWallet(address)
  const canShowData = getCanShowData(isConnected)

  const fetchSeason = useAppStore((s) => s.fetchSeason)
  const setEffectiveWallet = useAppStore((s) => s.setEffectiveWallet)
  const userStats = useAppStore(selectUserStats)
  const linkedWalletFromApi = useAppStore((s) => s.linkedWalletFromApi)

  const fetchPfp = usePfpStore((s) => s.fetchPfp)
  const fetchHasBookForWallets = useImuranBookStore((s) => s.fetchHasBookForWallets)
  const fetchHasRecipesForWallets = useNkdRecipesStore((s) => s.fetchHasRecipesForWallets)

  const linkedWallet = userStats?.linkedWallet ?? (normalizeLinkedWallet(linkedWalletFromApi) || undefined)

  const wallets = useMemo(
    () =>
      uniqueWallets([
        userStats?.wallet,
        linkedWallet,
        effectiveWallet,
      ]),
    [effectiveWallet, userStats?.wallet, linkedWallet]
  )
  const walletsKey = wallets.map((w) => w.toLowerCase()).sort().join(',')

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

  // Stagger PFP → Book → NKD so we don't hit all three endpoints at once (avoids 429 rate limit)
  useEffect(() => {
    if (wallets.length === 0 || !canShowData) return
    const list = wallets
    const t1 = setTimeout(() => {
      list.forEach((w) => fetchPfp(w))
    }, 0)
    const t2 = setTimeout(() => {
      fetchHasBookForWallets(list)
    }, 350)
    const t3 = setTimeout(() => {
      fetchHasRecipesForWallets(list)
    }, 700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [walletsKey, canShowData, fetchPfp, fetchHasBookForWallets, fetchHasRecipesForWallets])

  return null
}
