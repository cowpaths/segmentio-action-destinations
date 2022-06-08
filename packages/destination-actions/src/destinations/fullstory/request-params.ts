import type { RequestOptions } from '@segment/actions-core'
import type { Settings } from './generated-types'

type ID = string | null | undefined

interface RequestParams {
  url: string
  options: RequestOptions
}

export const requestParams = (settings: Settings) => {
  const baseUrl = settings.region === 'europe' ? 'https://api.eu1.fullstory.com' : 'https://api.fullstory.com'
  const prefixedUrl = (relativeUrl: string): string => `${baseUrl}/${relativeUrl}`

  const defaultRequestParams = (relativeUrl: string): RequestParams => {
    return {
      url: prefixedUrl(relativeUrl),
      options: {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${settings.apiKey}`
        }
      }
    }
  }

  return {
    listOperations: (): RequestParams => defaultRequestParams('operations/v1?limit=1'),

    setUserProperties: (userId: ID, requestBody: Object): RequestParams => {
      const defaultParams = defaultRequestParams(`users/v1/individual/${userId}/customvars`)
      return {
        ...defaultParams,
        options: {
          ...defaultParams.options,
          method: 'post',
          body: JSON.stringify(requestBody)
        }
      }
    },

    deleteUser: (userId: ID): RequestParams => {
      const defaultParams = defaultRequestParams(`users/v1/individual/${userId}`)
      return {
        ...defaultParams,
        options: {
          ...defaultParams.options,
          method: 'delete'
        }
      }
    }
  }
}
