import nock from 'nock'
import { createTestIntegration } from '@segment/actions-core'
import Definition from '../index'
import type { Settings } from '../generated-types'

const testDestination = createTestIntegration(Definition)

const regionToBaseUrlMapping: Record<string, string> = {
  north_america: 'https://api.fullstory.com',
  europe: 'https://api.eu1.fullstory.com'
}

const apiKey = 'fake-api-key'
const userId = 'fake-user-id'

const forEachRegion = (callback: (settings: Settings, baseUrl: string) => void) => {
  Object.keys(regionToBaseUrlMapping).forEach((region) => callback({ apiKey, region }, regionToBaseUrlMapping[region]))
}

describe('FullStory', () => {
  describe('testAuthentication', () => {
    forEachRegion((settings, baseUrl) => {
      it(`succeeds for region ${settings.region}`, async () => {
        nock(baseUrl).get('/operations/v1?limit=1').reply(200)
        await expect(testDestination.testAuthentication(settings)).resolves.not.toThrowError()
      })
    })
  })

  describe('identifyUser', () => {
    // TODO(nate): Assert against perform and related logic, including camel casing properties
  })

  describe('onDelete', () => {
    forEachRegion((settings, baseUrl) => {
      it(`succeeds for region ${settings.region}`, async () => {
        nock(baseUrl).delete(`/users/v1/individual/${userId}`).reply(200)
        const jsonSettings = {
          apiKey: settings.apiKey,
          region: settings.region!
        }
        await expect(testDestination.onDelete!({ type: 'delete', userId }, jsonSettings)).resolves.not.toThrowError()
      })
    })
  })
})
