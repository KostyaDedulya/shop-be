import 'source-map-support/register';

import { S3 } from 'aws-sdk';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse, responseBadRequest, responseInternalError } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const CATALOG_PATH = 'uploaded';

const BUCKET_NAME = 'imported-products-files';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async event => {
  const { name } = event?.queryStringParameters;
  if (!name) return responseBadRequest();

  const s3 = new S3({ region: 'eu-west-1' });
  let url;
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${CATALOG_PATH}/${name}`,
    ContentType: 'text/csv',
  };

  try {
    url = s3.getSignedUrl('putObject', params);
    console.log(url);
  } catch (e) {
    return responseInternalError();
  }

  return formatJSONResponse({
    url,
  });
};

export const main = middyfy(importProductsFile);
