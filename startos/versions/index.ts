import { VersionGraph } from '@start9labs/start-sdk'
import { v_2_4_1_4 } from './v2.4.1.4'
import { v_2_4_1_5 } from './v2.4.1.5'

export const versionGraph = VersionGraph.of({
  current: v_2_4_1_5,
  other: [v_2_4_1_4],
})
