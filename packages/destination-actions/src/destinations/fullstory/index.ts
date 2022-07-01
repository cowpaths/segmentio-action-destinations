import type { DestinationDefinition } from '@segment/actions-core'
import { defaultValues } from '@segment/actions-core'
import type { Settings } from './generated-types'
import identifyUser from './identifyUser'
import trackEvent from './trackEvent'
import { listOperationsRequestParams, deleteUserRequestParams } from './request-params'

const destination: DestinationDefinition<Settings> = {
  name: 'Fullstory (Actions)',
  slug: 'actions-fullstory',
  mode: 'cloud',
  presets: [
    {
      name: 'Track Event',
      subscribe: 'type = "track"',
      partnerAction: 'trackEvent',
      mapping: defaultValues(trackEvent.fields)
    },
    {
      name: 'Identify User',
      subscribe: 'type = "identify"',
      partnerAction: 'identifyUser',
      mapping: defaultValues(identifyUser.fields)
    }
  ],
  authentication: {
    scheme: 'custom',
    fields: {
      apiKey: {
        label: 'API Key',
        description: '[FullStory API key](https://help.fullstory.com/hc/en-us/articles/360052021773-Managing-API-Keys)',
        type: 'password',
        required: true
      }
    },

    testAuthentication: (request, { settings }) => {
      const { url, options } = listOperationsRequestParams(settings)
      return request(url, options)
    }
  },

  onDelete: async (request, { settings, payload }) => {
    if (payload.userId === null || payload.userId === undefined) {
      return
    }
    const { url, options } = deleteUserRequestParams(settings, payload.userId)
    return request(url, options)
  },

  actions: {
    trackEvent,
    identifyUser
  }
}

export default destination
