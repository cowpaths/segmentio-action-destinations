import { listOperationsRequestParams, setUserPropertiesRequestParams, deleteUserRequestParams } from '../request-params'
import { forEachRegion, anonymousId, displayName, email, userId } from './test-support'

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
          traits: {
            displayName,
            email
          }
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
