import { listOperationsRequestParams, setUserPropertiesRequestParams, deleteUserRequestParams } from '../request-params'
import type { Settings } from '../generated-types'

const regionToBaseUrlMapping: Record<string, string> = {
  north_america: 'https://api.fullstory.com',
  europe: 'https://api.eu1.fullstory.com'
}

const apiKey = 'fake-api-key'
const userId = 'fake-user-id'
const anonymousId = 'fake-anonymous-id'
const traits = {
  displayName: 'fake-display-name',
  email: 'fake+email@example.com'
}

// TODO(nate): Extract common test helper logic
const forEachRegion = (callback: (settings: Settings, baseUrl: string) => void) => {
  Object.keys(regionToBaseUrlMapping).forEach((region) => callback({ apiKey, region }, regionToBaseUrlMapping[region]))
}

describe('requestParams', () => {
  describe('listOperations', () => {
    forEachRegion((settings, baseUrl) => {
      it(`returns expected request params for region ${settings.region}`, () => {
        const { url, options } = listOperationsRequestParams(settings)
        expect(options.method).toBe('get')
        expect(options.headers!['Content-Type']).toBe('application/json')
        expect(options.headers!['Authorization']).toBe(`Basic ${settings.apiKey}`)
        expect(url).toBe(`${baseUrl}/operations/v1?limit=1`)
      })
    })
  })

  describe('setUserProperties', () => {
    forEachRegion((settings, baseUrl) => {
      it(`returns expected request params for region ${settings.region}`, () => {
        const requestBody = {
          anonymousId,
          traits
        }
        const { url, options } = setUserPropertiesRequestParams(settings, userId, requestBody)
        expect(options.method).toBe('post')
        expect(options.headers!['Content-Type']).toBe('application/json')
        expect(options.headers!['Authorization']).toBe(`Basic ${settings.apiKey}`)
        expect(url).toBe(`${baseUrl}/users/v1/individual/${userId}/customvars`)
        expect(options.body).toBe(JSON.stringify(requestBody))
      })
    })
  })

  describe('deleteUser', () => {
    forEachRegion((settings, baseUrl) => {
      it(`returns expected request params for region ${settings.region}`, () => {
        const { url, options } = deleteUserRequestParams(settings, userId)
        expect(options.method).toBe('delete')
        expect(options.headers!['Content-Type']).toBe('application/json')
        expect(options.headers!['Authorization']).toBe(`Basic ${settings.apiKey}`)
        expect(url).toBe(`${baseUrl}/users/v1/individual/${userId}`)
      })
    })
  })
})
