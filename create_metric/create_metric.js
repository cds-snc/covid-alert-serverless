"use strict";

const AWS = require("aws-sdk")
const crypto = require("crypto");
const dynamodb = new AWS.DynamoDB();


/* eslint-disable no-magic-numbers */
/* eslint-disable no-bitwise */
const uuidv4 = () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/ug, (char) =>
    (
      char ^ (crypto.randomFillSync(new Uint8Array(1))[0] & (15 >> (char / 4)))
    ).toString(16)
  );
/* eslint-enable no-magic-numbers */
/* eslint-enable no-bitwise */

exports.handler = async (event) => {
  const transactionStatus = {
    isBase64Encoded: false,
  };

  // Expire after 24 hours
  // eslint-disable-next-line no-magic-numbers
  const ttl = (Math.floor(Date.now() / 1000) + 86400).toString();

  // Dynamodb requries N and S as ids
  /* eslint-disable id-length */
  const params = {
    Item: {
      expdate: {
        N: ttl,
      },
      raw: {
        S: event.body,
      },
      uuid: {
        S: uuidv4(),
      },
    },
    TableName: process.env.TABLE_NAME,
  };
  /* eslint-enable id-length */

  try {
    await dynamodb.putItem(params).promise();
    transactionStatus.statusCode = 200;
    transactionStatus.body = JSON.stringify({ status: "RECORD CREATED" });
  } catch (err) {
    console.error(`Upload faile ${err}`);
    transactionStatus.statusCode = 500;
    transactionStatus.body = JSON.stringify({ status: "UPLOAD FAILED" });
  }

  return transactionStatus;
};
