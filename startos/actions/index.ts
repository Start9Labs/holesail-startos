import { sdk } from '../sdk'
import { manageTunnels } from './manageTunnels'
import { viewConnections } from './viewConnections'

export const actions = sdk.Actions.of()
  .addAction(manageTunnels)
  .addAction(viewConnections)
