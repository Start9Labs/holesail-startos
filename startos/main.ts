import { Daemons } from '@start9labs/start-sdk'
import { i18n } from './i18n'
import { manifest } from './manifest'
import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'

export const main = sdk.setupMain(async ({ effects }) => {
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

  let daemons: Daemons<typeof manifest, string> = sdk.Daemons.of(effects)

  await Promise.all(
    serviceEntries.map(async ([packageId, ifaces]) => {
      let packageTitle = 'StartOS'

      if (packageId !== 'startos') {
        packageTitle =
          (await sdk
            .getServiceManifest(effects, packageId, (m) => m?.title)
            .const()) ?? packageId
      }

      await Promise.all(
        Object.entries(ifaces).map(async ([interfaceId, connectionString]) => {
          const id = `${packageId}-${interfaceId}`

          let interfaceName = 'UI'
          let HOST = 'startos'
          let PORT: string | undefined

          if (packageId === 'startos') {
            PORT = '80'
          } else {
            HOST = `${packageId}.${HOST}`

            const iface = await sdk.serviceInterface
              .get(effects, {
                id: interfaceId,
                packageId,
              })
              .once()

            if (iface?.addressInfo) {
              interfaceName = iface.name
              PORT = String(iface.addressInfo.internalPort)
            }
          }

          if (!PORT) {
            return Promise.resolve(null)
          }

          daemons = daemons.addDaemon(id as never, {
            subcontainer,
            exec: {
              command: sdk.useEntrypoint(),
              env: {
                MODE: 'server',
                PORT,
                HOST,
                KEY: connectionString,
                LOG: 'true',
                NODE_ENV: 'production',
              },
            },
            ready: {
              display: `${packageTitle} - ${interfaceName}`,
              fn: () => ({
                result: 'success',
                message: 'Tunnel is working',
              }),
            },
            requires: [],
          })
        }),
      )
    }),
  )

  return daemons
})
