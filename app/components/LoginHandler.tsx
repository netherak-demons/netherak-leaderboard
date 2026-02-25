'use client'

import { useEffect, useRef } from 'react'
import { useAccount, useConnection } from 'wagmi'

type ConnectorWithSequenceWaas = {
  sequenceWaas?: { getIdToken: (args?: { nonce?: string }) => Promise<{ idToken: string }> }
}

/**
 * On Sequence login, creates/registers the user in the DB via POST /api/user.
 * Uses JWT from sequenceWaas and a random default username.
 */
export default function LoginHandler() {
  const { address, isConnected } = useAccount()
  const { connector } = useConnection()
  const registeredRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isConnected || !address) return

    // Avoid re-registering on every render; only once per address per session
    if (registeredRef.current === address) return
    registeredRef.current = address

    const sequenceWaas = (connector as ConnectorWithSequenceWaas)?.sequenceWaas
    if (!sequenceWaas) return // Not a WaaS connection (e.g. MetaMask), skip

    let cancelled = false
    ;(async () => {
      try {
        const { idToken } = await sequenceWaas.getIdToken()
        if (cancelled) return

        const randomSuffix = Math.random().toString(36).slice(2, 8)
        const defaultUsername = `Player_${randomSuffix}`

        const res = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            username: defaultUsername,
            linkedWallet: '',
          }),
        })

        if (cancelled) return
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isConnected, address, connector])

  // Reset when user disconnects so we register again on next connect
  useEffect(() => {
    if (!isConnected) {
      registeredRef.current = null
    }
  }, [isConnected])

  return null
}
