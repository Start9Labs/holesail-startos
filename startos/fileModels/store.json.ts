import { FileHelper, matches } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const { dictionary, string } = matches

export const shape = dictionary([string, dictionary([string, string])])

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.startos,
    subpath: '/store.json',
  },
  shape,
)
