import { requestParams } from '../request-params'
import type { Settings } from '../generated-types'

const regionToBaseUrlMapping: Record<string, string> = {
  north_america: 'https://api.fullstory.com',
  europe: 'https://api.eu1.fullstory.com'
}

const apiKey = 'fake-api-key'
const userId = 'fake-user-id'

// TODO(nate): Extract common test helper logic
const forEachRegion = (callback: (settings: Settings, baseUrl: string) => void) => {
  Object.keys(regionToBaseUrlMapping).forEach((region) => callback({ apiKey, region }, regionToBaseUrlMapping[region]))
}

describe('requestParams', () => {
  describe('listOperations', () => {
    forEachRegion((settings, baseUrl) => {
      it(`returns expected request params for region ${settings.region}`, () => {
        const { url, options } = requestParams(settings).listOperations()
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
        const { url, options } = requestParams(settings).setUserProperties(userId, {})
        expect(options.method).toBe('post')
        expect(options.headers!['Content-Type']).toBe('application/json')
        expect(options.headers!['Authorization']).toBe(`Basic ${settings.apiKey}`)
        expect(url).toBe(`${baseUrl}/users/v1/individual/${userId}/customvars`)
        // TODO(nate): Assert against request body
      })
    })
  })

  describe('deleteUser', () => {
    forEachRegion((settings, baseUrl) => {
      it(`returns expected request params for region ${settings.region}`, () => {
        const { url, options } = requestParams(settings).deleteUser(userId)
        expect(options.method).toBe('delete')
        expect(options.headers!['Content-Type']).toBe('application/json')
        expect(options.headers!['Authorization']).toBe(`Basic ${settings.apiKey}`)
        expect(url).toBe(`${baseUrl}/users/v1/individual/${userId}`)
      })
    })
  })
})
