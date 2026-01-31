'use client'

/**
 * Authentication component for backoffice
 * Protects the backoffice route with a password
 * 
 * Note: This is a simple frontend-only authentication.
 * For production, password validation should be done on the backend.
 */

import { useState, useEffect } from 'react'

const BACKOFFICE_PASSWORD = 'demons'
const AUTH_KEY = 'backoffice_authenticated'

interface BackofficeAuthProps {
  children: React.ReactNode
}

export default function BackofficeAuth({ children }: BackofficeAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = sessionStorage.getItem(AUTH_KEY)
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
    setChecking(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password === BACKOFFICE_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true')
      setIsAuthenticated(true)
      setPassword('')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center p-8">
        <div className="bg-[rgba(0,0,0,0.9)] rounded-xl p-12 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(234,227,211,0.1)] max-w-[400px] w-full">
          <div className="text-[#eae3d3] text-center text-base">Checking authentication...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center p-8">
        <div className="bg-[rgba(0,0,0,0.9)] rounded-xl p-12 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(234,227,211,0.1)] max-w-[400px] w-full">
          <h1 className="text-[#eae3d3] text-3xl mb-2 text-center" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Backoffice Access
          </h1>
          <p className="text-[#b8b8b8] text-center mb-8 text-sm">
            Enter password to continue
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="py-3 px-4 bg-[rgba(0,0,0,0.8)] border border-[rgba(234,227,211,0.2)] rounded-md text-[#eae3d3] text-base w-full box-border focus:outline-none focus:border-[#eae3d3]"
              autoFocus
            />
            {error && (
              <div className="py-3 px-4 bg-[rgba(255,140,138,0.2)] border border-[rgba(255,140,138,0.5)] rounded-md text-[#ff8c8a] text-center text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="py-3 px-6 bg-[#eae3d3] text-[#1a1a2e] border-none rounded-md cursor-pointer font-semibold transition-all duration-300 text-base w-full hover:bg-[#d4c9b0] hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={checking}
            >
              {checking ? 'Authenticating...' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
