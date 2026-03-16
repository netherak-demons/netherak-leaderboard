'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SequenceConnect } from '@0xsequence/connect'
import { config } from '../config/sequence'
import { useState } from 'react'
import LoginHandler from './LoginHandler'
import SomniaQuesterHandler from './SomniaQuesterHandler'
import DataLoader from './DataLoader'
import { UserStatsProvider } from '../account/context/UserStatsContext'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SequenceConnect config={config}>
      <QueryClientProvider client={queryClient}>
        <UserStatsProvider>
          <DataLoader />
          <LoginHandler />
          <SomniaQuesterHandler />
          {children}
        </UserStatsProvider>
      </QueryClientProvider>
    </SequenceConnect>
  )
}
