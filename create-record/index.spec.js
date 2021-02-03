const AWS = require('aws-sdk-mock')
const {handler} = require('./index.js')

test('With IAM programmactic access an S3 bucket and environment variables confiured this will succeed', async () => {

    const success = {
        "status": "RECORD_CREATED",
        "key": "e45509b0-605f-11eb-8854-115116dc42bb"
    };

    AWS.mock('S3', 'putObject', (params, callback) => {
        callback(null, success);
    });

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
    console.log(actualValue);
    AWS.restore();
});

test('fail', async () => {
    const failure = {
        "status": "UPLOAD FAILED"
    };

    AWS.mock('S3', 'putObject', (params, callback) => {
        callback(null, failure);
    });
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
    expect(actualValue).toEqual(failure);

});
