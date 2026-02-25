'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAccount, useConnection } from 'wagmi'
import { CircleCheck, Info } from 'lucide-react'
import { clearCachedPlayers } from '../hooks/playersCache'
import { normalizeLinkedWallet } from '../utils/dataMode'

type ConnectorWithSequenceWaas = {
  sequenceWaas?: { getIdToken: (args?: { nonce?: string }) => Promise<{ idToken: string }> }
}

interface SomniaQuesterPopUpProps {
  isOpen: boolean
  onClose: () => void
  initialLinkedWallet?: string
  onSaved?: (linkedWallet: string) => void
}

export default function SomniaQuesterPopUp({
  isOpen,
  onClose,
  initialLinkedWallet = '',
  onSaved,
}: SomniaQuesterPopUpProps) {
  const { address } = useAccount()
  const { connector } = useConnection()
  const sequenceWaas = (connector as ConnectorWithSequenceWaas)?.sequenceWaas

  const [linkedWallet, setLinkedWallet] = useState(initialLinkedWallet)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [currentUsername, setCurrentUsername] = useState('')
  const [tooltipVisible, setTooltipVisible] = useState(false)

  // Sync initial value and fetch current user when open
  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setSaved(false)
    setLinkedWallet(normalizeLinkedWallet(initialLinkedWallet))

    if (!sequenceWaas || !address) return

    let cancelled = false
    sequenceWaas
      .getIdToken()
      .then(({ idToken }) => {
        if (cancelled) return
        return fetch('/api/user', {
          method: 'GET',
          headers: { Authorization: `Bearer ${idToken}` },
        })
      })
      .then((res) => {
        if (!res || cancelled) return
        if (res.ok) {
          return res.json().then(
            (data: {
              username?: string
              profile?: { username?: string; linkedWallet?: string; LINKEDWALLET?: string }
            }) => {
              if (cancelled) return
              const username = data.username ?? data.profile?.username ?? ''
              const existingLinked =
                data.profile?.linkedWallet ?? data.profile?.LINKEDWALLET ?? ''
              setCurrentUsername(username)
              if (!initialLinkedWallet && existingLinked) {
                setLinkedWallet(normalizeLinkedWallet(existingLinked))
              }
            }
          )
        }
      })
      .catch(() => {
        if (!cancelled) setCurrentUsername('')
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, initialLinkedWallet, sequenceWaas, address])

  const handleConfirm = useCallback(async () => {
    const trimmed = linkedWallet.trim()
    if (!trimmed) {
      setError('Please enter your Somnia Quest wallet address')
      return
    }
    if (!sequenceWaas || !address) {
      setError('Wallet connection required')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const { idToken } = await sequenceWaas.getIdToken()
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          username: currentUsername || `Player_${address.slice(2, 8)}`,
          linkedWallet: trimmed,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      clearCachedPlayers()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('netherak:refreshUser'))
      }
      onSaved?.(trimmed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [linkedWallet, sequenceWaas, address, currentUsername, onSaved])

  const handleAddLater = useCallback(() => {
    onClose()
  }, [onClose])

  if (!isOpen) return null

  const glassStyle = {
    backgroundColor: 'transparent',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
    border: '0.5px solid rgba(255, 255, 255, 0.1)',
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 flex flex-col items-center text-center"
        style={{ fontFamily: 'var(--font-harmonique)', ...glassStyle }}
      >
        <h2 className="text-xl font-semibold text-white mb-1">Somnia Quester?</h2>
        <p className="text-white/90 text-sm mb-6">
          Add your Somnia quest-wallet address so we can connect it with your game wallet.
        </p>

        <div className="mb-4 w-full">
          <div className="flex items-center justify-center gap-2 mb-2">
            <label className="text-white text-sm font-medium">
              Enter Your Somnia Quest Wallet Address
            </label>
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
                onFocus={() => setTooltipVisible(true)}
                onBlur={() => setTooltipVisible(false)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '0.5px solid rgba(255, 255, 255, 0.2)',
                }}
                aria-label="Info"
              >
                <Info className="w-3 h-3" strokeWidth={2.5} />
              </button>
              {tooltipVisible && (
                <div
                  className="absolute right-0 bottom-full mb-1 z-10 px-3 py-2 rounded-lg text-white/90 text-xs whitespace-nowrap"
                  style={glassStyle}
                >
                  Metamask, Rabby, etc.
                </div>
              )}
            </div>
          </div>
          <input
            type="text"
            value={linkedWallet}
            onChange={(e) => setLinkedWallet(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-lg px-3 py-2.5 text-white placeholder:text-white/40 font-mono text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            style={{
              backgroundColor: 'transparent',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '0.5px solid rgba(255, 255, 255, 0.1)',
            }}
          />
          <p className="text-white/50 text-xs mt-2">
            Note: You can change it later in your profile section.
          </p>
        </div>

        {error && (
          <p className="text-red-netherak text-sm mb-4">{error}</p>
        )}

        <div className="flex flex-col gap-3 mb-6 w-full">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || !linkedWallet.trim()}
            className={`flex items-center justify-center gap-2 w-full rounded-lg py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              saved
                ? 'border border-green-netherak text-green-netherak'
                : 'text-white hover:opacity-90'
            }`}
            style={
              saved
                ? {
                    backgroundColor: 'transparent',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '0.5px solid rgba(131, 233, 150, 0.5)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
                  }
                : glassStyle
            }
          >
            <CircleCheck className="w-5 h-5 shrink-0" strokeWidth={2} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Confirm Wallet'}
          </button>
          <button
            type="button"
            onClick={handleAddLater}
            className="w-full rounded-lg py-3 text-white/90 hover:text-white transition-colors"
            style={glassStyle}
          >
            I&apos;ll add it later / I&apos;m no quester
          </button>
        </div>

        <p className="text-sm text-[#FFA474] mb-6 max-w-sm">
          IMPORTANT:
          We need your Somnia Quest Wallet address to validate the completion of the Somnia Quest.
        </p>

        <div className="flex justify-center">
          <img src="/somnia-logo.svg" alt="Somnia" className="h-5 w-auto opacity-80" />
        </div>
      </div>
    </>
  )
}
