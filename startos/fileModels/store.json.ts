import { FileHelper, matches } from '@start9labs/start-sdk'

const { dictionary, string } = matches

export const shape = dictionary([string, dictionary([string, string])])

export const storeJson = FileHelper.json(
  {
    volumeId: 'startos',
    subpath: '/store.json',
  },
  shape,
)
