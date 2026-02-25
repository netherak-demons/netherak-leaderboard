/**
 * GET /api/user response
 */
export interface GetUserResponse {
  wallet: string
  username: string
  email?: string
  linkedWallet?: string
  profile?: {
    email?: string
    username?: string
    linkedWallet?: string
    LINKEDWALLET?: string
  }
  createdAt?: string
}

/**
 * PUT /api/user response
 */
export interface PutUserResponse {
  message: string
  profile: {
    SEQUENCEWALLET?: string
    values?: {
      email?: string
    }
    GSI_RECORDTYPE_PK?: string
    LINKEDWALLET?: string
    SK?: string
    createdAt?: string
    username?: string
    GSI_RECORDTYPE_SK?: string
    PK?: string
    email?: string
  }
}
