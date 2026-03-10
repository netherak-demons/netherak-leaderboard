import { NextRequest, NextResponse } from 'next/server'

const NKD_RECIPES_CONTRACT =
  process.env.NEXT_PUBLIC_NKD_RECIPES_CONTRACT?.toLowerCase() ||
  '0xb1076dc36ac18e8e33d2f14a8d98e9d22c4fcb7f'
const SOMNIA_EXPLORER_API = 'https://explorer.somnia.network/api/v2'
const SEQUENCE_METADATA_API = 'https://metadata.sequence.app'
const SOMNIA_CHAIN_ID = 5031

function toIpfsGateway(url: string): string {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
  return url
}

function getImageUrl(item: Record<string, unknown>): string | null {
  const meta = item.metadata as Record<string, unknown> | undefined
  const sources = [
    item.image_url,
    item.thumbnail_url,
    item.media_url,
    meta?.image_url,
    meta?.image,
    meta?.thumbnail_url,
    meta?.thumbnail,
  ]
  for (const raw of sources) {
    if (raw && typeof raw === 'string') return raw
  }
  return null
}

function getTokenId(item: Record<string, unknown>): string | null {
  const id = item.id ?? item.token_id ?? item.tokenId
  return id != null ? String(id) : null
}

/** Fetch all instances from Somnia Explorer (handles pagination) */
async function fetchAllInstances(wallet: string): Promise<Record<string, unknown>[]> {
  const allItems: Record<string, unknown>[] = []
  let nextParams: Record<string, string> | null = {}

  do {
    const params = new URLSearchParams({ holder_address_hash: wallet })
    for (const [k, v] of Object.entries(nextParams)) params.set(k, v)
    const url = `${SOMNIA_EXPLORER_API}/tokens/${NKD_RECIPES_CONTRACT}/instances?${params}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Explorer API error: ${res.status}`)
    const data = (await res.json()) as { items?: unknown[]; next_page_params?: Record<string, string> }
    const items = Array.isArray(data?.items) ? data.items : []
    for (const item of items) allItems.push(item as Record<string, unknown>)
    nextParams = data?.next_page_params && Object.keys(data.next_page_params).length > 0 ? data.next_page_params : null
  } while (nextParams)

  return allItems
}

/** Try Sequence Metadata API for token image (works for Sequence collections) */
async function fetchSequenceImage(tokenId: string): Promise<string | null> {
  try {
    const url = `${SEQUENCE_METADATA_API}/tokens/${SOMNIA_CHAIN_ID}/${NKD_RECIPES_CONTRACT}/${tokenId}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as { image?: string }[] | { image?: string }
    const arr = Array.isArray(data) ? data : [data]
    const first = arr[0]
    return first?.image && typeof first.image === 'string' ? first.image : null
  } catch {
    return null
  }
}

/**
 * Proxies NKD Recipes NFT ownership check to Somnia Explorer API (avoids CORS).
 * Fetches all pages, then enriches images via Sequence Metadata API when Explorer lacks image.
 * Returns { hasRecipes: boolean, imageUrls: string[] } - images from all owned tokens.
 * GET /api/nkd-recipes?wallet=0x...
 */
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet')
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  try {
    const items = await fetchAllInstances(wallet)
    const hasRecipes = items.length > 0
    const imageUrls: string[] = []

    for (const item of items) {
      let raw = getImageUrl(item)
      if (!raw) {
        const tokenId = getTokenId(item)
        if (tokenId) raw = await fetchSequenceImage(tokenId)
      }
      imageUrls.push(raw ? toIpfsGateway(raw) : '/nkd-recipes.svg')
    }

    return NextResponse.json({ hasRecipes, imageUrls })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 500 }
    )
  }
}
