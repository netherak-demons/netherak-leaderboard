import { createConfig } from '@0xsequence/connect'
import { somniaMainnet, somniaTestnet } from './chains'

const projectAccessKey = "AQAAAAAAAJbd_5JOcE50AqglZCtvu51YlGI"
const waasConfigKey = "eyJwcm9qZWN0SWQiOjQwNjExLCJycGNTZXJ2ZXIiOiJodHRwczovL3dhYXMuc2VxdWVuY2UuYXBwIn0="

export const config = createConfig('waas', {
  projectAccessKey,
  position: "center",
  defaultTheme: "dark",
  signIn: {
    projectName: "NetherakDemons",
  },
  defaultChainId: 50312,
  chainIds: [1, 50312, 421614, 11155111, 37084624],
  appName: "NetherakDemons",
  email: true,
  waasConfigKey,
  google: false,
  apple: false,
  coinbase: false,
  metaMask: true,
  wagmiConfig: {
    multiInjectedProviderDiscovery: true,
    chains: [somniaMainnet, somniaTestnet],
  },
  enableConfirmationModal: true
})