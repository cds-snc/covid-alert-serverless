const { handler } = require('../');

describe('handler', () => {

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('With no programatic access this test will pass. This is the network error test', async () => {
        const mResponse = {
            "status": "UPLOAD FAILED"
        };
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
        expect(actualValue).toEqual({ status: "UPLOAD FAILED" });
    });

    test('With IAM programmactic access an S3 bucket and environment variables confiured this will succeed', async () => {
        const mResponse = {
            "status": "RECORD_CREATED",
            "key": "e45509b0-605f-11eb-8854-115116dc42bb"
        };
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
        expect(actualValue).toEqual( mResponse );
    });

});
