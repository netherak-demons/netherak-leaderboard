import { NextRequest, NextResponse } from 'next/server'

const PFP_CONTRACT = '0x9559ff653d4c8cc3565dd639963597f1aaae6a6a'
const SOMNIA_EXPLORER_API = 'https://explorer.somnia.network/api/v2'

/**
 * Proxies PFP NFT fetch to Somnia Explorer API (avoids CORS from browser).
 * GET /api/pfp?wallet=0x...
 */
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet')
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  try {
    const url = `${SOMNIA_EXPLORER_API}/tokens/${PFP_CONTRACT}/instances?holder_address_hash=${encodeURIComponent(wallet)}`
    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json(
        { error: `Explorer API error: ${res.status}` },
        { status: res.status }
      )
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 500 }
    )
  }
}
