'use client'

import ConnectButton from './components/ConnectButton'
import Leaderboard from './components/Leaderboard'

export default function Home() {
  // Always show leaderboard
  return (
    <div className="min-h-screen w-full">
      {/* Login button positioned absolutely */}
      <div className="fixed top-4 right-4 z-50">
        <ConnectButton />
      </div>

      {/* Main leaderboard content */}
      <Leaderboard />
    </div>
  )
}
