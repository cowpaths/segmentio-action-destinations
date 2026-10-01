import type { FS } from './types'
import type { BrowserDestinationDefinition } from '@segment/browser-destination-runtime/types'
import { initFullstory } from './types'
import { browserDestination } from '@segment/browser-destination-runtime/shim'
import type { Settings } from './generated-types'
import trackEvent from './trackEvent'
import trackEventV2 from './trackEventV2'
import identifyUser from './identifyUser'
import identifyUserV2 from './identifyUserV2'
import viewedPage from './viewedPage'
import viewedPageV2 from './viewedPageV2'
import { defaultValues } from '@segment/actions-core'

declare global {
  interface Window {
    FS: FS
  }
}

export const segmentEventSource = 'segment-browser-actions'

export const destination: BrowserDestinationDefinition<Settings, FS> = {
  name: 'Fullstory (Actions)',
  slug: 'actions-fullstory',
  mode: 'device',
  presets: [
    {
      name: 'Track Event',
      subscribe: 'type = "track"',
      partnerAction: 'trackEventV2',
      mapping: defaultValues(trackEventV2.fields),
      type: 'automatic'
    },
    {
      name: 'Identify User',
      subscribe: 'type = "identify"',
      partnerAction: 'identifyUserV2',
      mapping: defaultValues(identifyUserV2.fields),
      type: 'automatic'
    },
    {
      name: 'Viewed Page',
      subscribe: 'type = "page"',
      partnerAction: 'viewedPageV2',
      mapping: defaultValues(viewedPageV2.fields),
      type: 'automatic'
    }
  ],
  settings: {
    orgId: {
      description: 'The organization ID for Fullstory.',
      label: 'FS Org',
      type: 'string',
      required: true
    },
    debug: {
      description: 'Enables Fullstory debug mode.',
      label: 'Debug mode',
      type: 'boolean',
      required: false,
      default: false
    },
    recordOnlyThisIFrame: {
      description: 'Enables Fullstory inside an iframe.',
      label: 'Capture only this iFrame',
      type: 'boolean',
      required: false,
      default: false
    },
    host: {
      label: 'Host',
      description:
        "The domain of the web capture server host. Can be set to direct captured events to a [Fullstory Custom Endpoint](https://help.fullstory.com/hc/en-us/articles/18612999473175-How-to-send-captured-traffic-to-your-First-Party-Domain-using-Custom-Endpoints) or a proxy that you host. Defaults to 'fullstory.com', or the region-specific equivalent (for example 'eu1.fullstory.com') when the Org ID carries a region suffix.",
      type: 'string',
      required: false
    },
    appHost: {
      label: 'App Host',
      description:
        'The base URL of the Fullstory application, used when generating and displaying session URLs. Only set this if you need a value other than a Fullstory URL, which is rarely the case. Leave blank to use the default for your Org ID.',
      type: 'string',
      required: false
    },
    script: {
      label: 'Custom Script URL',
      description:
        "Optionally specify a custom Fullstory script URL. Useful if you are using a proxy. The default is 'edge.fullstory.com/s/fs.js', or the region-specific equivalent (for example 'edge.eu1.fullstory.com/s/fs.js') when the Org ID carries a region suffix.",
      type: 'string',
      required: false
    }
  },
  actions: {
    trackEvent,
    trackEventV2,
    identifyUser,
    identifyUserV2,
    viewedPage,
    viewedPageV2
  },
  initialize: async ({ settings }, dependencies) => {
    const { host, appHost, script } = settings

    const inputOptions = {
      ...settings,
      ...(host ? { host } : {}),
      ...(appHost ? { appHost } : {}),
      ...(script ? { script } : {})
    }

    initFullstory(inputOptions)
    await dependencies.resolveWhen(() => Object.prototype.hasOwnProperty.call(window, 'FS'), 100)
    return window.FS
  }
}

export default browserDestination(destination)
