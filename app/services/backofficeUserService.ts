/**
 * Backoffice User Service
 * Service for managing users in the backoffice (search, update whitelist, extra points)
 */

import { apiPost, apiPut, type ApiResponse } from './netherakClient'

export interface User {
  wallet: string
  username?: string
  profile?: {
    username?: string
    linkedWallet?: string
    extraPoints?: number
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
  // Early exit as soon as user is found (don't fetch remaining pages)
  let response: ApiResponse<SeasonStatsResponse>
  do {
    response = await apiPost<SeasonStatsResponse>('/stats/season', {
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

    const batch = response.data.seasonStats
    allUsers = [...allUsers, ...batch]
    lastKey = response.data.lastEvaluatedKey

    // Check if we found the user - return immediately (don't fetch next page)
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
 * Add or subtract extra points for a user
 * Calls the AWS extrapoints API. Amount can be positive (add) or negative (subtract).
 */
export async function updateExtraPoints(
  wallet: string,
  amount: number
): Promise<{ success: boolean; error: string | null }> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('backoffice_token') : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const res = await fetch('/api/user/extrapoints', {
    method: 'POST',
    headers,
    body: JSON.stringify({ wallet, amount }),
  })

  if (!res.ok) {
    const text = await res.text()
    let message: string
    try {
      const json = JSON.parse(text)
      message = json.error || text
    } catch {
      message = text || `HTTP ${res.status}`
    }
    return { success: false, error: message }
  }

  return { success: true, error: null }
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
