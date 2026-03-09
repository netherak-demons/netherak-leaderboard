'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import ConnectButton from './ConnectButton'
import { Flame, Menu, X } from 'lucide-react'
import { useUserPfp } from '../hooks/useUserPfp'
import { useUserStats } from '../hooks/useUserStats'
import { useImuranBookOwnership } from '../hooks/useImuranBookOwnership'
import { getEffectiveWallet } from '../utils/dataMode'
import { getMultiplier } from '../config/multiplier'
import { applyEvilPointsMultiplier } from '../utils/evilPoints'

const EXTERNAL_LINKS = {
  shop: 'https://fascinating-alpaca-40611.sequence.market/shop',
  marketplace: 'https://fascinating-alpaca-40611.sequence.market/market/',
}

export default function Header() {
  const pathname = usePathname()
  const currentRoute = pathname?.startsWith('/account') ? 'account' : 'leaderboards'
  const { address, isConnected } = useAccount()
  const effectiveWallet = getEffectiveWallet(address)
  const { userStats } = useUserStats(effectiveWallet)
  // Check main + linked + effective wallet (same as CursedItems) so PFP shows when in linked wallet
  const walletsForPfp = [userStats?.wallet, userStats?.linkedWallet, effectiveWallet].filter(
    (w): w is string => !!w && typeof w === 'string'
  )
  const { pfpUrl } = useUserPfp(walletsForPfp)
  const walletsForBook = [userStats?.wallet, userStats?.linkedWallet, effectiveWallet].filter(
    (w): w is string => !!w && typeof w === 'string'
  )
  const { hasBook: hasImuranBook } = useImuranBookOwnership(walletsForBook)
  const multiplier = getMultiplier(hasImuranBook, !!pfpUrl)
  const baseEvilPoints = userStats?.baseEvilPoints ?? 0
  const extraEvilPoints = userStats?.extraEvilPoints ?? 0
  const evilPoints = applyEvilPointsMultiplier(baseEvilPoints, extraEvilPoints, hasImuranBook, !!pfpUrl)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const navLinkBase =
    'nav-link-underline relative inline-block text-base font-medium uppercase tracking-wider transition-colors'
  const navLinkActive = 'nav-link-underline-active'

  const navLinks = (
    <>
      <Link
        href="/account"
        onClick={() => setMobileMenuOpen(false)}
        className={`${navLinkBase} ${
          currentRoute === 'account'
            ? 'text-primary ' + navLinkActive
            : 'text-secondary hover:text-primary'
        }`}
      >
        My Demon
      </Link>
      <Link
        href="/"
        onClick={() => setMobileMenuOpen(false)}
        className={`${navLinkBase} ${
          currentRoute === 'leaderboards'
            ? 'text-primary ' + navLinkActive
            : 'text-secondary hover:text-primary'
        }`}
      >
        Leaderboards
      </Link>
      <a
        href={EXTERNAL_LINKS.shop}
        target="_blank"
        rel="noopener noreferrer"
        className={`${navLinkBase} text-secondary hover:text-primary text-center`}
      >
        Imuran shop
      </a>
      <a
        href={EXTERNAL_LINKS.marketplace}
        target="_blank"
        rel="noopener noreferrer"
        className={`${navLinkBase} text-secondary hover:text-primary`}
      >
        Marketplace
      </a>
    </>
  )

  return (
    <>
      <header
        className="relative z-50 px-4 sm:px-6 py-4 flex items-center justify-between gap-4"
        style={{
          fontFamily: 'var(--font-harmonique)',
        }}
      >
        {/* Mobile: hamburger left (below lg) */}
        <div className="flex items-center gap-4 min-w-0 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded p-2 text-secondary hover:bg-white/10 hover:text-primary transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        {/* Desktop: evil points + multiplier left (lg+) */}
        <div className="hidden lg:flex items-center gap-4 min-w-0">
          <div className="font-medium text-primary flex items-center gap-2">
            <img src="/evil.svg" alt="Evil points" className="w-5 h-6 shrink-0" />
            <span className="text-green-netherak">{evilPoints.toLocaleString()}</span>
            <span className="text-white text-lg">EVIL</span>
          </div>
          <div className="font-medium text-primary flex items-center gap-2 bg-white/10 rounded-md px-2 py-1">
            <Flame className="w-4 h-4 shrink-0" style={{ color: '#FFD36C' }} strokeWidth={2} />
            <span className="text-white text-lg">x{multiplier}</span>
          </div>
        </div>

        {/* Desktop: center nav (lg+) */}
        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {navLinks}
        </nav>

        {/* Right: PFP (with settings overlay when connected) */}
        <div className="shrink-0 flex items-center">
          <ConnectButton pfpUrl={pfpUrl ?? undefined} userStats={userStats ?? undefined} />
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-60 bg-black/60 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed top-0 left-0 z-61 w-full max-w-[280px] h-full bg-[#1a1a1a] border-r border-white/10 shadow-xl lg:hidden flex flex-col p-6"
            style={{ fontFamily: 'var(--font-harmonique)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-medium text-primary uppercase tracking-wider">Menu</h2>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded p-2 text-secondary hover:bg-white/10 hover:text-primary"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="font-medium text-primary flex items-center gap-2">
                  <img src="/evil.svg" alt="Evil points" className="w-5 h-6 shrink-0" />
                  <span className="text-green-netherak">{evilPoints.toLocaleString()}</span>
                  <span className="text-white">EVIL</span>
                </div>
                <div className="font-medium text-primary flex items-center gap-2 bg-white/10 rounded-md px-2 py-1">
                  <Flame className="w-4 h-4 shrink-0" style={{ color: '#FFD36C' }} strokeWidth={2} />
                  <span className="text-white">x{multiplier}</span>
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <nav className="flex flex-col gap-4">
                {navLinks}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  )
}
