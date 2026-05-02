import { setupManifest } from '@start9labs/start-sdk'
import i18n from './i18n'

export const manifest = setupManifest({
  id: 'holesail',
  title: 'Holesail',
  license: 'GPL-V3',
  packageRepo: 'https://github.com/Start9-Community/holesail-startos',
  upstreamRepo: 'https://github.com/holesail/holesail-docker/',
  marketingUrl: 'https://holesail.io/',
  donationUrl: null,
  docsUrls: ['https://docs.holesail.io/'],
  description: i18n.description,
  volumes: ['holesail', 'startos'],
  images: {
    holesail: {
      source: { dockerTag: 'holesail/holesail:latest' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
