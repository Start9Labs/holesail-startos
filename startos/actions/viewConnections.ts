import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const viewConnections = sdk.Action.withoutInput(
  // id
  'view-connections',

  // metadata
  async ({ effects }) => ({
    name: 'View Connections',
    description: 'View the connection URLs for your tunnels',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: Object.keys((await storeJson.read().const(effects)) || {})
      .length
      ? 'enabled'
      : { disabled: 'You have no tunnels' },
  }),

  // execution function
  async ({ effects }) => {
    const store = (await storeJson.read().once()) || {}

    const val = (
      await Promise.all(
        Object.entries(store).map(async ([packageId, ifaces]) => {
          const title = packageId
          // const title = (await sdk.getServiceManifest(effects, packageId)).title

          return Promise.all(
            Object.entries(ifaces).map(
              async ([interfaceId, connectionString]) => {
                let name = 'StartOS - UI'

                if (packageId !== 'startos') {
                  const iface = await sdk.serviceInterface
                    .get(effects, {
                      id: interfaceId,
                      packageId,
                    })
                    .once()

                  name = `${title} - ${iface?.name}`
                }

                return {
                  type: 'single',
                  name,
                  description: null,
                  value: connectionString,
                  masked: true,
                  copyable: true,
                  qr: true,
                }
              },
            ),
          )
        }),
      )
    ).flat()

    return {
      version: '1',
      title: 'Connections',
      message: null,
      result: {
        type: 'group',
        value: (
          await Promise.all(
            Object.entries(store).flatMap(async ([packageId, ifaces]) => {
              let packageTitle = 'StartOS'

              if (packageId !== 'startos') {
                packageTitle = packageId
                // title = (await sdk.getServiceManifest(effects, packageId)).title
              }

              return Promise.all(
                Object.entries(ifaces).map(
                  async ([interfaceId, connectionString]) => {
                    let ifaceName = 'UI'

                    if (packageId !== 'startos') {
                      const iface = await sdk.serviceInterface
                        .get(effects, {
                          id: interfaceId,
                          packageId,
                        })
                        .once()

                      ifaceName = iface?.name || 'unknown'
                    }

                    return {
                      type: 'single' as const,
                      name: `${packageTitle} - ${ifaceName}`,
                      description: null,
                      value: connectionString,
                      masked: true,
                      copyable: true,
                      qr: true,
                    }
                  },
                ),
              )
            }),
          )
        ).flat(),
      },
    }
  },
)
