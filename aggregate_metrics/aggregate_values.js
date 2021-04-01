"use strict";

const AWS = require("aws-sdk");
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
const METRIC_VERSION = 6;
const https = require("https");
const agent = new https.Agent({
  keepAlive: true,
});
const documentClient = new AWS.DynamoDB.DocumentClient({
  httpOptions: {
    agent,
  },
});

const BASE10 = 10;
const MINIMUM_DELAY = 1;

// eslint-disable-next-line id-length
const p = (val) => {
  if (val === "") {
    return "*";
  }
  if (val === false) {
    return false;
  }

  return val || "*";
};

/* eslint-disable max-params */
const createSK = (
  date,
  appversion,
  appos,
  osversion,
  manufacturer,
  model,
  androidreleaseversion,
  pl
) => (
  `${pl.region}#${pl.identifier}#${date}#${appos}#${osversion}#${appversion}#${p(manufacturer)}#` +
  `${p(model)}#${p(androidreleaseversion)}#${p(pl.pushnotification)}#${p(pl.frameworkenabled)}#` +
  `${p(pl.state)}#${p(pl.hoursSinceExposureDetectedAt)}#${p(pl.count)}#${p( pl.duration)}#${p(pl.withDate)}#${p(pl.isUserExposed)}`
);
/* eslint-enable max-params */

const bucketCount = (count) => {

  const parsedCount = parseInt(count, BASE10);
  if (isNaN(parsedCount)) {
    return count;
  }

  /* eslint-disable  no-magic-numbers */
  if (parsedCount < 0) {
    console.error(`parsedCount is negative: ${parsedCount}`);
  }

  if (parsedCount === 0) {
    return "0";
  } else if (parsedCount < 6) {
    return "1-6";
  } else if (parsedCount < 12) {
    return "7-12";
  } else if (parsedCount < 30) {
    return "13-30";
  }
  /* eslint-enable  no-magic-numbers */

  return "30+";
};

const bucketDuration = (duration) => {

  const parsedDuration = parseFloat(duration, BASE10);
  if (isNaN(parsedDuration)) {
    return duration;
  }

  /* eslint-disable  no-magic-numbers */
  if (parsedDuration <= 0) {
    console.error(`parsedDuration is negative: ${parsedDuration}`);
  }

  if (parsedDuration === 0) {
    return "0";
  } else if (parsedDuration < 30) {
    return "< 30";
  } else if (parsedDuration < 60) {
    return "30 - 59";
  } else if (parsedDuration < 120) {
    return "1:00 min - 1:59 min";
  } else if (parsedDuration < 240) {
    return "2:00 min - 3:59 min";
  } else if (parsedDuration < 360) {
    return "4:00 min - 5:59 min";
  } else if (parsedDuration < 480) {
    return "6:00 min - 7:59 min";
  } else if (parsedDuration <= 600) {
    return "8:00 min - 9:59 min";
  }
  /* eslint-enable  no-magic-numbers */

  console.error(`parsedDuration is greater then 10 minutes: ${parsedDuration}`);
  return "> 10:00 min";
};

// Null Coalesce for optional attributes
// eslint-disable-next-line id-length
const c = (val) =>  (val || ""); 

const generatePayload = (aggregate) => ({
    Key: {
      pk: aggregate.pk,
      sk: aggregate.sk,
    },
    TableName: "aggregate_metrics",
    UpdateExpression: `
        SET appversion = :appversion,
            appos = :appos,
            #region = :region,
            identifier = :identifier,
            osversion = :osversion,
            manufacturer = :manufacturer,
            model = :model,
            androidreleaseversion = :androidreleaseversion,
            version = :version,
            #count = :count,
            pushnotification = :pushnotification,
            frameworkenabled = :frameworkenabled,
            #state = :state,
            hoursSinceExposureDetectedAt = :hoursSinceExposureDetectedAt,
            #date = :date,
            #duration = :duration,
            withDate = :withDate,
            isUserExposed = :isUserExposed,
            metricCount = if_not_exists(metricCount, :start) + :metricCount`,
    // eslint-disable-next-line sort-keys
    ExpressionAttributeValues: {
      ":androidreleaseversion": c(aggregate.androidreleaseversion),
      ":appos": aggregate.appos,
      ":appversion": aggregate.appversion,
      ":count": c(aggregate.count),
      ":date": c(aggregate.date),
      ":duration": c(aggregate.duration),
      ":frameworkenabled": c(aggregate.frameworkenabled),
      ":hoursSinceExposureDetectedAt": c(aggregate.hoursSinceExposureDetectedAt),
      ":identifier": aggregate.identifier,
      ":isUserExposed": c(aggregate.isUserExposed),
      ":manufacturer": c(aggregate.manufacturer),
      ":metricCount": aggregate.metricCount,
      ":model": c(aggregate.model),
      ":osversion": c(aggregate.osversion),
      ":pushnotification": c(aggregate.pushnotification),
      ":region": aggregate.region,
      ":start": 0,
      ":state": c(aggregate.state),
      ":version": METRIC_VERSION,
      ":withDate": c(aggregate.withDate),
    },
    // Reserved Keywords need to be handled here see: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
    // eslint-disable-next-line sort-keys
    ExpressionAttributeNames: {
      "#count": "count",
      "#date": "date",
      "#duration": "duration",
      "#region": "region",
      "#state": "state",
    },
  });

const pinDate = (timestamp) => {
  const date = new Date();
  date.setTime(timestamp);

  // eslint-disable-next-line no-magic-numbers
  date.setHours(0, 0, 0, 0);
  // eslint-disable-next-line no-magic-numbers
  return date.toISOString().split("T")[0];
};

const aggregateEvents = (event) => {
  const aggregates = {};
  event.Records.forEach((record) => {
    try {
      if (record.eventName === "INSERT") {
        const raw = JSON.parse(record.dynamodb.NewImage.raw.S);
        raw.payload.forEach((pl) => {
          // Skip Debug Events they currently aren't going to the aggregate_metrics table
          if (pl.identifier === "ExposureNotificationCheck") {
            return;
          }
          // Bucket values to reduce possible permutations
          const date = pinDate(pl.timestamp);
          pl.count = bucketCount(pl.count);
          pl.duration = bucketDuration(pl.duration);

          // Deal with potentially missing data
          const osversion = raw.osversion || "";
          const manufacturer = raw.manufacturer || "";
          const androidreleaseversion = raw.androidreleaseversion || "";
          const model = raw.model || "";

          const sk = createSK(
            date,
            raw.appversion,
            raw.appos,
            osversion,
            manufacturer,
            model,
            androidreleaseversion,
            pl
          );

          if (sk in aggregates) {
            // eslint-disable-next-line security/detect-object-injection
            aggregates[sk].metricCount += 1;
          } else {
            // eslint-disable-next-line security/detect-object-injection
            aggregates[sk] = {
              ...pl,
              androidreleaseversion,
              appos: raw.appos,
              appversion: raw.appversion,
              date,
              manufacturer,
              metricCount: 1,
              model,
              osversion,
              pk: pl.region,
              sk,
            };
          }
        });
      }
    } catch (err) {
      console.error(`issue parsing event: ${err}`);
      console.error(`payload uuid: ${record.dynamodb.NewImage.uuid.S}`);
    }
  });

  return aggregates;
};

const buildDeadLetterMsg = (payload, err) => ({
    DelaySeconds: MINIMUM_DELAY,
    MessageAttributes: {
      DelaySeconds: {
        DataType: "Number",
        StringValue: "1",
      },
      ErrorMsg: {
        DataType: "String",
        StringValue: err,
      },
    },
    MessageBody: JSON.stringify(payload),
    QueueUrl: process.env.DEAD_LETTER_QUEUE_URL,
  });

const sendToDeadLetterQueue = (payload, err) => {
  const msg = buildDeadLetterMsg(payload, err);
  sqs.sendMessage(msg, (sqsErr) => {
    if (sqsErr) {
      console.error(
        `Failed sending to Dead Letter Queue: ${sqsErr}, failed msg: ${msg}`
      );
    }
  });
};

const handler = (event, context, callback) => {
  try {
    const aggregates = aggregateEvents(event);
    for (const aggregate in aggregates) {
      if ({}.hasOwnProperty.call(aggregates, aggregate)) {
        // eslint-disable-next-line security/detect-object-injection
        const payload = generatePayload(aggregates[aggregate]);
        documentClient.update(payload, (err) => {
          if (err) {
            console.error(`Failed updating sending to Dead Letter Queue ${err}`);
            sendToDeadLetterQueue(payload, err);
          }
        });
      }
    }
  } catch (err) {
    console.error(`failed event: ${JSON.stringify(err)}`);
    callback(null, "Aggregator complete but failed to parse");
  }

  callback(null, "Aggregator is complete");
};

// eslint-disable-next-line id-length
exports.p = p;
// eslint-disable-next-line id-length
exports.c = c;
exports.createSK = createSK;
exports.bucketCount = bucketCount;
exports.bucketDuration = bucketDuration;
exports.generatePayload = generatePayload;
exports.pinDate = pinDate;
exports.aggregateEvents = aggregateEvents;
exports.buildDeadLetterMsg = buildDeadLetterMsg;
exports.sendToDeadLetterQueue = sendToDeadLetterQueue;
exports.handler = handler;
