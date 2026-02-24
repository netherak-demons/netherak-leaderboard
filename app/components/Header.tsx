'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import ConnectButton from './ConnectButton'
import { Flame, Settings } from 'lucide-react'
import { useUserPfp } from '../hooks/useUserPfp'
import { useUserStats } from '../hooks/useUserStats'
import { useImuranBookOwnership } from '../hooks/useImuranBookOwnership'
import { getEffectiveWallet } from '../utils/dataMode'
import { getMultiplier } from '../config/multiplier'

const EXTERNAL_LINKS = {
  shop: 'https://fascinating-alpaca-40611.sequence.market/shop',
  marketplace: 'https://fascinating-alpaca-40611.sequence.market/market/',
}

export default function Header() {
  const pathname = usePathname()
  const currentRoute = pathname?.startsWith('/account') ? 'account' : 'leaderboards'
  const { address } = useAccount()
  const effectiveWallet = getEffectiveWallet(address)
  const { pfpUrl } = useUserPfp(effectiveWallet)
  const { userStats } = useUserStats(effectiveWallet)
  const walletForBook = (userStats?.linkedWallet || userStats?.wallet) ?? effectiveWallet
  const { hasBook: hasImuranBook } = useImuranBookOwnership(walletForBook)
  const multiplier = getMultiplier(hasImuranBook, !!pfpUrl)
  const evilPoints = userStats?.evilPoints ?? 0

  return (
    <header
      className="relative z-50 px-6 py-4 flex items-center justify-between gap-4"
      style={{
        fontFamily: 'var(--font-harmonique)',
      }}
    >
      {/* Left: evil points + multiplier */}
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="font-medium text-primary flex items-center gap-2"
        >
          <img src="/evil.svg" alt="Evil points" className="w-5 h-6 shrink-0" />
          <span className="text-green-netherak">{evilPoints.toLocaleString()}</span>
          <span className="text-white text-lg">EVIL</span>
        </div>
        <div
          className="font-medium text-primary flex items-center gap-2 bg-white/10 rounded-md px-2 py-1"
        >
          <Flame className="w-4 h-4 shrink-0" style={{ color: '#FFD36C' }} strokeWidth={2} />
          <span className="text-white text-lg">x{multiplier}</span>
        </div>
      </div>

      {/* Center: nav links */}
      <nav className="flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        <Link
          href="/account"
          className={`text-base font-medium uppercase tracking-wider transition-colors ${
            currentRoute === 'account'
              ? 'text-primary'
              : 'text-secondary hover:text-primary'
          }`}
        >
          My account
        </Link>
        <Link
          href="/"
          className={`text-base font-medium uppercase tracking-wider transition-colors ${
            currentRoute === 'leaderboards'
              ? 'text-primary'
              : 'text-secondary hover:text-primary'
          }`}
        >
          Leaderboards
        </Link>
        <a
          href={EXTERNAL_LINKS.shop}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-medium uppercase tracking-wider text-secondary hover:text-primary transition-colors"
        >
          Imuran shop
        </a>
        <a
          href={EXTERNAL_LINKS.marketplace}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-medium uppercase tracking-wider text-secondary hover:text-primary transition-colors"
        >
          Marketplace
        </a>
      </nav>

      {/* Right: settings + connect button */}
      <div className="relative shrink-0 flex items-center gap-3">
        <button
          type="button"
          className="z-10 absolute left-1/2 ranslate-x-1/2 bottom-1/2 rounded-full p-2 text-secondary transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" strokeWidth={2} />
        </button>
        <ConnectButton pfpUrl={pfpUrl ?? undefined} userStats={userStats ?? undefined} />
      </div>
    </header>
  )
}
