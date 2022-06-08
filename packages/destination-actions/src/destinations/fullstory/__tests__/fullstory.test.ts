import nock from 'nock'
import { createTestIntegration } from '@segment/actions-core'
import Definition from '../index'
import type { Settings } from '../generated-types'

const testDestination = createTestIntegration(Definition)

const regionToBaseUrlMapping: Record<string, string> = {
  north_america: 'https://api.fullstory.com',
  europe: 'https://api.eu1.fullstory.com'
}

const apiKey = 'fake'

const forEachRegion = (callback: (settings: Settings, baseUrl: string) => void) => {
  Object.keys(regionToBaseUrlMapping).forEach((region) => callback({ apiKey, region }, regionToBaseUrlMapping[region]))
}

describe('FullStory', () => {
  describe('testAuthentication', () => {
    forEachRegion((settings, baseUrl) => {
      it(`succeeds for ${settings.region} region`, async () => {
        nock(baseUrl).get('/operations/v1?limit=1').reply(200)
        await expect(testDestination.testAuthentication(settings)).resolves.not.toThrowError()
      })
    })
  })

  describe('identifyUser', () => {
    // TODO(nate): Assert against perform and related logic, including camel casing properties
  })
})
