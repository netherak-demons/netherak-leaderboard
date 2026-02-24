import { createConfig } from '@0xsequence/connect'
import { somniaMainnet, somniaTestnet } from './chains'

// Sequence credentials - should be in environment variables
// These are public keys that can be exposed to the client, but it's better practice to use env vars
const projectAccessKey = process.env.NEXT_PUBLIC_SEQUENCE_PROJECT_ACCESS_KEY || ''
const waasConfigKey = process.env.NEXT_PUBLIC_SEQUENCE_WAAS_CONFIG_KEY || ''

// Debug: ambos deben ser del mismo proyecto (40611). El JWT aud viene del projectAccessKey.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const waasProject = (() => {
    if (!waasConfigKey) return null
    try {
      return JSON.parse(atob(waasConfigKey)).projectId
    } catch {
      return null
    }
  })()
  console.log('[sequence] Config cargada:', {
    waasProjectId: waasProject,
    esperado: 40611,
    projectAccessKeyPrefix: projectAccessKey ? projectAccessKey.slice(0, 15) + '...' : '(vacío)',
  })
  if (waasProject && waasProject !== 40611) {
    console.warn('[sequence] ⚠️ waasConfigKey tiene projectId', waasProject, '- debería ser 40611')
  }
}

export const config = createConfig('waas', {
  projectAccessKey,
  position: 'center',
  defaultTheme: 'dark',
  signIn: {
    projectName: 'NetherakDemons',
  },
  defaultChainId: 50312,
  chainIds: [1, 50312, 421614, 11155111, 37084624],
  appName: 'NetherakDemons',
  email: true,
  waasConfigKey,
  google: false,
  apple: false,
  coinbase: false,
  metaMask: false,
  walletConnect: false,
  guest: false,
  wagmiConfig: {
    multiInjectedProviderDiscovery: false,
    chains: [somniaMainnet, somniaTestnet],
  },
  enableConfirmationModal: true,
})