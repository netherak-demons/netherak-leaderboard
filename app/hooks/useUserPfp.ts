'use client'

import { useState, useEffect } from 'react'
import { PFP_CONTRACT } from '../config/contracts'
import { fetchTokenMetadata } from '../utils/nftMetadata'

const RPC_URL = 'https://rpc.ankr.com/somnia_mainnet'

function padAddress(addr: string): string {
  const clean = addr.startsWith('0x') ? addr.slice(2) : addr
  return clean.toLowerCase().padStart(64, '0')
}

function decodeStringResult(hex: string): string {
  if (!hex || hex === '0x') return ''
  const h = hex.slice(2)
  if (h.length < 128) return ''
  const lenHex = h.slice(64, 128)
  const len = parseInt(lenHex, 16)
  const dataHex = h.slice(128, 128 + len * 2)
  const bytes = dataHex.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || []
  let str = new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0/g, '')
  while (str.length > 0 && str.charCodeAt(0) < 32) str = str.slice(1)
  if (str.includes('https://') && !str.startsWith('https://')) {
    str = str.slice(str.indexOf('https://'))
  }
  if (str.includes('ipfs://') && !str.startsWith('ipfs://')) {
    str = str.slice(str.indexOf('ipfs://'))
  }
  return str.trim()
}

export function useUserPfp(walletAddress: string | undefined): { pfpUrl: string | null; loading: boolean } {
  const [pfpUrl, setPfpUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!walletAddress)

  useEffect(() => {
    if (!walletAddress) {
      setPfpUrl(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setPfpUrl(null)

      try {
        const addr = padAddress(walletAddress || '0x0000000000000000000000000000000000000000')

        const balanceRes = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{ to: PFP_CONTRACT.address, data: '0x70a08231' + addr }, 'latest'],
            id: 1,
          }),
        })

        const balanceJson = await balanceRes.json()
        if (balanceJson.error || !balanceJson.result) {
          setLoading(false)
          return
        }

        const balance = parseInt(balanceJson.result, 16)
        if (balance === 0) {
          setLoading(false)
          return
        }

        const tokenOfOwnerRes = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{ to: PFP_CONTRACT.address, data: '0x2f745c59' + addr + '0'.repeat(64) }, 'latest'],
            id: 2,
          }),
        })

        const tokenOfOwnerJson = await tokenOfOwnerRes.json()
        if (tokenOfOwnerJson.error || !tokenOfOwnerJson.result || tokenOfOwnerJson.result === '0x') {
          setLoading(false)
          return
        }

        const tokenId = BigInt(tokenOfOwnerJson.result)
        const tokenIdHex = tokenId.toString(16).padStart(64, '0')

        const tokenUriRes = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{ to: PFP_CONTRACT.address, data: '0xc87b56dd' + tokenIdHex }, 'latest'],
            id: 3,
          }),
        })

        const tokenUriJson = await tokenUriRes.json()
        if (tokenUriJson.error || !tokenUriJson.result) {
          setLoading(false)
          return
        }

        const tokenURI = decodeStringResult(tokenUriJson.result)
        if (!tokenURI) {
          setLoading(false)
          return
        }

        const metadata = await fetchTokenMetadata(tokenURI)
        if (cancelled || !metadata?.image) {
          setLoading(false)
          return
        }

        let imageUrl = metadata.image
        if (imageUrl.startsWith('ipfs://')) {
          imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
        }

        setPfpUrl(imageUrl)
      } catch {
        setPfpUrl(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [walletAddress])

  return { pfpUrl, loading }
}
