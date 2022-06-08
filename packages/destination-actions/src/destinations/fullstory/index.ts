import type { DestinationDefinition } from '@segment/actions-core'
import { defaultValues } from '@segment/actions-core'
import type { Settings } from './generated-types'
import identifyUser from './identifyUser'
import { requestParams } from './request-params'

const destination: DestinationDefinition<Settings> = {
  name: 'Fullstory (Actions)',
  slug: 'actions-fullstory',
  mode: 'cloud',
  presets: [
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
      },
      region: {
        label: 'Data Region',
        description: 'The region where your FullStory organization is provisioned.',
        type: 'string',
        format: 'text',
        choices: [
          {
            label: 'North America',
            value: 'north_america'
          },
          {
            label: 'Europe',
            value: 'europe'
          }
        ],
        default: 'north_america'
      }
    },

    testAuthentication: (request, { settings }) => {
      const { url, options } = requestParams(settings).listOperations()
      return request(url, options)
    }
  },

  onDelete: async (request, { settings, payload }) => {
    const { url, options } = requestParams(settings).deleteUser(payload.userId)
    return request(url, options)
  },

  actions: {
    identifyUser
  }
}

export default destination
