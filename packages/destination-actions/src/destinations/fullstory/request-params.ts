import type { RequestOptions } from '@segment/actions-core'
import type { Settings } from './generated-types'

/**
 * Mirrors the ID type which isn't exported from the @segment/actions-core package root.
 */
type ID = string | null | undefined

/**
 * Parameters intended to be passed into a RequestClient.
 */
interface RequestParams {
  url: string
  options: RequestOptions
}

const apiBaseUrl = 'https://api.fullstory.com'

/**
 * Returns default {@link RequestParams} suitable for most FullStory HTTP API requests.
 *
 * @param settings Settings configured for the cloud mode destination.
 * @param relativeUrl The relative URL from the FullStory API domain root.
 */
const defaultRequestParams = (settings: Settings, relativeUrl: string): RequestParams => {
  return {
    url: `${apiBaseUrl}/${relativeUrl}`,
    options: {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${settings.apiKey}`
      }
    }
  }
}

// TODO(nate): Remove "region specific" comments

/**
 * Returns the region specific {@link RequestParams} for the list operations HTTP API endpoint.
 *
 * @param settings Settings configured for the cloud mode destination.
 */
export const listOperationsRequestParams = (settings: Settings): RequestParams =>
  defaultRequestParams(settings, `operations/v1?limit=1`)

/**
 * Returns {@link RequestParams} for the custom events HTTP API endpoint.
 *
 * @param settings Settings configured for the cloud mode destination.
 * @param requestValues Values to send with the request.
 */
export const customEventRequestParams = (
  settings: Settings,
  requestValues: {
    userId: string
    eventName: string
    eventData: {}
    timestamp?: string
    useRecentSession?: boolean
    sessionUrl?: string
  }
): RequestParams => {
  const { userId, eventName, eventData, timestamp, useRecentSession, sessionUrl } = requestValues
  const defaultParams = defaultRequestParams(settings, `users/v1/individual/${userId}/customevent`)

  const requestBody: Record<string, any> = {
    event: {
      event_name: eventName,
      event_data: eventData
    }
  }

  if (timestamp) {
    requestBody.event.timestamp = timestamp
  }

  if (useRecentSession !== undefined) {
    requestBody.event.session = {
      use_recent_session: useRecentSession
    }
  }

  if (sessionUrl) {
    requestBody.event.session = requestBody.event.session || {}
    requestBody.event.session.session_url = sessionUrl
  }

  return {
    ...defaultParams,
    options: {
      ...defaultParams.options,
      method: 'post',
      json: requestBody
    }
  }
}

/**
 * Returns the region specific {@link RequestParams} for the set user properties HTTP API endpoint.
 *
 * @param settings Settings configured for the cloud mode destination.
 * @param userId The id of the user to update.
 * @param requestBody The request body containing user properties to set.
 */
export const setUserPropertiesRequestParams = (settings: Settings, userId: ID, requestBody: Object): RequestParams => {
  const defaultParams = defaultRequestParams(settings, `users/v1/individual/${userId}/customvars`)

  return {
    ...defaultParams,
    options: {
      ...defaultParams.options,
      method: 'post',
      // TODO(nate): Specify json instead of body which will JSON.stringify for us and set the correct content-type header
      body: JSON.stringify(requestBody)
    }
  }
}

/**
 * Returns the region specific {@link RequestParams} for the delete user HTTP API endpoint.
 *
 * @param settings Settings configured for the cloud mode destination.
 * @param userId The id of the user to delete.
 */
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
