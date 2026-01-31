import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { NETHERAK_NFT_CONTRACT, PlayerStats, LeaderboardEntry } from '../config/contracts'

// Función para parsear metadata del tokenURI
async function fetchTokenMetadata(tokenURI: string): Promise<any> {
  try {
    console.log('Parsing tokenURI:', tokenURI)

    // Si es un data URI base64, parsearlo directamente
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64Data = tokenURI.replace('data:application/json;base64,', '')
      const jsonString = atob(base64Data)
      return JSON.parse(jsonString)
    }

    // Si es otro tipo de data URI JSON
    if (tokenURI.startsWith('data:application/json,')) {
      const jsonString = tokenURI.replace('data:application/json,', '')
      return JSON.parse(decodeURIComponent(jsonString))
    }

    // Si es una URL HTTP/HTTPS, hacer fetch
    if (tokenURI.startsWith('http://') || tokenURI.startsWith('https://')) {
      const response = await fetch(tokenURI)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    }

    // Si es IPFS con diferentes formatos
    if (tokenURI.startsWith('ipfs://')) {
      const url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    }

    // Si es un hash IPFS directo (sin protocolo)
    if (tokenURI.match(/^Qm[a-zA-Z0-9]{44}$/) || tokenURI.match(/^ba[a-zA-Z0-9]{57}$/)) {
      const url = `https://ipfs.io/ipfs/${tokenURI}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    }

    // Si ya es JSON directo (string), intentar parsearlo
    if (tokenURI.startsWith('{') && tokenURI.endsWith('}')) {
      return JSON.parse(tokenURI)
    }

    console.log('Unknown tokenURI format:', tokenURI)
    throw new Error(`Unsupported tokenURI format: ${tokenURI.substring(0, 100)}`)
  } catch (error) {
    console.error('Error fetching token metadata:', error)
    return null
  }
}

export function useRealLeaderboards() {
  const [playersData, setPlayersData] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Obtener el total supply
  const { data: totalSupply, isError: totalSupplyError, isLoading: totalSupplyLoading } = useReadContract({
    ...NETHERAK_NFT_CONTRACT,
    functionName: 'totalSupply',
    chainId: 50312,
  })

  useEffect(() => {
    async function fetchAllPlayers() {
      if (totalSupplyLoading) return

      if (totalSupplyError) {
        setError('Error connecting to Somnia network')
        setLoading(false)
        return
      }

      if (!totalSupply || totalSupply === 0n) {
        setError('No NFTs found in contract')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const players: PlayerStats[] = []
        const supply = Number(totalSupply)
        console.log(`Total NFT supply: ${supply}`)
        console.log('Starting to fetch token data...')

        // Limitar a los primeros 10 tokens para evitar rate limiting
        const maxTokens = Math.min(supply, 10)

        // Hacer llamadas secuenciales con delay para evitar rate limiting
        for (let tokenId = 0; tokenId < maxTokens; tokenId++) {
          try {
            const player = await fetchSingleToken(tokenId)
            if (player) {
              players.push(player)
            }
            // Delay de 200ms entre requests para evitar rate limiting
            if (tokenId < maxTokens - 1) {
              await new Promise(resolve => setTimeout(resolve, 200))
            }
          } catch (error) {
            console.error(`Error fetching token ${tokenId}:`, error)
          }
        }

        if (players.length === 0) {
          setError('No valid player data found')
        } else {
          console.log(`Loaded ${players.length} players from contract`)
          setPlayersData(players)
        }
      } catch (err) {
        setError('Error fetching leaderboard data from contract')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    // Función para obtener datos de un token individual
    async function fetchSingleToken(tokenId: number): Promise<PlayerStats | null> {
      try {
        // Hacer llamadas al contrato usando fetch directo a RPC
        const rpcUrl = 'https://rpc.ankr.com/somnia_testnet'

        // Llamada para ownerOf
        const ownerResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: NETHERAK_NFT_CONTRACT.address,
              data: `0x6352211e${tokenId.toString(16).padStart(64, '0')}` // ownerOf selector + tokenId
            }, 'latest'],
            id: 1
          })
        })

        // Llamada para tokenURI
        const tokenURIResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: NETHERAK_NFT_CONTRACT.address,
              data: `0xc87b56dd${tokenId.toString(16).padStart(64, '0')}` // tokenURI selector + tokenId
            }, 'latest'],
            id: 2
          })
        })

        const [ownerResult, tokenURIResult] = await Promise.all([
          ownerResponse.json(),
          tokenURIResponse.json()
        ])

        if (ownerResult.error || tokenURIResult.error) {
          throw new Error(`RPC Error: ${ownerResult.error?.message || tokenURIResult.error?.message}`)
        }

        // Decodificar resultados
        const owner = `0x${ownerResult.result.slice(-40)}`

        // Decodificar tokenURI (string)
        let tokenURI = ''
        if (tokenURIResult.result && tokenURIResult.result !== '0x') {
          try {
            // El resultado es hex encoded string, necesitamos decodificarlo
            const hex = tokenURIResult.result.slice(2)

            // Si el hex empieza con '0000002', es un string con offset y length
            if (hex.startsWith('0000002')) {
              // Skip the offset (32 bytes) and get length (next 32 bytes)
              const lengthHex = hex.slice(64, 128)
              const length = parseInt(lengthHex, 16)
              const dataHex = hex.slice(128, 128 + length * 2)

              const bytes = dataHex.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)) || []
              tokenURI = new TextDecoder().decode(new Uint8Array(bytes))
            } else {
              // Fallback to old method
              const bytes = hex.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)) || []
              tokenURI = new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0/g, '')
            }

            // Clean up any invalid characters at the beginning/end
            tokenURI = tokenURI.trim()

            // Remove any non-printable characters at the start
            while (tokenURI.length > 0 && tokenURI.charCodeAt(0) < 32) {
              tokenURI = tokenURI.slice(1)
            }

            // Handle case where URL starts with invalid characters before https://
            if (tokenURI.includes('https://') && !tokenURI.startsWith('https://')) {
              const httpsIndex = tokenURI.indexOf('https://')
              if (httpsIndex > 0) {
                tokenURI = tokenURI.slice(httpsIndex)
              }
            }

            // Handle case where URL starts with invalid characters before http://
            if (tokenURI.includes('http://') && !tokenURI.startsWith('http://')) {
              const httpIndex = tokenURI.indexOf('http://')
              if (httpIndex > 0) {
                tokenURI = tokenURI.slice(httpIndex)
              }
            }
          } catch (error) {
            console.error(`Error decoding tokenURI for token ${tokenId}:`, error)
            console.log('Raw hex result:', tokenURIResult.result)
          }
        }

        if (!tokenURI) {
          throw new Error('Empty tokenURI')
        }

        console.log(`Token ${tokenId} - tokenURI:`, tokenURI)

        // Obtener metadata
        const metadata = await fetchTokenMetadata(tokenURI)
        if (!metadata) {
          throw new Error('Failed to fetch metadata')
        }

        console.log(`Token ${tokenId} - metadata:`, metadata)

        return {
          tokenId: tokenId.toString(),
          owner,
          name: metadata.name || `Player Career ${tokenId}`,
          description: metadata.description || '',
          image: metadata.image || '',
          monstersKilled: metadata.properties?.["Monsters Killed"] || 0,
          dungeonsCompleted: metadata.properties?.["Dungeons Completed"] || 0,
          avatar: metadata.image || `/demons/avatar${(tokenId % 2) + 1}.svg`
        }

      } catch (error) {
        console.error(`Error fetching token ${tokenId}:`, error)
        return null
      }
    }

    fetchAllPlayers()
  }, [totalSupply, totalSupplyLoading, totalSupplyError])

  // Generar leaderboards
  const dungeonsLeaderboard: LeaderboardEntry[] = playersData
    .sort((a, b) => b.dungeonsCompleted - a.dungeonsCompleted)
    .slice(0, 10)
    .map((player, index) => ({
      ranking: index + 1,
      demon: player.name,
      avatar: player.avatar,
      score: player.dungeonsCompleted,
      address: player.owner,
      tokenId: player.tokenId
    }))

  const enemiesLeaderboard: LeaderboardEntry[] = playersData
    .sort((a, b) => b.monstersKilled - a.monstersKilled)
    .slice(0, 10)
    .map((player, index) => ({
      ranking: index + 1,
      demon: player.name,
      avatar: player.avatar,
      score: player.monstersKilled,
      address: player.owner,
      tokenId: player.tokenId
    }))

  return {
    dungeonsLeaderboard,
    enemiesLeaderboard,
    loading,
    error,
    totalPlayers: playersData.length
  }
}