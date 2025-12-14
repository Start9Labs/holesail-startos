import { shape, storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { getRandomConnectionString } from '../utils'

const { InputSpec, Value, List, Variants } = sdk

export const inputSpec = InputSpec.of({
  tunnels: Value.list(
    List.obj(
      { name: 'Tunnels' },
      {
        displayAs: '{{service.selection}} {{service.value.iface}}',
        uniqueBy: { all: ['service.selection', 'service.value.iface'] },
        spec: InputSpec.of({
          service: Value.dynamicUnion(async ({ effects }) => {
            const packages = await sdk.getInstalledPackages(effects)

            const entries: [
              string,
              {
                name: any
                spec: ReturnType<typeof InputSpec.of>
              },
            ][] = await Promise.all(
              packages.map(async (packageId) => {
                const title = packageId
                // const title = (await sdk.getServiceManifest(effects, packageId)).title

                const iFaces = await sdk.serviceInterface
                  .getAll(effects, { packageId })
                  .once()

                return [
                  packageId,
                  {
                    name: title,
                    spec: InputSpec.of({
                      iface: Value.select({
                        name: 'Service Interface',
                        default: '',
                        values: Object.fromEntries(
                          iFaces.map((i) => [i.id, i.name]),
                        ),
                      }),
                      isPublic: Value.toggle({
                        name: 'Public',
                        default: false,
                      }),
                    }),
                  },
                ]
              }),
            )

            return {
              name: 'Service',
              default: '',
              disabled: false,
              variants: Variants.of(Object.fromEntries(entries)),
            }
          }),
        }),
      },
    ),
  ),
})

export const manageTunnels = sdk.Action.withInput(
  // id
  'manage-tunnels',

  // metadata
  async ({ effects }) => ({
    name: 'Manage Tunnels',
    description: 'Add and remove Holesail tunnels',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // input spec
  inputSpec,

  // optionally pre-fill form
  async ({ effects }) => {
    const store = (await storeJson.read().once()) || {}

    return {
      tunnels: Object.entries(store).flatMap(([packageId, ifaces]) =>
        Object.entries(ifaces).map(([interfaceId, connectionString]) => ({
          service: {
            selection: packageId,
            value: {
              iface: interfaceId,
              isPublic: connectionString.charAt(5) === '0',
            },
          },
        })),
      ),
    }
  },

  // execution function
  async ({ effects, input }) => {
    const store = (await storeJson.read().once()) || {}

    const toSave: typeof shape._TYPE = {}

    input.tunnels.forEach((tunnel) => {
      const { selection, value } = tunnel.service as {
        selection: string
        value: {
          iface: string
          isPublic: boolean
        }
      }

      const iface: (typeof shape._TYPE)[''] = {
        [value.iface]:
          store[selection]?.[value.iface] ||
          getRandomConnectionString(value.isPublic),
      }

      if (!toSave[selection]) {
        toSave[selection] = iface
      } else {
        toSave[selection] = {
          ...toSave[selection],
          ...iface,
        }
      }
    })

    await storeJson.write(effects, toSave)
  },
)
