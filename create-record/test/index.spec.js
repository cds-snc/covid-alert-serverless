const { handler } = require('../');

describe('handler', () => {

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('should return error message', async () => {
        const mResponse = { code: 200, status: "RECORD_CREATED" };
        const mEvent = {
            "metrics": {
                "metricstimestamp": "2020-04-11 08:20",
                "symptomonsent": true,
                "appversion": "1.0.0",
                "appos": "Android",
                "payload": [{
                    "identifier": "installed",
                    "region": "ON",
                    "timestamp": "2020-04-11 08:20"
                }]
            }
        };
        const actualValue = await handler(mEvent);
        expect(actualValue).toEqual({ statusCode: 400, body: JSON.stringify({ message: mResponse.message }) });
    });

});
