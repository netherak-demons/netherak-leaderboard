import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { parseSequenceWaaSConfigKey } from '@0xsequence/waas'
import { verifySequenceJwt } from '../../lib/verifySequenceJwt'

const USER_API_URL = 'https://yv97bn1mj3.execute-api.us-east-1.amazonaws.com/stage-1/user'
const isDev = process.env.NODE_ENV === 'development'

function getExpectedAudience(): string | undefined {
  const waasConfigKey = process.env.NEXT_PUBLIC_SEQUENCE_WAAS_CONFIG_KEY
  if (!waasConfigKey) {
    if (isDev) console.warn('[api/user] No NEXT_PUBLIC_SEQUENCE_WAAS_CONFIG_KEY, skipping audience check')
    return undefined
  }
  try {
    const config = parseSequenceWaaSConfigKey<{ projectId: number }>(waasConfigKey)
    const projectId = config.projectId
    if (projectId != null) {
      return `https://sequence.build/project/${projectId}`
    }
  } catch (e) {
    if (isDev) console.warn('[api/user] Failed to parse waasConfigKey:', e)
  }
  return undefined
}

function debugJwt(token: string) {
  if (!isDev) return
  try {
    const decoded = jwt.decode(token, { complete: true })
    if (decoded && typeof decoded !== 'string' && decoded.payload) {
      const p = decoded.payload as jwt.JwtPayload
      console.log('[api/user] JWT debug:', {
        aud: p.aud,
        iss: p.iss,
        sub: p.sub?.slice(0, 10) + '...',
        exp: p.exp,
        iat: p.iat,
      })
    }
  } catch {
    console.warn('[api/user] Could not decode JWT for debug')
  }
}

async function forwardToAws(
  authHeader: string,
  payload: Record<string, string>,
  method: 'POST' | 'PUT'
): Promise<{ ok: true; data: unknown } | { ok: false; status: number; text: string }> {
  const res = await fetch(USER_API_URL, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    return { ok: false, status: res.status, text }
  }
  const data = await res.json().catch(() => ({}))
  return { ok: true, data }
}

async function fetchUserFromAws(
  authHeader: string
): Promise<{ ok: true; data: unknown } | { ok: false; status: number; text: string }> {
  const res = await fetch(USER_API_URL, {
    method: 'GET',
    headers: { Authorization: authHeader },
  })
  if (!res.ok) {
    const text = await res.text()
    return { ok: false, status: res.status, text }
  }
  const data = await res.json().catch(() => ({}))
  return { ok: true, data }
}

/** GET: fetch current user profile (wallet, username, linkedWallet) */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authorization header with Bearer token is required' },
      { status: 401 }
    )
  }

  const token = authHeader.slice(7)
  try {
    const expectedAudience = getExpectedAudience()
    await verifySequenceJwt(token, expectedAudience)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid token'
    return NextResponse.json(
      { error: `JWT verification failed: ${message}` },
      { status: 401 }
    )
  }

  try {
    const result = await fetchUserFromAws(authHeader)
    if (!result.ok) {
      return NextResponse.json(
        { error: `API error ${result.status}: ${result.text.substring(0, 500)}` },
        { status: result.status }
      )
    }
    return NextResponse.json(result.data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 500 }
    )
  }
}

/** POST: create/register user on login */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isDev) console.warn('[api/user] POST 401: No Authorization Bearer header')
    return NextResponse.json(
      { error: 'Authorization header with Bearer token is required' },
      { status: 401 }
    )
  }

  const token = authHeader.slice(7)
  if (isDev) {
    debugJwt(token)
    const expectedAudience = getExpectedAudience()
    console.log('[api/user] Expected audience:', expectedAudience ?? '(none, skipped)')
  }

  try {
    const expectedAudience = getExpectedAudience()
    await verifySequenceJwt(token, expectedAudience)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid token'
    if (isDev) {
      console.error('[api/user] JWT verification failed:', message)
      if (err instanceof Error && err.stack) console.error(err.stack)
    }
    return NextResponse.json(
      { error: `JWT verification failed: ${message}` },
      { status: 401 }
    )
  }

  let body: { username?: string; linkedWallet?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const username = typeof body.username === 'string' ? body.username.trim() : ''
  const linkedWallet = typeof body.linkedWallet === 'string' ? body.linkedWallet.trim() : ''

  if (!username) {
    return NextResponse.json(
      { error: 'username is required for user registration' },
      { status: 400 }
    )
  }

  const payload: Record<string, string> = {
    username,
    linkedWallet: linkedWallet || '',
  }

  try {
    const result = await forwardToAws(authHeader, payload, 'POST')
    if (!result.ok) {
      // Backend returns 500 for "User already exists" - treat as success (idempotent)
      if (result.status === 500 && /user already exists/i.test(result.text)) {
        return NextResponse.json({ message: 'User already exists' }, { status: 200 })
      }
      if (isDev) {
        console.error('[api/user] POST AWS error:', result.status, result.text)
      }
      return NextResponse.json(
        { error: `API error ${result.status}: ${result.text.substring(0, 500)}` },
        { status: result.status }
      )
    }
    return NextResponse.json(result.data)
  } catch (err) {
    if (isDev) {
      console.error('[api/user] POST exception:', err)
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 500 }
    )
  }
}

/** PUT: update existing user (username, linkedWallet) */
export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authorization header with Bearer token is required' },
      { status: 401 }
    )
  }

  const token = authHeader.slice(7)
  if (isDev) {
    debugJwt(token)
    console.log('[api/user] PUT expected audience:', getExpectedAudience() ?? '(none)')
  }

  try {
    const expectedAudience = getExpectedAudience()
    await verifySequenceJwt(token, expectedAudience)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid token'
    if (isDev) {
      console.error('[api/user] PUT JWT verification failed:', message)
      if (err instanceof Error && err.stack) console.error(err.stack)
    }
    return NextResponse.json(
      { error: `JWT verification failed: ${message}` },
      { status: 401 }
    )
  }

  let body: { username?: string; linkedWallet?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const username = typeof body.username === 'string' ? body.username.trim() : ''
  const linkedWallet = typeof body.linkedWallet === 'string' ? body.linkedWallet.trim() : ''

  if (!username && !linkedWallet) {
    return NextResponse.json(
      { error: 'At least one of username or linkedWallet must be provided' },
      { status: 400 }
    )
  }

  const payload: Record<string, string> = {
    username: username || '',
    linkedWallet: linkedWallet || '',
  }

  try {
    const result = await forwardToAws(authHeader, payload, 'PUT')
    if (!result.ok) {
      return NextResponse.json(
        { error: `API error ${result.status}: ${result.text.substring(0, 500)}` },
        { status: result.status }
      )
    }
    return NextResponse.json(result.data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 500 }
    )
  }
}
