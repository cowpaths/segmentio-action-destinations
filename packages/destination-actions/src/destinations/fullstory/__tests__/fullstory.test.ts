import nock from 'nock'
import { createTestEvent, createTestIntegration } from '@segment/actions-core'
import Definition from '../index'

export const apiKey = 'fake-api-key'
export const userId = 'fake/user/id'
export const urlEncodedUserId = encodeURIComponent(userId)
export const anonymousId = 'fake-anonymous-id'
export const email = 'fake+email@example.com'
export const displayName = 'fake-display-name'
export const baseUrl = 'https://api.fullstory.com'
export const settings = { apiKey }

const testDestination = createTestIntegration(Definition)

describe('FullStory', () => {
  describe('testAuthentication', () => {
    it('makes expected request', async () => {
      nock(baseUrl).get('/operations/v1?limit=1').reply(200)
      await expect(testDestination.testAuthentication(settings)).resolves.not.toThrowError()
    })
  })

  describe('trackEvent', () => {
    it('makes expected request with default mappings', async () => {
      nock(baseUrl).post(`/users/v1/individual/${urlEncodedUserId}/customevent`).reply(200)
      const eventName = 'test-event'

      const properties = {
        eventData: {
          'first-property': 'first-value',
          second_property: 'second_value',
          thirdProperty: 'thirdValue'
        },
        useRecentSession: true,
        sessionUrl: 'session-url'
      }

      const timestamp = new Date(Date.UTC(2022, 1, 2, 3, 4, 5)).toISOString()

      const event = createTestEvent({
        type: 'track',
        userId,
        event: eventName,
        timestamp,
        properties
      })

      const [response] = await testDestination.testAction('trackEvent', {
        settings,
        event,
        // Default mappings defined under fields in ../trackEvent/index.ts
        useDefaultMappings: true,
        mapping: {
          useRecentSession: {
            '@path': '$.properties.useRecentSession'
          },
          sessionUrl: {
            '@path': '$.properties.sessionUrl'
          }
        }
      })

      expect(response.status).toBe(200)
      expect(JSON.parse(response.options.body as string)).toEqual({
        event: {
          event_name: eventName,
          event_data: properties,
          timestamp,
          use_recent_session: properties.useRecentSession,
          session_url: properties.sessionUrl
        }
      })
    })

    it('handles undefined event values', async () => {
      nock(baseUrl).post(`/users/v1/individual/${urlEncodedUserId}/customevent`).reply(200)
      const eventName = 'test-event'

      const event = createTestEvent({
        type: 'track',
        userId,
        event: eventName,
        timestamp: undefined
      })

      const [response] = await testDestination.testAction('trackEvent', {
        settings,
        event,
        useDefaultMappings: true
      })

      expect(response.status).toBe(200)
      expect(JSON.parse(response.options.body as string)).toEqual({
        event: {
          event_name: eventName,
          event_data: {}
        }
      })
    })
  })

  describe('identifyUser', () => {
    it('makes expected request with default mappings', async () => {
      nock(baseUrl).post(`/users/v1/individual/${urlEncodedUserId}/customvars`).reply(200)
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
      expect(JSON.parse(response.options.body as string)).toEqual({
        segmentAnonymousId_str: anonymousId,
        email,
        displayName,
        originallyHyphenated: true,
        originallySpaced: true,
        typeSuffixed_str: true
      })
    })
  })

  describe('onDelete', () => {
    it('makes expected request', async () => {
      nock(baseUrl).delete(`/users/v1/individual/${urlEncodedUserId}`).reply(200)
      await expect(testDestination.onDelete!({ type: 'delete', userId }, settings)).resolves.not.toThrowError()
    })
  })
})
