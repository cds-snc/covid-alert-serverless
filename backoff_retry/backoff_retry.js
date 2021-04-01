"use strict";

const AWS = require("aws-sdk");
const https = require("https");
const agent = new https.Agent({
  keepAlive: true,
});
const documentClient = new AWS.DynamoDB.DocumentClient({
  httpOptions: {
    agent,
  },
});
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const calculateDelay = (delaySeconds) => {

  // eslint-disable-next-line no-magic-numbers
  if (delaySeconds === 1) {
    return delaySeconds;
  }

  return delaySeconds * delaySeconds;
}

const buildDeadLetterMsg = (payload, record, err) => {
  const delay = calculateDelay(record.MessageAttributes.DelaySeconds);

  return {
    DelaySeconds: delay,
    MessageAttributes: {
      DelaySeconds: {
        DataType: "Number",
        StringValue: delay,
      },
      ErrorMsg: {
        DataType: "String",
        StringValue: err,
      },
    },
    MessageBody: JSON.stringify(payload),
    QueueUrl: process.env.DEAD_LETTER_QUEUE_URL,
  };
}

const sendToDeadLetterQueue = (payload, record, err) => {
  const msg = buildDeadLetterMsg(payload, record, err);
  sqs.sendMessage(msg, (sqsErr) => {
    if (sqsErr) {
      console.error(
        `Failed sending to dead letter queue: ${sqsErr}, failed msg: ${msg}`
      );
    }
  });
}

const asyncForEach = async (array, callback) => {
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < array.length; index++) {
    /* eslint-disable no-await-in-loop */
    /* eslint-disable security/detect-object-injection  */
    await callback(array[index], index, array);
    /* eslint-enable no-await-in-loop */
    /* eslint-enable security/detect-object-injection  */
  }
}

exports.handler = async function handler (event) {
  await asyncForEach(event.Records, async (record) => {
    // Read from dead letter queue
    const payload = JSON.parse(record.body);

    try {
      await documentClient.update(payload).promise();
    } catch (err) {
      console.error(`Sending to dead letter queue ${err}`);
      await sendToDeadLetterQueue(payload, record, err);
    }
  });
};
