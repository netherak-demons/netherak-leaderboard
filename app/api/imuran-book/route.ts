import { NextRequest, NextResponse } from 'next/server'

const IMURAN_BOOK_CONTRACT =
  process.env.NEXT_PUBLIC_IMURAN_BOOK_CONTRACT?.toLowerCase() ||
  '0x1727c70bfcc64df79cd084b7197517ebfd44b6e7'
const SOMNIA_EXPLORER_API = 'https://explorer.somnia.network/api/v2'

/**
 * Proxies Imuran Book NFT ownership check to Somnia Explorer API (avoids CORS).
 * Returns { hasBook: boolean } - true if wallet holds at least one token from the contract.
 * GET /api/imuran-book?wallet=0x...
 */
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet')
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  try {
    const url = `${SOMNIA_EXPLORER_API}/tokens/${IMURAN_BOOK_CONTRACT}/instances?holder_address_hash=${encodeURIComponent(wallet)}`
    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json(
        { error: `Explorer API error: ${res.status}` },
        { status: res.status }
      )
    }
    const data = await res.json()
    const hasBook = Array.isArray(data?.items) && data.items.length > 0
    return NextResponse.json({ hasBook })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 500 }
    )
  }
}
