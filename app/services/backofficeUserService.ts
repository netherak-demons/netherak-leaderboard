/**
 * Backoffice User Service
 * Service for managing users in the backoffice (search, update whitelist, extra points)
 */

import { apiPost, apiPut } from './netherakClient'

export interface User {
  wallet: string
  username?: string
  profile?: {
    username?: string
  }
  isWhitelisted?: boolean
  extraPoints?: number
  stats?: {
    enemiesKilled?: Record<string, number>
    dungeonsCompleted?: Record<string, number>
    skillsUsed?: Record<string, number>
  }
}

export interface UserSearchParams {
  wallet?: string
  username?: string
}

export interface UpdateUserParams {
  wallet: string
  isWhitelisted?: boolean
  extraPoints?: number
}

interface SeasonStatsResponse {
  seasonStats: User[]
  lastEvaluatedKey: string | null
}

/**
 * Helper to check if a user matches search params
 */
function matchesSearch(user: User, params: UserSearchParams): boolean {
  if (params.wallet) {
    return user.wallet?.toLowerCase() === params.wallet.toLowerCase()
  }
  if (params.username) {
    const username = user.username || user.profile?.username
    return username?.toLowerCase() === params.username.toLowerCase()
  }
  return false
}

/**
 * Search for a user by wallet or username
 * Uses the season stats endpoint to search through users
 */
export async function searchUser(
  params: UserSearchParams
): Promise<{ user: User | null; error: string | null }> {
  if (!params.wallet && !params.username) {
    return { user: null, error: 'Either wallet or username must be provided' }
  }

  let allUsers: User[] = []
  let lastKey: string | null = null
  const maxUsers = 500

  // Fetch users in batches until we find the user or reach max
  do {
    const response = await apiPost<SeasonStatsResponse>('/stats/season', {
      seasonId: '0',
      limit: 100,
      ...(lastKey && { lastKey }),
    })

    if (response.error) {
      return { user: null, error: response.error }
    }

    if (!response.data) {
      return { user: null, error: 'No data returned from API' }
    }

    allUsers = [...allUsers, ...response.data.seasonStats]
    lastKey = response.data.lastEvaluatedKey

    // Check if we found the user
    const found = allUsers.find((user) => matchesSearch(user, params))
    if (found) {
      return { user: found, error: null }
    }
  } while (lastKey && allUsers.length < maxUsers)

  // User not found
  return {
    user: null,
    error: params.wallet
      ? `User with wallet ${params.wallet} not found`
      : `User with username ${params.username} not found`,
  }
}

/**
 * Update user whitelist status and extra points
 */
export async function updateUser(
  params: UpdateUserParams
): Promise<{ success: boolean; error: string | null }> {
  const updateBody = {
    isWhitelisted: params.isWhitelisted,
    extraPoints: params.extraPoints,
  }

  // Try primary endpoint first
  let response = await apiPut<{ success: boolean }>(
    `/api/users/${params.wallet}`,
    updateBody
  )

  // Fallback to alternative endpoint if primary fails
  if (response.error) {
    response = await apiPut<{ success: boolean }>(
      `/api/stats/season/user/${params.wallet}`,
      updateBody
    )
  }

  if (response.error) {
    return { success: false, error: response.error }
  }

  return { success: true, error: null }
}
