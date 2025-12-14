import { Daemons } from '@start9labs/start-sdk'
import { manifest } from './manifest'
import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   *
   * In this section, we fetch any resources or run any desired preliminary commands.
   */
  console.info('Starting Holesail!')

  const store = await storeJson.read().const(effects)
  const serviceEntries = Object.entries(store || {})

  if (!serviceEntries.length) {
    throw new Error('Store is empty') // unreachable
  }

  /**
   * ======================== Daemons ========================
   *
   * In this section, we create one or more daemons that define the service runtime.
   *
   * Each daemon defines its own health check, which can optionally be exposed to the user.
   */

  const subcontainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'holesail' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'holesail',
      subpath: null,
      mountpoint: '/usr/src/app/data',
      readonly: false,
    }),
    'holesail-sub',
  )

  let daemons: Daemons<typeof manifest, string> = sdk.Daemons.of(
    effects,
    started,
  )

  await Promise.all(
    serviceEntries.flatMap(([packageId, ifaces]) =>
      Object.entries(ifaces).map(async ([interfaceId, connectionString]) => {
        const id = `${packageId}-${interfaceId}`

        const title = packageId
        // const title = (await sdk.getServiceManifest(effects, packageId)).title

        const iface = await sdk.serviceInterface
          .get(effects, {
            id: interfaceId,
            packageId,
          })
          .once()

        if (!iface?.addressInfo || !iface.host) {
          return Promise.resolve(null)
        }

        const port = iface.addressInfo.internalPort

        if (!port) {
          return Promise.resolve(null)
        }

        daemons = daemons.addDaemon(id as never, {
          subcontainer,
          exec: {
            command: sdk.useEntrypoint(),
            user: '1001',
            env: {
              MODE: 'server',
              PORT: String(port),
              HOST: `${packageId}.startos`,
              KEY: connectionString,
              LOG: String(true),
              NODE_ENV: 'production',
            },
          },
          ready: {
            display: `${title} - ${iface.name}`,
            fn: () => ({
              result: 'success',
              message: 'Tunnel is working',
            }),
          },
          requires: [],
        })
      }),
    ),
  )

  return daemons
})
