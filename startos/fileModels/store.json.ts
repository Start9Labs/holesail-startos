import { FileHelper, matches } from '@start9labs/start-sdk'

const { dictionary, string, object, boolean } = matches

export const shape = dictionary([
  string,
  dictionary([
    string,
    object({
      key: string,
      isPublic: boolean,
    }),
  ]),
])

export const storeJson = FileHelper.json(
  {
    volumeId: 'startos',
    subpath: '/store.json',
  },
  shape,
)
