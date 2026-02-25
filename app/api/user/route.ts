import { NextRequest, NextResponse } from 'next/server'
import { parseSequenceWaaSConfigKey } from '@0xsequence/waas'
import { verifySequenceJwt } from '../../lib/verifySequenceJwt'

const USER_API_URL = 'https://yv97bn1mj3.execute-api.us-east-1.amazonaws.com/stage-1/user'

function getExpectedAudience(): string | undefined {
  const waasConfigKey = process.env.NEXT_PUBLIC_SEQUENCE_WAAS_CONFIG_KEY
  if (!waasConfigKey) return undefined
  try {
    const config = parseSequenceWaaSConfigKey<{ projectId: number }>(waasConfigKey)
    const projectId = config.projectId
    if (projectId != null) {
      return `https://sequence.build/project/${projectId}`
    }
  } catch {
    // ignore
  }
  return undefined
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
  const linkedWalletRaw = body.linkedWallet
  const linkedWallet =
    typeof linkedWalletRaw === 'string' ? linkedWalletRaw.trim() : linkedWalletRaw === null ? '' : ''

  if (!username && !linkedWallet) {
    return NextResponse.json(
      { error: 'At least one of username or linkedWallet must be provided' },
      { status: 400 }
    )
  }

  // When client sends empty string for linkedWallet, forward string "null" to clear/delete it
  const payload: Record<string, string> = {
    username: username || '',
    linkedWallet: linkedWallet === '' ? 'null' : linkedWallet || '',
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
