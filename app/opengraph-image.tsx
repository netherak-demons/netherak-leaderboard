import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Netherak Leaderboard - Season statistics and rankings'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export const runtime = 'nodejs'

export default async function Image() {
  let bgSrc: string | undefined
  try {
    const svg = await readFile(join(process.cwd(), 'public/background.svg'), 'base64')
    bgSrc = `data:image/svg+xml;base64,${svg}`
  } catch {
    // fallback if file read fails
  }

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          background: '#000',
        }}
      >
        {bgSrc && (
          <img
            src={bgSrc}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#EAE3D3',
              marginBottom: 16,
            }}
          >
            Netherak Leaderboard
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#83E996',
              marginBottom: 24,
            }}
          >
            Season statistics and rankings
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#BFBFBF',
            }}
          >
            Connect your wallet to view your stats
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
