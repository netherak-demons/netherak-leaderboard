import jwt from 'jsonwebtoken'

const BACKOFFICE_JWT_SECRET = process.env.BACKOFFICE_JWT_SECRET

export interface BackofficeTokenPayload {
  purpose: 'backoffice'
  exp: number
  iat: number
}

/**
 * Verifies the backoffice session token.
 * Returns the payload if valid, throws if invalid.
 */
export function verifyBackofficeToken(token: string): BackofficeTokenPayload {
  if (!BACKOFFICE_JWT_SECRET) {
    throw new Error('BACKOFFICE_JWT_SECRET not configured')
  }

  const decoded = jwt.verify(token, BACKOFFICE_JWT_SECRET, {
    algorithms: ['HS256'],
    maxAge: '24h',
  }) as BackofficeTokenPayload

  if (decoded.purpose !== 'backoffice') {
    throw new Error('Invalid token purpose')
  }

  return decoded
}
