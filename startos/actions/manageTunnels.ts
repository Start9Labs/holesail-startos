import { z } from '@start9labs/start-sdk'
import { shape, storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getRandomConnectionString } from '../utils'

const { InputSpec, Value, List, Variants } = sdk

export const inputSpec = InputSpec.of({
  tunnels: Value.list(
    List.obj(
      { name: i18n('Tunnels') },
      {
        displayAs: '{{service.selection}} {{service.value.iface}}',
        uniqueBy: { all: ['service.selection', 'service.value.iface'] },
        spec: InputSpec.of({
          service: Value.dynamicUnion(async ({ effects }) => {
            const packages = await sdk.getInstalledPackages(effects)

            const entries = await Promise.all(
              packages.map(async (packageId) => {
                const title =
                  (await sdk
                    .getServiceManifest(effects, packageId, (m) => m?.title)
                    .const()) ?? packageId

                const iFaces = await sdk.serviceInterface
                  .getAll(effects, { packageId }, (ifaces) => ifaces.map(i => [i.id, i.name]))
                  .once()

                return getSpec(packageId, title, iFaces)
              }),
            )

            return {
              name: i18n('Service'),
              default: '',
              disabled: false,
              variants: Variants.of(
                Object.fromEntries(
                  [
                    getSpec('startos', 'StartOS', [['ui', 'UI']]),
                  ].concat(entries),
                ),
              ),
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
    name: i18n('Manage Tunnels'),
    description: i18n('Add and remove Holesail tunnels'),
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

    const toSave: z.infer<typeof shape> = {}

    input.tunnels.forEach((tunnel) => {
      const { selection, value } = tunnel.service as {
        selection: string
        value: {
          iface: string
          isPublic: boolean
        }
      }

      const iface: (z.infer<typeof shape>)[''] = {
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

function getSpec(
  packageId: string,
  packageTitle: string,
  iFaces: string[][],
) {
  return [
    packageId,
    {
      name: packageTitle,
      spec: InputSpec.of({
        iface: Value.select({
          name: i18n('Service Interface'),
          default: '',
          values: Object.fromEntries(iFaces),
        }),
        isPublic: Value.toggle({
          name: i18n('Public'),
          default: false,
        }),
      }),
    },
  ] as const
}
