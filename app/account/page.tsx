'use client'

import ProfileInfo from './components/ProfileInfo'
import Achievements from './components/Achievements'
import Rewards from './components/Rewards'
import CursedItems from './components/CursedItems'

export default function AccountPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden px-8 pb-12">
      <div className="max-w-[1600px] mx-auto flex flex-wrap gap-8 justify-start">
        <ProfileInfo />
        <Achievements />
        <Rewards />
        <CursedItems />
      </div>
    </div>
  )
}
