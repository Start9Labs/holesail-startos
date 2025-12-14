import { utils } from '@start9labs/start-sdk'

export function getRandomConnectionString(isPublic: boolean) {
  const key = utils.getDefaultString({
    charset: 'a-z,A-Z,0-9',
    len: 42,
  })

  return `hs://${isPublic ? '0' : 's'}000${key}`
}
