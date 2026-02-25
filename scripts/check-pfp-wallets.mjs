#!/usr/bin/env node
/**
 * Check which wallets from season stats own a PFP NFT.
 * Use output for NEXT_PUBLIC_OBSERVATION_WALLET in observation mode.
 *
 * Usage:
 *   node scripts/check-pfp-wallets.mjs              # check all wallets from season stats
 *   node scripts/check-pfp-wallets.mjs 0x1234...    # check a custom wallet only
 *
 * Requires: .env.local with NETHERAK_API_KEY (only when not passing a custom wallet)
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const PFP_CONTRACT = '0x9559ff653d4c8cc3565Dd639963597F1aAaE6A6A'
const RPC_URL = 'https://rpc.ankr.com/somnia_mainnet'
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

async function checkBalance(wallet) {
  const addr = wallet.replace(/^0x/, '').toLowerCase().padStart(64, '0')
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{ to: PFP_CONTRACT, data: '0x70a08231' + addr }, 'latest'],
      id: 1,
    }),
  })
  const json = await res.json()
  if (json.error) return 0
  return parseInt(json.result || '0x0', 16)
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
  let wallets

  if (customWallet) {
    wallets = [customWallet]
    console.log(`Checking custom wallet: ${customWallet}\n`)
  } else {
    const env = loadEnv()
    const apiKey = env.NETHERAK_API_KEY
    if (!apiKey) {
      console.error('NETHERAK_API_KEY not found in .env.local')
      process.exit(1)
    }
    console.log('Fetching wallets from season stats...')
    wallets = await fetchAllWallets(apiKey)
    console.log(`Found ${wallets.length} unique wallets\n`)
  }

  console.log(`Checking PFP ownership (contract ${PFP_CONTRACT})...`)
  const withPfp = []

  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i]
    const balance = await checkBalance(w)
    if (balance > 0) {
      withPfp.push(w)
      console.log(`  ✓ ${w} (${balance} PFP${balance > 1 ? 's' : ''})`)
    }
    if ((i + 1) % 20 === 0) process.stdout.write(`  Checked ${i + 1}/${wallets.length}\r`)
  }

  console.log(`\n--- Summary ---`)
  console.log(`Wallets with PFP: ${withPfp.length}`)
  if (withPfp.length > 0) {
    console.log('\nAdd to .env.local for observation mode:')
    console.log(`NEXT_PUBLIC_OBSERVATION_WALLET=${withPfp[0]}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
