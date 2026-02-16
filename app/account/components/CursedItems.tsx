'use client'

import React, { useState } from 'react'
import Image from 'next/image'

const CURSED_ITEMS = [
  { id: 1, src: '/imuran-book.png', alt: 'Imuran Book' },
  { id: 2, src: null, alt: 'Cursed Item' },
  { id: 3, src: null, alt: 'Cursed Item' },
  { id: 4, src: null, alt: 'Cursed Item' },
]

function CursedItemImage({
  src,
  alt,
}: {
  src: string | null
  alt: string
}) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div
        className="w-full aspect-square rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '0.5px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span className="text-xs text-white/40">{alt}</span>
      </div>
    )
  }
  return (
    <div
      className="w-full aspect-square rounded-lg overflow-hidden relative"
      style={{
        border: '0.5px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        onError={() => setError(true)}
      />
    </div>
  )
}

export default function CursedItems() {
  return (
    <div
      className="flex flex-col gap-4 w-[350px] shrink-0 rounded-xl p-6"
      style={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        border: '0.5px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <h3
        className="text-white text-base font-medium uppercase tracking-wider font-zachar"
      >
        Cursed Items
      </h3>

      {/* Divider */}
      <div
        className="w-full shrink-0"
        style={{
          height: '0.5px',
          background: 'linear-gradient(90deg, transparent, #796359, #DFB7A4, #796359, transparent)',
        }}
      />

      {/* 2-col grid of square images */}
      <div className="grid grid-cols-2 gap-3">
        {CURSED_ITEMS.map((item) => (
          <CursedItemImage key={item.id} src={item.src} alt={item.alt} />
        ))}
      </div>
    </div>
  )
}
