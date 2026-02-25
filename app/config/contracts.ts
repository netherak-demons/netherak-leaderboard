/** Imuran Book NFT contract - ownership check for "Get Book" button */
export const IMURAN_BOOK_CONTRACT = {
  address: (process.env.NEXT_PUBLIC_IMURAN_BOOK_CONTRACT ||
    '0x1727C70bFcC64DF79Cd084b7197517ebFD44B6e7') as `0x${string}`,
}

/** PFP (profile picture) NFT contract for avatar display */
export const PFP_CONTRACT = {
  address: '0x9559ff653d4c8cc3565Dd639963597F1aAaE6A6A' as `0x${string}`,
  abi: [
    {
      type: 'function',
      name: 'balanceOf',
      inputs: [{ name: 'owner', type: 'address', internalType: 'address' }],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'tokenOfOwnerByIndex',
      inputs: [
        { name: 'owner', type: 'address', internalType: 'address' },
        { name: 'index', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'tokenURI',
      inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
      outputs: [{ name: '', type: 'string', internalType: 'string' }],
      stateMutability: 'view',
    },
  ] as const,
}

export const NETHERAK_NFT_CONTRACT = {
  address: '0x5c72d14ba0563ba056c51a5a823b0a68b7e91c53' as `0x${string}`,
  abi: [
    {
      "type": "function",
      "name": "totalSupply",
      "inputs": [],
      "outputs": [{"name": "result", "type": "uint256", "internalType": "uint256"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "tokenURI",
      "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
      "outputs": [{"name": "", "type": "string", "internalType": "string"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "ownerOf",
      "inputs": [{"name": "tokenId", "type": "uint256", "internalType": "uint256"}],
      "outputs": [{"name": "", "type": "address", "internalType": "address"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [{"name": "owner", "type": "address", "internalType": "address"}],
      "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "tokensOfOwner",
      "inputs": [{"name": "owner", "type": "address", "internalType": "address"}],
      "outputs": [{"name": "", "type": "uint256[]", "internalType": "uint256[]"}],
      "stateMutability": "view"
    }
  ] as const
}

export interface PlayerStats {
  tokenId: string
  owner: string
  name: string
  description: string
  image: string
  monstersKilled: number
  dungeonsCompleted: number
  avatar: string
}

export interface LeaderboardEntry {
  ranking: number
  demon: string
  avatar: string
  score: number
  address: string
  tokenId: string
}