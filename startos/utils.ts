import { utils } from '@start9labs/start-sdk'

export function getRandomKey() {
  return utils.getDefaultString({
    charset: 'a-z,A-Z,0-9',
    len: 32,
  })
}
