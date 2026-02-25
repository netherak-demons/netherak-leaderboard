import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { NETHERAK_NFT_CONTRACT, PlayerStats, LeaderboardEntry } from '../config/contracts'

export function useLeaderboards() {
  const [playersData, setPlayersData] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Obtener el total supply
  const { data: totalSupply, isError: totalSupplyError, isLoading: totalSupplyLoading } = useReadContract({
    ...NETHERAK_NFT_CONTRACT,
    functionName: 'totalSupply',
    chainId: 50312, // Somnia devnet
  })

  useEffect(() => {
    async function fetchAllPlayers() {
      if (totalSupplyLoading) return

      if (totalSupplyError) {
        setError('Error connecting to Somnia network')
        setLoading(false)
        return
      }

      if (!totalSupply) {
        setError('No NFTs found in contract')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const players: PlayerStats[] = []
        const supply = Number(totalSupply)

        // Limitar a los primeros 50 tokens para performance
        const maxTokens = Math.min(supply, 50)

        for (let tokenId = 0; tokenId < maxTokens; tokenId++) {
          try {
            // TODO: Implementar llamadas reales al contrato para:
            // 1. ownerOf(tokenId)
            // 2. tokenURI(tokenId)
            // 3. fetchTokenMetadata(tokenURI)

            // Por ahora mostrar error hasta que se implemente
            throw new Error('Real contract calls not implemented yet')

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