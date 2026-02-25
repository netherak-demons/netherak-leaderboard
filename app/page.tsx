'use client'

import Leaderboard from './components/Leaderboard'
import ErrorBoundary from './components/ErrorBoundary'

export default function Home() {
  return (
    <ErrorBoundary>
      <Leaderboard />
    </ErrorBoundary>
  )
}
