import { NextRequest, NextResponse } from 'next/server'

const NKD_RECIPES_CONTRACT =
  process.env.NEXT_PUBLIC_NKD_RECIPES_CONTRACT?.toLowerCase() ||
  '0xb1076dc36ac18e8e33d2f14a8d98e9d22c4fcb7f'
const SOMNIA_EXPLORER_API = 'https://explorer.somnia.network/api/v2'

function toIpfsGateway(url: string): string {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
  return url
}

/**
 * Proxies NKD Recipes NFT ownership check to Somnia Explorer API (avoids CORS).
 * Returns { hasRecipes: boolean, imageUrls: string[] } - images from all owned tokens.
 * GET /api/nkd-recipes?wallet=0x...
 */
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet')
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  try {
    const url = `${SOMNIA_EXPLORER_API}/tokens/${NKD_RECIPES_CONTRACT}/instances?holder_address_hash=${encodeURIComponent(wallet)}`
    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json(
        { error: `Explorer API error: ${res.status}` },
        { status: res.status }
      )
    }
    const data = await res.json()
    const items = Array.isArray(data?.items) ? data.items : []
    const hasRecipes = items.length > 0
    const imageUrls: string[] = []
    for (const item of items) {
      const raw = item.image_url ?? item.metadata?.image_url ?? item.metadata?.image ?? item.media_url
      if (raw && typeof raw === 'string') {
        imageUrls.push(toIpfsGateway(raw))
      }
    }
    return NextResponse.json({ hasRecipes, imageUrls })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 500 }
    )
  }
}
