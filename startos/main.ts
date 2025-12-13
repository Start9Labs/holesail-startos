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
      Object.entries(ifaces).map(async ([interfaceId, { key, isPublic }]) => {
        const id = `${packageId}-${interfaceId}`

        const title = interfaceId
        // const title = (await sdk.getServiceManifest(effects, packageId)).title

        const iface = await sdk.serviceInterface
          .get(effects, {
            id: interfaceId,
            packageId,
          })
          .once()

        const port =
          iface?.host?.bindings[iface.addressInfo?.internalPort || 0]?.net
            .assignedPort

        if (!port) {
          return Promise.resolve(null)
        }

        daemons = daemons.addDaemon(id as never, {
          subcontainer,
          exec: {
            command: sdk.useEntrypoint(),
            env: {
              MODE: 'server',
              PORT: String(port),
              HOST: '0.0.0.0',
              KEY: key,
              PUBLIC: String(isPublic),
              LOG: String(true),
            },
          },
          ready: {
            display: `${title} - ${iface.name}`,
            fn: () =>
              sdk.healthCheck.checkWebUrl(
                effects,
                `${packageId}.startos:${port}`,
                {
                  successMessage: 'The tunnel is healthy',
                  errorMessage: 'Problem with the tunnel',
                },
              ),
          },
          requires: [],
        })
      }),
    ),
  )

  return daemons
})
