import { data } from '../data';
import 'source-map-support/register';

import type { HttpEventRequest } from '../../libs/apiGateway';
import { formatJSONResponse } from '../../libs/apiGateway';
import { middyfy } from '../../libs/lambda';
import { APIGatewayProxyResult } from 'aws-lambda';

export const getProductById = async (event: HttpEventRequest<{ id: string }>): Promise<APIGatewayProxyResult> => {
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
