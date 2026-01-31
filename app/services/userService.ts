/**
 * User service for managing users in the database
 * Handles fetching and updating user data
 */

import { apiPost, apiPut } from './api'

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

  // First, try to get user from season stats endpoint
  // This endpoint returns all users, so we'll filter client-side
  const response = await apiPost<{
    seasonStats: User[]
    lastEvaluatedKey: string | null
  }>('/stats/season', {
    seasonId: '0',
    limit: 100, // Get more results to search through
  })

  if (response.error) {
    return { user: null, error: response.error }
  }

  if (!response.data) {
    return { user: null, error: 'No data returned from API' }
  }

  // Search through all pages if needed
  let allUsers: User[] = [...response.data.seasonStats]
  let lastKey = response.data.lastEvaluatedKey

  // Continue fetching if we haven't found the user yet
  while (lastKey && allUsers.length < 500) {
    const nextResponse = await apiPost<{
      seasonStats: User[]
      lastEvaluatedKey: string | null
    }>('/stats/season', {
      seasonId: '0',
      limit: 100,
      lastKey,
    })

    if (nextResponse.error || !nextResponse.data) {
      break
    }

    allUsers = [...allUsers, ...nextResponse.data.seasonStats]
    lastKey = nextResponse.data.lastEvaluatedKey

    // Check if we found the user
    const found = allUsers.find((user) => {
      if (params.wallet) {
        return user.wallet?.toLowerCase() === params.wallet.toLowerCase()
      }
      if (params.username) {
        const username = user.username || user.profile?.username
        return username?.toLowerCase() === params.username.toLowerCase()
      }
      return false
    })

    if (found) {
      return { user: found, error: null }
    }
  }

  // Search in the collected users
  const user = allUsers.find((u) => {
    if (params.wallet) {
      return u.wallet?.toLowerCase() === params.wallet.toLowerCase()
    }
    if (params.username) {
      const username = u.username || u.profile?.username
      return username?.toLowerCase() === params.username.toLowerCase()
    }
    return false
  })

  if (!user) {
    return {
      user: null,
      error: params.wallet
        ? `User with wallet ${params.wallet} not found`
        : `User with username ${params.username} not found`,
    }
  }

  return { user, error: null }
}

/**
 * Update user whitelist status and extra points
 * 
 * Note: The backend endpoint should accept PUT requests to update user data
 * Endpoint: PUT /users/{wallet} or PUT /stats/season/user/{wallet}
 * Body: { isWhitelisted: boolean, extraPoints: number }
 */
export async function updateUser(
  params: UpdateUserParams
): Promise<{ success: boolean; error: string | null }> {
  // Try different endpoint formats based on backend implementation
  // Option 1: PUT /users/{wallet}
  let response = await apiPut<{ success: boolean }>(
    `/api/users/${params.wallet}`,
    {
      isWhitelisted: params.isWhitelisted,
      extraPoints: params.extraPoints,
    }
  )

  // If that fails, try alternative endpoint format
  if (response.error) {
    response = await apiPut<{ success: boolean }>(
      `/api/stats/season/user/${params.wallet}`,
      {
        isWhitelisted: params.isWhitelisted,
        extraPoints: params.extraPoints,
      }
    )
  }

  if (response.error) {
    return { success: false, error: response.error }
  }

  return { success: true, error: null }
}
