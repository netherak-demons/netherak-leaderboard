import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { NETHERAK_NFT_CONTRACT, PlayerStats, LeaderboardEntry } from '../config/contracts'
import { fetchTokenMetadata } from '../utils/nftMetadata'

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

      if (!totalSupply || totalSupply === BigInt(0)) {
        setError('No NFTs found in contract')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const players: PlayerStats[] = []
        const supply = Number(totalSupply)

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
          } catch {
            // ignore
          }
        }

        if (players.length === 0) {
          setError('No valid player data found')
        } else {
          setPlayersData(players)
        }
      } catch {
        setError('Error fetching leaderboard data from contract')
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
          } catch {
            // ignore
          }
        }

        if (!tokenURI) {
          throw new Error('Empty tokenURI')
        }

        // Obtener metadata
        const metadata = await fetchTokenMetadata(tokenURI)
        if (!metadata) {
          throw new Error('Failed to fetch metadata')
        }

        return {
          tokenId: tokenId.toString(),
          owner,
          name: metadata.name || `Player Career ${tokenId}`,
          description: metadata.description || '',
          image: metadata.image || '',
          monstersKilled: Number(metadata.properties?.['Monsters Killed']) || 0,
          dungeonsCompleted: Number(metadata.properties?.['Dungeons Completed']) || 0,
          avatar: metadata.image || `/demons/avatar${(tokenId % 2) + 1}.svg`
        }

      } catch {
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