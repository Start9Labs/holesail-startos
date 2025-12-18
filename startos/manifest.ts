import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'holesail',
  title: 'Holesail',
  license: 'GPL-V3',
  wrapperRepo: 'https://github.com/Start9Labs/holesail-startos/',
  upstreamRepo: 'https://github.com/holesail/holesail-docker/',
  supportSite: 'https://github.com/holesail/holesail-docker/issues/',
  marketingSite: 'https://holesail.io/',
  donationUrl: null,
  docsUrl: 'https://github.com/holesail/holesail-docker/',
  description: {
    short: 'P2P Tunnels for instant access',
    long: 'Create P2P tunnels instantly that bypass any network, firewall, NAT restrictions and expose local services over peer-to-peer tunnels. No Dynamic DNS required',
  },
  volumes: ['holesail', 'startos'],
  images: {
    holesail: {
      source: { dockerTag: 'holesail/holesail:latest' },
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
