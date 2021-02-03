'use strict';

const
    AWS = require('aws-sdk'),
    uuid = require('uuid'),
    S3 = new AWS.S3();

exports.handler = async (event, context) => {

    const bucket = process.env.dataBucket;
    const filePath = process.env.fileLoca;
    const filename = uuid.v1();
    let transactionStatus = "FAILED";
    var body = JSON.stringify(event);

    const bucketParams = {
        Bucket: bucket + "/" + filePath,
        Key: filename + '.json',
        Body: body,
        ServerSideEncryption: 'AES256'
    };

    /* The puObject call forces a promise because the result returned may not be a promise.  */
    try {
        const resp = await S3.putObject(bucketParams).promise();
        console.debug(resp);
        transactionStatus = { "status": "RECORD_CREATED", "key": filename};
    } catch (err) {
        console.debug("UPLOAD FAILED", err);
        transactionStatus = { "status": "UPLOAD FAILED"};
    }

    return transactionStatus;
};
