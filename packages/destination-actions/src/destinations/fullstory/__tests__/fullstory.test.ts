import nock from 'nock'
import { createTestEvent, createTestIntegration } from '@segment/actions-core'
import Definition from '../index'
import type { Settings } from '../generated-types'

const regionToBaseUrlMapping: Record<string, string> = {
  north_america: 'https://api.fullstory.com',
  europe: 'https://api.eu1.fullstory.com'
}

const apiKey = 'fake-api-key'
export const userId = 'fake-user-id'
export const anonymousId = 'fake-anonymous-id'
export const email = 'fake+email@example.com'
export const displayName = 'fake-display-name'

export const forEachRegion = (callback: (settings: Settings, baseUrl: string) => void) => {
  Object.keys(regionToBaseUrlMapping).forEach((region) => callback({ apiKey, region }, regionToBaseUrlMapping[region]))
}

const testDestination = createTestIntegration(Definition)

describe('FullStory', () => {
  describe('testAuthentication', () => {
    forEachRegion((settings, baseUrl) => {
      it(`makes expected request for region ${settings.region}`, async () => {
        nock(baseUrl).get('/operations/v1?limit=1').reply(200)
        await expect(testDestination.testAuthentication(settings)).resolves.not.toThrowError()
      })
    })
  })

  describe('identifyUser', () => {
    forEachRegion((settings, baseUrl) => {
      it(`makes expected request for region ${settings.region} with default mappings`, async () => {
        nock(baseUrl).post(`/users/v1/individual/${userId}/customvars`).reply(200)
        const event = createTestEvent({
          type: 'identify',
          userId,
          anonymousId,
          traits: {
            email,
            displayName,
            'originally-hyphenated': true,
            'originally spaced': true,
            typeSuffixed_str: true
          }
        })

        const [response] = await testDestination.testAction('identifyUser', {
          settings,
          event,
          useDefaultMappings: true
        })

        expect(response.status).toBe(200)
        expect(JSON.parse(response.options.body as string)).toMatchObject({
          segmentAnonymousId_str: anonymousId,
          email,
          displayName,
          originallyHyphenated: true,
          originallySpaced: true,
          typeSuffixed_str: true
        })
      })
    })
  })

  describe('onDelete', () => {
    forEachRegion((settings, baseUrl) => {
      it(`makes expected request for region ${settings.region}`, async () => {
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
