'use client'

import Header from '../components/Header'

export default function AccountPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <div className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "url('/background.svg')", zIndex: 0 }} />
      <Header currentRoute="account" />
      <div className="relative z-10 pt-28 px-8 flex items-center justify-center min-h-screen">
        <div
          className="text-primary text-center text-lg"
          style={{ fontFamily: 'var(--font-harmonique)' }}
        >
          My Account — Coming soon
        </div>
      </div>
    </div>
  )
}
