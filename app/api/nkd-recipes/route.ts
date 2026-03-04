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
 * Returns { hasRecipes: boolean, imageUrl?: string } - image from first owned token when available.
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
    const hasRecipes = Array.isArray(data?.items) && data.items.length > 0
    let imageUrl: string | undefined
    if (hasRecipes && data.items[0]) {
      const first = data.items[0]
      const raw = first.image_url ?? first.metadata?.image_url ?? first.metadata?.image ?? first.media_url
      if (raw && typeof raw === 'string') {
        imageUrl = toIpfsGateway(raw)
      }
    }
    return NextResponse.json({ hasRecipes, imageUrl: imageUrl ?? null })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 500 }
    )
  }
}
