'use client'

import Header from './components/Header'
import Leaderboard from './components/Leaderboard'

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      <Header currentRoute="leaderboards" />
      <Leaderboard />
    </div>
  )
}
