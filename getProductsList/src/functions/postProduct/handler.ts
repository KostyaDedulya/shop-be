import 'source-map-support/register';

import type { HttpEventPostRequest } from '../../libs/apiGateway';
import { formatJSONResponse, responseBadRequest, responseInternalError } from '../../libs/apiGateway';
import { middyfy } from '../../libs/lambda';
import { APIGatewayProxyResult } from 'aws-lambda';
import { postProductToDB } from '../../db/postProduct';

interface BodyRequest {
  title: string;
  description: string;
  price: number;
  count: number;
}

export const postProduct = async (event: HttpEventPostRequest<BodyRequest>): Promise<APIGatewayProxyResult> => {
  console.log(`postProductToRDS, method: ${event.httpMethod}, body: ${JSON.stringify(event.body)}`);

  try {
    const product = await postProductToDB(event.body);
    if (!product) return responseBadRequest();
    return formatJSONResponse(product);
  } catch (e) {
    return responseInternalError();
  }
};

export const main = middyfy(postProduct);
