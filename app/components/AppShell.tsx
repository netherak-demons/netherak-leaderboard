'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const currentRoute = pathname?.startsWith('/account') ? 'account' : 'leaderboards'

  return (
    <>
      {/* Background */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/background.svg')", zIndex: 0 }}
      />
      <Header currentRoute={currentRoute} />
      <main className="relative z-10 flex-1">{children}</main>
    </>
  )
}
