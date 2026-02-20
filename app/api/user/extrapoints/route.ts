import { NextRequest, NextResponse } from 'next/server'

const EXTRAPOINTS_URL = 'https://yv97bn1mj3.execute-api.us-east-1.amazonaws.com/stage-1/user/extrapoints'

export async function POST(request: NextRequest) {
  const apiKey = process.env.NETHERAK_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server configuration error: API key not configured' },
      { status: 500 }
    )
  }

  let body: { wallet?: string; amount?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const wallet = typeof body.wallet === 'string' ? body.wallet.trim() : ''
  const amount = typeof body.amount === 'number' ? body.amount : Number(body.amount)

  if (!wallet) {
    return NextResponse.json(
      { error: 'wallet is required' },
      { status: 400 }
    )
  }

  if (isNaN(amount)) {
    return NextResponse.json(
      { error: 'amount must be a number' },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(EXTRAPOINTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ wallet, amount }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `API error ${res.status}: ${text.substring(0, 500)}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 500 }
    )
  }
}
