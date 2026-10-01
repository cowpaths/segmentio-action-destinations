import { Analytics, Context } from '@segment/analytics-next'
import { Subscription } from '@segment/browser-destination-runtime/types'
import { JSONArray } from '@segment/actions-core'

const example: Subscription[] = [
  {
    partnerAction: 'trackEvent',
    name: 'Track Event',
    enabled: true,
    subscribe: 'type = "track"',
    mapping: {
      name: {
        '@path': '$.name'
      },
      properties: {
        '@path': '$.properties'
      }
    }
  },
  {
    partnerAction: 'identifyUser',
    name: 'Identify User',
    enabled: true,
    subscribe: 'type = "identify"',
    mapping: {
      anonymousId: {
        '@path': '$.anonymousId'
      },
      userId: {
        '@path': '$.userId'
      },
      email: {
        '@path': '$.traits.email'
      },
      traits: {
        '@path': '$.traits'
      },
      displayName: {
        '@path': '$.traits.name'
      }
    }
  }
]

let fullstory: typeof import('..').default
let destination: typeof import('..').destination
let FullStoryTypes: typeof import('../types')

beforeEach(async () => {
  jest.restoreAllMocks()
  // @fullstory/browser 2.1+ keeps its init state in module scope rather than on window._fs_* globals,
  // so reload the destination (and the SDK with it) to get a fresh, uninitialized SDK for each test.
  jest.resetModules()
  const destinationModule = await import('..')
  fullstory = destinationModule.default
  destination = destinationModule.destination
  FullStoryTypes = await import('../types')
  // @ts-ignore
  delete window.FS
})

test('can load fullstory', async () => {
  const [event] = await fullstory({
    orgId: 'thefullstory.com',
    host: 'customdomain.com',
    subscriptions: example as unknown as JSONArray
  })

  jest.spyOn(destination.actions.trackEvent, 'perform')
  jest.spyOn(destination, 'initialize')

  await event.load(Context.system(), {} as Analytics)
  expect(destination.initialize).toHaveBeenCalled()

  const ctx = await event.track?.(
    new Context({
      type: 'track',
      properties: {
        banana: 'banana'
      }
    })
  )

  expect(destination.actions.trackEvent.perform).toHaveBeenCalled()
  expect(ctx).not.toBeUndefined()

  const scripts = window.document.querySelectorAll('script')
  expect(scripts).toMatchInlineSnapshot(`
    NodeList [
      <script
        crossorigin="anonymous"
        data-fs-namespace="FS"
        src="https://edge.fullstory.com/s/fs.js?org=thefullstory.com"
      />,
      <script>
        // the emptiness
      </script>,
    ]
  `)
})

describe('custom domain settings', () => {
  let initFullStorySpy: jest.SpyInstance

  beforeEach(() => {
    initFullStorySpy = jest.spyOn(FullStoryTypes, 'initFullStory')
  })

  test('initializes with custom host setting', async () => {
    const [event] = await fullstory({
      orgId: 'test-org-id',
      subscriptions: example as unknown as JSONArray,
      host: 'custom-recording.example.com'
    })

    await event.load(Context.system(), {} as Analytics)

    expect(initFullStorySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'test-org-id',
        host: 'custom-recording.example.com'
      })
    )
  })

  test('initializes with custom appHost setting', async () => {
    const [event] = await fullstory({
      orgId: 'test-org-id',
      subscriptions: example as unknown as JSONArray,
      appHost: 'app.example.com'
    })

    await event.load(Context.system(), {} as Analytics)

    expect(initFullStorySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'test-org-id',
        appHost: 'app.example.com'
      })
    )
  })

  test('initializes with custom script URL setting', async () => {
    const [event] = await fullstory({
      orgId: 'test-org-id',
      subscriptions: example as unknown as JSONArray,
      script: 'custom-cdn.example.com/fs.js'
    })

    await event.load(Context.system(), {} as Analytics)

    expect(initFullStorySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'test-org-id',
        script: 'custom-cdn.example.com/fs.js'
      })
    )

    const scripts = window.document.querySelectorAll('script')
    expect(scripts).toMatchInlineSnapshot(`
      NodeList [
        <script
          crossorigin="anonymous"
          data-fs-namespace="FS"
          src="https://custom-cdn.example.com/fs.js?org=test-org-id"
        />,
        <script>
          // the emptiness
        </script>,
      ]
    `)
  })

  test('initializes with all custom settings together', async () => {
    const [event] = await fullstory({
      orgId: 'test-org-id',
      subscriptions: example as unknown as JSONArray,
      host: 'custom-recording.example.com',
      appHost: 'app.example.com',
      script: 'custom-cdn.example.com/fs.js'
    })

    await event.load(Context.system(), {} as Analytics)

    expect(initFullStorySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'test-org-id',
        host: 'custom-recording.example.com',
        appHost: 'app.example.com',
        script: 'custom-cdn.example.com/fs.js'
      })
    )

    const scripts = window.document.querySelectorAll('script')
    expect(scripts).toMatchInlineSnapshot(`
      NodeList [
        <script
          crossorigin="anonymous"
          data-fs-namespace="FS"
          src="https://custom-cdn.example.com/fs.js?org=test-org-id"
        />,
        <script>
          // the emptiness
        </script>,
      ]
    `)
  })

  test('initializes without custom settings when not provided', async () => {
    const [event] = await fullstory({
      orgId: 'test-org-id',
      subscriptions: example as unknown as JSONArray
    })

    await event.load(Context.system(), {} as Analytics)

    const callArgs = initFullStorySpy.mock.calls[0][0]
    expect(callArgs).toEqual(
      expect.objectContaining({
        orgId: 'test-org-id'
      })
    )
    expect(callArgs).not.toHaveProperty('host')
    expect(callArgs).not.toHaveProperty('appHost')
    expect(callArgs).not.toHaveProperty('script')

    const scripts = window.document.querySelectorAll('script')
    expect(scripts).toMatchInlineSnapshot(`
      NodeList [
        <script
          crossorigin="anonymous"
          data-fs-namespace="FS"
          src="https://edge.fullstory.com/s/fs.js?org=test-org-id"
        />,
        <script>
          // the emptiness
        </script>,
      ]
    `)
  })

  describe('region handling', () => {
    // Snippet 2.1 appends `?org=<orgId>` to the script URL; only the origin and path matter for region handling.
    const scriptSrcs = () =>
      Array.from(window.document.querySelectorAll('script[src]')).map((script) => {
        const { origin, pathname } = new URL(script.getAttribute('src') as string)
        return origin + pathname
      })

    test('loads fs.js from the regional edge when the orgId carries a region', async () => {
      const [event] = await fullstory({
        orgId: 'o-ABC123-eu1',
        subscriptions: example as unknown as JSONArray
      })

      await event.load(Context.system(), {} as Analytics)

      expect(scriptSrcs()).toContain('https://edge.eu1.fullstory.com/s/fs.js')
    })

    test('leaves a custom proxy script URL untouched for a regional orgId', async () => {
      const [event] = await fullstory({
        orgId: 'o-ABC123-eu1',
        subscriptions: example as unknown as JSONArray,
        host: 'proxy.example.com',
        script: 'custom-cdn.example.com/fs.js'
      })

      await event.load(Context.system(), {} as Analytics)

      expect(scriptSrcs()).toContain('https://custom-cdn.example.com/fs.js')
      expect(scriptSrcs()).not.toContain('https://edge.eu1.fullstory.com/s/fs.js')
    })

    test('loads fs.js from the default edge for an na1 orgId', async () => {
      const [event] = await fullstory({
        orgId: 'o-ABC123-na1',
        subscriptions: example as unknown as JSONArray
      })

      await event.load(Context.system(), {} as Analytics)

      expect(scriptSrcs()).toContain('https://edge.fullstory.com/s/fs.js')
    })
  })

  test('initializes with debug and recordOnlyThisIFrame along with custom settings', async () => {
    const [event] = await fullstory({
      orgId: 'test-org-id',
      subscriptions: example as unknown as JSONArray,
      debug: true,
      recordOnlyThisIFrame: true,
      host: 'custom-recording.example.com',
      appHost: 'app.example.com'
    })

    await event.load(Context.system(), {} as Analytics)

    expect(initFullStorySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'test-org-id',
        debug: true,
        recordOnlyThisIFrame: true,
        host: 'custom-recording.example.com',
        appHost: 'app.example.com'
      })
    )
  })
})
