'use client'

import React from 'react'
import Link from 'next/link'
import ConnectButton from './ConnectButton'

const EXTERNAL_LINKS = {
  shop: 'https://fascinating-alpaca-40611.sequence.market/shop',
  marketplace: 'https://fascinating-alpaca-40611.sequence.market/market/',
}

interface HeaderProps {
  currentRoute?: 'leaderboards' | 'account'
}

export default function Header({ currentRoute = 'leaderboards' }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between gap-4"
      style={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(36, 36, 36, 0.8)',
      }}
    >
      {/* Left: placeholder stats */}
      <div className="flex items-center gap-6 min-w-0">
        <div
          className="text-sm font-medium text-primary flex items-center gap-2"
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          <span className="text-secondary">Evil points:</span>
          <span className="text-white">x</span>
        </div>
        <div
          className="text-sm font-medium text-primary flex items-center gap-2"
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          <span className="text-secondary">Multiplier:</span>
          <span className="text-white">x</span>
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
          style={{ fontFamily: 'var(--font-harmonique)' }}
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
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          Leaderboards
        </Link>
        <a
          href={EXTERNAL_LINKS.shop}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-medium uppercase tracking-wider text-secondary hover:text-primary transition-colors"
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          Imuran shop
        </a>
        <a
          href={EXTERNAL_LINKS.marketplace}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-medium uppercase tracking-wider text-secondary hover:text-primary transition-colors"
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          Marketplace
        </a>
      </nav>

      {/* Right: connect button */}
      <div className="shrink-0">
        <ConnectButton />
      </div>
    </header>
  )
}
