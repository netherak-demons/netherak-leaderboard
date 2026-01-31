import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Backoffice authentication endpoint
 * Validates password using hashed comparison for security
 */

// Hash password using PBKDF2 (industry standard)
function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex')
}

// Generate salt and hash for a password
function generateHash(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex')
  const hash = hashPassword(password, salt)
  return { hash, salt }
}

// Verify password against stored hash
function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashToVerify = hashPassword(password, salt)
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(hashToVerify)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    // Get hashed password from environment variable
    // Format: "hash:salt" or just "hash" (if salt is in separate env var)
    const storedPasswordHash = process.env.BACKOFFICE_PASSWORD_HASH
    const storedPasswordSalt = process.env.BACKOFFICE_PASSWORD_SALT

    if (!storedPasswordHash) {
      console.error('BACKOFFICE_PASSWORD_HASH environment variable is not set')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Parse hash format: "hash:salt" or use separate env vars
    let hash: string
    let salt: string

    if (storedPasswordHash.includes(':')) {
      // Format: "hash:salt"
      const parts = storedPasswordHash.split(':')
      hash = parts[0]
      salt = parts[1]
    } else {
      // Separate env vars
      hash = storedPasswordHash
      salt = storedPasswordSalt || ''
    }

    if (!salt) {
      console.error('Password salt is missing')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify password
    const isValid = verifyPassword(password, hash, salt)

    if (!isValid) {
      // Add small delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 100))
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Generate a simple session token (in production, use JWT or similar)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    // In production, store this token in a database or Redis
    // For now, we'll return it and the client will store it in sessionStorage
    return NextResponse.json({
      success: true,
      token,
      expiresAt,
    })
  } catch (error) {
    console.error('Backoffice auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper endpoint to generate hash for a password (development only)
// This should be removed or protected in production
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const password = searchParams.get('password')

  if (!password) {
    return NextResponse.json({
      error: 'Missing password parameter',
      usage: 'GET /api/auth/backoffice?password=your_password',
      note: 'This endpoint is only available in development mode',
    })
  }

  const { hash, salt } = generateHash(password)
  return NextResponse.json({
    hash,
    salt,
    // Combined format for easy copy-paste
    combined: `${hash}:${salt}`,
    envFormat: `BACKOFFICE_PASSWORD_HASH=${hash}:${salt}`,
    note: 'Add this to your .env.local file. Never commit it to git!',
  })
}
