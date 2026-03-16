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

    const unwrapDynamo = (value: unknown): unknown => {
      if (!value || typeof value !== 'object') return value
      const obj = value as Record<string, unknown>
      if ('S' in obj) return obj.S
      if ('BOOL' in obj) return obj.BOOL
      if ('N' in obj) return obj.N
      if ('M' in obj) return obj.M
      return value
    }

    const pickString = (sources: unknown[], keys: string[]): string | null => {
      for (const sourceRaw of sources) {
        const source = unwrapDynamo(sourceRaw)
        if (!source || typeof source !== 'object') continue
        const src = source as Record<string, unknown>
        for (const key of keys) {
          const value = unwrapDynamo(src[key])
          if (typeof value === 'string' && value.trim().length > 0) {
            return value.trim()
          }
        }
      }
      return null
    }

    const pickBoolean = (sources: unknown[], keys: string[]): boolean | null => {
      for (const sourceRaw of sources) {
        const source = unwrapDynamo(sourceRaw)
        if (!source || typeof source !== 'object') continue
        const src = source as Record<string, unknown>
        for (const key of keys) {
          const value = unwrapDynamo(src[key])
          if (typeof value === 'boolean') return value
          if (typeof value === 'string') {
            if (value.toLowerCase() === 'true') return true
            if (value.toLowerCase() === 'false') return false
          }
        }
      }
      return null
    }

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

        // Source of truth for profile identity/assets is /api/user.
        try {
          const userRes = await fetch('/api/user', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          })
          if (!cancelled && userRes.ok) {
            const userRaw = await userRes.json()
            const profileRaw = userRaw?.profile
            const profile = unwrapDynamo(profileRaw)
            const profileValues = unwrapDynamo(
              profile && typeof profile === 'object'
                ? (profile as Record<string, unknown>).values
                : undefined
            )
            const rootValues = unwrapDynamo(userRaw?.values)
            const sources = [profile, profileValues, rootValues, userRaw]

            const userPfpImage = pickString(sources, ['PFPImage', 'PFPimage', 'pfpImage'])
            const userOwnsPfp = pickBoolean(sources, ['ownsPFP'])
            const userOwnsImuranBook = pickBoolean(sources, ['ownsImuranBook', 'ownsImmuranBook'])
            const userWallet = pickString(sources, ['wallet', 'SEQUENCEWALLET', 'sequenceWallet']) ?? ''
            const userUsername = pickString(sources, ['username']) ?? ''

            // console.log('[UserStatsContext] /api/user PFP candidates', {
            //   topLevelKeys: userRaw && typeof userRaw === 'object' ? Object.keys(userRaw) : [],
            //   profileKeys: profile && typeof profile === 'object' ? Object.keys(profile as Record<string, unknown>) : [],
            //   profileValuesKeys: profileValues && typeof profileValues === 'object' ? Object.keys(profileValues as Record<string, unknown>) : [],
            //   rootValuesKeys: rootValues && typeof rootValues === 'object' ? Object.keys(rootValues as Record<string, unknown>) : [],
            //   rootPFPImage: userRaw?.PFPImage,
            //   rootPFPimage: userRaw?.PFPimage,
            //   rootpfpImage: userRaw?.pfpImage,
            //   selectedPfpImage: userPfpImage,
            //   selectedOwnsPfp: userOwnsPfp,
            //   selectedOwnsImuranBook: userOwnsImuranBook,
            // })

            setUserFromApi({
              wallet: userWallet,
              username: userUsername,
            })
            setProfilePfpImage(userPfpImage)
            setProfileOwnsPfp(userOwnsPfp)
            setProfileHasImuranBook(userOwnsImuranBook)
          }
          if (!cancelled && !userRes.ok) {
            const userText = await userRes.text().catch(() => '')
            // console.warn('[UserStatsContext] /api/user failed', {
            //   status: userRes.status,
            //   body: userText.slice(0, 400),
            // })
          }
        } catch {
          // Non-fatal: season stats can still load even if /api/user fails.
        }

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
      } catch (err) {
        if (!cancelled) {
          setUserStats(null)
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
