import { manageTunnels } from '../actions/manageTunnels'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskAddTunnel = sdk.setupOnInit(async (effects, _) => {
  const store = await storeJson.read().const(effects)

  if (!Object.keys(store || {}).length) {
    await sdk.action.createOwnTask(effects, manageTunnels, 'critical', {
      reason: i18n('Create your first tunnel'),
    })
  }
})
