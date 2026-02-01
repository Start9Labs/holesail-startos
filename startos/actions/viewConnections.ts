import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const viewConnections = sdk.Action.withoutInput(
  // id
  'view-connections',

  // metadata
  async ({ effects }) => ({
    name: i18n('View Connections'),
    description: i18n('View the connection URLs for your tunnels'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: Object.keys((await storeJson.read().const(effects)) || {})
      .length
      ? 'enabled'
      : { disabled: i18n('You have no tunnels') },
  }),

  // execution function
  async ({ effects }) => {
    const store = (await storeJson.read().once()) || {}

    const val = (
      await Promise.all(
        Object.entries(store).map(async ([packageId, ifaces]) => {
          const title = await sdk
            .getServiceManifest(effects, packageId, (m) => m?.title)
            .const()

          return Promise.all(
            Object.entries(ifaces).map(
              async ([interfaceId, connectionString]) => {
                let name = 'StartOS - UI'

                if (packageId !== 'startos') {
                  const name = await sdk.serviceInterface
                    .get(effects, {
                      id: interfaceId,
                      packageId,
                    }, (i) => `${title} - ${i?.name}`)
                    .once()
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
      title: i18n('Connections'),
      message: null,
      result: {
        type: 'group',
        value: (
          await Promise.all(
            Object.entries(store).flatMap(async ([packageId, ifaces]) => {
              let packageTitle = 'StartOS'

              if (packageId !== 'startos') {
                packageTitle =
                  (await sdk
                    .getServiceManifest(effects, packageId, (m) => m?.title)
                    .const()) ?? packageId
              }

              return Promise.all(
                Object.entries(ifaces).map(
                  async ([interfaceId, connectionString]) => {
                    let ifaceName = 'UI'

                    if (packageId !== 'startos') {
                      ifaceName = await sdk.serviceInterface
                        .get(effects, {
                          id: interfaceId,
                          packageId,
                        }, (i) => i?.name || 'unknown')
                        .once()
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
