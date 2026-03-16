'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAccount, useConnection } from 'wagmi'
import { getCanShowData, getEffectiveWallet, normalizeLinkedWallet } from '../../utils/dataMode'
import type { UserStats } from '../../hooks/useUserStats'
import { useAppStore } from '../../stores/useAppStore'

interface UserStatsContextValue {
  userStats: UserStats | null
  loading: boolean
  hasNoData: boolean
  error: string | null
  canShowData: boolean
  profilePfpImage: string | null
  profileOwnsPfp: boolean | null
  profileHasImuranBook: boolean | null
}

const UserStatsContext = createContext<UserStatsContextValue | null>(null)

export function UserStatsProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const { connector } = useConnection()
  const sequenceWaas = (connector as { sequenceWaas?: { getIdToken: () => Promise<{ idToken: string }> } })?.sequenceWaas
  const effectiveWallet = getEffectiveWallet(address)
  const canShowData = getCanShowData(isConnected)

  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [profilePfpImage, setProfilePfpImage] = useState<string | null>(null)
  const [profileOwnsPfp, setProfileOwnsPfp] = useState<boolean | null>(null)
  const [profileHasImuranBook, setProfileHasImuranBook] = useState<boolean | null>(null)
  const setUserFromApi = useAppStore((s) => s.setUserFromApi)

  useEffect(() => {
    let cancelled = false

    async function fetchUserSeasonStats() {
      if (!canShowData || !effectiveWallet || !sequenceWaas) {
        setUserStats(null)
        setProfilePfpImage(null)
        setProfileOwnsPfp(null)
        setProfileHasImuranBook(null)
        setLoading(false)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { idToken } = await sequenceWaas.getIdToken()
        if (cancelled) return

        const res = await fetch('/api/stats?seasonId=0', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })

        if (!res.ok) {
          if (res.status === 404) {
            try {
              const userRes = await fetch('/api/user', {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${idToken}`,
                },
              })
              if (!cancelled && userRes.ok) {
                const userRaw = await userRes.json()
                setUserFromApi({
                  wallet: userRaw?.wallet ?? '',
                  username: userRaw?.username ?? userRaw?.profile?.username ?? '',
                })
              }
            } catch {
              // Non-fatal: keep 404 flow even if /api/user fallback fails.
            }
            throw new Error('API error 404')
          }
          const msg = await res.text()
          throw new Error(msg || `HTTP ${res.status}`)
        }

        const raw = await res.json()
        if (cancelled) return

        const source = Array.isArray(raw) ? raw[0] : raw
        const stats = source?.stats || {}
        const dungeonsObj = stats?.dungeonsCompleted || {}
        const enemiesObj = stats?.enemiesKilled || {}
        const skillsObj = stats?.skillsUsed || {}
        const wavesRaw = stats?.wavesCompleted
        const wavesCompleted =
          typeof wavesRaw === 'number'
            ? wavesRaw
            : (wavesRaw && typeof wavesRaw === 'object'
              ? Object.values(wavesRaw).reduce((sum: number, v) => sum + Number(v || 0), 0)
              : 0)

        const dungeonsCompleted = Object.values(dungeonsObj).reduce((sum: number, v) => sum + Number(v || 0), 0)
        const slayedHumans = Object.values(enemiesObj).reduce((sum: number, v) => sum + Number(v || 0), 0)
        const harvestedSouls = Number(skillsObj?.DrainSoul || 0)
        const evilPoints = Number(source?.score || 0)

        const mapped: UserStats = {
          wallet: source?.wallet || effectiveWallet,
          username: source?.username || source?.profile?.username || 'Unknown',
          linkedWallet: normalizeLinkedWallet(source?.profile?.linkedWallet ?? source?.profile?.LINKEDWALLET) || undefined,
          dungeonsCompleted,
          slayedHumans,
          harvestedSouls,
          wavesCompleted,
          evilPoints,
          baseEvilPoints: evilPoints,
          extraEvilPoints: 0,
          ranking: {
            dungeons: null,
            slayedHumans: null,
            harvestedSouls: null,
            waves: null,
          },
        }

        setUserStats(mapped)
        setProfilePfpImage(source?.profile?.PFPImage ?? null)
        setProfileOwnsPfp(
          typeof source?.profile?.ownsPFP === 'boolean'
            ? source.profile.ownsPFP
            : null
        )
        setProfileHasImuranBook(
          typeof source?.profile?.ownsImmuranBook === 'boolean'
            ? source.profile.ownsImmuranBook
            : null
        )
      } catch (err) {
        if (!cancelled) {
          setUserStats(null)
          setProfilePfpImage(null)
          setProfileOwnsPfp(null)
          setProfileHasImuranBook(null)
          setError(err instanceof Error ? err.message : 'Failed to fetch user stats')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUserSeasonStats()
    return () => {
      cancelled = true
    }
  }, [canShowData, effectiveWallet, sequenceWaas])

  const hasNoData = useMemo(() => canShowData && !loading && !error && !userStats, [canShowData, loading, error, userStats])

  const value: UserStatsContextValue = {
    userStats,
    loading,
    hasNoData,
    error,
    canShowData,
    profilePfpImage,
    profileOwnsPfp,
    profileHasImuranBook,
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
