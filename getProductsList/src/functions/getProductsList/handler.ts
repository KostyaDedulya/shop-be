import { data } from '../data';
import 'source-map-support/register';

import { formatJSONResponse } from '../../libs/apiGateway';
import { middyfy } from '../../libs/lambda';
import { APIGatewayProxyResult } from 'aws-lambda';

export const getProductsList = async (): Promise<APIGatewayProxyResult> => {
  return formatJSONResponse({
    data,
  });
};

export const main = middyfy(getProductsList);