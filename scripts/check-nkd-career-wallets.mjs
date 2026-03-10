#!/usr/bin/env node
/**
 * Check which wallets own the NKD Career NFT.
 * Contract 0x5D8469A1269C8bbb15553792E538f08aA89CAe2F
 *
 * Usage:
 *   node scripts/check-nkd-career-wallets.mjs                    # check all wallets from season stats
 *   node scripts/check-nkd-career-wallets.mjs 0x1234...             # check a custom wallet only
 *   node scripts/check-nkd-career-wallets.mjs --info                # show token info from explorer
 *   node scripts/check-nkd-career-wallets.mjs 0x1234... --info      # check wallet + show token info
 *
 * Requires: .env.local with NETHERAK_API_KEY (only when not passing a custom wallet)
 *           NEXT_PUBLIC_NKD_CAREER_CONTRACT in .env.local (or uses default)
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const DEFAULT_NKD_CAREER_CONTRACT = '0x5D8469A1269C8bbb15553792E538f08aA89CAe2F'
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

function getNkdCareerContract(env) {
  const c = env.NEXT_PUBLIC_NKD_CAREER_CONTRACT?.trim()
  return c ? c.toLowerCase() : DEFAULT_NKD_CAREER_CONTRACT
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

async function fetchTokenInfo(contract) {
  try {
    const res = await fetch(`${SOMNIA_EXPLORER_API}/tokens/${contract}`)
    if (!res.ok) return null
    const data = await res.json()
    return {
      name: data?.name ?? data?.symbol ?? 'Unknown',
      symbol: data?.symbol ?? '-',
      type: data?.type ?? '-',
      totalSupply: data?.total_supply ?? '-',
      holdersCount: data?.holders_count ?? '-',
    }
  } catch {
    return null
  }
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

async function checkHasNft(contract, wallet) {
  const url = `${SOMNIA_EXPLORER_API}/tokens/${contract}/instances?holder_address_hash=${encodeURIComponent(wallet)}`
  const res = await fetch(url)
  if (!res.ok) return { hasNft: false, count: 0 }
  const data = await res.json()
  const items = Array.isArray(data?.items) ? data.items : []
  return { hasNft: items.length > 0, count: items.length }
}

function parseWalletArg(arg) {
  if (!arg || typeof arg !== 'string') return null
  const trimmed = arg.trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null
  return trimmed.toLowerCase()
}

async function main() {
  const args = process.argv.slice(2)
  const showInfo = args.includes('--info')
  const filteredArgs = args.filter((a) => a !== '--info')
  const arg = filteredArgs[0]
  const customWallet = parseWalletArg(arg)

  if (arg !== undefined && !customWallet && filteredArgs.length > 0) {
    console.error('Invalid wallet. Use a valid 0x-prefixed Ethereum address (40 hex chars).')
    process.exit(1)
  }

  const env = loadEnv()
  const contract = getNkdCareerContract(env)
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

  if (showInfo) {
    console.log('--- Token info (from Somnia Explorer) ---')
    const info = await fetchTokenInfo(contract)
    if (info) {
      console.log(`  Contract: ${contract}`)
      console.log(`  Name:    ${info.name}`)
      console.log(`  Symbol:  ${info.symbol}`)
      console.log(`  Type:    ${info.type}`)
      console.log(`  Supply:  ${info.totalSupply}`)
      console.log(`  Holders: ${info.holdersCount}`)
    } else {
      console.log('  (Could not fetch token info)')
    }
    console.log('')
  }

  console.log(`Checking NKD Career ownership (contract ${contract})...`)
  const withNft = []

  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i]
    const { hasNft, count } = await checkHasNft(contract, w)
    if (hasNft) {
      withNft.push({ wallet: w, count })
      const countStr = count === 1 ? '1 token' : `${count} tokens`
      console.log(`  ✓ ${w} (${countStr})`)
    }
    if ((i + 1) % 20 === 0) process.stdout.write(`  Checked ${i + 1}/${wallets.length}\r`)
  }

  console.log(`\n--- Summary ---`)
  console.log(`Wallets with NKD Career: ${withNft.length}`)
  if (withNft.length > 0) {
    console.log('\nAdd to .env.local for observation mode:')
    console.log(`NEXT_PUBLIC_OBSERVATION_WALLET=${withNft[0].wallet}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
