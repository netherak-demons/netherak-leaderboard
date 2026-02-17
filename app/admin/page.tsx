'use client'

/**
 * Backoffice page for managing users
 * Allows searching users and updating whitelist/extra points
 */

import { useState } from 'react'
import BackofficeAuth from '../components/BackofficeAuth'
import { searchUser, updateUser, User, UpdateUserParams } from '../services/backofficeUserService'

export default function Backoffice() {
  const [searchType, setSearchType] = useState<'wallet' | 'username'>('wallet')
  const [searchValue, setSearchValue] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isWhitelisted, setIsWhitelisted] = useState(false)
  const [extraPoints, setExtraPoints] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Please enter a search value')
      return
    }

    setLoading(true)
    setError(null)
    setUser(null)
    setSaveSuccess(false)

    const params = searchType === 'wallet' 
      ? { wallet: searchValue.trim() }
      : { username: searchValue.trim() }

    const result = await searchUser(params)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.user) {
      setUser(result.user)
      setIsWhitelisted(result.user.isWhitelisted || false)
      setExtraPoints(result.user.extraPoints || 0)
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setError(null)
    setSaveSuccess(false)

    const params: UpdateUserParams = {
      wallet: user.wallet,
      isWhitelisted,
      extraPoints: Number(extraPoints) || 0,
    }

    const result = await updateUser(params)

    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }

    setSaveSuccess(true)
    setSaving(false)

    // Update local user state
    setUser({
      ...user,
      isWhitelisted,
      extraPoints: Number(extraPoints) || 0,
    })
  }

  return (
    <BackofficeAuth>
      <div className="relative min-h-screen w-full overflow-x-hidden flex justify-center items-start p-8">
        <div className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "url('/background.svg')", zIndex: 0 }}></div>
        <div className="relative z-10 max-w-[800px] w-full bg-[#00000080] border border-white/5 rounded-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h1 className="text-[#eae3d3] text-[2.5rem] mb-2" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Backoffice
          </h1>
          <p className="text-[#b8b8b8] mb-8 text-base">
            Manage user whitelist and extra points
          </p>

          {/* Search Section */}
          <div className="mb-8 p-6 rounded-lg border border-[rgba(234,227,211,0.1)]">
            <h2 className="text-[#eae3d3] text-2xl mb-4" style={{ fontFamily: 'var(--font-harmonique)' }}>
              Search User
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <button
                  className={`flex-1 py-3 px-4 rounded-md transition-all duration-300 text-sm ${
                    searchType === 'wallet'
                      ? 'bg-[rgba(234,227,211,0.3)] border border-[#eae3d3] text-[#eae3d3]'
                      : 'bg-[rgba(234,227,211,0.1)] border border-[rgba(234,227,211,0.2)] text-[#eae3d3] hover:bg-[rgba(234,227,211,0.2)]'
                  }`}
                  onClick={() => setSearchType('wallet')}
                >
                  By Wallet
                </button>
                <button
                  className={`flex-1 py-3 px-4 rounded-md transition-all duration-300 text-sm ${
                    searchType === 'username'
                      ? 'bg-[rgba(234,227,211,0.3)] border border-[#eae3d3] text-[#eae3d3]'
                      : 'bg-[rgba(234,227,211,0.1)] border border-[rgba(234,227,211,0.2)] text-[#eae3d3] hover:bg-[rgba(234,227,211,0.2)]'
                  }`}
                  onClick={() => setSearchType('username')}
                >
                  By Username
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={searchType === 'wallet' ? '0x...' : 'Username'}
                  className="flex-1 py-3 px-4 bg-[rgba(0,0,0,0.8)] border border-[rgba(234,227,211,0.2)] rounded-md text-[#eae3d3] text-base focus:outline-none focus:border-[#eae3d3]"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="py-3 px-6 bg-[#eae3d3] text-[#1a1a2e] border-none rounded-md cursor-pointer font-semibold transition-all duration-300 text-base hover:bg-[#d4c9b0] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-[rgba(255,140,138,0.2)] border border-[rgba(255,140,138,0.5)] rounded-md text-[#ff8c8a] mb-4">
              {error}
            </div>
          )}

          {/* User Details Section */}
          {user && (
            <div className="mb-8 p-6 rounded-lg border border-[rgba(234,227,211,0.1)]">
              <h2 className="text-[#eae3d3] text-2xl mb-4" style={{ fontFamily: 'var(--font-harmonique)' }}>
                User Details
              </h2>
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex gap-4 py-3 bg-[rgba(0,0,0,0.5)] rounded-md px-3">
                  <span className="text-[#b8b8b8] font-semibold min-w-[100px]">Wallet:</span>
                  <span className="text-[#eae3d3] break-all">{user.wallet}</span>
                </div>
                <div className="flex gap-4 py-3 bg-[rgba(0,0,0,0.5)] rounded-md px-3">
                  <span className="text-[#b8b8b8] font-semibold min-w-[100px]">Username:</span>
                  <span className="text-[#eae3d3]">
                    {user.username || user.profile?.username || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[rgba(234,227,211,0.1)]">
                <h3 className="text-[#eae3d3] text-xl mb-4">
                  Edit User
                </h3>
                
                <div className="mb-6">
                  <label className="flex items-center gap-3 text-[#eae3d3] text-base cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWhitelisted}
                      onChange={(e) => setIsWhitelisted(e.target.checked)}
                      className="w-5 h-5 cursor-pointer accent-[#eae3d3]"
                    />
                    <span>Whitelisted</span>
                  </label>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-3 text-[#eae3d3] text-base">
                    Extra Points:
                    <input
                      type="number"
                      value={extraPoints}
                      onChange={(e) => setExtraPoints(Number(e.target.value) || 0)}
                      min="0"
                      className="ml-3 py-2 px-4 bg-[rgba(0,0,0,0.8)] border border-[rgba(234,227,211,0.2)] rounded-md text-[#eae3d3] text-base w-[120px] focus:outline-none focus:border-[#eae3d3]"
                    />
                  </label>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="py-3 px-6 bg-[#eae3d3] text-[#1a1a2e] border-none rounded-md cursor-pointer font-semibold transition-all duration-300 text-base hover:bg-[#d4c9b0] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                {saveSuccess && (
                  <div className="mt-4 p-4 bg-[rgba(76,175,80,0.2)] border border-[rgba(76,175,80,0.5)] rounded-md text-[#4caf50]">
                    Changes saved successfully!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </BackofficeAuth>
  )
}
