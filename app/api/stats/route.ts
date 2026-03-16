import { NextRequest, NextResponse } from 'next/server'
import { parseSequenceWaaSConfigKey } from '@0xsequence/waas'
import { verifySequenceJwt } from '../../lib/verifySequenceJwt'

const STATS_API_BASE_URL = 'https://yv97bn1mj3.execute-api.us-east-1.amazonaws.com/stage-1/stats'

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

  const seasonId = request.nextUrl.searchParams.get('seasonId')?.trim() || '0'
  const upstreamUrl = `${STATS_API_BASE_URL}?seasonId=${encodeURIComponent(seasonId)}`

  try {
    const res = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `API error ${res.status}: ${text.substring(0, 500)}` },
        { status: res.status }
      )
    }

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 500 }
    )
  }
}

