import { data } from '../data';
import 'source-map-support/register';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;
  try {
    const product = data.filter((p) => p.id === id);
    if (product.length === 0) throw new Error();
    return formatJSONResponse({
      data: product[0],
    });
  } catch (e) {
    return formatJSONResponse(
      {
        errorMessage: 'Product not found',
      },
      404
    );
  }
};

export const main = middyfy(getProductById);
