import { sdk } from '../sdk'
import { manageTunnels } from './manageTunnels'

export const actions = sdk.Actions.of().addAction(manageTunnels)
