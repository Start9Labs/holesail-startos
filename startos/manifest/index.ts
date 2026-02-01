import { setupManifest } from '@start9labs/start-sdk'
import i18n from './i18n'

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
  description: i18n.description,
  volumes: ['holesail', 'startos'],
  images: {
    holesail: {
      source: { dockerTag: 'holesail/holesail:2.4.1' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
