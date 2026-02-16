'use client'

import Header from '../components/Header'
import ProfileInfo from './components/ProfileInfo'
import Achievements from './components/Achievements'
import Rewards from './components/Rewards'
import CursedItems from './components/CursedItems'

export default function AccountPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <div className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "url('/background.svg')", zIndex: 0 }} />
      <Header currentRoute="account" />
      <div className="relative z-10 pt-28 px-8 pb-12">
        <div className="max-w-[1400px] mx-auto flex flex-wrap gap-8 justify-start">
          <ProfileInfo />
          <Achievements />
          <Rewards />
          <CursedItems />
        </div>
      </div>
    </div>
  )
}
