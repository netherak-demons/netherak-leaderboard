/**
 * Verify Sequence WaaS JWT using JWKS.
 * @see https://docs.sequence.xyz/sdk/headless-wallet/verification
 */
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

const JWKS_URI = 'https://waas.sequence.app/.well-known/jwks.json'

let jwks: jwksClient.JwksClient | null = null

function getJwksClient() {
  if (!jwks) {
    jwks = jwksClient({
      jwksUri: JWKS_URI,
      cache: true,
      cacheMaxAge: 86400000, // 1 day
    })
  }
  return jwks
}

async function getSigningKey(kid: string): Promise<string> {
  const key = await getJwksClient().getSigningKey(kid)
  const signingKey = key.getPublicKey()
  return signingKey
}

export interface VerifiedSequenceJwt {
  /** Wallet address from the JWT (sub or wallet claim) */
  wallet?: string
  /** Email if present */
  email?: string
  /** Raw decoded payload */
  payload: jwt.JwtPayload
}

/**
 * Verifies a Sequence JWT and returns the decoded payload.
 * Throws if the token is invalid.
 * Verifies signature (via Sequence JWKS), expiry, and audience (from waas config projectId).
 */
export async function verifySequenceJwt(
  token: string,
  expectedAudience?: string
): Promise<VerifiedSequenceJwt> {
  const decoded = jwt.decode(token, { complete: true })
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid token format')
  }

  const kid = decoded.header.kid
  if (!kid) {
    throw new Error('Token missing kid header')
  }

  const publicKey = await getSigningKey(kid)

  const verifyOptions: jwt.VerifyOptions = { algorithms: ['RS256'] }
  if (expectedAudience) {
    verifyOptions.audience = expectedAudience
  }

  const verified = jwt.verify(token, publicKey, verifyOptions) as jwt.JwtPayload

  const payload = verified as jwt.JwtPayload
  const wallet = payload.sub ?? payload.wallet ?? payload.address

  return {
    wallet: typeof wallet === 'string' ? wallet : undefined,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    payload,
  }
}
