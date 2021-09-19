import 'source-map-support/register';

import { S3 } from 'aws-sdk';
import { S3Event } from 'aws-lambda';
import csv from 'csv-parser';

import { middyfy } from '@libs/lambda';
import { formatJSONResponse, responseInternalError } from '@libs/apiGateway';
// const CATALOG_PATH = 'uploaded';
//
const BUCKET_NAME = 'imported-products-files';

const importFileParser = async (event: S3Event) => {
  const s3 = new S3({ region: 'eu-west-1' });

  try {
    for (const record of event.Records) {
      const s3ReadStream = s3
        .getObject({
          Bucket: BUCKET_NAME,
          Key: record.s3.object.key,
        })
        .createReadStream();

      s3ReadStream
        .pipe(csv())
        .on('data', data => {
          console.log(data);
        })
        .on('error', () => {
          return responseInternalError();
        });

      await s3
        .copyObject({
          Bucket: BUCKET_NAME,
          CopySource: `${BUCKET_NAME}/${record.s3.object.key}`,
          Key: record.s3.object.key.replace('uploaded', 'parsed'),
        })
        .promise();

      await s3
        .deleteObject({
          Bucket: BUCKET_NAME,
          Key: record.s3.object.key,
        })
        .promise();
    }
  } catch (e) {
    return responseInternalError();
  }

  formatJSONResponse({
    message: 'OK',
  });
};

export const main = middyfy(importFileParser);
