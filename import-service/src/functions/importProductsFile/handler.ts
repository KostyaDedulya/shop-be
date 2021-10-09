import 'source-map-support/register';

import { S3 } from 'aws-sdk';
import { formatJSONResponse, responseBadRequest, responseInternalError } from '../../libs/apiGateway';
import { middyfy } from '../../libs/lambda';

const CATALOG_PATH = 'uploaded';

const BUCKET_NAME = 'imported-products-files';

export const importProductsFile = async event => {
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
  } catch (e) {
    return responseInternalError();
  }

  return formatJSONResponse({
    url,
  });
};

export const main = middyfy(importProductsFile);
