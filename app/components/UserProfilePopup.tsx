'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useAccount, useConnection, useDisconnect } from 'wagmi'
import { LogOut, Save, X } from 'lucide-react'
import { clearCachedPlayers } from '../hooks/playersCache'
import { getDataMode } from '../utils/dataMode'

import type { UserStats } from '../hooks/useUserStats'

type ConnectorWithSequenceWaas = { sequenceWaas?: { getIdToken: (args?: { nonce?: string }) => Promise<{ idToken: string }> } }

function shortenAddress(addr: string) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

interface UserProfilePopupProps {
  isOpen: boolean
  onClose: () => void
  userStats: UserStats | null
  pfpUrl?: string
}

const DEFAULT_PFP = '/demons/avatar1.svg'

export default function UserProfilePopup({
  isOpen,
  onClose,
  userStats,
  pfpUrl,
}: UserProfilePopupProps) {
  const { address } = useAccount()
  const { connector } = useConnection()
  const { disconnect } = useDisconnect()
  const sequenceWaaS = (connector as ConnectorWithSequenceWaas)?.sequenceWaas

  const [username, setUsername] = useState('')
  const [linkedWallet, setLinkedWallet] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Data: prefer userStats (season-stats). If null (user not in leaderboard), fetch GET /api/user with JWT
  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setSaved(false)

    if (userStats) {
      setUsername(userStats.username ?? '')
      setLinkedWallet(userStats.linkedWallet ?? '')
      setEmail('') // season-stats strips email
      return
    }

    // User not in season-stats: fetch from GET /api/user (JWT from sequenceWaas.getIdToken())
    if (!sequenceWaaS || !address) {
      setUsername('')
      setLinkedWallet('')
      setEmail('')
      return
    }

    let cancelled = false
    sequenceWaaS.getIdToken().then(({ idToken }) => {
      if (cancelled) return
      return fetch('/api/user', {
        method: 'GET',
        headers: { Authorization: `Bearer ${idToken}` },
      })
    }).then((res) => {
      if (!res || cancelled) return
      if (res.ok) {
        return res.json().then((data: { wallet?: string; username?: string; email?: string; linkedWallet?: string; profile?: { username?: string; email?: string; linkedWallet?: string; LINKEDWALLET?: string } }) => {
          if (cancelled) return
          setUsername(data.username ?? data.profile?.username ?? '')
          setLinkedWallet(data.profile?.linkedWallet ?? data.profile?.LINKEDWALLET ?? data.linkedWallet ?? '')
          setEmail(data.email ?? data.profile?.email ?? '')
        })
      }
    }).catch(() => {
      if (!cancelled) {
        setUsername('')
        setLinkedWallet('')
        setEmail('')
      }
    })

    return () => { cancelled = true }
  }, [isOpen, userStats, sequenceWaaS, address])

  const handleSave = useCallback(async () => {
    if (!sequenceWaaS || !address) {
      setError('Wallet connection does not support profile updates')
      return
    }
    if (!username.trim() && !linkedWallet.trim()) {
      setError('Provide at least a username or linked wallet')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const { idToken } = await sequenceWaaS.getIdToken()
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          linkedWallet: linkedWallet.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      // Backend may return raw DynamoDB keys (LINKEDWALLET) or normalized (linkedWallet)
      const profile = data.profile ?? {}
      const savedUsername = profile.username ?? data.username ?? username
      const savedLinkedWallet = profile.linkedWallet ?? profile.LINKEDWALLET ?? linkedWallet
      const savedEmail = profile.email ?? profile.values?.email ?? data.email ?? email
      setUsername(savedUsername)
      setLinkedWallet(savedLinkedWallet)
      setEmail(savedEmail)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      clearCachedPlayers()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('netherak:refreshUser'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [sequenceWaaS, address, username, linkedWallet])

  const handleLogout = useCallback(() => {
    onClose()
    disconnect()
  }, [onClose, disconnect])

  if (!isOpen) return null

  const gameWallet = userStats?.wallet ?? address ?? ''
  const displayPfp = pfpUrl || DEFAULT_PFP
  const isObservationMode = getDataMode() === 'observation'
  const isViewingOtherUser =
    isObservationMode &&
    (!address || (userStats?.wallet && userStats.wallet.toLowerCase() !== address.toLowerCase()))
  const canEdit = !isViewingOtherUser && !!address

  return (
    <>
      <div
        className="fixed inset-0 z-100 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 z-101 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-xl"
        style={{ fontFamily: 'var(--font-harmonique)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-primary">Profile</h3>
          {isViewingOtherUser && (
            <span className="text-xs text-amber-400/90 mr-2">View only (observation)</span>
          )}
          <button
            onClick={onClose}
            className="rounded p-1 text-secondary hover:bg-white/10 hover:text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center gap-2">
          <img
            src={displayPfp}
            alt="Profile"
            className="h-20 w-20 rounded-full object-cover bg-[#2a2a2a]"
            style={{ border: '0.25px solid #FD9D83' }}
          />
          {username && (
            <span className="text-base font-medium text-primary">{username}</span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-secondary">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => canEdit && setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={!canEdit}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-primary placeholder:text-secondary/70 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {email && (
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-secondary">
                Email
              </label>
              <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-secondary">
                {email}
              </p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-secondary">
              Game wallet
            </label>
            <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-secondary">
              {gameWallet ? shortenAddress(gameWallet) : '—'}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-secondary">
              Secondary wallet
            </label>
            <input
              type="text"
              value={linkedWallet}
              onChange={(e) => canEdit && setLinkedWallet(e.target.value)}
              placeholder="0x..."
              disabled={!canEdit}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-primary placeholder:text-secondary/70 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-netherak">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={!canEdit || saving || (!username.trim() && !linkedWallet.trim())}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 transition-colors disabled:opacity-50 ${
              saved
                ? 'border-green-netherak bg-green-netherak/20 text-green-netherak'
                : error
                  ? 'border-red-netherak bg-red-netherak/20 text-red-netherak'
                  : 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            <Save className="h-4 w-4" strokeWidth={2} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
          <button
            onClick={handleLogout}
            disabled={!address}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-secondary py-2.5 text-connect-button-text transition-colors hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.5} />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
