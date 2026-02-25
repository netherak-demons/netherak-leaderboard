'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnection } from 'wagmi'
import { getDataMode, normalizeLinkedWallet } from '../utils/dataMode'
import SomniaQuesterPopUp from './SomniaQuesterPopUp'

type ConnectorWithSequenceWaas = {
  sequenceWaas?: { getIdToken: (args?: { nonce?: string }) => Promise<{ idToken: string }> }
}

const REFRESH_EVENT = 'netherak:refreshUser'

/**
 * Shows SomniaQuesterPopUp after login only when the user has no linked wallet in their profile.
 * Fetches from GET /api/user to check. Runs at app level (Providers).
 */
export default function SomniaQuesterHandler() {
  const { address, isConnected } = useAccount()
  const { connector } = useConnection()
  const sequenceWaas = (connector as ConnectorWithSequenceWaas)?.sequenceWaas

  const [showPopup, setShowPopup] = useState(false)
  const [linkedWallet, setLinkedWallet] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const handler = () => setRefreshTrigger((n) => n + 1)
    if (typeof window !== 'undefined') {
      window.addEventListener(REFRESH_EVENT, handler)
      return () => window.removeEventListener(REFRESH_EVENT, handler)
    }
  }, [])

  useEffect(() => {
    if (!isConnected || !address || !sequenceWaas) {
      setShowPopup(false)
      setLoading(false)
      return
    }

    // In observation mode we show the observation wallet's data (which may have linkedWallet).
    // Don't prompt the connected user to add their linked wallet—it's confusing.
    if (getDataMode() === 'observation') {
      setShowPopup(false)
      setLoading(false)
      return
    }

    if (dismissed) return

    let cancelled = false
    setLoading(true)

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
              profile?: { linkedWallet?: string; LINKEDWALLET?: string }
              linkedWallet?: string
            }) => {
              if (cancelled) return
              const w = normalizeLinkedWallet(
                data.profile?.linkedWallet ?? data.profile?.LINKEDWALLET ?? data.linkedWallet
              )
              setLinkedWallet(w)
              setShowPopup(!w.trim())
            }
          )
        }
        // 404 or error: user may not exist yet (just logged in) - show popup to add linked wallet
        if (res.status === 404) {
          setLinkedWallet('')
          setShowPopup(true)
        } else {
          setShowPopup(false)
        }
      })
      .catch(() => {
        if (!cancelled) setShowPopup(false)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isConnected, address, sequenceWaas, dismissed, refreshTrigger])

  const handleClose = () => {
    setDismissed(true)
    setShowPopup(false)
  }

  const handleSaved = () => {
    setDismissed(true)
    setShowPopup(false)
  }

  return (
    <SomniaQuesterPopUp
      isOpen={showPopup}
      onClose={handleClose}
      initialLinkedWallet={linkedWallet}
      onSaved={handleSaved}
    />
  )
}
