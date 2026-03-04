#!/usr/bin/env node
/**
 * Check which wallets from season stats own the NKD Recipes NFT.
 * Use output for NEXT_PUBLIC_OBSERVATION_WALLET in observation mode.
 *
 * Usage:
 *   node scripts/check-nkd-recipes-wallets.mjs              # check all wallets from season stats
 *   node scripts/check-nkd-recipes-wallets.mjs 0x1234...    # check a custom wallet only
 *
 * Requires: .env.local with NETHERAK_API_KEY (only when not passing a custom wallet)
 *           NEXT_PUBLIC_NKD_RECIPES_CONTRACT in .env.local (or uses default)
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const DEFAULT_NKD_RECIPES_CONTRACT = '0xb1076dc36ac18e8e33d2f14a8d98e9d22c4fcb7f'
const SOMNIA_EXPLORER_API = 'https://explorer.somnia.network/api/v2'
const AWS_API_URL = 'https://yv97bn1mj3.execute-api.us-east-1.amazonaws.com/stage-1/stats/season'

function loadEnv() {
  const envPath = path.join(rootDir, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('Missing .env.local')
    process.exit(1)
  }
  const content = fs.readFileSync(envPath, 'utf8')
  const env = {}
  for (const line of content.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return env
}

function getNkdRecipesContract(env) {
  const c = env.NEXT_PUBLIC_NKD_RECIPES_CONTRACT?.trim()
  return c ? c.toLowerCase() : DEFAULT_NKD_RECIPES_CONTRACT
}

function toIpfsGateway(url) {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
  return url
}

function httpsGetWithBody(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const data = JSON.stringify(body)
    const opts = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    }
    const req = https.request(opts, (res) => {
      let chunks = ''
      res.on('data', (c) => (chunks += c))
      res.on('end', () => resolve({ status: res.statusCode, body: chunks }))
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function fetchAllWallets(apiKey) {
  const wallets = new Set()
  let lastKey = null

  do {
    const body = { seasonId: '0', limit: 100, ...(lastKey && { lastKey }) }
    const res = await httpsGetWithBody(AWS_API_URL, body, { 'x-api-key': apiKey })
    if (res.status !== 200) {
      throw new Error(`API ${res.status}: ${res.body}`)
    }
    const data = JSON.parse(res.body)
    const stats = data.seasonStats || []
    for (const p of stats) {
      if (p.wallet) wallets.add(p.wallet.toLowerCase())
      const linked = p.profile?.linkedWallet || p.profile?.LINKEDWALLET
      if (linked) wallets.add(linked.toLowerCase())
    }
    lastKey = data.lastEvaluatedKey || null
  } while (lastKey)

  return Array.from(wallets)
}

async function checkHasRecipes(contract, wallet) {
  const url = `${SOMNIA_EXPLORER_API}/tokens/${contract}/instances?holder_address_hash=${encodeURIComponent(wallet)}`
  const res = await fetch(url)
  if (!res.ok) return { hasRecipes: false, count: 0, imageUrl: null }
  const data = await res.json()
  const items = Array.isArray(data?.items) ? data.items : []
  const count = items.length
  const hasRecipes = count > 0
  let imageUrl = null
  if (hasRecipes && items[0]) {
    const first = items[0]
    const raw = first.image_url ?? first.metadata?.image_url ?? first.metadata?.image ?? first.media_url
    if (raw && typeof raw === 'string') {
      imageUrl = toIpfsGateway(raw)
    }
  }
  return { hasRecipes, count, imageUrl }
}

function parseWalletArg(arg) {
  if (!arg || typeof arg !== 'string') return null
  const trimmed = arg.trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null
  return trimmed.toLowerCase()
}

async function main() {
  const arg = process.argv[2]
  const customWallet = parseWalletArg(arg)
  if (arg !== undefined && !customWallet) {
    console.error('Invalid wallet. Use a valid 0x-prefixed Ethereum address (40 hex chars).')
    process.exit(1)
  }

  const env = loadEnv()
  const contract = getNkdRecipesContract(env)
  let wallets

  if (customWallet) {
    wallets = [customWallet]
    console.log(`Checking custom wallet: ${customWallet}\n`)
  } else {
    const apiKey = env.NETHERAK_API_KEY
    if (!apiKey) {
      console.error('NETHERAK_API_KEY not found in .env.local')
      process.exit(1)
    }
    console.log('Fetching wallets from season stats...')
    wallets = await fetchAllWallets(apiKey)
    console.log(`Found ${wallets.length} unique wallets\n`)
  }

  console.log(`Checking NKD Recipes ownership (contract ${contract})...`)
  const withRecipes = []

  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i]
    const { hasRecipes, count, imageUrl } = await checkHasRecipes(contract, w)
    if (hasRecipes) {
      withRecipes.push({ wallet: w, count, imageUrl })
      const countStr = count === 1 ? '1 recipe' : `${count} recipes`
      console.log(`  ✓ ${w} (${countStr})${imageUrl ? ` [image: ${imageUrl}]` : ''}`)
    }
    if ((i + 1) % 20 === 0) process.stdout.write(`  Checked ${i + 1}/${wallets.length}\r`)
  }

  console.log(`\n--- Summary ---`)
  console.log(`Wallets with NKD Recipes: ${withRecipes.length}`)
  if (withRecipes.length > 0) {
    console.log('\nAdd to .env.local for observation mode:')
    console.log(`NEXT_PUBLIC_OBSERVATION_WALLET=${withRecipes[0].wallet}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
