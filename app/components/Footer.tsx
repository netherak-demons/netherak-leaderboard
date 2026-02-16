'use client'

import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full py-8 flex justify-center items-center gap-8 shrink-0 z-50">
      <img
        src="/demons-logo.svg"
        alt="Demons"
        className="object-contain opacity-100 h-9 w-auto"
      />
      <img
        src="/netherak-logo.svg"
        alt="Netherak"
        className="object-contain opacity-100 h-9 w-auto"
      />
      <img
        src="/somnia-logo.svg"
        alt="Somnia"
        className="object-contain opacity-100 h-4 w-auto"
      />
    </footer>
  )
}
