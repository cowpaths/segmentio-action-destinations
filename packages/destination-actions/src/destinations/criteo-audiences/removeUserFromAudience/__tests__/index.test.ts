import nock from 'nock'
import { createTestEvent, createTestIntegration } from '@segment/actions-core'
import Destination from '../../index'

const testDestination = createTestIntegration(Destination)

const VALID_ADVERTISER_ID = '12345'
const INVALID_ADVERTISER_ID = 'abcd'
const AUDIENCE_KEY = "weekly_active_shoppers_viewed_product_within_7_days"

const event = createTestEvent({
    traits: {
        email: "test.email@test.com"
    },
    properties: {
        "audience_key": AUDIENCE_KEY,
    }
})

const MOCK_TOKEN_RESPONSE = {
    "access_token": "token",
    "token_type": "Bearer",
    "refresh_token": null,
    "expires_in": 900
}

const VALID_SETTINGS = {
    client_id: "client_id",
    client_secret: "client_id",
    advertiser_id: VALID_ADVERTISER_ID
}

const ADVERTISER_AUDIENCES = {
    "data": [
        {
            "id": "1234",
            "attributes": {
                "advertiserId": VALID_ADVERTISER_ID,
                "name": AUDIENCE_KEY
            }
        }
    ]
}

const AUDIENCE_CREATION_RESPONSE = {
    "data": {
        "id": "5678",
        "type": "Audience"
    },
    "errors": [],
    "warnings": []
}

describe('removeUserFromAudience', () => {
    it('should throw error if no access to the audiences of the advertiser', async () => {
        const settings = VALID_SETTINGS;
        nock('https://api.criteo.com').persist().post('/oauth2/token').reply(200, MOCK_TOKEN_RESPONSE)
        nock('https://api.criteo.com').get(/^\/\d{4}-\d{2}\/audiences$/).query({ "advertiser-id": settings.advertiser_id }).reply(403)
        await expect(
            testDestination.testAction('removeUserFromAudience', {
                event,
                settings,
                useDefaultMappings: true
            })
        ).rejects.toThrowError()
    })

    it('should throw error if advertiser ID is not a number', async () => {
        nock('https://api.criteo.com').persist().post('/oauth2/token').reply(200, MOCK_TOKEN_RESPONSE)

        const settings = {
            client_id: "client_id",
            client_secret: "client_secret",
            advertiser_id: INVALID_ADVERTISER_ID
        }

        await expect(
            testDestination.testAction('removeUserFromAudience', {
                event,
                settings,
                useDefaultMappings: true
            })
        ).rejects.toThrowError()
    })

    it('should throw error if failing to create a new audience', async () => {
        const settings = VALID_SETTINGS;
        nock('https://api.criteo.com').persist().post('/oauth2/token').reply(200, MOCK_TOKEN_RESPONSE)
        nock('https://api.criteo.com').get(/^\/\d{4}-\d{2}\/audiences$/).query({ "advertiser-id": settings.advertiser_id }).reply(200, {
            "data": [
                {
                    "id": "1234",
                    "attributes": {
                        "advertiserId": VALID_ADVERTISER_ID,
                        "name": "OTHER AUDIENCE NAME"
                    }
                }
            ]
        }
        )
        // The audience key is not present in the list of the advertiser's audiences so a new audience needs to be created
        nock('https://api.criteo.com').post(/^\/\d{4}-\d{2}\/audiences$/).reply(403)

        await expect(
            testDestination.testAction('removeUserFromAudience', {
                event,
                settings,
                useDefaultMappings: true
            })
        ).rejects.toThrowError()
    })

    it('should not throw an error if the audience creation and the patch requests succeed', async () => {
        const settings = VALID_SETTINGS;
        nock('https://api.criteo.com').persist().post('/oauth2/token').reply(200, MOCK_TOKEN_RESPONSE)
        nock('https://api.criteo.com').get(/^\/\d{4}-\d{2}\/audiences$/).query({ "advertiser-id": settings.advertiser_id }).reply(200, {
            "data": [
                {
                    "id": "5678",
                    "attributes": {
                        "advertiserId": VALID_ADVERTISER_ID,
                        "name": "OTHER AUDIENCE NAME"
                    }
                }
            ]
        }
        )
        // The audience key is not present in the list of the advertiser's audiences so a new audience needs to be created
        nock('https://api.criteo.com').post(/^\/\d{4}-\d{2}\/audiences$/).reply(200, AUDIENCE_CREATION_RESPONSE)
        nock('https://api.criteo.com').patch(/^\/\d{4}-\d{2}\/audiences\/\d+\/contactlist$/).reply(200)

        await expect(
            testDestination.testAction('removeUserFromAudience', {
                event,
                settings,
                useDefaultMappings: true
            })
        ).resolves.not.toThrowError()
    })

    it('should not throw an error if the audience already exists and the patch requests succeeds', async () => {
        const settings = VALID_SETTINGS;
        nock('https://api.criteo.com').persist().post('/oauth2/token').reply(200, MOCK_TOKEN_RESPONSE)
        nock('https://api.criteo.com').get(/^\/\d{4}-\d{2}\/audiences$/).query({ "advertiser-id": settings.advertiser_id }).reply(200, ADVERTISER_AUDIENCES)
        nock('https://api.criteo.com').patch(/^\/\d{4}-\d{2}\/audiences\/\d+\/contactlist$/).reply(200)

        await expect(
            testDestination.testAction('removeUserFromAudience', {
                event,
                settings,
                useDefaultMappings: true
            })
        ).resolves.not.toThrowError()
    })
})