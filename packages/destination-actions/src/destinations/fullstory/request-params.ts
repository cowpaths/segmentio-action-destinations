import type { RequestOptions } from '@segment/actions-core'
import type { Settings } from './generated-types'

type ID = string | null | undefined

interface RequestParams {
  url: string
  options: RequestOptions
}

const defaultRequestParams = (settings: Settings, relativeUrl: string): RequestParams => {
  const baseUrl = settings.region === 'europe' ? 'https://api.eu1.fullstory.com' : 'https://api.fullstory.com'

  return {
    url: `${baseUrl}/${relativeUrl}`,
    options: {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${settings.apiKey}`
      }
    }
  }
}

export const listOperationsRequestParams = (settings: Settings): RequestParams =>
  defaultRequestParams(settings, `operations/v1?limit=1`)

export const setUserPropertiesRequestParams = (settings: Settings, userId: ID, requestBody: Object): RequestParams => {
  const defaultParams = defaultRequestParams(settings, `users/v1/individual/${userId}/customvars`)

  return {
    ...defaultParams,
    options: {
      ...defaultParams.options,
      method: 'post',
      body: JSON.stringify(requestBody)
    }
  }
}

export const deleteUserRequestParams = (settings: Settings, userId: ID): RequestParams => {
  const defaultParams = defaultRequestParams(settings, `users/v1/individual/${userId}`)

  return {
    ...defaultParams,
    options: {
      ...defaultParams.options,
      method: 'delete'
    }
  }
}
