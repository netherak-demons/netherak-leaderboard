'use client'

import ProfileInfo from './components/ProfileInfo'
import Achievements from './components/Achievements'
import Rewards from './components/Rewards'
import CursedItems from './components/CursedItems'
import { UserStatsProvider } from './context/UserStatsContext'

export default function AccountPage() {
  return (
    <UserStatsProvider>
      <div className="relative min-h-screen w-full overflow-x-hidden px-4 sm:px-8 pb-12">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row flex-wrap gap-6 md:gap-8 justify-start w-full">
          <ProfileInfo />
          <Achievements />
          <Rewards />
          <CursedItems />
        </div>
      </div>
    </UserStatsProvider>
  )
}
