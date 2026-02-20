/**
 * Fetches and parses NFT token metadata from tokenURI
 */
export interface NFTMetadata {
  image?: string
  name?: string
  description?: string
  properties?: Record<string, unknown>
}

export async function fetchTokenMetadata(tokenURI: string): Promise<NFTMetadata | null> {
  try {
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64Data = tokenURI.replace('data:application/json;base64,', '')
      const jsonString = atob(base64Data)
      return JSON.parse(jsonString)
    }
    if (tokenURI.startsWith('data:application/json,')) {
      const jsonString = tokenURI.replace('data:application/json,', '')
      return JSON.parse(decodeURIComponent(jsonString))
    }
    if (tokenURI.startsWith('http://') || tokenURI.startsWith('https://')) {
      const response = await fetch(tokenURI)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    }
    if (tokenURI.startsWith('ipfs://')) {
      const url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    }
    if (tokenURI.match(/^Qm[a-zA-Z0-9]{44}$/) || tokenURI.match(/^ba[a-zA-Z0-9]{57}$/)) {
      const response = await fetch(`https://ipfs.io/ipfs/${tokenURI}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    }
    if (tokenURI.startsWith('{') && tokenURI.endsWith('}')) {
      return JSON.parse(tokenURI)
    }
    return null
  } catch {
    return null
  }
}
