import type { ActionDefinition } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import { createUpdateUser } from '../request-params'
import { normalizePropertyNames } from '../vars'

const action: ActionDefinition<Settings> = {
  title: 'Identify User V2',
  description: 'Sets user identity variables, creates user if it does not exist',
  platform: 'cloud',
  defaultSubscription: 'type = "identify"',
  fields: {
    uid: {
      type: 'string',
      required: true,
      description: "The user's id",
      label: 'User ID',
      default: {
        '@path': '$.userId'
      }
    },
    display_name: {
      type: 'string',
      required: false,
      description: "The user's display name",
      label: 'Display Name',
      default: {
        '@path': '$.traits.name'
      }
    },
    email: {
      type: 'string',
      required: false,
      description: "The user's email",
      label: 'Email',
      default: {
        '@path': '$.traits.email'
      }
    },
    properties: {
      type: 'object',
      required: false,
      description: 'The Segment traits to be forwarded to FullStory',
      label: 'Traits',
      default: {
        '@path': '$.traits'
      }
    }
  },
  perform: (request, { payload, settings }) => {
    const { properties, uid, email, display_name } = payload

    const normalizedProperties = normalizePropertyNames(properties, { camelCase: true })

    delete normalizedProperties.email
    delete normalizedProperties.name

    const requestBody = {
      uid,
      ...(email !== undefined && { email }),
      ...(display_name !== undefined && { display_name }),
      properties: {
        ...normalizedProperties
      }
    }

    const { url, options } = createUpdateUser(settings, requestBody)
    return request(url, options)
  }
}

export default action
