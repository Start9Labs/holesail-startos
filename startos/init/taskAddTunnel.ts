import { manageTunnels } from '../actions/manageTunnels'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const taskAddTunnel = sdk.setupOnInit(async (effects, _) => {
  const store = await storeJson.read().const(effects)

  if (!Object.keys(store || {}).length) {
    await sdk.action.createOwnTask(effects, manageTunnels, 'critical', {
      reason: 'Create your first tunnel',
    })
  }
})
