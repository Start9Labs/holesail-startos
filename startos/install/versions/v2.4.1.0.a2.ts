import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_4_1_0_a2 = VersionInfo.of({
  version: '2.4.1:0-alpha.2',
  releaseNotes: 'Initial release for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
